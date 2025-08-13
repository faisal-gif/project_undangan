import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm } from "@inertiajs/react";
import React from "react";

function Edit({ tamu }) {
    const { data, setData, put, processing, errors } = useForm({
        nama: tamu.nama || "",
        alamat: tamu.alamat || "",
        status: tamu.status || "Hadir",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route("tamu.update", tamu.id));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Edit Tamu" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <h1 className="text-2xl font-bold mb-4">
                                Edit Tamu
                            </h1>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
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
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                    {errors.nama && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.nama}
                                        </p>
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
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    ></textarea>
                                    {errors.alamat && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.alamat}
                                        </p>
                                    )}
                                </div>
                                <div className="mb-4">
                                    <label
                                        htmlFor="status"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Status
                                    </label>
                                    <select
                                        id="status"
                                        value={data.status}
                                        onChange={(e) =>
                                            setData("status", e.target.value)
                                        }
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    >
                                        <option value="Hadir">Hadir</option>
                                        <option value="Tidak Hadir">
                                            Tidak Hadir
                                        </option>
                                        <option value="Menunggu Konfirmasi">
                                            Menunggu Konfirmasi
                                        </option>
                                    </select>
                                    {errors.status && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.status}
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
