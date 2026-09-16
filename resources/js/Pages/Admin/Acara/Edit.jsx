import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { Head, router, useForm, usePage } from "@inertiajs/react";
import React, { useState } from "react";

const kosong = {
    nama: "Anugerah TIMES Indonesia",
    mulai: "",
    selesai: "",
    tempat: "",
    alamat: "",
    peta_url: "",
};

/**
 * Form diberi key={acara?.id} oleh pemanggilnya, jadi berpindah edisi
 * memasang ulang komponen ini dan useForm terisi nilai edisi yang benar.
 */
function FormAcara({ acara, membuatBaru, onBatalBaru }) {
    const { data, setData, post, put, processing, errors } = useForm(
        membuatBaru || !acara
            ? kosong
            : {
                nama: acara.nama || "",
                mulai: acara.mulai || "",
                selesai: acara.selesai || "",
                tempat: acara.tempat || "",
                alamat: acara.alamat || "",
                peta_url: acara.peta_url || "",
            }
    );

    const handleSubmit = (e) => {
        e.preventDefault();

        if (membuatBaru || !acara) {
            post(route("admin.acara.store"));
        } else {
            put(route("admin.acara.update", acara.id));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <InputLabel htmlFor="nama" value="Nama acara" />
                <TextInput
                    id="nama"
                    className="mt-1 block w-full"
                    value={data.nama}
                    onChange={(e) => setData("nama", e.target.value)}
                    required
                />
                <InputError message={errors.nama} className="mt-2" />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
                <div>
                    <InputLabel htmlFor="mulai" value="Mulai (WIB)" />
                    <TextInput
                        id="mulai"
                        type="datetime-local"
                        className="mt-1 block w-full"
                        value={data.mulai}
                        onChange={(e) => setData("mulai", e.target.value)}
                        required
                    />
                    <InputError message={errors.mulai} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="selesai" value="Selesai (WIB)" />
                    <TextInput
                        id="selesai"
                        type="datetime-local"
                        className="mt-1 block w-full"
                        value={data.selesai}
                        onChange={(e) => setData("selesai", e.target.value)}
                    />
                    <InputError message={errors.selesai} className="mt-2" />
                </div>
            </div>

            <div>
                <InputLabel htmlFor="tempat" value="Tempat" />
                <TextInput
                    id="tempat"
                    className="mt-1 block w-full"
                    value={data.tempat}
                    onChange={(e) => setData("tempat", e.target.value)}
                    placeholder="Grand Ballroom"
                />
                <InputError message={errors.tempat} className="mt-2" />
            </div>

            <div>
                <InputLabel htmlFor="alamat" value="Alamat lengkap" />
                <textarea
                    id="alamat"
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    value={data.alamat}
                    onChange={(e) => setData("alamat", e.target.value)}
                />
                <InputError message={errors.alamat} className="mt-2" />
            </div>

            <div>
                <InputLabel htmlFor="peta_url" value="Tautan peta (Google Maps)" />
                <TextInput
                    id="peta_url"
                    type="url"
                    className="mt-1 block w-full"
                    value={data.peta_url}
                    onChange={(e) => setData("peta_url", e.target.value)}
                    placeholder="https://maps.app.goo.gl/..."
                />
                <InputError message={errors.peta_url} className="mt-2" />
            </div>

            <div className="flex flex-wrap items-center gap-4">
                <PrimaryButton disabled={processing}>
                    {processing
                        ? "Menyimpan..."
                        : membuatBaru
                            ? "Simpan Edisi Baru"
                            : "Simpan"}
                </PrimaryButton>

                {membuatBaru && (
                    <button
                        type="button"
                        onClick={onBatalBaru}
                        className="text-sm text-gray-600 underline"
                    >
                        Batal
                    </button>
                )}

                {!membuatBaru && acara && (
                    acara.aktif ? (
                        <span className="badge badge-success">Acara aktif</span>
                    ) : (
                        <button
                            type="button"
                            className="btn btn-sm btn-warning"
                            onClick={() => router.put(route("admin.acara.aktifkan", acara.id))}
                        >
                            Jadikan Aktif
                        </button>
                    )
                )}
            </div>
        </form>
    );
}

function Edit({ acara, acaras = [] }) {
    const { flash } = usePage().props;
    const [membuatBaru, setMembuatBaru] = useState(false);

    return (
        <AuthenticatedLayout>
            <Head title="Pengaturan Acara" />
            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <h1 className="text-2xl font-bold">Pengaturan Acara</h1>

                                <div className="flex items-center gap-3">
                                    {acaras.length > 0 && !membuatBaru && (
                                        <select
                                            className="select select-bordered select-sm"
                                            value={acara?.id ?? ""}
                                            onChange={(e) =>
                                                router.get(route("admin.acara.edit", { acara: e.target.value }))
                                            }
                                            aria-label="Pilih edisi acara"
                                        >
                                            {acaras.map((a) => (
                                                <option key={a.id} value={a.id}>
                                                    {a.label} ({a.jumlah} tamu){a.aktif ? " • aktif" : ""}
                                                </option>
                                            ))}
                                        </select>
                                    )}

                                    {!membuatBaru && (
                                        <button
                                            type="button"
                                            className="btn btn-neutral btn-sm"
                                            onClick={() => setMembuatBaru(true)}
                                        >
                                            Edisi Baru
                                        </button>
                                    )}
                                </div>
                            </div>

                            <p className="mt-1 mb-6 text-sm text-gray-600">
                                {membuatBaru
                                    ? "Edisi baru dibuat dalam keadaan tidak aktif. Aktifkan setelah datanya lengkap."
                                    : "Dipakai untuk hitung mundur dan informasi acara di halaman depan, undangan tamu, widget, dan kartu QR. Semua jam dalam WIB."}
                            </p>

                            {flash?.success && (
                                <div className="mb-6 rounded-md bg-green-50 px-4 py-3 text-sm text-green-800">
                                    {flash.success}
                                </div>
                            )}

                            <FormAcara
                                key={membuatBaru ? "baru" : acara?.id}
                                acara={acara}
                                membuatBaru={membuatBaru}
                                onBatalBaru={() => setMembuatBaru(false)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

export default Edit;
