/**
 * Hanya tampil untuk tamu berjenis "penerima".
 *
 * Teks panduan di bawah ini contoh yang masuk akal untuk malam penganugerahan;
 * sesuaikan dengan arahan panitia sebelum undangan disebar.
 */
const panduan = [
    {
        judul: "Hadir lebih awal",
        isi: "Mohon tiba sebelum jadwal registrasi ditutup untuk pengarahan singkat dari panitia.",
    },
    {
        judul: "Pemanggilan ke panggung",
        isi: "Nama Bapak/Ibu akan dipanggil pada sesi penyerahan anugerah. Mohon duduk di area yang telah disiapkan.",
    },
    {
        judul: "Sesi dokumentasi",
        isi: "Foto bersama dilakukan setelah seluruh penghargaan diserahkan.",
    },
    {
        judul: "Bila berhalangan",
        isi: "Mohon kabari panitia lebih awal agar penghargaan dapat diwakilkan.",
    },
];

export const PanduanPenerimaSection = ({ kategori }) => {
    return (
        <section className="border-t border-ati-cream/15 px-6 py-20 lg:py-24">
            <div className="mx-auto max-w-4xl">
                <h2 data-tampil className="font-heading text-[clamp(1.9rem,4vw,2.75rem)] font-bold tracking-[-0.035em] text-ati-cream">
                    Panduan Penerima
                </h2>
                <p className="mt-3 max-w-[58ch] text-ati-cream/65">
                    Beberapa hal yang perlu Bapak/Ibu ketahui sebagai penerima
                    {kategori ? ` ${kategori}` : " penghargaan"} pada malam ini.
                </p>

                <ol data-tampil className="mt-8 grid gap-x-12 sm:grid-cols-2">
                    {panduan.map((item) => (
                        <li
                            key={item.judul}
                            className="border-t border-ati-cream/15 py-6"
                        >
                            <h3 className="font-heading text-lg font-semibold text-ati-gold-light">
                                {item.judul}
                            </h3>
                            <p className="mt-1.5 leading-[1.6] text-ati-cream/70">{item.isi}</p>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    );
};
