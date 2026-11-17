import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { Head, Link, router, useForm, usePage } from "@inertiajs/react";
import React, { useState } from "react";

const kosong = {
    nama: "Anugerah TIMES Indonesia",
    mulai: "",
    selesai: "",
    tempat: "",
    alamat: "",
    peta_url: "",
    video_url: "",
    musik_url: "",
    jumlah_meja: "",
    kursi_per_meja: 6,
};

/**
 * "2026-11-27T19:30" -> "Jumat, 27 November 2026 pukul 19.30 WIB".
 * Dibaca sebagai teks apa adanya, bukan lewat Date(), supaya tidak ikut
 * bergeser oleh zona waktu komputer admin.
 */
function bacaWib(nilai) {
    const cocok = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(nilai || "");
    if (!cocok) return null;

    const [, th, bl, tg, jam, menit] = cocok;
    const hari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const bulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli",
        "Agustus", "September", "Oktober", "November", "Desember"];
    const tanggal = new Date(Number(th), Number(bl) - 1, Number(tg));

    return `${hari[tanggal.getDay()]}, ${Number(tg)} ${bulan[Number(bl) - 1]} ${th} pukul ${jam}.${menit} WIB`;
}

/**
 * "27 meja, 6 per meja, 1 kursi disisipkan" -> "27 x 6 + 1 = 163 kursi."
 *
 * Selisihnya tidak diketik di sini - ia diatur per meja lewat halaman
 * Penempatan Kursi - tapi tetap ikut dihitung, supaya angka di layar ini
 * tidak pernah berbeda dari jumlah kursi yang sebenarnya. Boleh negatif:
 * kursi yang dicabut dari satu meja dan tidak dipasang di meja lain
 * mengurangi totalnya.
 */
function hitungKursi({ jumlah_meja, kursi_per_meja }, selisih = 0) {
    const meja = Number(jumlah_meja);
    const per = Number(kursi_per_meja);

    if (!meja || !per || meja < 0 || per < 1) {
        return "Belum diatur. Penempatan tamu baru bisa dilakukan setelah ini diisi.";
    }

    const dasar = meja * per;
    const total = dasar + selisih;

    if (selisih === 0) {
        return `${meja} meja \u00d7 ${per} kursi = ${total} kursi.`;
    }

    return (
        `${meja} meja \u00d7 ${per} kursi ${selisih > 0 ? "+" : "\u2212"} ` +
        `${Math.abs(selisih)} kursi = ${total} kursi.`
    );
}

/**
 * Form diberi key={acara?.id} oleh pemanggilnya, jadi berpindah edisi
 * memasang ulang komponen ini dan useForm terisi nilai edisi yang benar.
 */
function FormAcara({ acara, membuatBaru, onBatalBaru }) {
    // Cloudflare di domain produksi hanya mengizinkan GET/POST, jadi pembaruan
    // dikirim sebagai POST dengan _method (pola yang sama dipakai form Pemenang).
    const { data, setData, post, processing, errors } = useForm(
        membuatBaru || !acara
            ? { ...kosong, _method: "post" }
            : {
                _method: "put",
                nama: acara.nama || "",
                mulai: acara.mulai || "",
                selesai: acara.selesai || "",
                tempat: acara.tempat || "",
                alamat: acara.alamat || "",
                peta_url: acara.peta_url || "",
                video_url: acara.video_url || "",
                musik_url: acara.musik_url || "",
                jumlah_meja: acara.jumlah_meja ?? "",
                kursi_per_meja: acara.kursi_per_meja ?? 6,
            }
    );

    // Hanya dibaca, tidak ikut dikirim: kursi tambahan punya halamannya
    // sendiri, dan menyimpannya dari dua tempat adalah cara paling pasti
    // untuk membuat keduanya berselisih.
    const selisih = membuatBaru || !acara ? 0 : acara.selisih_kursi || 0;
    const mejaKhusus = (membuatBaru || !acara ? [] : acara.meja_khusus) ?? [];

    // Batas bawah berasal dari tempat duduk yang sudah dipakai. Edisi baru
    // belum punya tamu, jadi batasnya nol.
    const batasMeja = membuatBaru || !acara ? 0 : acara.meja_terpakai || 0;
    const batasKursi = membuatBaru || !acara ? 0 : acara.kursi_terpakai || 0;

    // Hanya penyusutan jumlah meja yang bisa dipastikan di layar. Kursi per
    // meja tidak lagi sepadan dengan satu angka sejak ada kursi tambahan -
    // kursi 7 boleh sah di meja terakhir - jadi penilaiannya diserahkan ke
    // server, yang menyebut nomor kursi, nomor meja, dan nama tamunya.
    const menyusut =
        batasMeja > 0 && Number(data.jumlah_meja) > 0 && Number(data.jumlah_meja) < batasMeja;

    const handleSubmit = (e) => {
        e.preventDefault();

        if (membuatBaru || !acara) {
            post(route("admin.acara.store"));
        } else {
            post(route("admin.acara.update", acara.id));
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
                    <p className="mt-1 text-xs text-gray-500">
                        {bacaWib(data.mulai) ?? "Tanggal dan jam mulai acara."}
                    </p>
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
                    <p className="mt-1 text-xs text-gray-500">
                        {bacaWib(data.selesai) ?? "Boleh dikosongkan bila jam selesai belum pasti."}
                    </p>
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

            <div>
                <InputLabel htmlFor="video_url" value="Video sorotan (YouTube)" />
                <TextInput
                    id="video_url"
                    className="mt-1 block w-full"
                    value={data.video_url}
                    onChange={(e) => setData("video_url", e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                />
                <p className="mt-1 text-xs text-gray-500">
                    Tampil di halaman depan. Tempel tautan biasa dari YouTube; kosongkan untuk menyembunyikan video.
                </p>
                <InputError message={errors.video_url} className="mt-2" />
            </div>

            <div>
                <InputLabel htmlFor="musik_url" value="Musik latar undangan" />
                <TextInput
                    id="musik_url"
                    className="mt-1 block w-full"
                    value={data.musik_url}
                    onChange={(e) => setData("musik_url", e.target.value)}
                    placeholder="/musik/undangan.mp3"
                />
                <p className="mt-1 text-xs text-gray-500">
                    Alamat berkas audio, mis. taruh di folder public lalu isi /musik/undangan.mp3.
                    Kosongkan untuk mematikan musik. Musik baru berbunyi setelah tamu menekan "Buka Undangan".
                </p>
                <InputError message={errors.musik_url} className="mt-2" />
            </div>

            {/* Tata letak kursi. Jumlah kursinya tidak diketik - ia diturunkan
                dari ketiga angka ini, jadi tidak pernah berselisih dengan
                ketiganya. */}
            <div className="border-t border-gray-200 pt-5">
                <InputLabel value="Tata letak kursi" />
                <p className="mt-1 text-xs text-gray-500">
                    Isi banyaknya meja dan isi tiap meja; jumlah kursi dihitung sendiri.
                    Meja tertentu boleh ditambah atau dikurangi kursinya lewat
                    Penempatan Kursi.
                </p>

                <div className="mt-3 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                        <InputLabel htmlFor="jumlah_meja" value="Jumlah meja" />
                        <TextInput
                            id="jumlah_meja"
                            type="number"
                            min={batasMeja || 0}
                            className="mt-1 block w-full"
                            value={data.jumlah_meja}
                            onChange={(e) => setData("jumlah_meja", e.target.value)}
                            placeholder="24"
                        />
                        {batasMeja > 0 && (
                            <p className="mt-1 text-xs text-gray-500">
                                Minimal {batasMeja}; meja {batasMeja} masih ada tamunya.
                            </p>
                        )}
                        <InputError message={errors.jumlah_meja} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="kursi_per_meja" value="Kursi per meja" />
                        <TextInput
                            id="kursi_per_meja"
                            type="number"
                            min="1"
                            className="mt-1 block w-full"
                            value={data.kursi_per_meja}
                            onChange={(e) => setData("kursi_per_meja", e.target.value)}
                        />
                        {batasKursi > 0 && (
                            <p className="mt-1 text-xs text-gray-500">
                                Kursi tertinggi yang sudah dipakai: {batasKursi}.
                            </p>
                        )}
                        <InputError message={errors.kursi_per_meja} className="mt-2" />
                    </div>

                    {/* Kursi tambahan hanya dilaporkan di sini. Yang menentukan
                        meja mana yang ditambahi adalah orang yang sedang melihat
                        papan penempatan, bukan orang yang sedang mengisi tanggal
                        dan tempat acara. */}
                    <div>
                        <InputLabel value="Meja yang isinya beda" />
                        <p className="mt-1 text-sm text-gray-700">
                            {mejaKhusus.length > 0
                                ? mejaKhusus
                                      .map((m) => `Meja ${m.meja}: ${m.kursi} kursi`)
                                      .join(" · ")
                                : "Tidak ada; semua meja sama."}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                            Diatur per meja lewat{" "}
                            <Link
                                href={route("admin.penempatan.index")}
                                className="underline hover:text-gray-800"
                            >
                                Penempatan Kursi
                            </Link>
                            .
                        </p>
                    </div>
                </div>

                <p className="mt-3 text-sm text-gray-700">{hitungKursi(data, selisih)}</p>

                {menyusut && (
                    <div className="mt-3 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-900">
                        Meja {batasMeja} masih ada tamunya. Tamu yang duduk di luar
                        jumlah meja yang baru akan hilang dari denah - undangannya
                        sudah terkirim dengan nomor itu. Pindahkan tamunya dulu lewat
                        Penempatan Kursi.
                    </div>
                )}
            </div>

            <div className="flex flex-wrap items-center gap-4">
                {/* Selebar layar di ponsel: 87x34px terlalu kecil untuk jempol. */}
                <PrimaryButton className="w-full justify-center py-3 sm:w-auto sm:py-2" disabled={processing}>
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
                            onClick={() => router.post(route("admin.acara.aktifkan", acara.id), { _method: "put" })}
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
                        <div className="p-4 sm:p-6 bg-white border-b border-gray-200">
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
