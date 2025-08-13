import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";
import React, { useState } from "react";

function Index({ tamus, filters }) {
    const [search, setSearch] = useState(filters.search || "");
    const [loadingPdfId, setLoadingPdfId] = useState(null);


    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route("tamu.index", { search }));
    };

    const handleDownloadPdf = async (id) => {
        try {
            setLoadingPdfId(id);

            const res = await fetch(route("pdf", id), {
                method: "GET",
            });

            const blob = await res.blob();

            // Ambil filename dari Content-Disposition
            const disposition = res.headers.get("Content-Disposition");
            let filename = `tamu-${id}.pdf`; // default kalau header tidak ada

            if (disposition && disposition.includes("filename=")) {
                filename = decodeURIComponent(
                    disposition
                        .split("filename=")[1]
                        .replace(/['"]/g, "") // hapus tanda kutip
                        .trim()
                );
            }

            // Buat URL dan trigger download
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Gagal download PDF:", error);
        } finally {
            setLoadingPdfId(null);
        }
    };

    const getStatusBadge = (status) => {
        if (status === "attend") {
            return <span className="badge badge-success">Attend</span>;
        }
        if (status === "not_attend") {
            return <span className="badge badge-warning text-xs">Not Attend</span>;
        }
        return <span className="badge">{status}</span>;
    };

    return (
        <AuthenticatedLayout>
            <Head title="Tamu" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <div className="flex justify-between items-center mb-4">
                                <h1 className="text-2xl font-bold">
                                    Daftar Tamu
                                </h1>
                                <div className="flex flex-row gap-4">
                                    <Link
                                        href={route("tamu.create")}
                                        className="btn btn-neutral btn-sm"
                                    >
                                        Tambah Tamu
                                    </Link>
                                    <button
                                        onClick={() => router.reload({ only: ['tamus'] })}
                                        className="btn btn-primary btn-sm"
                                    >
                                        Refresh
                                    </button>
                                </div>

                            </div>
                            <form
                                onSubmit={handleSearch}
                                className="flex items-center mb-4"
                            >
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="border rounded-l-md px-4 py-2 w-full"
                                    placeholder="Cari nama tamu..."
                                />
                                <button
                                    type="submit"
                                    className="bg-blue-500 text-white px-4 py-2 rounded-r-md"
                                >
                                    Cari
                                </button>
                            </form>
                            <div className="overflow-x-auto">

                                <table className="table table-zebra">
                                    <thead>
                                        <tr>
                                            <th className="py-2 px-4 border-b">
                                                ID
                                            </th>
                                            <th className="py-2 px-4 border-b">
                                                Nama
                                            </th>
                                            <th className="py-2 px-4 border-b">
                                                Lembaga
                                            </th>
                                            <th className="py-2 px-4 border-b">
                                                PIC
                                            </th>
                                            <th className="py-2 px-4 border-b">
                                                Status
                                            </th>
                                            <th className="py-2 px-4 border-b">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tamus.data.map((tamu) => (
                                            <tr key={tamu.id}>
                                                <td className="py-2 px-4 border-b text-center">
                                                    {tamu.id}
                                                </td>
                                                <td className="py-2 px-4 border-b">
                                                    {tamu.nama}
                                                </td>
                                                <td className="py-2 px-4 border-b">
                                                    {tamu.lembaga}
                                                </td>
                                                <td className="py-2 px-4 border-b">
                                                    {tamu.pc}
                                                </td>
                                                <td className="py-2 border-b w-40 ">
                                                    {getStatusBadge(tamu.status)}
                                                </td>

                                                <td className="py-2 px-4 border-b text-center flex flex-row gap-2">
                                                    <Link
                                                        href={route(
                                                            "tamu.edit",
                                                            tamu.id,
                                                        )}
                                                        className="btn btn-xs btn-neutral"
                                                    >
                                                        Edit
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDownloadPdf(tamu.id)}
                                                        className={`btn btn-xs btn-neutral ${loadingPdfId === tamu.id ? "btn-disabled" : ""}`}
                                                        disabled={loadingPdfId === tamu.id}
                                                    >
                                                        {loadingPdfId === tamu.id ? "Loading..." : "PDF"}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-8  join">
                                {tamus.links.map((l, index) => (
                                    <Link
                                        key={index + 1}
                                        href={l.url ? l.url : "#"}
                                        className={`join-item btn btn-sm ${l.active ? "btn-active" : ""}`}
                                        dangerouslySetInnerHTML={{
                                            __html: l.label,
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

export default Index;
