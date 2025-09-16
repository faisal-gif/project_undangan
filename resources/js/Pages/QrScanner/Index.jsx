import QrCode from '@/Components/QrCode'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head, Link, router } from '@inertiajs/react';
import { Eye } from 'lucide-react';
import React, { useState } from 'react'
import Swal from 'sweetalert2';

function Index({ tamus, filters }) {
    const [isScanning, setIsScanning] = useState(false);
    const [search, setSearch] = useState(filters.search || "");
    const [telephone, setTelephone] = useState("");



    const handleScan = async (data) => {
        setIsScanning(false); // sembunyikan scanner
        console.log(data);

    };

    const getStatusBadge = (status) => {
        if (status === "attend") {
            return <span className="badge badge-success p-4">Attend</span>;
        }
        if (status === "not_attend") {
            return <span className="badge badge-warning text-xs p-4">Not Attend</span>;
        }
        return <span className="badge">{status}</span>;
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route("qrScanner", { search }));
    };

    const handleAttendance = (e, tamuId) => {
        e.preventDefault();
        router.post(route("attendance"), { telephone, tamu_id: tamuId }, {
            onSuccess: () => {
                document.getElementById('modal_phone' + tamuId).close();
                Swal.fire({
                    icon: "success",
                    title: "Berhasil",
                    text: "Kehadiran berhasil dicatat.",
                    timer: 2000,
                    showConfirmButton: false,
                });
            },
            onError: (errors) => {
                document.getElementById('modal_phone' + tamuId).close();
                Swal.fire({
                    icon: "error",
                    title: "Gagal",
                    text: errors.message || "Terjadi kesalahan saat absensi.",
                });
            }
        });
    };


    return (
        <AuthenticatedLayout>
            <Head title="Qr Scanner" />
            <div className="container mx-auto px-4 py-8">

                <div className="max-w-7xl mx-auto space-y-4">

                    {/* Ticket Card */}
                    {/* <div className="card bg-base-100 shadow-2xl border">
                        <div className="card-body">
                            <h2 className="card-title">Qr Scanner</h2>
                        </div>
                        {!isScanning && (
                            <button
                                onClick={() => setIsScanning(true)}
                                className="bg-blue-600 text-white px-4 py-2 m-10 rounded"
                            >
                                Mulai Scan
                            </button>
                        )}

                        {isScanning && (
                            <div className="mt-4 mb-4">
                                <QrCode onScanSuccess={handleScan} />
                            </div>
                        )}

                    </div> */}

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <div className="flex justify-between items-center mb-4">
                                <h1 className="text-2xl font-bold">
                                    Daftar Pendaftar
                                </h1>
                                <div className="flex flex-row gap-4">

                                    <button
                                        onClick={() => router.reload({ only: ['tamus'] })}
                                        className="btn btn-primary btn-sm"
                                    >
                                        Refresh
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsScanning(true);
                                            document.getElementById("qrModal").showModal();
                                        }}
                                        className="btn btn-warning btn-sm"
                                    >
                                        Mulai Scan
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
                                            <th className="py-2 px-4 border-b">Email</th>
                                            <th className="py-2 px-4 border-b">Kartu Identitas</th>
                                            <th className="py-2 px-4 border-b">No Kartu Identitas</th>
                                            <th className="py-2 px-4 border-b">Status Racepack</th>
                                            <th className="py-2 px-4 border-b">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tamus.data.map((tamu) => (
                                            <tr key={tamu.id}>
                                                <td className="py-2 px-4 border-b text-center">{tamu.id}</td>
                                                <td className="py-2 px-4 border-b">{tamu.nama}</td>
                                                <td className="py-2 px-4 border-b">{tamu.email}</td>
                                                <td className="py-2 px-4 border-b">{tamu.kartu_identitas}</td>
                                                <td className="py-2 px-4 border-b">{tamu.no_kartu_identitas}</td>
                                                <td className="py-2 border-b w-40">
                                                    {getStatusBadge(tamu.status)}
                                                </td>
                                                <td className="py-2 px-4 border-b ">
                                                    <Link
                                                        href={route("tamu.show", tamu.id)}
                                                        className="btn btn-xs btn-neutral"

                                                    >
                                                        <Eye size={20} />
                                                    </Link>

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

            <dialog
                id="qrModal"
                className="modal"
                onClose={() => setIsScanning(false)}
            >
                <div className="modal-box">
                    {isScanning && <QrCode onScanSuccess={handleScan} />}
                    <div className="modal-action">
                        <form method="dialog">
                            <button className="btn">Tutup</button>
                        </form>
                    </div>
                </div>
            </dialog>

        </AuthenticatedLayout>
    )
}

export default Index