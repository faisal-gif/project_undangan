import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import { Check, Edit2, Send, User } from "lucide-react";
import React from "react";

/**
 * Rincian satu tamu.
 *
 * Disusun mulai dari layar ponsel: satu kolom kartu, naik jadi dua kolom di
 * lg. Halaman ini sering dibuka dari ponsel saat mencocokkan tamu di lokasi,
 * jadi tiga hal yang paling dicari - tempat duduk, kode undangan, dan status
 * kehadiran - ditaruh paling atas, bukan data administratif.
 */
function Show({ tamu, edisi, qr }) {
    const slugify = (teks) =>
        (teks || "")
            .toLowerCase()
            .replace(/ /g, "-")
            .replace(/[^\w-]+/g, "")
            .replace(/--+/g, "-")
            .replace(/^-+|-+$/g, "");

    const tautan = route("undangan", [tamu.code, slugify(tamu.nama)]);

    const kirimWhatsapp = () => {
        const pesan = `Kepada Yth. ${tamu.nama}\n\nDengan hormat, Melalui pesan ini, kami bermaksud menyampaikan undangan resmi kepada Bapak/Ibu. Besar harapan kami agar Bapak/Ibu berkenan membuka tautan undangan digital berikut untuk informasi lengkap acara:\n\n${tautan}\n\nAtas perhatian dan waktunya, kami ucapkan terima kasih.\n\nSalam hormat.\nTIMES Indonesia`;

        window.open(`https://wa.me/?text=${encodeURIComponent(pesan)}`, "_blank");
    };

    const badgeRsvp = {
        hadir: "badge-success",
        berhalangan: "badge-error",
    };

    return (
        <AuthenticatedLayout>
            <Head title={tamu.nama || "Tamu"} />

            <div className="py-6 sm:py-12">
                <div className="mx-auto max-w-5xl sm:px-6 lg:px-8">
                    <div className="space-y-4 sm:space-y-6">
                        {/* Kepala */}
                        <div className="bg-white p-4 shadow-sm sm:rounded-lg sm:p-6">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <h1 className="text-2xl font-bold leading-tight">
                                        {tamu.nama}
                                    </h1>
                                    {tamu.lembaga && (
                                        <p className="mt-1 text-gray-600">{tamu.lembaga}</p>
                                    )}
                                    <p className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                                        <span
                                            className={`badge ${
                                                tamu.jenis === "penerima"
                                                    ? "badge-warning"
                                                    : "badge-ghost"
                                            }`}
                                        >
                                            {tamu.jenis === "penerima"
                                                ? "Penerima penghargaan"
                                                : "Tamu undangan"}
                                        </span>
                                        {edisi && (
                                            <span className="text-gray-500">{edisi}</span>
                                        )}
                                    </p>
                                </div>
                            </div>

                            {/* Tombol selebar layar di ponsel; di sm ke atas kembali
                                sebaris supaya tidak memakan ruang sia-sia. */}
                            <div className="mt-4 grid grid-cols-1 gap-2 border-t pt-4 sm:flex sm:flex-wrap">
                                <Link
                                    href={route("admin.tamu.edit", tamu.id)}
                                    className="btn btn-warning gap-2 sm:btn-sm"
                                >
                                    <Edit2 size={16} />
                                    Ubah
                                </Link>
                                <Link
                                    href={tautan}
                                    className="btn btn-neutral gap-2 sm:btn-sm"
                                >
                                    <User size={16} />
                                    Buka undangan
                                </Link>
                                <button
                                    type="button"
                                    onClick={kirimWhatsapp}
                                    className="btn btn-success gap-2 sm:btn-sm"
                                >
                                    <Send size={16} />
                                    Kirim WhatsApp
                                </button>
                                {tamu.status !== "datang" && (
                                    <Link
                                        href={route("admin.attendance", tamu.code)}
                                        className="btn btn-outline gap-2 sm:btn-sm"
                                    >
                                        <Check size={16} />
                                        Tandai hadir
                                    </Link>
                                )}
                            </div>
                        </div>

                        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
                            <Kartu judul="Tempat duduk">
                                <Baris
                                    label="Meja"
                                    nilai={tamu.meja ? `Meja ${tamu.meja}` : null}
                                />
                                <Baris label="Kursi" nilai={tamu.kursi} />
                                <Baris
                                    label="Jumlah orang"
                                    nilai={tamu.jumlah_orang ? `${tamu.jumlah_orang} orang` : null}
                                />
                            </Kartu>

                            <Kartu judul="Kehadiran">
                                <div className="flex items-center justify-between gap-3 border-b border-gray-100 py-2 last:border-0">
                                    <span className="text-sm text-gray-500">Konfirmasi</span>
                                    <span
                                        className={`badge ${badgeRsvp[tamu.rsvp] ?? "badge-ghost"}`}
                                    >
                                        {tamu.rsvp === "hadir"
                                            ? "Hadir"
                                            : tamu.rsvp === "berhalangan"
                                              ? "Berhalangan"
                                              : "Belum"}
                                    </span>
                                </div>
                                <Baris label="Dikonfirmasi pada" nilai={tamu.rsvp_pada} />
                                <div className="flex items-center justify-between gap-3 border-b border-gray-100 py-2 last:border-0">
                                    <span className="text-sm text-gray-500">Check-in</span>
                                    <span
                                        className={`badge ${
                                            tamu.status === "datang"
                                                ? "badge-success"
                                                : "badge-warning"
                                        }`}
                                    >
                                        {tamu.status === "datang" ? "Datang" : "Belum"}
                                    </span>
                                </div>
                            </Kartu>

                            {tamu.jenis === "penerima" && (
                                <Kartu judul="Penghargaan">
                                    <Baris
                                        label="Kategori"
                                        nilai={tamu.kategori_penghargaan}
                                    />
                                    <Baris label="Nama penghargaan" nilai={tamu.sub_kategori} />
                                </Kartu>
                            )}

                            <Kartu judul="Kontak">
                                <Baris label="PIC" nilai={tamu.pic} />
                                <Baris label="Telepon" nilai={tamu.telepon} />
                                <Baris label="Alamat" nilai={tamu.alamat} />
                            </Kartu>

                            <Kartu judul="Undangan">
                                <Baris label="Kode" nilai={tamu.code} />
                                <div className="py-2">
                                    <p className="text-sm text-gray-500">Tautan</p>
                                    <a
                                        href={tautan}
                                        className="mt-1 block break-all text-sm text-blue-600 hover:underline"
                                    >
                                        {tautan}
                                    </a>
                                </div>
                                {qr && (
                                    <div className="pt-2">
                                        <p className="text-sm text-gray-500">QR</p>
                                        <img
                                            src={qr}
                                            alt={`QR undangan ${tamu.nama}`}
                                            className="mt-2 h-40 w-40 rounded border border-gray-200 bg-white p-2"
                                        />
                                    </div>
                                )}
                            </Kartu>
                        </div>

                        <div className="px-4 sm:px-0">
                            <Link
                                href={route("admin.tamu.index")}
                                className="btn btn-ghost btn-sm"
                            >
                                Kembali ke daftar
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function Kartu({ judul, children }) {
    return (
        <div className="bg-white p-4 shadow-sm sm:rounded-lg sm:p-5">
            <h2 className="font-semibold">{judul}</h2>
            <div className="mt-2">{children}</div>
        </div>
    );
}

/**
 * Baris kosong sengaja tetap ditampilkan dengan tanda "-". Kalau
 * disembunyikan, admin tidak bisa membedakan "belum diisi" dari "kolomnya
 * memang tidak ada di halaman ini".
 */
function Baris({ label, nilai }) {
    return (
        <div className="flex items-baseline justify-between gap-3 border-b border-gray-100 py-2 last:border-0">
            <span className="shrink-0 text-sm text-gray-500">{label}</span>
            <span className="min-w-0 break-words text-right">
                {nilai || <span className="text-gray-300">-</span>}
            </span>
        </div>
    );
}

export default Show;
