import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm } from "@inertiajs/react";
import React from "react";

function Edit({ tamu }) {
    const { data, setData, put, processing, errors } = useForm({
        nama: tamu.nama || "",
        lembaga: tamu.lembaga || "",
        alamat: tamu.alamat || "",
        pic: tamu.pic || "",
        status: tamu.status || "belum",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route("admin.tamu.update", tamu.id));
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

                                <div className="mb-4">
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
                                        className="mt-2 input input-bordered w-full max-w-xs"
                                    />
                                    {errors.pic && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.pic}
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
