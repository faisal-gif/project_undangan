import PialaTiga from '@/Components/PialaTiga';
import { usePage } from "@inertiajs/react";

export const AwardsEventSection = ({ kode }) => {
    const { acara } = usePage().props;
    const jamMulai = acara?.jam_label?.includes(" - ")
        ? acara.jam_label.split(" - ")[0] + " WIB"
        : acara?.jam_label;

    const baris = [
        {
            label: "Tanggal",
            nilai: acara?.tanggal_label,
        },
        {
            label: "Waktu",
            nilai: acara?.jam_label,
            catatan: jamMulai ? `Registrasi: ${jamMulai}` : null,
        },
        {
            label: "Lokasi",
            nilai: acara?.tempat,
            catatan: acara?.alamat,
        },
        {
            label: "Dress Code",
            nilai: "Batik / Formal",
        },
    ];

    return (
        <section className="ati-rule relative overflow-hidden px-6 py-20 lg:py-24 lg:pb-64">
            {/* Pojok kanan bawah. lg:pb-52 di atas menyediakan ruang kosong
                untuknya - tanpa itu pialanya mendarat di atas tombol peta. */}
            <PialaTiga
                sumber="/piala1baru.glb"
                className="pointer-events-none absolute bottom-0 right-4 hidden w-[24%] max-w-[270px] lg:block"
                tinggi="240px"
                interaktif={false}
            />
            <div className="mx-auto max-w-4xl">
                <h2 data-tampil className="font-heading text-[clamp(1.9rem,4vw,2.75rem)] font-bold tracking-[-0.035em] text-ati-cream">
                    Informasi Acara
                </h2>

                <dl data-tampil className="mt-8 sm:grid sm:grid-cols-2 sm:gap-x-12">
                    {baris.map((item) => (
                        <div key={item.label} className="border-t border-ati-cream/15 py-6">
                            <dt className="font-heading text-sm text-ati-gold">{item.label}</dt>
                            <dd className="mt-1.5 font-heading text-xl font-semibold leading-snug text-ati-cream">
                                {item.nilai}
                            </dd>
                            {item.catatan && (
                                <dd className="mt-1.5 text-sm leading-[1.6] text-ati-cream/60">
                                    {item.catatan}
                                </dd>
                            )}
                        </div>
                    ))}
                </dl>

                <div data-tampil className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
                    {acara?.peta_url && (
                        <a
                            href={acara.peta_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-baseline gap-3 bg-ati-gold px-7 py-3 text-base font-semibold text-ati-ink transition-colors hover:bg-ati-gold-light"
                        >
                            Lihat Peta Lokasi
                            <span aria-hidden="true">&rarr;</span>
                        </a>
                    )}

                    {kode && (
                        <a
                            href={route('undangan.kalender', kode)}
                            className="font-semibold text-ati-cream underline decoration-ati-gold decoration-1 underline-offset-[6px] transition-colors hover:text-ati-gold-light"
                        >
                            Tambah ke kalender
                        </a>
                    )}
                </div>
            </div>
        </section>
    );
};
