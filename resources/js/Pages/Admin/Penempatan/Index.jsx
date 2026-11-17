import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { useState } from "react";

/**
 * Papan penempatan: daftar tamu yang belum duduk di kiri, susunan meja di
 * kanan.
 *
 * Nomor kursi tidak pernah diketik. Admin memilih satu tamu, lalu menunjuk
 * mejanya; sistem yang mengambil kursi kosong. Cara ini menghapus seluruh
 * kelas salah ketik sekaligus - kursi ganda, kursi di luar kapasitas, dan
 * jumlah kursi yang tidak sesuai jumlah orang.
 *
 * Rombongannya tidak harus utuh satu meja: undangan berkuota 2 bisa diisi
 * satu orang di sini dan satu lagi di meja lain. Yang dipilih adalah berapa
 * orang yang duduk di meja ini, dan tamunya tetap di daftar kiri sampai
 * seluruh kuotanya kebagian kursi.
 */
export default function Index({ acara, mejas, belum }) {
    const { errors } = usePage().props;
    const [dipilih, setDipilih] = useState(null);
    const [jumlah, setJumlah] = useState(1);
    const [cari, setCari] = useState("");

    // Daftar di kiri dimuat ulang setiap kali ada penempatan, jadi yang
    // dipegang state bisa basi. Yang dipakai selalu baris terbarunya.
    const aktif = dipilih && belum.find((t) => t.id === dipilih.id);
    const sisa = aktif ? aktif.sisa : 0;
    const duduk = Math.min(Math.max(jumlah, 1), Math.max(sisa, 1));

    const pilih = (t) => {
        const sama = aktif?.id === t.id;
        setDipilih(sama ? null : t);
        if (!sama) setJumlah(t.sisa);
    };

    const tempatkan = (meja) => {
        if (!aktif) return;

        router.post(
            route("admin.penempatan.tempatkan"),
            { tamu_id: aktif.id, meja, jumlah: duduk },
            {
                preserveScroll: true,
                // Tamu yang masih bersisa tetap terpilih, supaya sisa
                // rombongannya bisa langsung ditunjuk ke meja berikutnya.
                onSuccess: (halaman) => {
                    const lagi = halaman.props.belum.find((t) => t.id === aktif.id);
                    setDipilih(lagi ?? null);
                    setJumlah(lagi ? lagi.sisa : 1);
                },
            }
        );
    };

    const keluarkan = (tamuId, meja) => {
        router.post(
            route("admin.penempatan.keluarkan", tamuId),
            { meja },
            { preserveScroll: true }
        );
    };

    const terlihat = belum.filter((t) =>
        t.nama.toLowerCase().includes(cari.trim().toLowerCase())
    );

    if (!acara || acara.jumlah_meja < 1) {
        return (
            <AuthenticatedLayout>
                <Head title="Penempatan Kursi" />
                <div className="py-12">
                    <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                        <div className="rounded-lg bg-white p-8 shadow-sm">
                            <h1 className="text-2xl font-bold">Penempatan Kursi</h1>
                            <p className="mt-3 text-gray-600">
                                Tata letak kursi belum diatur, jadi belum ada meja untuk diisi.
                            </p>
                            <Link
                                href={route("admin.acara.edit")}
                                className="btn btn-neutral btn-sm mt-6"
                            >
                                Atur jumlah kursi
                            </Link>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    const totalTerisi = mejas.reduce((n, m) => n + m.terisi, 0);

    // Pengatur "berapa orang di meja ini". Hanya muncul kalau memang ada
    // yang bisa dibagi - undangan satu orang tidak punya pilihan apa pun.
    const kontrolJumlah = sisa > 1 && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-xs">Duduk di meja ini:</span>
            <div className="join">
                <button
                    type="button"
                    onClick={() => setJumlah(Math.max(1, duduk - 1))}
                    disabled={duduk <= 1}
                    className="btn btn-xs join-item"
                >
                    &minus;
                </button>
                <span className="join-item border-y border-base-300 bg-white px-3 text-sm font-semibold leading-6">
                    {duduk}
                </span>
                <button
                    type="button"
                    onClick={() => setJumlah(Math.min(sisa, duduk + 1))}
                    disabled={duduk >= sisa}
                    className="btn btn-xs join-item"
                >
                    +
                </button>
            </div>
            <span className="text-xs">
                dari {sisa} yang belum duduk
                {duduk < sisa && ` · sisa ${sisa - duduk} ke meja lain`}
            </span>
        </div>
    );

    return (
        <AuthenticatedLayout>
            <Head title="Penempatan Kursi" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="rounded-lg bg-white p-4 shadow-sm sm:p-6">
                        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                            <h1 className="text-2xl font-bold">
                                Penempatan Kursi{" "}
                                <span className="text-base font-normal text-gray-500">
                                    {acara.label}
                                </span>
                            </h1>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                <p className="text-sm text-gray-600">
                                    {acara.jumlah_meja} meja &middot; {acara.jumlah_kursi} kursi &middot;{" "}
                                    <strong>{totalTerisi}</strong> terisi, {acara.jumlah_kursi - totalTerisi} kosong
                                </p>
                                <Link
                                    href={route("admin.penempatan.cetak")}
                                    className="btn btn-sm btn-ghost"
                                >
                                    Cetak
                                </Link>
                            </div>
                        </div>

                        {(errors.meja || errors.tamu_id) && (
                            <div className="alert alert-error mt-4">
                                <span>{errors.meja || errors.tamu_id}</span>
                            </div>
                        )}

                        {/*
                            min-w-0 wajib di kedua anaknya. Kolom grid
                            berukuran auto tidak mau menyusut di bawah
                            min-content isinya, jadi nama panjang di daftar
                            meja menarik seluruh halaman jadi 509px di layar
                            375px - melebar diam-diam, karena pembungkus
                            drawer di layout yang menelan geserannya.
                        */}
                        <div className="mt-6 grid gap-8 lg:grid-cols-[22rem_1fr]">
                            {/* Tamu yang belum duduk */}
                            <div className="min-w-0">
                                <h2 className="font-semibold">
                                    Belum ditempatkan ({belum.length})
                                </h2>

                                <input
                                    type="text"
                                    value={cari}
                                    onChange={(e) => setCari(e.target.value)}
                                    placeholder="Cari nama..."
                                    className="input input-bordered input-sm mt-3 w-full"
                                />

                                {aktif && (
                                    <div className="mt-3 hidden rounded bg-amber-50 px-3 py-2 text-sm text-amber-900 lg:block">
                                        <p>
                                            <strong>{aktif.nama}</strong> dipilih &mdash; klik meja
                                            tujuan.{" "}
                                            {aktif.sudah > 0
                                                ? `${aktif.sudah} dari ${aktif.jumlah_orang} sudah duduk.`
                                                : `Butuh ${aktif.jumlah_orang} kursi.`}
                                        </p>
                                        {kontrolJumlah}
                                    </div>
                                )}

                                <ul className="mt-3 max-h-72 overflow-y-auto lg:max-h-[32rem]">
                                    {terlihat.length === 0 && (
                                        <li className="py-6 text-sm text-gray-500">
                                            {belum.length === 0
                                                ? "Semua tamu sudah ditempatkan."
                                                : "Tidak ada nama yang cocok."}
                                        </li>
                                    )}

                                    {terlihat.map((t) => (
                                        <li key={t.id}>
                                            <button
                                                type="button"
                                                onClick={() => pilih(t)}
                                                className={`w-full border-b px-3 py-2 text-left text-sm transition-colors ${
                                                    aktif?.id === t.id
                                                        ? "bg-amber-100 font-semibold"
                                                        : "hover:bg-gray-50"
                                                }`}
                                            >
                                                {t.nama}
                                                <span className="ml-2 text-xs text-gray-500">
                                                    {t.sudah > 0
                                                        ? `sisa ${t.sisa} dari ${t.jumlah_orang} org`
                                                        : `${t.jumlah_orang} org`}
                                                </span>
                                                {t.lembaga && (
                                                    <span className="block text-xs text-gray-400">
                                                        {t.lembaga}
                                                    </span>
                                                )}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Susunan meja */}
                            <div
                                className={`grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-3 ${
                                    // Bilah pilihan di bawah layar menutupi
                                    // kartu terakhir; ia lebih tinggi sejak
                                    // memuat pengatur jumlah orang.
                                    aktif ? "pb-40 lg:pb-0" : ""
                                }`}
                            >
                                {mejas.map((m) => {
                                    const penuh = m.terisi >= m.kapasitas;
                                    // Satu tamu memakai beberapa kursi berturut-turut, jadi
                                    // lembaganya hanya ditulis di kursi pertamanya - kalau
                                    // diulang, kartunya jadi dua kali lebih tinggi tanpa
                                    // menambah satu pun keterangan baru. Memakai Set, bukan
                                    // membandingkan kursi sebelumnya, karena kursi satu tamu
                                    // tidak dijamin berdampingan.
                                    const sudahDisebut = new Set();
                                    // Yang harus muat cuma orang yang didudukkan
                                    // di meja ini, bukan seluruh rombongannya.
                                    const cukup = aktif && m.kapasitas - m.terisi >= duduk;

                                    return (
                                        <div
                                            key={m.nomor}
                                            className={`min-w-0 rounded-lg border p-4 ${
                                                aktif && cukup
                                                    ? "border-amber-400 bg-amber-50"
                                                    : penuh
                                                        ? "border-gray-200 bg-gray-50"
                                                        : "border-gray-200"
                                            }`}
                                        >
                                            <div className="flex items-baseline justify-between">
                                                <h3 className="font-semibold">Meja {m.nomor}</h3>
                                                <span className="text-xs text-gray-500">
                                                    {m.terisi}/{m.kapasitas}
                                                </span>
                                            </div>

                                            <ol className="mt-3 space-y-1">
                                                {m.kursi.map((k) => {
                                                    const ulang =
                                                        k.tamu && sudahDisebut.has(k.tamu.id);

                                                    if (k.tamu) sudahDisebut.add(k.tamu.id);

                                                    return (
                                                        <li
                                                            key={k.nomor}
                                                            className="flex items-start gap-2 text-xs leading-5"
                                                        >
                                                            <span className="w-4 shrink-0 text-gray-400">
                                                                {k.nomor}
                                                            </span>
                                                            <span
                                                                className={
                                                                    k.tamu
                                                                        ? "text-gray-800"
                                                                        : "text-gray-300"
                                                                }
                                                            >
                                                                {k.tamu ? k.tamu.nama : "kosong"}
                                                                {k.tamu?.lembaga && !ulang && (
                                                                    <span className="block text-gray-400">
                                                                        {k.tamu.lembaga}
                                                                    </span>
                                                                )}
                                                            </span>
                                                        </li>
                                                    );
                                                })}
                                            </ol>

                                            {aktif ? (
                                                <button
                                                    type="button"
                                                    disabled={!cukup}
                                                    onClick={() => tempatkan(m.nomor)}
                                                    className="btn btn-sm btn-neutral mt-3 w-full"
                                                >
                                                    {cukup
                                                        ? `Dudukkan ${duduk} di sini`
                                                        : `Sisa ${m.kapasitas - m.terisi} kursi`}
                                                </button>
                                            ) : (
                                                m.tamus.length > 0 && (
                                                    <ul className="mt-3 space-y-1 border-t pt-2">
                                                        {m.tamus.map((t) => (
                                                            <li
                                                                key={t.id}
                                                                className="flex items-center justify-between gap-2 text-xs"
                                                            >
                                                                <span className="min-w-0 flex-1">
                                                                    <span className="block truncate">
                                                                        {t.nama}
                                                                        {t.kursi && (
                                                                            <span className="text-gray-400">
                                                                                {" "}
                                                                                &middot; kursi {t.kursi}
                                                                            </span>
                                                                        )}
                                                                    </span>
                                                                    {t.lembaga && (
                                                                        <span className="block truncate text-gray-400">
                                                                            {t.lembaga}
                                                                        </span>
                                                                    )}
                                                                    {t.terbelah && (
                                                                        <span className="block text-amber-700">
                                                                            rombongannya terbagi ke meja lain
                                                                        </span>
                                                                    )}
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        keluarkan(t.id, m.nomor)
                                                                    }
                                                                    className="shrink-0 text-red-600 hover:underline"
                                                                >
                                                                    keluarkan
                                                                </button>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/*
                Dipasang fixed, bukan sticky: pembungkus drawer di layout
                punya overflow sendiri, dan sticky akan menempel ke wadah itu
                - bukan ke layar - sehingga tidak pernah terlihat saat
                menggulir ke daftar meja.
            */}
            {aktif && (
                <div className="fixed inset-x-0 bottom-0 z-30 border-t border-amber-300 bg-amber-50 p-3 shadow-[0_-2px_8px_rgba(0,0,0,0.08)] lg:hidden">
                    <div className="mx-auto flex max-w-7xl items-start gap-3">
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-amber-900">
                                {aktif.nama}
                            </p>
                            <p className="text-xs text-amber-800">
                                {aktif.sudah > 0
                                    ? `${aktif.sudah} dari ${aktif.jumlah_orang} sudah duduk`
                                    : `Butuh ${aktif.jumlah_orang} kursi`}{" "}
                                &mdash; pilih mejanya di bawah
                            </p>
                            <div className="text-amber-900">{kontrolJumlah}</div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setDipilih(null)}
                            className="btn btn-sm btn-ghost shrink-0"
                        >
                            Batal
                        </button>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
