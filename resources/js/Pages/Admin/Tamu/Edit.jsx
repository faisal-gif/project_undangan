import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm } from "@inertiajs/react";
import React from "react";

function Edit({ tamu, edisi }) {
    // Lihat catatan di Admin/Acara/Edit.jsx: PUT asli diblokir Cloudflare.
    const { data, setData, post, processing, errors } = useForm({
        _method: "put",
        nama: tamu.nama || "",
        lembaga: tamu.lembaga || "",
        alamat: tamu.alamat || "",
        pic: tamu.pic || "",
        jenis: tamu.jenis || "hadir",
        kategori_penghargaan: tamu.kategori_penghargaan || "",
        meja: tamu.meja || "",
        kursi: tamu.kursi || "",
        sub_kategori: tamu.sub_kategori || "",
        jumlah_orang: tamu.jumlah_orang || 0,
        status: tamu.status || "belum",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("admin.tamu.update", tamu.id));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Edit Tamu" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <h1 className="text-2xl font-bold">
                                Edit Tamu
                            </h1>
                            {edisi && (
                                <p className="text-sm text-gray-600 mb-4">
                                    Edisi: <b>{edisi}</b>
                                </p>
                            )}
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    <div className="flex flex-col w-full">
                                        <label
                                            htmlFor="nama"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            Nama
                                        </label>
                                        <input
                                            type="text"
                                            id="nama"
                                            value={data.nama}
                                            onChange={(e) =>
                                                setData("nama", e.target.value)
                                            }
                                            className="mt-2 input input-bordered w-full"
                                        />
                                        {errors.nama && (
                                            <p className="text-red-500 text-xs mt-1">
                                                {errors.nama}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <label
                                            htmlFor="lembaga"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            Lembaga
                                        </label>
                                        <input
                                            type="text"
                                            id="lembaga"
                                            value={data.lembaga}
                                            onChange={(e) =>
                                                setData("lembaga", e.target.value)
                                            }
                                            className="mt-2 input input-bordered w-full"
                                        />
                                        {errors.lembaga && (
                                            <p className="text-red-500 text-xs mt-1">
                                                {errors.lembaga}
                                            </p>
                                        )}
                                    </div>

                                </div>

                                <div className="mb-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
                                    <div className="w-full col-span-2">
                                        <label
                                            htmlFor="pic"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            PIC
                                        </label>
                                        <input
                                            type="text"
                                            id="pic"
                                            value={data.pic}
                                            onChange={(e) =>
                                                setData("pic", e.target.value)
                                            }
                                            className="mt-2 input input-bordered w-full"
                                        />
                                        {errors.pic && (
                                            <p className="text-red-500 text-xs mt-1">
                                                {errors.pic}
                                            </p>
                                        )}
                                    </div>

                                    <div className="w-full col-span-1">
                                        <label
                                            htmlFor="jumlah_orang"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            Jumlah Orang
                                        </label>
                                        <input
                                            type="text"
                                            id="jumlah_orang"
                                            value={data.jumlah_orang}
                                            onChange={(e) =>
                                                setData("jumlah_orang", e.target.value)
                                            }
                                            className="mt-2 input input-bordered w-full"
                                        />
                                        {errors.jumlah_orang && (
                                            <p className="text-red-500 text-xs mt-1">
                                                {errors.jumlah_orang}
                                            </p>
                                        )}
                                    </div>

                                    <div className="w-full col-span-1">
                                        <label htmlFor="meja" className="block text-sm font-medium text-gray-700">
                                            Nomor Meja
                                        </label>
                                        <input
                                            type="text"
                                            id="meja"
                                            value={data.meja}
                                            onChange={(e) => setData("meja", e.target.value)}
                                            placeholder="5"
                                            className="mt-2 input input-bordered w-full"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            Boleh huruf, mis. "VIP 2". Kosongkan bila penempatan belum selesai.
                                        </p>
                                        {errors.meja && (
                                            <p className="text-red-500 text-xs mt-1">{errors.meja}</p>
                                        )}
                                    </div>

                                    <div className="w-full col-span-1">
                                        <label htmlFor="kursi" className="block text-sm font-medium text-gray-700">
                                            Nomor Kursi
                                        </label>
                                        <input
                                            type="text"
                                            id="kursi"
                                            value={data.kursi}
                                            onChange={(e) => setData("kursi", e.target.value)}
                                            placeholder="3, 4"
                                            className="mt-2 input input-bordered w-full"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            Kursi 1-6, pisahkan dengan koma. Jumlahnya harus sama dengan jumlah orang.
                                        </p>
                                        {errors.kursi && (
                                            <p className="text-red-500 text-xs mt-1">{errors.kursi}</p>
                                        )}
                                    </div>
                                    <div className="w-full col-span-1">
                                        <label
                                            htmlFor="jenis"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            Jenis Undangan
                                        </label>
                                        <select
                                            id="jenis"
                                            value={data.jenis}
                                            onChange={(e) => setData("jenis", e.target.value)}
                                            className="mt-2 select select-bordered w-full"
                                        >
                                            <option value="hadir">Tamu undangan</option>
                                            <option value="penerima">Penerima penghargaan</option>
                                        </select>
                                        {errors.jenis && (
                                            <p className="text-red-500 text-xs mt-1">{errors.jenis}</p>
                                        )}
                                    </div>

                                    {data.jenis === "penerima" && (
                                        <div className="w-full col-span-1">
                                            <label
                                                htmlFor="kategori_penghargaan"
                                                className="block text-sm font-medium text-gray-700"
                                            >
                                                Kategori Penghargaan
                                            </label>
                                            <input
                                                type="text"
                                                id="kategori_penghargaan"
                                                value={data.kategori_penghargaan}
                                                onChange={(e) =>
                                                    setData("kategori_penghargaan", e.target.value)
                                                }
                                                placeholder="Positive News Maker"
                                                className="mt-2 input input-bordered w-full"
                                            />
                                            <p className="mt-1 text-xs text-gray-500">
                                                Boleh dikosongkan; undangan tetap menyebutnya sebagai penerima.
                                            </p>
                                            {errors.kategori_penghargaan && (
                                                <p className="text-red-500 text-xs mt-1">
                                                    {errors.kategori_penghargaan}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {data.jenis === "penerima" && (
                                        <div className="w-full col-span-1">
                                            <label
                                                htmlFor="sub_kategori"
                                                className="block text-sm font-medium text-gray-700"
                                            >
                                                Nama Penghargaan
                                            </label>
                                            <input
                                                type="text"
                                                id="sub_kategori"
                                                value={data.sub_kategori}
                                                onChange={(e) =>
                                                    setData("sub_kategori", e.target.value)
                                                }
                                                placeholder="Best Innovation in Basic Education Transformation"
                                                className="mt-2 input input-bordered w-full"
                                            />
                                            <p className="mt-1 text-xs text-gray-500">
                                                Penghargaan spesifik yang diterima, tampil di bawah kategorinya pada undangan.
                                            </p>
                                            {errors.sub_kategori && (
                                                <p className="text-red-500 text-xs mt-1">
                                                    {errors.sub_kategori}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                </div>


                                <div className="mb-4">
                                    <label
                                        htmlFor="alamat"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Alamat
                                    </label>
                                    <textarea
                                        id="alamat"
                                        value={data.alamat}
                                        onChange={(e) =>
                                            setData("alamat", e.target.value)
                                        }
                                        className="mt-1 textarea textarea-bordered w-full"
                                    ></textarea>
                                    {errors.alamat && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.alamat}
                                        </p>
                                    )}
                                </div>


                                <div className="flex items-center justify-end">
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-500 text-white rounded-md"
                                        disabled={processing}
                                    >
                                        Simpan
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

export default Edit;
