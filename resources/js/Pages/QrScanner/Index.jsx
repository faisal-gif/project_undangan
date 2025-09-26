import Pagination from '@/Components/Pagination';
import QrCode from '@/Components/QrCode'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Eye } from 'lucide-react';
import React, { useState } from 'react'
import Swal from 'sweetalert2';

function Index({ tamus, filters }) {
    const { flash } = usePage().props
    const [isScanning, setIsScanning] = useState(false);
    const [search, setSearch] = useState(filters.search || "");
    const [telephone, setTelephone] = useState("");



    const handleScan = async (data) => {
        setIsScanning(false); // sembunyikan scanner
        console.log("Hasil scan:", data);

        try {
            // validasi kalau data adalah URL
            const url = new URL(data);
            // redirect langsung
            window.location.href = url.href;
        } catch (err) {
            // kalau bukan URL, tampilkan alert saja
            alert(`QR berisi teks: ${data}`);
        }
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
                            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
                                <h1 className="text-2xl font-bold">
                                    Daftar Pendaftar
                                </h1>
                                <div className="flex flex-row gap-2 justify-end">
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
                            <div className="mt-4">
                                <Pagination tamus={tamus} />
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