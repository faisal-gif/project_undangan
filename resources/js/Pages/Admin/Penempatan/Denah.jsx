import AtiLogo from "@/Components/AtiLogo";
import PialaTiga from "@/Components/PialaTiga";
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
const JARI_MEJA = 44;
const JARI_KURSI_MAKS = 20;

/**
 * Celahnya negatif: kursi diselipkan ke bawah tepi meja, bukan dijajar di
 * luarnya. Begitulah kursi banquet yang sudah didorong masuk terlihat dari
 * atas, dan itu yang membedakan gambar ini dari bunga tujuh kelopak.
 *
 * Piringannya digambar BELAKANGAN supaya sandaran kursi benar-benar
 * tertutup olehnya - kalau urutannya terbalik, kursinya tampak ditumpuk di
 * atas meja.
 */
const CELAH = -6;
const ORBIT = JARI_MEJA + CELAH + JARI_KURSI_MAKS;
const KOTAK = (ORBIT + JARI_KURSI_MAKS + 2) * 2;

/**
 * Dua tempat, dua ruangan yang berbeda.
 *
 * Halaman admin dibaca dari jarak dekat di ruang kerja yang terang. Mode
 * monitor berdiri di meja penerima tamu saat acara berlangsung - ballroom
 * yang lampunya diredupkan - dan dibaca dari beberapa meter. Lembar putih
 * seukuran layar itu menyilaukan dan justru menenggelamkan kursi ambernya,
 * jadi ruangannya digelapkan dan kursi yang terisi yang menyala.
 *
 * Warnanya hanya dua: abu-abu netral dan amber yang sudah dipakai seluruh
 * panel admin. Amber berarti "ada orangnya" di mana pun ia muncul.
 */
const TEMA = {
    terang: {
        // Tiga lapis: dinding, lantai, lalu benda di atasnya. Tanpa jeda
        // warna antara dinding dan lantai, panggung dan pintu tampak
        // melayang di pita putih, bukan berdiri di ruangan yang sama.
        bingkai: "border-amber-200/70 bg-amber-50/50",
        lantai: "bg-amber-100/50",
        panggung: "bg-gray-900 text-white",
        videotron: "bg-gray-600 text-gray-100",
        band: "bg-gray-700 text-gray-100",
        papan: "border-gray-400 bg-white text-gray-600",
        redup: "text-gray-500",
        meja: {
            kosong: { piring: "fill-white stroke-gray-300", taplak: "stroke-gray-200", angka: "fill-gray-500" },
            sebagian: { piring: "fill-white stroke-amber-400", taplak: "stroke-amber-200", angka: "fill-gray-800" },
            penuh: { piring: "fill-amber-100 stroke-amber-500", taplak: "stroke-amber-300", angka: "fill-amber-900" },
        },
        kursi: {
            kosong: { bulat: "fill-white stroke-gray-300", angka: "fill-gray-500" },
            isi: { bulat: "fill-amber-400 stroke-amber-600", angka: "fill-amber-950" },
        },
        bayang: "drop-shadow(0 1px 1.5px rgb(0 0 0 / 0.18))",
    },
    /**
     * Mode monitor memakai warna acaranya sendiri - anggur dan emas ATI, sama
     * dengan undangan yang sudah dipegang tamu. Layar ini berdiri di meja
     * penerima tamu, dilihat orang yang baru datang: ia bagian dari acara,
     * bukan jendela panel admin yang kebetulan dipasang di ballroom.
     *
     * Emas hanya untuk kursi yang ada orangnya. Itu satu-satunya hal yang
     * dicari tamu di layar ini, jadi tidak ada benda lain yang boleh
     * seterang itu - panggungnya pun maroon, bukan emas.
     */
    gala: {
        bingkai: "border-ati-gold/25 bg-ati-wine/70",
        lantai: "bg-ati-ink/70",
        panggung: "bg-ati-maroon text-ati-gold-light",
        videotron: "bg-ati-gold/25 text-ati-gold-light",
        band: "bg-ati-wine text-ati-gold/80",
        papan: "border-ati-gold/30 bg-ati-wine text-ati-cream/70",
        redup: "text-ati-cream/70",
        meja: {
            kosong: { piring: "fill-ati-wine stroke-ati-gold/30", taplak: "stroke-ati-gold/15", angka: "fill-ati-cream/60" },
            sebagian: { piring: "fill-ati-wine stroke-ati-gold/70", taplak: "stroke-ati-gold/30", angka: "fill-ati-cream" },
            penuh: { piring: "fill-ati-maroon stroke-ati-gold", taplak: "stroke-ati-gold/45", angka: "fill-ati-gold-light" },
        },
        kursi: {
            kosong: { bulat: "fill-ati-wine stroke-ati-gold/30", angka: "fill-ati-cream/50" },
            isi: { bulat: "fill-ati-gold stroke-ati-gold-light", angka: "fill-ati-ink" },
        },
        bayang: "drop-shadow(0 2px 3px rgb(0 0 0 / 0.55))",
    },
};

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
    landscape: { vh: 0.64, min: 440, maks: 1000, rasio: 1.95 },
    potret: { vh: 0.76, min: 540, maks: 1250, rasio: 0.72 },
};

/**
 * Tinggi yang dipakai selain lantai di mode monitor: kepala halaman, panggung,
 * pintu, keterangan, dan jaraknya. Diukur, bukan dikira.
 *
 * Dikurangkan, bukan dipersenkan. Pecahan dari tinggi layar hanya benar di
 * satu ukuran monitor - yang 0.79 tadinya pas di 1080 tapi membuat laptop
 * 900px tergulir seratus piksel, dan di monitor penerima tamu tidak ada yang
 * menggulirnya. Selisihnya tetap, jadi satu angka benar di semua ukuran.
 */
const SISA_LAYAR = 348;

/**
 * Tinggi lantai mengikuti tinggi layar, bukan angka tetap.
 *
 * Denah ini juga tampil di monitor besar sebelah penerima tamu; tinggi yang
 * dipatok membuat separuh layar terbuang dan mejanya kecil tanpa alasan.
 */
/**
 * Denah ini sebuah peta, bukan tabel: memaksanya muat di layar 375px
 * membuat semua meja jatuh ke MEJA_MIN dan saling menimpa, dan angkanya
 * tidak terbaca lagi. Jadi di layar sempit lantainya dipatok selebar ini dan
 * digeser ke samping - gerakan yang memang wajar untuk peta.
 *
 * 110px per kolom menghasilkan meja sekitar 95px - diukur, bukan ditebak:
 * barisnya yang mengikat, bukan kolomnya, karena rasio ruangan membuat sel
 * vertikal selalu ~11% lebih sempit. Dibagi LANTAI_LEBAR karena hanya
 * sebagian lantai yang dipakai meja.
 */
function lebarLantaiSempit(kolom) {
    return Math.round((Math.max(1, kolom) * 110 * 100) / LANTAI_LEBAR);
}

function tinggiLantai(bentuk, tinggiLayar, layar = false) {
    // Mode monitor hampir tidak punya hiasan di sekelilingnya - tanpa menu,
    // tanpa tombol - jadi lantainya mengambil seluruh sisa layar. Halaman
    // admin masih harus berbagi dengan tombol-tombolnya, dan di sana halaman
    // yang digulir sedikit memang wajar.
    const layarTinggi = tinggiLayar || 900;
    const muat = layar ? layarTinggi - SISA_LAYAR : layarTinggi * bentuk.vh;

    return Math.max(bentuk.min, Math.min(bentuk.maks, muat));
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

/**
 * Keadaan satu meja dalam tiga langkah, bukan dua.
 *
 * Dulu meja hanya "penuh" atau "tidak", padahal yang dicari panitia justru
 * meja yang masih setengah - itu yang paling mungkin diisi berikutnya. Tiga
 * langkah membuat seluruh ruangan terbaca sekali pandang tanpa perlu
 * menghitung kursi satu per satu.
 */
function keadaanMeja(meja) {
    if (meja.terisi <= 0) return "kosong";

    return meja.terisi >= meja.kapasitas ? "penuh" : "sebagian";
}

function MejaBundar({ meja, ukuran, t }) {
    const jariK = jariKursi(meja.kursi.length);
    const rupa = t.meja[keadaanMeja(meja)];

    // Ukuran huruf diturunkan dari jari-jarinya, bukan dipatok, supaya angka
    // selalu mengisi bulatannya - termasuk saat kursi mengecil karena satu
    // meja diisi banyak kursi.
    const hurufMeja = Math.round(JARI_MEJA * 0.62);
    const hurufKursi = Math.round(jariK * 0.95);
    const pusat = KOTAK / 2;

    return (
        <svg
            viewBox={`0 0 ${KOTAK} ${KOTAK}`}
            style={{ width: ukuran, height: ukuran, filter: t.bayang }}
        >
            {/* Kursi lebih dulu: tepi meja yang menutupi sandarannya. */}
            {meja.kursi.map((k, i) => {
                const { x, y } = posisiKursi(i, meja.kursi.length);
                const gaya = k.tamu ? t.kursi.isi : t.kursi.kosong;

                return (
                    <circle key={k.nomor} cx={x} cy={y} r={jariK} className={gaya.bulat} strokeWidth="2">
                        <title>{`Kursi ${k.nomor}: ${k.tamu ? k.tamu.nama : "kosong"}`}</title>
                    </circle>
                );
            })}

            <circle cx={pusat} cy={pusat} r={JARI_MEJA} className={rupa.piring} strokeWidth="2.5" />

            {/* Lipatan taplak: satu lingkaran tipis sedikit di dalam tepinya.
                Tanpa ini piringannya hanya bulatan polos - garis inilah yang
                membuatnya terbaca sebagai meja yang ditaplaki. */}
            <circle
                cx={pusat}
                cy={pusat}
                r={JARI_MEJA - 7}
                fill="none"
                className={rupa.taplak}
                strokeWidth="1.5"
            />

            <text
                x={pusat}
                y={pusat + hurufMeja * 0.35}
                textAnchor="middle"
                fontSize={hurufMeja}
                className={`font-bold ${rupa.angka}`}
            >
                {meja.nomor}
            </text>

            {/* Nomor kursi digambar paling akhir supaya tidak ada yang
                menutupinya, termasuk tepi meja. */}
            {meja.kursi.map((k, i) => {
                const { x, y } = posisiKursi(i, meja.kursi.length);
                const gaya = k.tamu ? t.kursi.isi : t.kursi.kosong;

                return (
                    <text
                        key={k.nomor}
                        x={x}
                        y={y + hurufKursi * 0.35}
                        textAnchor="middle"
                        fontSize={hurufKursi}
                        className={`font-bold ${gaya.angka}`}
                    >
                        {k.nomor}
                    </text>
                );
            })}
        </svg>
    );
}

/**
 * Amber tidak menjelaskan dirinya sendiri. Keterangan ini yang paling
 * dibutuhkan justru di monitor penerima tamu, tempat yang melihat bukan
 * panitia yang sudah hafal.
 */
function Keterangan({ t }) {
    const tanda = [
        ["Kursi terisi", t.kursi.isi.bulat],
        ["Kursi kosong", t.kursi.kosong.bulat],
        ["Meja penuh", t.meja.penuh.piring],
        ["Meja terisi sebagian", t.meja.sebagian.piring],
    ];

    return (
        <ul className={`mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs ${t.redup}`}>
            {tanda.map(([label, kelas]) => (
                <li key={label} className="flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
                        <circle cx="10" cy="10" r="8" className={kelas} strokeWidth="2.5" />
                    </svg>
                    {label}
                </li>
            ))}
        </ul>
    );
}

/**
 * Ruangan beserta isinya. Dipakai mode admin dan mode monitor; bedanya hanya
 * boleh-tidaknya digeser dan warnanya.
 */
function Ruangan({ mejas, letak, kolom, baris, orientasi, aturUlang, layar = false, tema = "terang", onGeser, onPilih, disorot }) {
    const ruang = useRef(null);
    const menyeret = useRef(null);
    const bentuk = LANTAI[orientasi] ?? LANTAI.landscape;
    const t = TEMA[tema];
    const [ukuran, setUkuran] = useState(90);
    const [tinggi, setTinggi] = useState(bentuk.min);
    const [lebarMin, setLebarMin] = useState(0);

    useEffect(() => {
        const el = ruang.current;
        if (!el) return;

        const hitung = () => {
            // Mode monitor selalu layar besar, jadi tidak pernah ikut aturan
            // layar sempit walau jendelanya kebetulan dikecilkan.
            const sempit = !layar && window.innerWidth < 1024;
            const min = sempit ? lebarLantaiSempit(kolom) : 0;

            // Saat dipatok, tingginya diturunkan dari lebar itu supaya bentuk
            // ruangannya tetap benar - bukan dari tinggi jendela, yang akan
            // membuat ruangan melebar jadi tampak hampir persegi.
            const tinggiBaru = sempit
                ? Math.round(min / bentuk.rasio)
                : tinggiLantai(bentuk, window.innerHeight, layar);

            setLebarMin(min);
            setTinggi(tinggiBaru);
            setUkuran(
                ukuranMeja(Math.max(el.getBoundingClientRect().width, min), tinggiBaru, kolom, baris)
            );
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
        <>
            <div className="overflow-x-auto">
                <div
                    className={`mx-auto w-full overflow-hidden rounded-xl border shadow-[0_1px_3px_rgb(0_0_0/0.08),0_8px_24px_-12px_rgb(0_0_0/0.18)] ${t.bingkai}`}
                    style={{ maxWidth: Math.max(tinggi * bentuk.rasio, lebarMin), minWidth: lebarMin }}
                >
                    {/* Panggung adalah benda paling besar di ruangan dan satu-satunya
                        penunjuk arah yang dipunyai denah ini - dari situ orang tahu
                        mana depan. Videotron digambar menempel di atasnya, seperti
                        letaknya yang sebenarnya, bukan melayang sebagai kotak lain. */}
                    <div className="flex items-stretch gap-2 p-3">
                        <div
                            className={`flex w-16 shrink-0 items-center justify-center rounded-md text-[0.65rem] font-semibold tracking-[0.15em] ${t.band}`}
                        >
                            BAND
                        </div>
                        <div className={`min-w-0 flex-1 rounded-md px-3 pb-2 pt-2 ${t.panggung}`}>
                            <div
                                className={`mx-auto w-2/3 rounded-sm py-0.5 text-center text-[0.55rem] tracking-[0.3em] ${t.videotron}`}
                            >
                                VIDEOTRON
                            </div>
                            <p className="mt-1.5 text-center text-xs font-semibold tracking-[0.35em]">
                                PANGGUNG
                            </p>
                        </div>
                    </div>

                    <div ref={ruang} className={`relative ${t.lantai}`} style={{ height: tinggi }}>
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
                                    className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full outline-none transition-transform duration-150 ${
                                        aturUlang
                                            ? "cursor-grab active:cursor-grabbing active:scale-105"
                                            : "cursor-pointer hover:scale-[1.06] focus-visible:ring-4 focus-visible:ring-amber-400/70"
                                    } ${disorot === m.nomor ? "scale-[1.06] ring-4 ring-amber-400" : ""}`}
                                    style={{ left: `${titik.x}%`, top: `${titik.y}%`, touchAction: "none" }}
                                    aria-label={`Meja ${m.nomor}, ${m.terisi} dari ${m.kapasitas} kursi terisi`}
                                >
                                    <MejaBundar meja={m} ukuran={ukuran} t={t} />
                                </button>
                            );
                        })}
                    </div>

                    {/* Pintu di dinding belakang, berseberangan dengan panggung. */}
                    <div className="flex justify-end p-3">
                        <div
                            className={`rounded-md border px-6 py-1 text-[0.65rem] font-semibold tracking-[0.2em] ${t.papan}`}
                        >
                            PINTU
                        </div>
                    </div>
                </div>
            </div>

            <Keterangan t={t} />

            {lebarMin > 0 && (
                <p className={`mt-2 text-center text-xs ${t.redup}`}>
                    Geser denah ke samping untuk melihat seluruh ruangan.
                </p>
            )}
        </>
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

    // Mode monitor: tanpa menu, tanpa tombol, sebesar mungkin, dan berwarna
    // acaranya sendiri - ia berdiri di meja penerima tamu, bukan di ruang
    // kerja. Kelas ati-guest membawa serta butiran kertas dan batang gulir
    // emas yang sudah dipakai undangan, jadi layar ini sewarna dengannya.
    if (layar) {
        return (
            <>
                <Head title="Denah Meja" />
                <div className="ati-guest relative min-h-screen overflow-hidden bg-ati-ink font-sans text-ati-cream">
                    {/* Sorot lampu jatuh dari sisi panggung, dan lantai di
                        dekat pintu meredup - ruangannya punya arah, bukan
                        kehitaman rata. */}
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0"
                        style={{
                            background:
                                "radial-gradient(ellipse 68% 42% at 50% -8%, rgba(214,162,73,0.18) 0%, transparent 62%)," +
                                "radial-gradient(ellipse 120% 65% at 50% 112%, rgba(122,15,31,0.32) 0%, transparent 72%)",
                        }}
                    />

                    <div className="relative z-10 p-5">
                        <header className="mb-3 flex items-center justify-between gap-6">
                            <div className="flex min-w-0 items-center gap-4">
                                <PialaTiga
                                    sumber="/piala1baru.glb"
                                    alt="Piala Anugerah TIMES Indonesia"
                                    className="hidden w-28 shrink-0 sm:block"
                                    tinggi="124px"
                                    interaktif={false}
                                    diam
                                />
                                <div className="min-w-0">
                                    <AtiLogo className="mb-1 h-6 w-auto" />
                                    <h1 className="font-heading text-4xl font-semibold leading-none text-ati-gold-light">
                                        Denah Meja
                                    </h1>
                                    <p className="mt-1 truncate text-lg text-ati-cream/70">
                                        {acara.tempat || acara.label}
                                    </p>
                                </div>
                            </div>

                            <p className="shrink-0 text-right">
                                <span className="font-heading text-5xl font-bold tabular-nums text-ati-gold">
                                    {terisi}
                                </span>
                                <span className="text-xl text-ati-cream/70">
                                    {" "}
                                    / {acara.jumlah_kursi}
                                </span>
                                <span className="block text-sm uppercase tracking-[0.25em] text-ati-cream/50">
                                    kursi terisi
                                </span>
                            </p>
                        </header>

                        <Ruangan
                            mejas={mejas}
                            letak={letak}
                            kolom={kolom}
                            baris={baris}
                            orientasi={orientasi}
                            aturUlang={false}
                            tema="gala"
                            layar
                        />
                    </div>
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

                            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-gray-600">
                                {/* Di layar sempit angkanya dapat barisnya sendiri; kalau
                                    disejajarkan dengan tombol, ia tampak seperti label tombol. */}
                                <span className="w-full lg:w-auto">
                                    <strong className="tabular-nums">{terisi}</strong>/
                                    <span className="tabular-nums">{acara.jumlah_kursi}</span> kursi terisi
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
                            <div className="mt-6 overflow-hidden rounded-xl border border-amber-300">
                                <div className="flex items-center gap-3 border-b border-amber-300 bg-amber-50 px-4 py-3">
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-amber-500 bg-white font-bold tabular-nums text-amber-900">
                                        {dilihat.nomor}
                                    </span>
                                    <div className="min-w-0">
                                        <h2 className="font-semibold text-gray-900">
                                            Meja {dilihat.nomor}
                                        </h2>
                                        <p className="text-sm text-amber-900">
                                            <span className="tabular-nums">{dilihat.terisi}</span> dari{" "}
                                            <span className="tabular-nums">{dilihat.kapasitas}</span> kursi
                                            terisi
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setDilihat(null)}
                                        className="btn btn-ghost btn-sm ml-auto shrink-0"
                                    >
                                        Tutup
                                    </button>
                                </div>

                                <ol className="grid gap-x-8 gap-y-1 p-4 sm:grid-cols-2">
                                    {dilihat.kursi.map((k) => (
                                        <li key={k.nomor} className="flex items-baseline gap-3 text-sm">
                                            <span className="w-5 shrink-0 text-xs font-semibold tabular-nums text-gray-400">
                                                {k.nomor}
                                            </span>
                                            <span className={k.tamu ? "text-gray-900" : "text-gray-400"}>
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
