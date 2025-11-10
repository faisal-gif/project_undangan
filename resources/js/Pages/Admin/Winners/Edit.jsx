import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm } from "@inertiajs/react";
import React, { useState } from "react";

function Edit({ winner }) {
    const { data, setData, post, processing, errors } = useForm({
        nama: winner.nama || "",
        jabatan: winner.jabatan || "",
        kategori: winner.kategori || "",
        tahun: winner.tahun || "",
        foto: null,
        _method: "PUT",
    });

    const [previewUrl, setPreviewUrl] = useState(
        winner.foto ? `/storage/${winner.foto}` : null
    );

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData("foto", file);
            
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemovePhoto = () => {
        setData("foto", null);
        setPreviewUrl(winner.foto ? `/storage/${winner.foto}` : null);
        document.getElementById("foto").value = "";
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("admin.winners.update", winner.id));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Edit Pemenang" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <h1 className="text-2xl font-bold mb-4">
                                Edit Pemenang
                            </h1>
                            <form onSubmit={handleSubmit}>
                                {/* Upload Foto Section */}
                                <div className="flex flex-col w-full mb-6">
                                    <label
                                        htmlFor="foto"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Foto (Portrait)
                                    </label>
                                    
                                    {previewUrl ? (
                                        <div className="flex flex-col items-start gap-3">
                                            <div className="relative">
                                                <img
                                                    src={previewUrl}
                                                    alt="Preview"
                                                    className="w-48 h-64 object-cover rounded-lg border-2 border-gray-300 shadow-sm"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleRemovePhoto}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors shadow-md"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => document.getElementById("foto").click()}
                                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
                                            >
                                                Ganti Foto
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center w-48 h-64 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                                            <label
                                                htmlFor="foto"
                                                className="cursor-pointer flex flex-col items-center justify-center w-full h-full"
                                            >
                                                <svg
                                                    className="w-12 h-12 text-gray-400 mb-2"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                    />
                                                </svg>
                                                <span className="text-sm text-gray-500 text-center px-2">
                                                    Klik untuk upload foto
                                                </span>
                                                <span className="text-xs text-gray-400 mt-1">
                                                    (Portrait)
                                                </span>
                                            </label>
                                        </div>
                                    )}
                                    
                                    <input
                                        type="file"
                                        id="foto"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                    
                                    {errors.foto && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.foto}
                                        </p>
                                    )}
                                </div>

                                <div className="flex flex-col w-full mb-4">
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

                                <div className="mb-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
                                    <div className="flex flex-col">
                                        <label
                                            htmlFor="jabatan"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            Jabatan
                                        </label>
                                        <input
                                            type="text"
                                            id="jabatan"
                                            value={data.jabatan}
                                            onChange={(e) =>
                                                setData("jabatan", e.target.value)
                                            }
                                            className="mt-2 input input-bordered w-full"
                                        />
                                        {errors.jabatan && (
                                            <p className="text-red-500 text-xs mt-1">
                                                {errors.jabatan}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <label
                                            htmlFor="kategori"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            Kategori
                                        </label>
                                        <input
                                            type="text"
                                            id="kategori"
                                            value={data.kategori}
                                            onChange={(e) =>
                                                setData("kategori", e.target.value)
                                            }
                                            className="mt-2 input input-bordered w-full"
                                        />
                                        {errors.kategori && (
                                            <p className="text-red-500 text-xs mt-1">
                                                {errors.kategori}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <label
                                            htmlFor="tahun"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            Tahun
                                        </label>
                                        <input
                                            type="number"
                                            id="tahun"
                                            value={data.tahun}
                                            onChange={(e) =>
                                                setData("tahun", e.target.value)
                                            }
                                            className="mt-2 input input-bordered w-full"
                                            placeholder="2024"
                                        />
                                        {errors.tahun && (
                                            <p className="text-red-500 text-xs mt-1">
                                                {errors.tahun}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-2">
                                    <a
                                        href={route("admin.winners.index")}
                                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                                    >
                                        Batal
                                    </a>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                                        disabled={processing}
                                    >
                                        Update
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