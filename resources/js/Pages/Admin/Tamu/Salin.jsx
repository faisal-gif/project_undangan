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
                        <div className="p-6 bg-white border-b border-gray-200">
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
                                    <div className="flex flex-wrap items-center gap-3">
                                        <label className="text-sm font-medium text-gray-700" htmlFor="dari">
                                            Ambil dari
                                        </label>
                                        <select
                                            id="dari"
                                            className="select select-bordered select-sm"
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
                                            className="input input-bordered input-sm w-64"
                                        />

                                        <span className="ml-auto text-sm text-gray-600">
                                            {terpilih.size} dipilih dari {bisaDipilih.length} yang bisa disalin
                                        </span>
                                    </div>

                                    {errors.tamu_ids && (
                                        <p className="mt-3 text-sm text-red-600">{errors.tamu_ids}</p>
                                    )}

                                    <div className="mt-4 max-h-[28rem] overflow-y-auto border border-gray-200 rounded-md">
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
                                        className="btn btn-neutral btn-sm mt-4"
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
