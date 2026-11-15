import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router, useForm } from "@inertiajs/react";
import React, { useMemo, useState } from "react";

function Salin({ tujuan, sumber, sumberTersedia = [], tamus = [] }) {
    const [cari, setCari] = useState("");

    // Tamu yang sudah ada di edisi tujuan tidak bisa dicentang.
    const bisaDipilih = useMemo(() => tamus.filter((t) => !t.sudah_ada), [tamus]);

    const { data, setData, post, processing, errors } = useForm({
        tamu_ids: [],
    });

    const tampil = useMemo(() => {
        const kata = cari.trim().toLowerCase();
        if (!kata) return tamus;

        return tamus.filter((t) =>
            [t.nama, t.lembaga, t.pic].some((v) => (v || "").toLowerCase().includes(kata))
        );
    }, [tamus, cari]);

    const terpilih = new Set(data.tamu_ids);
    const semuaTerpilih = bisaDipilih.length > 0 && terpilih.size === bisaDipilih.length;

    const toggleSatu = (id) => {
        setData(
            "tamu_ids",
            terpilih.has(id) ? data.tamu_ids.filter((x) => x !== id) : [...data.tamu_ids, id]
        );
    };

    const toggleSemua = () => {
        setData("tamu_ids", semuaTerpilih ? [] : bisaDipilih.map((t) => t.id));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("admin.tamu.salin"));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Salin Tamu" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-4 sm:p-6 bg-white border-b border-gray-200">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <h1 className="text-2xl font-bold">Salin Tamu dari Edisi Lain</h1>
                                    <p className="mt-1 text-sm text-gray-600">
                                        Tamu terpilih disalin ke <b>{tujuan?.label ?? "edisi aktif"}</b>.
                                        Statusnya kembali ke "belum" dan kode undangannya dibuat baru.
                                    </p>
                                </div>

                                <Link href={route("admin.tamu.index")} className="btn btn-ghost btn-sm">
                                    Kembali
                                </Link>
                            </div>

                            {sumberTersedia.length === 0 || !sumber ? (
                                <p className="mt-8 rounded-md bg-gray-50 px-4 py-8 text-center text-gray-600">
                                    Belum ada edisi lain yang berisi tamu.
                                </p>
                            ) : (
                                <form onSubmit={handleSubmit} className="mt-6">
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                                        <label className="text-sm font-medium text-gray-700" htmlFor="dari">
                                            Ambil dari
                                        </label>
                                        <select
                                            id="dari"
                                            className="select select-bordered select-sm max-w-full flex-1 sm:flex-none"
                                            value={sumber.id}
                                            onChange={(e) =>
                                                router.get(route("admin.tamu.salinForm", { dari: e.target.value }))
                                            }
                                        >
                                            {sumberTersedia.map((a) => (
                                                <option key={a.id} value={a.id}>
                                                    {a.label} ({a.jumlah} tamu)
                                                </option>
                                            ))}
                                        </select>

                                        <input
                                            type="text"
                                            value={cari}
                                            onChange={(e) => setCari(e.target.value)}
                                            placeholder="Cari nama, lembaga, PIC..."
                                            className="input input-bordered input-sm w-full sm:w-64"
                                        />

                                        <span className="text-sm text-gray-600 sm:ml-auto">
                                            {terpilih.size} dipilih dari {bisaDipilih.length} yang bisa disalin
                                        </span>
                                    </div>

                                    {errors.tamu_ids && (
                                        <p className="mt-3 text-sm text-red-600">{errors.tamu_ids}</p>
                                    )}

                                    {/*
                                        Enam kolom dengan kotak centang tidak
                                        bisa dipakai di layar 375px. Di bawah
                                        md tiap tamu jadi satu baris kartu
                                        yang seluruhnya bisa ditekan, jadi
                                        sasaran sentuhnya sebesar kartunya -
                                        bukan kotak centang 16px.
                                    */}
                                    <div className="mt-4 md:hidden">
                                        <button
                                            type="button"
                                            onClick={toggleSemua}
                                            disabled={bisaDipilih.length === 0}
                                            className="btn btn-sm btn-ghost"
                                        >
                                            {semuaTerpilih ? "Kosongkan pilihan" : "Pilih semua"}
                                        </button>

                                        <ul className="mt-2 max-h-[26rem] space-y-2 overflow-y-auto">
                                            {tampil.map((t) => (
                                                <li key={t.id}>
                                                    <button
                                                        type="button"
                                                        disabled={t.sudah_ada}
                                                        onClick={() => toggleSatu(t.id)}
                                                        className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left ${
                                                            t.sudah_ada
                                                                ? "border-gray-200 opacity-50"
                                                                : terpilih.has(t.id)
                                                                  ? "border-amber-400 bg-amber-50"
                                                                  : "border-gray-200"
                                                        }`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            className="checkbox checkbox-sm pointer-events-none mt-0.5 shrink-0"
                                                            checked={terpilih.has(t.id)}
                                                            disabled={t.sudah_ada}
                                                            readOnly
                                                            tabIndex={-1}
                                                            aria-hidden="true"
                                                        />
                                                        <span className="min-w-0 flex-1">
                                                            <span className="block font-medium">
                                                                {t.nama}
                                                                {t.sudah_ada && (
                                                                    <span className="ml-2 badge badge-ghost badge-sm">
                                                                        sudah ada
                                                                    </span>
                                                                )}
                                                            </span>
                                                            {t.lembaga && (
                                                                <span className="mt-0.5 block text-sm text-gray-500">
                                                                    {t.lembaga}
                                                                </span>
                                                            )}
                                                            <span className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                                                                <span className="badge badge-ghost badge-sm">
                                                                    {t.jumlah_orang} org
                                                                </span>
                                                                {t.pic && (
                                                                    <span className="badge badge-primary badge-outline badge-sm">
                                                                        {t.pic}
                                                                    </span>
                                                                )}
                                                                <span
                                                                    className={`badge badge-sm ${
                                                                        t.status === "datang"
                                                                            ? "badge-success"
                                                                            : "badge-warning"
                                                                    }`}
                                                                >
                                                                    {t.status === "datang" ? "Datang" : "Belum"}
                                                                </span>
                                                            </span>
                                                        </span>
                                                    </button>
                                                </li>
                                            ))}

                                            {tampil.length === 0 && (
                                                <li className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
                                                    Tidak ada tamu yang cocok dengan pencarian.
                                                </li>
                                            )}
                                        </ul>
                                    </div>

                                    <div className="mt-4 hidden max-h-[28rem] overflow-y-auto rounded-md border border-gray-200 md:block">
                                        <table className="table table-pin-rows table-sm">
                                            <thead>
                                                <tr>
                                                    <th className="w-10">
                                                        <input
                                                            type="checkbox"
                                                            className="checkbox checkbox-sm"
                                                            checked={semuaTerpilih}
                                                            onChange={toggleSemua}
                                                            aria-label="Pilih semua"
                                                        />
                                                    </th>
                                                    <th>Nama</th>
                                                    <th>Lembaga</th>
                                                    <th>PIC</th>
                                                    <th>Orang</th>
                                                    <th>Status di edisi lama</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {tampil.map((t) => (
                                                    <tr key={t.id} className={t.sudah_ada ? "opacity-50" : ""}>
                                                        <td>
                                                            <input
                                                                type="checkbox"
                                                                className="checkbox checkbox-sm"
                                                                checked={terpilih.has(t.id)}
                                                                disabled={t.sudah_ada}
                                                                onChange={() => toggleSatu(t.id)}
                                                                aria-label={`Pilih ${t.nama}`}
                                                            />
                                                        </td>
                                                        <td className="font-medium">
                                                            {t.nama}
                                                            {t.sudah_ada && (
                                                                <span className="ml-2 badge badge-ghost badge-sm">
                                                                    sudah ada
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td>{t.lembaga}</td>
                                                        <td>{t.pic}</td>
                                                        <td className="tabular-nums">{t.jumlah_orang}</td>
                                                        <td>
                                                            {t.status === "datang" ? (
                                                                <span className="badge badge-success badge-sm">Datang</span>
                                                            ) : (
                                                                <span className="badge badge-warning badge-sm">Belum</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}

                                                {tampil.length === 0 && (
                                                    <tr>
                                                        <td colSpan={6} className="py-8 text-center text-gray-500">
                                                            Tidak ada tamu yang cocok dengan pencarian.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-neutral mt-4 w-full sm:btn-sm sm:w-auto"
                                        disabled={processing || terpilih.size === 0}
                                    >
                                        {processing
                                            ? "Menyalin..."
                                            : `Salin ${terpilih.size} tamu ke ${tujuan?.label ?? "edisi aktif"}`}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

export default Salin;
