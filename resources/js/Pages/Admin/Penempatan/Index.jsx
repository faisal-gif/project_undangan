import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { useState } from "react";

/**
 * Papan penempatan: daftar tamu yang belum duduk di kiri, susunan meja di
 * kanan.
 *
 * Nomor kursi tidak pernah diketik. Admin memilih satu tamu, lalu menunjuk
 * mejanya; sistem yang mengambil kursi kosong sebanyak orang yang diundang.
 * Cara ini menghapus seluruh kelas salah ketik sekaligus - kursi ganda, kursi
 * di luar kapasitas, dan jumlah kursi yang tidak sesuai jumlah orang.
 */
export default function Index({ acara, mejas, belum }) {
    const { errors } = usePage().props;
    const [dipilih, setDipilih] = useState(null);
    const [cari, setCari] = useState("");

    const tempatkan = (meja) => {
        if (!dipilih) return;

        router.post(
            route("admin.penempatan.tempatkan"),
            { tamu_id: dipilih.id, meja },
            { preserveScroll: true, onSuccess: () => setDipilih(null) }
        );
    };

    const keluarkan = (tamuId) => {
        router.post(
            route("admin.penempatan.keluarkan", tamuId),
            {},
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

    return (
        <AuthenticatedLayout>
            <Head title="Penempatan Kursi" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <div className="flex flex-wrap items-baseline justify-between gap-3">
                            <h1 className="text-2xl font-bold">
                                Penempatan Kursi{" "}
                                <span className="text-base font-normal text-gray-500">
                                    {acara.label}
                                </span>
                            </h1>
                            <p className="text-sm text-gray-600">
                                {acara.jumlah_meja} meja &middot; {acara.jumlah_kursi} kursi &middot;{" "}
                                <strong>{totalTerisi}</strong> terisi, {acara.jumlah_kursi - totalTerisi} kosong
                            </p>
                        </div>

                        {(errors.meja || errors.tamu_id) && (
                            <div className="alert alert-error mt-4">
                                <span>{errors.meja || errors.tamu_id}</span>
                            </div>
                        )}

                        <div className="mt-6 grid gap-8 lg:grid-cols-[22rem_1fr]">
                            {/* Tamu yang belum duduk */}
                            <div>
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

                                {dipilih && (
                                    <p className="mt-3 rounded bg-amber-50 px-3 py-2 text-sm text-amber-900">
                                        <strong>{dipilih.nama}</strong> dipilih &mdash; klik meja
                                        tujuan. Butuh {dipilih.jumlah_orang} kursi.
                                    </p>
                                )}

                                <ul className="mt-3 max-h-[32rem] overflow-y-auto">
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
                                                onClick={() =>
                                                    setDipilih(dipilih?.id === t.id ? null : t)
                                                }
                                                className={`w-full border-b px-3 py-2 text-left text-sm transition-colors ${
                                                    dipilih?.id === t.id
                                                        ? "bg-amber-100 font-semibold"
                                                        : "hover:bg-gray-50"
                                                }`}
                                            >
                                                {t.nama}
                                                <span className="ml-2 text-xs text-gray-500">
                                                    {t.jumlah_orang} org
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
                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                {mejas.map((m) => {
                                    const penuh = m.terisi >= m.kapasitas;
                                    const cukup =
                                        dipilih &&
                                        m.kapasitas - m.terisi >= dipilih.jumlah_orang;

                                    return (
                                        <div
                                            key={m.nomor}
                                            className={`rounded-lg border p-4 ${
                                                dipilih && cukup
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
                                                {m.kursi.map((k) => (
                                                    <li
                                                        key={k.nomor}
                                                        className="flex gap-2 text-xs leading-5"
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
                                                        </span>
                                                    </li>
                                                ))}
                                            </ol>

                                            {dipilih ? (
                                                <button
                                                    type="button"
                                                    disabled={!cukup}
                                                    onClick={() => tempatkan(m.nomor)}
                                                    className="btn btn-sm btn-neutral mt-3 w-full"
                                                >
                                                    {cukup
                                                        ? `Tempatkan di sini`
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
                                                                <span className="truncate">
                                                                    {t.nama}
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => keluarkan(t.id)}
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
        </AuthenticatedLayout>
    );
}
