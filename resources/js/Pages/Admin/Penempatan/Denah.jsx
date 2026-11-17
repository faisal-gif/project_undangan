import AtiLogo from "@/Components/AtiLogo";
import Ruangan from "@/Components/DenahRuangan";
import PialaTiga from "@/Components/PialaTiga";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";

/**
 * Denah ruangan yang bisa diatur: meja digeser ke posisi sebenarnya di
 * ballroom, lalu susunannya disimpan.
 *
 * Koordinatnya persen, bukan piksel. Denah ini dipakai di tiga tempat dengan
 * ukuran yang jauh berbeda - layar admin, monitor besar di sebelah meja
 * penerima tamu, dan kertas - dan persen membuat ketiganya menampilkan
 * susunan yang sama. Gambarnya sendiri ada di Components/DenahRuangan.
 */
export default function Denah({ acara, mejas, letak: letakAwal, kolom, baris, meja_per_baris, orientasi, layar = false }) {
    const { errors } = usePage().props;
    const [letak, setLetak] = useState(letakAwal ?? {});
    const [aturUlang, setAturUlang] = useState(false);
    const [belumDisimpan, setBelumDisimpan] = useState(false);
    // Yang disimpan nomornya, bukan mejanya. Kartu meja dimuat ulang setiap
    // kali kursinya diubah, dan benda yang disalin ke state akan tetap
    // memperlihatkan jumlah kursi yang lama setelahnya.
    const [dilihat, setDilihat] = useState(null);
    const [sibuk, setSibuk] = useState(false);
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

    // Kursi meja juga bisa digeser dari sini, bukan cuma dari papan
    // penempatan: saat menyusun denah, meja yang terlalu dekat pintu atau
    // terlalu mepet panggung baru kelihatan di gambar ini.
    const aturKursi = (meja, jumlah) => {
        if (sibuk) return;

        setSibuk(true);
        router.post(
            route("admin.penempatan.kursi-tambahan"),
            { meja, jumlah },
            { preserveScroll: true, onFinish: () => setSibuk(false) }
        );
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
    const meja = dilihat ? mejas.find((m) => m.nomor === dilihat) : null;

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
                                        <Link
                                            href={route("admin.penempatan.cetak")}
                                            className="btn btn-sm btn-neutral"
                                        >
                                            Cetak
                                        </Link>
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
                                onPilih={(m) => setDilihat(dilihat === m.nomor ? null : m.nomor)}
                                disorot={dilihat}
                            />
                        </div>

                        {!aturUlang && meja && (
                            <div className="mt-6 overflow-hidden rounded-xl border border-amber-300">
                                <div className="flex flex-wrap items-center gap-3 border-b border-amber-300 bg-amber-50 px-4 py-3">
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-amber-500 bg-white font-bold tabular-nums text-amber-900">
                                        {meja.nomor}
                                    </span>
                                    <div className="min-w-0">
                                        <h2 className="font-semibold text-gray-900">
                                            Meja {meja.nomor}
                                            {meja.ubahan !== 0 && (
                                                <span
                                                    className={`ml-2 align-middle text-[0.65rem] font-semibold uppercase tracking-wide ${
                                                        meja.ubahan > 0 ? "text-amber-700" : "text-gray-500"
                                                    }`}
                                                >
                                                    {meja.ubahan > 0 ? "+" : "−"}
                                                    {Math.abs(meja.ubahan)} kursi
                                                </span>
                                            )}
                                        </h2>
                                        <p className="text-sm text-amber-900">
                                            <span className="tabular-nums">{meja.terisi}</span> dari{" "}
                                            <span className="tabular-nums">{meja.kapasitas}</span> kursi
                                            terisi
                                        </p>
                                    </div>

                                    {/* Kursinya bisa digeser dari sini juga. Meja yang
                                        terlalu mepet pintu atau panggung baru kelihatan
                                        saat denahnya dilihat, bukan saat daftarnya. */}
                                    <div className="ml-auto flex items-center gap-2 text-xs text-amber-900">
                                        <span>Jumlah kursi</span>
                                        <div className="join">
                                            <button
                                                type="button"
                                                onClick={() => aturKursi(meja.nomor, meja.ubahan - 1)}
                                                disabled={sibuk || meja.kapasitas <= 0}
                                                className="btn btn-xs join-item"
                                                aria-label={`Kurangi kursi di meja ${meja.nomor}`}
                                            >
                                                &minus;
                                            </button>
                                            <span className="join-item border-y border-amber-300 bg-white px-2 font-semibold leading-6 tabular-nums text-gray-800">
                                                {meja.kapasitas}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => aturKursi(meja.nomor, meja.ubahan + 1)}
                                                disabled={sibuk}
                                                className="btn btn-xs join-item"
                                                aria-label={`Tambah kursi di meja ${meja.nomor}`}
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setDilihat(null)}
                                        className="btn btn-ghost btn-sm shrink-0"
                                    >
                                        Tutup
                                    </button>
                                </div>

                                {errors.meja && (
                                    <div className="border-b border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
                                        {errors.meja}
                                    </div>
                                )}

                                <ol className="grid gap-x-8 gap-y-1 p-4 sm:grid-cols-2">
                                    {meja.kursi.map((k) => (
                                        <li key={k.nomor} className="flex items-baseline gap-3 text-sm">
                                            <span className="w-5 shrink-0 text-xs font-semibold tabular-nums text-gray-400">
                                                {k.nomor}
                                            </span>
                                            <span className={k.tamu ? "text-gray-900" : "text-gray-400"}>
                                                {k.tamu ? k.tamu.nama : "kosong"}
                                            </span>
                                        </li>
                                    ))}
                                    {meja.kursi.length === 0 && (
                                        <li className="text-sm text-gray-400">
                                            Meja ini tidak punya kursi.
                                        </li>
                                    )}
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
