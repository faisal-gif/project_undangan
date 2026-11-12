import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";
import { useEffect, useRef, useState } from "react";

/**
 * Denah ruangan yang bisa diatur: meja digeser ke posisi sebenarnya di
 * ballroom, lalu susunannya disimpan.
 *
 * Koordinatnya persen, bukan piksel. Denah ini dipakai di dua tempat dengan
 * ukuran yang jauh berbeda - layar admin dan monitor besar di sebelah meja
 * penerima tamu - dan persen membuat keduanya menampilkan susunan yang sama.
 *
 * Kursi digambar mengelilingi meja dari sudutnya, bukan ditulis satu per satu,
 * jadi mengubah jumlah kursi per meja tidak menyentuh berkas ini. Kursi 1
 * selalu di sisi terdekat panggung lalu searah jarum jam, supaya nomor di
 * layar sama dengan yang dilihat tamu di lapangan.
 */

/**
 * Pembagian ruang di dalam satu gambar meja.
 *
 * Piringan meja hanya memikul satu angka, sedangkan enam kursinya memikul
 * enam angka yang sama pentingnya - padahal dulu piringannya 57% dari gambar
 * dan kursinya 17%, jadi angka kursi tinggal 8px dan tidak terbaca. Jari-jari
 * meja dikecilkan dan kursinya dibesarkan di dalam kotak yang sama besar:
 * angka kursi naik dari 8px ke 14px di layar admin tanpa memakan lantai
 * sepetak pun.
 */
const JARI_MEJA = 34;
const JARI_KURSI_MAKS = 20;
const CELAH = 3;
const ORBIT = JARI_MEJA + CELAH + JARI_KURSI_MAKS;
const KOTAK = (ORBIT + JARI_KURSI_MAKS + 2) * 2;

/**
 * Kursi sebesar mungkin tanpa saling bertumpuk di orbitnya.
 *
 * Jarak antar pusat kursi di orbit adalah 2 * ORBIT * sin(pi/n), jadi kursi
 * yang lebih banyak harus lebih kecil. Tanpa ini, meja berisi 10 kursi akan
 * menggambar kursi yang saling menimpa begitu kursinya dibesarkan.
 */
function jariKursi(total) {
    const muat = ORBIT * Math.sin(Math.PI / Math.max(3, total)) * 0.88;

    return Math.max(9, Math.min(JARI_KURSI_MAKS, muat));
}

// Harus sama dengan LANTAI_* di App\Models\Acara: bagian lantai yang dipakai
// grid cadangan. Persen letak meja mengacu ke lantai, bukan ke seluruh
// ruangan - panggung dan pintu berada di luarnya dan berukuran tetap.
const LANTAI_LEBAR = 84;
const LANTAI_TINGGI = 84;

/** Batas ukuran gambar meja, supaya tetap terbaca tanpa jadi raksasa. */
const MEJA_MIN = 48;
const MEJA_MAKS = 320;

/** Bagian sel yang dipakai gambar meja; sisanya jadi jarak antar meja. */
const ISI_SEL = 0.96;

/**
 * Ukuran lantai per orientasi - selalu muat satu layar, tidak pernah digulir.
 * Melebar untuk ballroom biasa, memanjang untuk ruangan yang lebih dalam
 * daripada lebar. Rasionya harus sama dengan RASIO_LANTAI di App\Models\Acara,
 * yang dipakai menghitung jumlah kolom grid.
 */
const LANTAI = {
    // vhLayar diukur, bukan dikira: di 1920x1080 judul, videotron, panggung,
    // pintu, dan jaraknya memakan 217px, jadi 0.80 ke atas membuat halaman
    // monitor ikut tergulir - dan di monitor tidak ada yang menggulirnya.
    landscape: { vh: 0.64, vhLayar: 0.79, min: 440, maks: 1000, rasio: 1.95 },
    potret: { vh: 0.76, vhLayar: 0.84, min: 540, maks: 1250, rasio: 0.72 },
};

/**
 * Tinggi lantai mengikuti tinggi layar, bukan angka tetap.
 *
 * Denah ini juga tampil di monitor besar sebelah penerima tamu; tinggi yang
 * dipatok membuat separuh layar terbuang dan mejanya kecil tanpa alasan.
 */
function tinggiLantai(bentuk, tinggiLayar, layar = false) {
    // Mode monitor hampir tidak punya hiasan di sekelilingnya - tanpa menu,
    // tanpa tombol, hanya satu baris judul - jadi lantainya boleh jauh lebih
    // tinggi daripada di halaman admin. Memakai satu angka untuk keduanya
    // berarti monitor yang justru paling perlu terbaca ikut dikecilkan oleh
    // ruang yang dipakai tombol-tombol admin.
    const bagian = layar ? bentuk.vhLayar : bentuk.vh;

    return Math.max(bentuk.min, Math.min(bentuk.maks, (tinggiLayar || 900) * bagian));
}

/**
 * Ukuran meja diambil dari sisi sel yang terkecil, lebar maupun tinggi.
 *
 * Denah dipakai untuk melihat seluruh ruangan sekaligus - di layar admin dan
 * di monitor sebelah penerima tamu. Denah yang harus digulir bukan denah lagi,
 * jadi lantainya dikunci setinggi satu layar dan mejanya yang menyesuaikan.
 *
 * Konsekuensinya jujur: grid dengan banyak baris menggambar meja kecil. Itu
 * memang pilihan admin lewat "meja per baris", dan bisa dibesarkan kembali
 * dengan menambah meja per baris.
 */
function ukuranMeja(lebarLantai, tinggiLantai, kolom, baris) {
    const selLebar = ((LANTAI_LEBAR / 100) * lebarLantai) / Math.max(1, kolom);
    const selTinggi = ((LANTAI_TINGGI / 100) * tinggiLantai) / Math.max(1, baris);

    return Math.max(MEJA_MIN, Math.min(MEJA_MAKS, Math.min(selLebar, selTinggi) * ISI_SEL));
}

function posisiKursi(index, total) {
    const sudut = ((index / total) * 360 - 90) * (Math.PI / 180);

    return {
        x: KOTAK / 2 + ORBIT * Math.cos(sudut),
        y: KOTAK / 2 + ORBIT * Math.sin(sudut),
    };
}

function MejaBundar({ meja, ukuran }) {
    const penuh = meja.terisi >= meja.kapasitas;
    const jariK = jariKursi(meja.kursi.length);

    // Ukuran huruf diturunkan dari jari-jarinya, bukan dipatok, supaya angka
    // selalu mengisi bulatannya - termasuk saat kursi mengecil karena satu
    // meja diisi banyak kursi.
    const hurufMeja = Math.round(JARI_MEJA * 0.82);
    const hurufKursi = Math.round(jariK * 0.95);

    return (
        <svg viewBox={`0 0 ${KOTAK} ${KOTAK}`} style={{ width: ukuran, height: ukuran }}>
            <circle
                cx={KOTAK / 2}
                cy={KOTAK / 2}
                r={JARI_MEJA}
                className={penuh ? "fill-gray-200" : "fill-white"}
                stroke="#9ca3af"
                strokeWidth="2"
            />
            <text
                x={KOTAK / 2}
                y={KOTAK / 2 + hurufMeja * 0.35}
                textAnchor="middle"
                fontSize={hurufMeja}
                className="fill-gray-700 font-bold"
            >
                {meja.nomor}
            </text>

            {meja.kursi.map((k, i) => {
                const { x, y } = posisiKursi(i, meja.kursi.length);

                return (
                    <g key={k.nomor}>
                        <circle
                            cx={x}
                            cy={y}
                            r={jariK}
                            className={k.tamu ? "fill-amber-500" : "fill-white"}
                            stroke={k.tamu ? "#b45309" : "#9ca3af"}
                            strokeWidth="2"
                        >
                            <title>{`Kursi ${k.nomor}: ${k.tamu ? k.tamu.nama : "kosong"}`}</title>
                        </circle>
                        <text
                            x={x}
                            y={y + hurufKursi * 0.35}
                            textAnchor="middle"
                            fontSize={hurufKursi}
                            className={`font-bold ${k.tamu ? "fill-white" : "fill-gray-600"}`}
                        >
                            {k.nomor}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
}

/**
 * Ruangan beserta isinya. Dipakai mode admin dan mode monitor; bedanya hanya
 * boleh-tidaknya digeser.
 */
function Ruangan({ mejas, letak, kolom, baris, orientasi, aturUlang, layar = false, onGeser, onPilih, disorot }) {
    const ruang = useRef(null);
    const menyeret = useRef(null);
    const bentuk = LANTAI[orientasi] ?? LANTAI.landscape;
    const [ukuran, setUkuran] = useState(90);
    const [tinggi, setTinggi] = useState(bentuk.min);

    useEffect(() => {
        const el = ruang.current;
        if (!el) return;

        const hitung = () => {
            const t = tinggiLantai(bentuk, window.innerHeight, layar);

            setTinggi(t);
            setUkuran(ukuranMeja(el.getBoundingClientRect().width, t, kolom, baris));
        };

        hitung();

        // Ukur ulang beberapa saat setelah mount. Pengukuran pertama bisa
        // jatuh sebelum tata letak tenang - huruf web baru selesai dimuat,
        // batang gulir muncul - dan denah ini dibuka sekali di monitor
        // penerima tamu lalu ditinggal berjam-jam: tidak ada yang mengubah
        // ukuran jendela untuk memicu pengukuran ulang. Satu ResizeObserver
        // saja berarti satu titik gagal tanpa jaring pengaman.
        const jeda = [120, 400, 1200].map((ms) => setTimeout(hitung, ms));

        const pengamat = new ResizeObserver(hitung);
        pengamat.observe(el);
        window.addEventListener("resize", hitung);

        return () => {
            jeda.forEach(clearTimeout);
            pengamat.disconnect();
            window.removeEventListener("resize", hitung);
        };
    }, [kolom, baris, bentuk, layar]);

    // Pointer event, bukan drag-and-drop HTML5: yang terakhir itu tidak
    // bekerja di layar sentuh, dan denah ini kemungkinan diatur dari tablet.
    useEffect(() => {
        if (!aturUlang) return;

        const gerak = (e) => {
            const seret = menyeret.current;
            if (!seret || !ruang.current) return;

            const kotak = ruang.current.getBoundingClientRect();
            const x = ((e.clientX - kotak.left) / kotak.width) * 100;
            const y = ((e.clientY - kotak.top) / kotak.height) * 100;

            onGeser(seret, {
                x: Math.max(0, Math.min(100, x)),
                y: Math.max(0, Math.min(100, y)),
            });
        };

        const lepas = () => {
            menyeret.current = null;
        };

        window.addEventListener("pointermove", gerak);
        window.addEventListener("pointerup", lepas);

        return () => {
            window.removeEventListener("pointermove", gerak);
            window.removeEventListener("pointerup", lepas);
        };
    }, [aturUlang, onGeser]);

    // Panggung dan pintu berukuran tetap di luar lantai; hanya lantai yang
    // tumbuh. Kalau keduanya ikut dipersen, ruangan yang panjang akan
    // meregangkan panggung dan menyisakan ratusan piksel kosong di atas meja.
    return (
        <div
            className="mx-auto w-full overflow-hidden rounded-lg border border-gray-300 bg-gray-50"
            style={{ maxWidth: tinggi * bentuk.rasio }}
        >
            <div className="space-y-1.5 p-3">
                <div className="mx-auto w-3/4 rounded border border-gray-300 bg-white/70 py-0.5 text-center text-[0.6rem] tracking-[0.3em] text-gray-500">
                    VIDEOTRON
                </div>
                <div className="flex items-stretch gap-2">
                    <div className="flex w-16 items-center justify-center rounded border border-gray-300 bg-white/70 text-[0.6rem] text-gray-500">
                        BAND
                    </div>
                    <div className="flex-1 rounded border border-gray-400 bg-gray-200/70 py-3 text-center text-xs font-semibold tracking-[0.3em] text-gray-600">
                        PANGGUNG
                    </div>
                </div>
            </div>

            <div ref={ruang} className="relative" style={{ height: tinggi }}>
            {mejas.map((m) => {
                const titik = letak[m.nomor] ?? { x: 50, y: 50 };

                return (
                    <button
                        key={m.nomor}
                        type="button"
                        onPointerDown={(e) => {
                            if (!aturUlang) return;
                            e.preventDefault();
                            menyeret.current = m.nomor;
                        }}
                        onClick={() => !aturUlang && onPilih?.(m)}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-shadow ${
                            aturUlang ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"
                        } ${disorot === m.nomor ? "ring-4 ring-amber-400" : ""}`}
                        style={{ left: `${titik.x}%`, top: `${titik.y}%`, touchAction: "none" }}
                        aria-label={`Meja ${m.nomor}, ${m.terisi} dari ${m.kapasitas} kursi terisi`}
                    >
                        <MejaBundar meja={m} ukuran={ukuran} />
                    </button>
                );
            })}
            </div>

            <div className="flex justify-end p-3">
                <div className="rounded border border-gray-300 bg-white/70 px-5 py-1 text-[0.6rem] tracking-[0.3em] text-gray-500">
                    PINTU
                </div>
            </div>
        </div>
    );
}

export default function Denah({ acara, mejas, letak: letakAwal, kolom, baris, meja_per_baris, orientasi, layar = false }) {
    const [letak, setLetak] = useState(letakAwal ?? {});
    const [aturUlang, setAturUlang] = useState(false);
    const [belumDisimpan, setBelumDisimpan] = useState(false);
    const [dilihat, setDilihat] = useState(null);
    const [perBaris, setPerBaris] = useState(meja_per_baris ?? "");

    const ubahBentuk = (ubahan) =>
        router.post(
            route("admin.penempatan.denah.grid"),
            {
                meja_per_baris: perBaris === "" ? null : Number(perBaris),
                orientasi,
                ...ubahan,
            },
            { preserveScroll: true }
        );

    // Monitor di sebelah penerima tamu harus ikut berubah saat panitia
    // menempatkan tamu dari ruangan lain, tanpa ada yang menyegarkannya.
    useEffect(() => {
        if (!layar) return;

        const jam = setInterval(
            () => router.reload({ only: ["mejas"], preserveScroll: true }),
            15000
        );

        return () => clearInterval(jam);
    }, [layar]);

    useEffect(() => {
        if (!aturUlang) setLetak(letakAwal ?? {});
    }, [letakAwal, aturUlang]);

    const geser = (nomor, titik) => {
        setLetak((lama) => ({ ...lama, [nomor]: titik }));
        setBelumDisimpan(true);
    };

    const simpan = () => {
        router.post(
            route("admin.penempatan.denah.simpan"),
            { letak },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setBelumDisimpan(false);
                    setAturUlang(false);
                },
            }
        );
    };

    if (!acara || acara.jumlah_meja < 1) {
        return (
            <AuthenticatedLayout>
                <Head title="Denah Meja" />
                <div className="py-12">
                    <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                        <div className="rounded-lg bg-white p-8 shadow-sm">
                            <h1 className="text-2xl font-bold">Denah Meja</h1>
                            <p className="mt-3 text-gray-600">
                                Tata letak kursi belum diatur, jadi belum ada meja untuk digambar.
                            </p>
                            <Link href={route("admin.acara.edit")} className="btn btn-neutral btn-sm mt-6">
                                Atur jumlah kursi
                            </Link>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    const terisi = mejas.reduce((n, m) => n + m.terisi, 0);

    // Mode monitor: tanpa menu, tanpa tombol, sebesar mungkin.
    if (layar) {
        return (
            <>
                <Head title="Denah Meja" />
                <div className="min-h-screen bg-white p-4">
                    <div className="mb-3 flex items-baseline justify-between">
                        <h1 className="text-2xl font-bold">
                            Denah Meja{" "}
                            <span className="text-lg font-normal text-gray-500">
                                {acara.tempat || acara.label}
                            </span>
                        </h1>
                        <p className="text-lg text-gray-600">
                            <strong>{terisi}</strong>/{acara.jumlah_kursi} kursi terisi
                        </p>
                    </div>
                    <Ruangan mejas={mejas} letak={letak} kolom={kolom} baris={baris} orientasi={orientasi} aturUlang={false} layar />
                </div>
            </>
        );
    }

    return (
        <AuthenticatedLayout>
            <Head title="Denah Meja" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <div className="flex flex-wrap items-baseline justify-between gap-3">
                            <h1 className="text-2xl font-bold">
                                Denah Meja{" "}
                                <span className="text-base font-normal text-gray-500">
                                    {acara.tempat || acara.label}
                                </span>
                            </h1>

                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                                <span>
                                    <strong>{terisi}</strong>/{acara.jumlah_kursi} kursi terisi
                                </span>

                                {aturUlang ? (
                                    <>
                                        <button
                                            type="button"
                                            onClick={simpan}
                                            disabled={!belumDisimpan}
                                            className="btn btn-sm btn-primary"
                                        >
                                            Simpan Susunan
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setLetak(letakAwal ?? {});
                                                setBelumDisimpan(false);
                                                setAturUlang(false);
                                            }}
                                            className="btn btn-sm btn-ghost"
                                        >
                                            Batal
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className="join">
                                            {[
                                                ["landscape", "Melebar"],
                                                ["potret", "Memanjang"],
                                            ].map(([nilai, label]) => (
                                                <button
                                                    key={nilai}
                                                    type="button"
                                                    onClick={() => ubahBentuk({ orientasi: nilai })}
                                                    className={`btn btn-sm join-item ${
                                                        orientasi === nilai ? "btn-neutral" : "btn-ghost"
                                                    }`}
                                                >
                                                    {label}
                                                </button>
                                            ))}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => setAturUlang(true)}
                                            className="btn btn-sm btn-neutral"
                                        >
                                            Atur Letak Meja
                                        </button>
                                        <a
                                            href={`${route("admin.penempatan.denah")}?layar=1`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-sm btn-ghost"
                                        >
                                            Mode Monitor
                                        </a>
                                        <Link
                                            href={route("admin.penempatan.index")}
                                            className="btn btn-sm btn-ghost"
                                        >
                                            Atur penempatan
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>

                        {aturUlang && (
                            <div className="alert alert-info mt-4">
                                <span>
                                    Seret meja ke posisinya di ruangan, lalu simpan. Letak disimpan
                                    dalam persen, jadi susunan yang sama ikut terpakai di monitor.
                                </span>
                            </div>
                        )}

                        <div className="mt-6">
                            <Ruangan
                                mejas={mejas}
                                letak={letak}
                                kolom={kolom}
                                baris={baris}
                                orientasi={orientasi}
                                aturUlang={aturUlang}
                                onGeser={geser}
                                onPilih={(m) => setDilihat(dilihat?.nomor === m.nomor ? null : m)}
                                disorot={dilihat?.nomor}
                            />
                        </div>

                        {!aturUlang && dilihat && (
                            <div className="mt-6 rounded-lg border border-amber-300 bg-amber-50 p-5">
                                <h2 className="font-semibold">
                                    Meja {dilihat.nomor} &mdash; {dilihat.terisi}/{dilihat.kapasitas} kursi
                                </h2>
                                <ol className="mt-3 grid gap-x-8 gap-y-1 sm:grid-cols-2">
                                    {dilihat.kursi.map((k) => (
                                        <li key={k.nomor} className="flex gap-3 text-sm">
                                            <span className="w-5 shrink-0 text-gray-400">{k.nomor}</span>
                                            <span className={k.tamu ? "" : "text-gray-400"}>
                                                {k.tamu ? k.tamu.nama : "kosong"}
                                            </span>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        )}

                        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                            <p className="text-xs text-gray-500">
                                Kursi 1 berada di sisi terdekat panggung, lalu berputar searah jarum jam.
                            </p>

                            {!aturUlang && (
                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                    <label className="flex items-center gap-2">
                                        Meja per baris
                                        <input
                                            type="number"
                                            min="1"
                                            value={perBaris}
                                            onChange={(e) => setPerBaris(e.target.value)}
                                            placeholder={String(kolom)}
                                            className="input input-bordered input-xs w-20"
                                        />
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => ubahBentuk({})}
                                        className="btn btn-xs btn-neutral"
                                    >
                                        Terapkan
                                    </button>
                                    <span className="text-gray-400">
                                        {kolom} &times; {baris}, kosongkan untuk otomatis
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => router.post(route("admin.penempatan.denah.reset"), {}, { preserveScroll: true })}
                                        className="underline hover:text-gray-800"
                                    >
                                        Kembalikan ke grid
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
