import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { Check, Copy, Edit2, Eye, Send, User } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

function Index({ tamus, filters, jumlahJenis = {}, acaras = [], acaraDilihat }) {
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


    const jenis = filters.jenis || "";

    // Satu pintu untuk semua filter supaya yang satu tidak pernah menghapus
    // yang lain. Nilai kosong dibuang dari URL, bukan dikirim sebagai "".
    const terapkanFilter = (ubahan) => {
        const q = { search, jenis, acara: acaraDilihat?.id, ...ubahan };
        router.get(route("admin.tamu.index"), Object.fromEntries(
            Object.entries(q).filter(([, v]) => v !== "" && v != null)
        ));
    };

    const handleSearch = (e) => {
        e.preventDefault();
        terapkanFilter({});
    };

    // Pindah edisi: bawa pencarian, tapi kembali ke halaman 1.
    const gantiEdisi = (id) => {
        router.get(route("admin.tamu.index", { acara: id, search, jenis: jenis || undefined }), {}, { preserveState: false });
    };

    // "Penerima penghargaan" tidak muat bertiga di layar 375px dan tabnya
    // pecah menimpa kolom pencarian, jadi di layar sempit dipakai label
    // pendeknya. Isinya sama, hanya katanya yang dipotong.
    const JENIS = [
        { nilai: "", label: "Semua", pendek: "Semua", jumlah: (jumlahJenis.hadir || 0) + (jumlahJenis.penerima || 0) },
        { nilai: "hadir", label: "Tamu undangan", pendek: "Tamu", jumlah: jumlahJenis.hadir || 0 },
        { nilai: "penerima", label: "Penerima penghargaan", pendek: "Penerima", jumlah: jumlahJenis.penerima || 0 },
    ];

    // Konfirmasi dari tamu lewat undangannya; berbeda dari status kehadiran
    // yang baru terisi saat QR dipindai di pintu masuk.
    const getRsvpBadge = (rsvp) => {
        if (rsvp === "hadir") {
            return <span className="badge badge-success text-xs p-3">Hadir</span>;
        }
        if (rsvp === "berhalangan") {
            return <span className="badge badge-error text-xs p-3">Berhalangan</span>;
        }
        return <span className="badge badge-ghost text-xs p-3">Belum</span>;
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
        const url = route("undangan", [tamu.code, slugify(tamu.nama)]);
        navigator.clipboard.writeText(url);

        setCopiedId(tamu.id); // tandai yang dicopy

        setTimeout(() => {
            setCopiedId(null); // setelah 2 detik kembali normal
        }, 2000);
    };

    const sendWhatsapp = (tamu) => {
        const url = route("undangan", [tamu.code, slugify(tamu.nama)]);
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
                        <div className="p-4 sm:p-6 bg-white border-b border-gray-200">
                            <div className="flex flex-wrap justify-between items-start sm:items-center gap-4 mb-4">
                                <div className="flex flex-wrap items-center gap-3">
                                    <h1 className="text-2xl font-bold">
                                        Daftar Pendaftar
                                    </h1>
                                    {acaras.length > 0 && (
                                        <select
                                            className="select select-bordered select-sm"
                                            value={acaraDilihat?.id ?? ""}
                                            onChange={(e) => gantiEdisi(e.target.value)}
                                            aria-label="Pilih edisi acara"
                                        >
                                            {acaras.map((a) => (
                                                <option key={a.id} value={a.id}>
                                                    {a.label} ({a.jumlah}){a.aktif ? " • aktif" : ""}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                                {user.role === 'admin' && (
                                    <div className="flex flex-wrap gap-4">

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
                                        {acaraDilihat?.aktif && (
                                            <Link
                                                href={route("admin.tamu.salinForm")}
                                                className="btn btn-neutral btn-sm"
                                            >
                                                Salin dari Edisi Lain
                                            </Link>
                                        )}


                                    </div>
                                )}


                            </div>

                            {acaraDilihat && !acaraDilihat.aktif && (
                                <div className="alert alert-warning mb-4">
                                    <span>
                                        Anda sedang melihat arsip {acaraDilihat.label}. Tamu baru tetap masuk ke edisi aktif.
                                    </span>
                                </div>
                            )}
                            <div role="tablist" className="tabs tabs-boxed mb-4 w-full sm:w-fit">
                                {JENIS.map((j) => (
                                    <button
                                        key={j.nilai || "semua"}
                                        role="tab"
                                        type="button"
                                        aria-selected={jenis === j.nilai}
                                        className={`tab flex-1 gap-1.5 whitespace-nowrap px-2 sm:flex-none sm:gap-2 sm:px-4 ${
                                            jenis === j.nilai ? "tab-active" : ""
                                        }`}
                                        onClick={() => terapkanFilter({ jenis: j.nilai })}
                                    >
                                        <span className="sm:hidden">{j.pendek}</span>
                                        <span className="hidden sm:inline">{j.label}</span>
                                        <span className="badge badge-sm">{j.jumlah}</span>
                                    </button>
                                ))}
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
                            {/*
                                Di bawah md tabelnya diganti kartu. Sembilan
                                kolom di layar 375px berarti menggeser ke
                                samping untuk melihat tempat duduk, PIC, dan
                                tombol aksinya - padahal justru itu yang
                                dicari saat memegang ponsel di lokasi acara.
                            */}
                            <ul className="grid gap-3 sm:grid-cols-2 xl:hidden">
                                {tamus.data.map((tamu, index) => (
                                    <li
                                        key={tamu.id}
                                        className="flex flex-col rounded-lg border border-gray-200 p-4"
                                    >
                                        <div className="flex items-start gap-3">
                                            <span className="mt-0.5 shrink-0 text-xs text-gray-400">
                                                {index + 1}
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <Link
                                                    href={route("admin.tamu.show", tamu.id)}
                                                    className="font-semibold leading-snug hover:underline"
                                                >
                                                    {tamu.nama}
                                                </Link>
                                                {tamu.lembaga && (
                                                    <p className="mt-0.5 text-sm text-gray-500">
                                                        {tamu.lembaga}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-3 flex flex-wrap items-center gap-2">
                                            {tamu.meja ? (
                                                <span className="badge badge-neutral">
                                                    Meja {tamu.meja}
                                                    {tamu.kursi ? ` \u00b7 ${tamu.kursi}` : ""}
                                                </span>
                                            ) : (
                                                <span className="badge badge-ghost">
                                                    Belum ada meja
                                                </span>
                                            )}
                                            <span className="badge badge-ghost">
                                                {tamu.jumlah_orang} org
                                            </span>
                                            {tamu.pic && (
                                                <span className="badge badge-primary badge-outline">
                                                    {tamu.pic}
                                                </span>
                                            )}
                                        </div>

                                        <dl className="mb-3 mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs">
                                            <div className="flex items-center gap-1.5">
                                                <dt className="text-gray-500">Konfirmasi</dt>
                                                <dd>{getRsvpBadge(tamu.rsvp)}</dd>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <dt className="text-gray-500">Kehadiran</dt>
                                                <dd>{getStatusBadge(tamu.status)}</dd>
                                            </div>
                                        </dl>

                                        <div className="mt-auto flex flex-wrap gap-2 border-t pt-3">
                                            {user.role === "admin" && (
                                                <Link
                                                    href={route("admin.tamu.edit", tamu)}
                                                    className="btn btn-sm btn-warning gap-1.5"
                                                >
                                                    <Edit2 size={14} />
                                                    Ubah
                                                </Link>
                                            )}
                                            <Link
                                                href={route("undangan", [
                                                    tamu.code,
                                                    slugify(tamu.nama),
                                                ])}
                                                className="btn btn-sm btn-neutral gap-1.5"
                                            >
                                                <User size={14} />
                                                Undangan
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() => sendWhatsapp(tamu)}
                                                className="btn btn-sm btn-success gap-1.5"
                                            >
                                                <Send size={14} />
                                                Kirim
                                            </button>
                                        </div>
                                    </li>
                                ))}

                                {tamus.data.length === 0 && (
                                    <li className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500 sm:col-span-2">
                                        Tidak ada pendaftar yang cocok.
                                    </li>
                                )}
                            </ul>

                            <div className="hidden overflow-x-auto xl:block">

                                <table className="table table-zebra">
                                    <thead>
                                        <tr>
                                            <th className="py-2 px-4 border-b">NO</th>
                                            <th className="py-2 px-4 border-b">Nama</th>
                                            <th className="py-2 px-4 border-b">Lembaga</th>
                                            <th className="py-2 px-4 border-b">Jumlah Orang</th>
                                            <th className="py-2 px-4 border-b">Tempat Duduk</th>
                                            <th className="py-2 px-4 border-b">PIC</th>
                                            <th className="py-2 px-4 border-b">Konfirmasi</th>
                                            <th className="py-2 px-4 border-b">Status</th>
                                            <th className="py-2 px-4 border-b">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tamus.data.map((tamu, index) => (
                                            <tr key={tamu.id}>
                                                <td className="py-2 px-4 border-b text-center">{index + 1}</td>
                                                <td className="py-2 px-4 border-b">
                                                    {/* Satu-satunya pintu ke halaman rincian; sebelumnya
                                                        tidak ada tautan ke sana dari mana pun. */}
                                                    <Link
                                                        href={route("admin.tamu.show", tamu.id)}
                                                        className="hover:underline"
                                                    >
                                                        {tamu.nama}
                                                    </Link>
                                                </td>
                                                <td className="py-2 px-4 border-b">{tamu.lembaga}</td>
                                                <td className="py-2 px-4 border-b">{tamu.jumlah_orang}</td>
                                                <td className="py-2 px-4 border-b whitespace-nowrap">
                                                    {tamu.meja ? (
                                                        <span className="badge badge-neutral p-3">
                                                            Meja {tamu.meja}
                                                            {tamu.kursi ? ` · ${tamu.kursi}` : ""}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">belum</span>
                                                    )}
                                                </td>
                                                <td className="py-2 px-4 border-b"><span className="badge badge-primary badge-outline p-3">{tamu.pic}</span></td>
                                                <td className="py-2 border-b w-40">
                                                    {getRsvpBadge(tamu.rsvp)}
                                                </td>
                                                <td className="py-2 px-4 border-b">
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
                                                        href={route("undangan", [tamu.code, slugify(tamu.nama)])}
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
                            </div>

                            <div className="mt-6 join xl:mt-8">
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


        </AuthenticatedLayout>
    );
}

export default Index;
