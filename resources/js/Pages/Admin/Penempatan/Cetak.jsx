import Ruangan from "@/Components/DenahRuangan";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";

/**
 * Lembar cetak penempatan: denah, daftar penghuni tiap meja, lalu indeks nama.
 *
 * Tiga bagian karena tiga orang yang berbeda memakainya. Denah untuk ditempel
 * di pintu masuk; daftar per meja untuk pengarah yang berdiri di ruangan dan
 * ditanya "meja 12 siapa saja"; indeks nama untuk petugas penerima tamu, yang
 * selalu ditanya dari arah sebaliknya - orangnya menyebut namanya, bukan nomor
 * mejanya.
 *
 * Semuanya hitam-putih. Lembar yang hanya terbaca kalau dicetak berwarna
 * adalah lembar yang gagal tepat di hari ia paling dibutuhkan.
 */

/** Tinggi lantai di kertas, dalam piksel CSS pada A4 melintang 96dpi.
 *
 * Diukur, bukan ditebak: area cetak A4 melintang dengan tepi 10mm adalah
 * 277x190mm, yakni sekitar 1047x718px. Kepala halaman, panggung, pintu,
 * keterangan, dan catatan kakinya terukur memakan 265px dari tingginya, jadi
 * lantai 440px menghasilkan lembar setinggi ~705px - masih di dalam 718px.
 * Lebarnya 440 x 1.95 = 858px, juga di dalam 1047px.
 *
 * Kalau lembarnya sampai melebihi satu halaman, denahnya terpotong jadi dua
 * kertas - dan denah yang terpotong bukan denah lagi. */
const TINGGI_CETAK = 440;

function Kosong() {
    return (
        <AuthenticatedLayout>
            <Head title="Cetak Penempatan" />
            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    <div className="rounded-lg bg-white p-8 shadow-sm">
                        <h1 className="text-2xl font-bold">Cetak Penempatan</h1>
                        <p className="mt-3 text-gray-600">
                            Belum ada acara aktif, jadi belum ada denah untuk dicetak.
                        </p>
                        <Link href={route("admin.acara.edit")} className="btn btn-neutral btn-sm mt-6">
                            Atur acara
                        </Link>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function KepalaLembar({ acara, judul, terisi, belumDuduk }) {
    return (
        <header className="mb-4 flex items-end justify-between gap-6 border-b-2 border-gray-900 pb-2">
            <div className="min-w-0">
                <h2 className="text-xl font-bold leading-tight">{judul}</h2>
                <p className="text-sm text-gray-700">
                    {acara.nama}
                    {acara.tempat ? ` · ${acara.tempat}` : ""}
                    {acara.waktu ? ` · ${acara.waktu}` : ""}
                </p>
            </div>
            <p className="shrink-0 text-right text-sm text-gray-700">
                <span className="font-bold tabular-nums">{terisi}</span> dari{" "}
                <span className="tabular-nums">{acara.jumlah_kursi}</span> kursi terisi
                <span className="block tabular-nums">
                    {acara.jumlah_meja} meja
                    {belumDuduk > 0 && ` · ${belumDuduk} orang belum duduk`}
                </span>
            </p>
        </header>
    );
}

export default function Cetak({ acara, mejas, letak, kolom, baris, orientasi, indeks, belum }) {
    if (!acara) return <Kosong />;

    const terisi = mejas.reduce((n, m) => n + m.terisi, 0);
    const belumDuduk = belum.reduce((n, t) => n + t.sisa, 0);
    const kepala = { acara, terisi, belumDuduk };

    return (
        <>
            <Head title="Cetak Penempatan" />

            <style>{`
                @page { size: A4 landscape; margin: 10mm; }

                @media print {
                    /* Panggung dan kursi terisi dibedakan oleh isian gelap.
                       Tanpa ini peramban membuang seluruh latar saat mencetak,
                       dan keduanya hilang jadi kotak putih berbingkai. */
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                    .tanpa-cetak { display: none !important; }
                    .lembar { break-after: page; }
                    .lembar:last-child { break-after: auto; }
                    .utuh { break-inside: avoid; }
                }
            `}</style>

            <div className="min-h-screen bg-gray-100 py-8 text-gray-900 print:bg-white print:py-0">
                {/* Batang perintah hanya ada di layar. */}
                <div className="tanpa-cetak mx-auto mb-6 flex max-w-[1100px] flex-wrap items-center justify-between gap-3 px-4">
                    <div>
                        <h1 className="text-xl font-bold">Cetak Penempatan</h1>
                        <p className="text-sm text-gray-600">
                            Empat lembar: denah, daftar per meja, indeks nama, lalu yang belum
                            dapat kursi. Atur kertas ke A4 melintang.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href={route("admin.penempatan.denah")} className="btn btn-sm btn-ghost">
                            Kembali ke denah
                        </Link>
                        <button type="button" onClick={() => window.print()} className="btn btn-sm btn-neutral">
                            Cetak
                        </button>
                    </div>
                </div>

                <div className="mx-auto max-w-[1100px] space-y-8 px-4 print:max-w-none print:space-y-0 print:px-0">
                    {/* Lembar 1: denah ruangan */}
                    <section className="lembar rounded-lg bg-white p-6 shadow-sm print:rounded-none print:p-0 print:shadow-none">
                        <KepalaLembar {...kepala} judul="Denah Meja" />

                        <Ruangan
                            mejas={mejas}
                            letak={letak}
                            kolom={kolom}
                            baris={baris}
                            orientasi={orientasi}
                            aturUlang={false}
                            tema="cetak"
                            tinggiPaksa={TINGGI_CETAK}
                        />

                        <p className="mt-3 text-center text-[0.7rem] text-gray-600">
                            Kursi 1 berada di sisi terdekat panggung, lalu berputar searah jarum jam.
                        </p>
                    </section>

                    {/* Lembar 2: siapa duduk di meja mana */}
                    <section className="lembar rounded-lg bg-white p-6 shadow-sm print:rounded-none print:p-0 print:shadow-none">
                        <KepalaLembar {...kepala} judul="Daftar Tamu per Meja" />

                        {/* Seluruh meja dicetak, termasuk yang masih kosong:
                            kertas ini dibawa keliling ruangan dan dicocokkan
                            meja demi meja, jadi meja yang hilang dari daftar
                            berarti meja yang tidak pernah diperiksa. */}
                        {mejas.length === 0 ? (
                            <p className="py-8 text-center text-sm text-gray-600">
                                Tata letak kursi belum diatur, jadi belum ada meja.
                            </p>
                        ) : (
                            <div className="grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-3 print:grid-cols-4">
                                {mejas.map((m) => (
                                    <div key={m.nomor} className="utuh border border-gray-400">
                                        <h3 className="flex items-baseline justify-between gap-2 border-b border-gray-400 bg-gray-900 px-2 py-1 text-xs font-bold text-white">
                                            <span>MEJA {m.nomor}</span>
                                            <span className="font-normal tabular-nums">
                                                {m.terisi}/{m.kapasitas}
                                            </span>
                                        </h3>
                                        <ol className="divide-y divide-gray-200">
                                            {m.kursi.map((k) => (
                                                <li key={k.nomor} className="flex gap-2 px-2 py-1 text-[0.7rem] leading-tight">
                                                    <span className="w-3 shrink-0 tabular-nums text-gray-500">
                                                        {k.nomor}
                                                    </span>
                                                    {k.tamu ? (
                                                        <span className="min-w-0">
                                                            <span className="block font-semibold">
                                                                {k.tamu.nama}
                                                            </span>
                                                            {k.tamu.lembaga && (
                                                                <span className="block text-gray-600">
                                                                    {k.tamu.lembaga}
                                                                </span>
                                                            )}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400">kosong</span>
                                                    )}
                                                </li>
                                            ))}
                                            {m.kursi.length === 0 && (
                                                <li className="px-2 py-1 text-[0.7rem] text-gray-400">
                                                    tanpa kursi
                                                </li>
                                            )}
                                        </ol>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Lembar 3: dari nama ke tempat duduk - arah yang dipakai
                        petugas penerima tamu. */}
                    <section className="lembar rounded-lg bg-white p-6 shadow-sm print:rounded-none print:p-0 print:shadow-none">
                        <KepalaLembar {...kepala} judul={`Indeks Nama (${indeks.length} tamu)`} />

                        <p className="-mt-2 mb-3 text-[0.7rem] text-gray-600">
                            Urut abjad. <strong>M</strong> = nomor meja, <strong>K</strong> = nomor
                            kursi. Satu undangan boleh terbagi ke dua meja, dan keduanya ditulis.
                        </p>

                        {indeks.length === 0 ? (
                            <p className="py-8 text-center text-sm text-gray-600">
                                Belum ada tamu yang ditempatkan.
                            </p>
                        ) : (
                            <div className="grid gap-x-8 sm:grid-cols-2 print:grid-cols-3">
                                {indeks.map((t) => (
                                    <div
                                        key={t.id}
                                        className="utuh flex items-baseline justify-between gap-3 border-b border-gray-200 py-1 text-[0.72rem] leading-tight"
                                    >
                                        <span className="min-w-0">
                                            <span className="block font-semibold">{t.nama}</span>
                                            {t.lembaga && (
                                                <span className="block text-gray-600">{t.lembaga}</span>
                                            )}
                                        </span>
                                        <span className="shrink-0 text-right font-semibold tabular-nums">
                                            {t.tempat_duduk}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Lembar 4: siapa yang masih berdiri. Panitia memegang ini
                        saat acara mulai, dan rombongan yang baru separuh duduk
                        ikut di sini - bukan "sudah ditempatkan" hanya karena
                        satu orangnya sudah dapat kursi. */}
                    <section className="lembar rounded-lg bg-white p-6 shadow-sm print:rounded-none print:p-0 print:shadow-none">
                        <KepalaLembar
                            {...kepala}
                            judul={`Belum Dapat Kursi (${belumDuduk} orang)`}
                        />

                        {belum.length === 0 ? (
                            <p className="py-8 text-center text-sm text-gray-700">
                                Semua tamu sudah dapat kursi.
                            </p>
                        ) : (
                            <>
                                <p className="-mt-2 mb-3 text-[0.7rem] text-gray-600">
                                    {belum.length} undangan, {belumDuduk} orang. Urut abjad.
                                    Rombongan yang sebagiannya sudah duduk ikut tercantum dengan
                                    sisanya saja.
                                </p>

                                <div className="grid gap-x-8 sm:grid-cols-2 print:grid-cols-3">
                                    {belum.map((t) => (
                                        <div
                                            key={t.id}
                                            className="utuh flex items-baseline justify-between gap-3 border-b border-gray-200 py-1 text-[0.72rem] leading-tight"
                                        >
                                            <span className="min-w-0">
                                                <span className="block font-semibold">{t.nama}</span>
                                                {t.lembaga && (
                                                    <span className="block text-gray-600">
                                                        {t.lembaga}
                                                    </span>
                                                )}
                                            </span>
                                            <span className="shrink-0 text-right font-semibold tabular-nums">
                                                {t.sudah > 0
                                                    ? `sisa ${t.sisa} dari ${t.jumlah_orang}`
                                                    : `${t.sisa} org`}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </section>
                </div>
            </div>
        </>
    );
}
