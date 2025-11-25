import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { Check, Copy, Edit2, Eye, Send, User } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

function Index({ tamus, filters }) {
    const user = usePage().props.auth.user;

    const { flash } = usePage().props
    const [search, setSearch] = useState(filters.search || "");
    const [loadingPdfId, setLoadingPdfId] = useState(null);
    const [copiedId, setCopiedId] = useState(null);


    const slugify = (text) =>
        text
            .toLowerCase()
            .replace(/ /g, "-")        // ubah spasi jadi -
            .replace(/[^\w-]+/g, "")   // hapus karakter non-alfanumerik
            .replace(/--+/g, "-")      // hilangkan double dash
            .replace(/^-+|-+$/g, "");  // trim - di awal/akhir


    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route("admin.tamu.index", { search }));
    };

    const getStatusBadge = (status) => {
        if (status === "datang") {
            return <span className="badge badge-success text-xs p-3">Datang</span>;
        }
        if (status === "belum") {
            return <span className="badge badge-warning text-xs p-3">Belum</span>;
        }
        return <span className="badge">{status}</span>;
    };

    const copyLink = (tamu) => {
        const url = route("undangan", [tamu.id, slugify(tamu.nama)]);
        navigator.clipboard.writeText(url);

        setCopiedId(tamu.id); // tandai yang dicopy

        setTimeout(() => {
            setCopiedId(null); // setelah 2 detik kembali normal
        }, 2000);
    };

    const sendWhatsapp = (tamu) => {
        const url = route("undangan", [tamu.id, slugify(tamu.nama)]);
        const message = `Kepada Yth. ${tamu.nama}\n\nDengan hormat, Melalui pesan ini, kami bermaksud menyampaikan undangan resmi kepada Bapak/Ibu. Besar harapan kami agar Bapak/Ibu berkenan membuka tautan undangan digital berikut untuk informasi lengkap acara:\n\n${url}\n\nAtas perhatian dan waktunya, kami ucapkan terima kasih.\n\nSalam hormat.\nTIMES Indonesia`;

        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, "_blank");
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
                                {user.role === 'admin' && (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

                                        <Link
                                            href={route("admin.tamu.create")}
                                            className="btn btn-neutral btn-sm"
                                        >
                                            Tambah Pendaftar
                                        </Link>
                                        <button
                                            onClick={() => router.reload({ only: ['tamus'] })}
                                            className="btn btn-primary btn-sm"
                                        >
                                            Refresh
                                        </button>
                                        <Link
                                            href={route("loop")}
                                            className="btn btn-neutral btn-sm"
                                        >
                                            Generate Qr Code
                                        </Link>


                                    </div>
                                )}


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
                                            <th className="py-2 px-4 border-b">Lembaga</th>
                                            <th className="py-2 px-4 border-b">Jumlah Orang</th>
                                            <th className="py-2 px-4 border-b">PIC</th>
                                            <th className="py-2 px-4 border-b">Status</th>
                                            <th className="py-2 px-4 border-b">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tamus.data.map((tamu) => (
                                            <tr key={tamu.id}>
                                                <td className="py-2 px-4 border-b text-center">{tamu.id}</td>
                                                <td className="py-2 px-4 border-b">{tamu.nama}</td>
                                                <td className="py-2 px-4 border-b">{tamu.lembaga}</td>
                                                <td className="py-2 px-4 border-b">{tamu.jumlah_orang}</td>
                                                <td className="py-2 px-4 border-b"><span className="badge badge-primary badge-outline p-3">{tamu.pic}</span></td>
                                                <td className="py-2 border-b w-40">
                                                    {getStatusBadge(tamu.status)}
                                                </td>
                                                <td className="flex items-center gap-2">
                                                    {user.role === 'admin' && (
                                                        <Link href={route("admin.tamu.edit", tamu)}
                                                            className="btn btn-xs btn-warning"
                                                        >
                                                            <Edit2 size={16} />
                                                        </Link>
                                                    )}

                                                    {/* Lihat Undangan */}
                                                    <Link
                                                        href={route("undangan", [tamu.id, slugify(tamu.nama)])}
                                                        className="btn btn-xs btn-neutral"
                                                    >
                                                        <User size={16} />
                                                    </Link>
                                                    {/* Copy Link */}
                                                    <button
                                                        onClick={() => sendWhatsapp(tamu)}
                                                        className="btn btn-xs btn-success flex items-center gap-1"
                                                    >
                                                        <Send size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
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


        </AuthenticatedLayout>
    );
}

export default Index;
