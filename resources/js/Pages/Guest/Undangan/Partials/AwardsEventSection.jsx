import { usePage } from "@inertiajs/react";

export const AwardsEventSection = () => {
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
        <section className="border-t border-ati-cream/15 px-6 py-20 lg:py-24">
            <div className="mx-auto max-w-4xl">
                <h2 className="font-heading text-[clamp(1.9rem,4vw,2.75rem)] font-bold tracking-[-0.035em] text-ati-cream">
                    Informasi Acara
                </h2>

                <dl className="mt-8 sm:grid sm:grid-cols-2 sm:gap-x-12">
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

                {acara?.peta_url && (
                    <a
                        href={acara.peta_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-8 inline-flex items-baseline gap-3 bg-ati-gold px-7 py-3 text-base font-semibold text-ati-ink transition-colors hover:bg-ati-gold-light"
                    >
                        Lihat Peta Lokasi
                        <span aria-hidden="true">&rarr;</span>
                    </a>
                )}
            </div>
        </section>
    );
};
