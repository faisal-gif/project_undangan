import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { Eye, Send } from "lucide-react";
import React, { useState } from "react";

function Index({ tamus, filters }) {
    const { flash } = usePage().props
    const [search, setSearch] = useState(filters.search || "");
    const [loadingPdfId, setLoadingPdfId] = useState(null);
    const [selectedLogs, setSelectedLogs] = useState(null);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route("admin.tamu.index", { search }));
    };

    const getStatusBadge = (status) => {
        if (status === "ambil") {
            return <span className="badge badge-success p-4">Sudah Ambil</span>;
        }
        if (status === "belum") {
            return <span className="badge badge-warning text-xs p-4">Belum</span>;
        }
        return <span className="badge">{status}</span>;
    };

    return (
        <AuthenticatedLayout>
            <Head title="Tamu" />
            <div>
                {flash.success && (
                    <div className="toast toast-top toast-end ">
                        <div className="alert alert-success">
                            <span>{flash.success}</span>
                        </div>
                    </div>
                )}

                {flash.error && (
                    <div className="toast">
                        <div className="toast toast-top toast-end">
                            <span>{flash.error}</span>
                        </div>
                    </div>
                )}
            </div>
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <div className="flex justify-between items-center mb-4">
                                <h1 className="text-2xl font-bold">
                                    Daftar Pendaftar
                                </h1>
                                <div className="flex flex-row gap-4">
                                 
                                    <Link
                                        href={route("admin.tamu.create")}
                                        className="btn btn-neutral btn-sm"
                                        disabled
                                    >
                                        Tambah Pendaftar
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
                                    placeholder="Cari Pendaftar..."
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
                                            <th className="py-2 px-4 border-b">ID</th>
                                            <th className="py-2 px-4 border-b">Nama</th>
                                       
                                            <th className="py-2 px-4 border-b">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tamus.data.map((tamu) => {
                                            const latestLog = tamu.email_logs.length > 0
                                                ? tamu.email_logs[0] // asumsi sudah urut dari backend (DESC)
                                                : null;
                                            return (<tr key={tamu.id}>
                                                <td className="py-2 px-4 border-b text-center">{tamu.id}</td>
                                                <td className="py-2 px-4 border-b">{tamu.nama}</td>
                                                <td className="py-2 px-4 border-b">{tamu.email}</td> 
                                             
                                            </tr>)

                                        })}
                                    </tbody>
                                </table>
                                <div className="mt-8 join">
                                    {
                                        tamus.links
                                            .filter((l) => l.label.includes("Previous") || l.label.includes("Next"))
                                            .map((l, index) => (
                                                <Link
                                                    key={index}
                                                    href={l.url ?? "#"}
                                                    className={`join-item btn btn-sm ${!l.url ? "btn-disabled" : ""}`}
                                                    dangerouslySetInnerHTML={{ __html: l.label }}
                                                />
                                            ))}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {selectedLogs && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-lg font-bold mb-4">Log Pengiriman Email</h2>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {selectedLogs.map((log) => (
                                <div key={log.id} className="border-b pb-2">
                                    <span
                                        className={log.status === "success" ? "text-green-600" : "text-red-600"}
                                    >
                                        {log.status}
                                    </span>
                                    <br />
                                    <small>{new Date(log.created_at).toLocaleString()}</small>
                                    {log.error_message && (
                                        <p className="text-xs text-gray-600 mt-1">{log.error_message}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 text-right">
                            <button
                                onClick={() => setSelectedLogs(null)}
                                className="btn btn-sm btn-neutral"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}

export default Index;
