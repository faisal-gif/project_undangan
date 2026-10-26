import { usePage } from "@inertiajs/react";

export const QRCodeSection = ({ guestName, guestCode }) => {
  const { acara } = usePage().props;

  const eventLabel = [acara?.nama, acara?.tahun].filter(Boolean).join(" ");

  // Dibuat saat diminta oleh server; tidak ada berkas tersimpan.
  const qrUrl = route('tamu.qr', guestCode);

  const petunjuk = [
    "Tunjukkan QR ini dari layar ponsel saat registrasi",
    "Simpan tautan undangan ini agar mudah dibuka lagi",
    "Datang 30 menit sebelum acara",
    "Dress code: Batik",
  ];

  return (
    <section className="border-t border-ati-cream/15 px-6 py-20 lg:py-24">
      <div className="mx-auto max-w-4xl">
        <h2 className="font-heading text-[clamp(1.9rem,4vw,2.75rem)] font-bold tracking-[-0.035em] text-ati-cream">
          E-Ticket Anda
        </h2>
        <p className="mt-3 max-w-[52ch] text-ati-cream/65">
          Tunjukkan QR code ini dari layar ponsel Anda saat registrasi.
        </p>

        <div className="mt-8 grid gap-10 sm:grid-cols-[auto_1fr] sm:gap-12">
          {/* Latar putih wajib: pemindai butuh kontras penuh. */}
          <div className="mx-auto w-full max-w-[17rem] bg-white p-5 sm:mx-0">
            <img
              src={qrUrl}
              alt={`QR undangan ${guestName}`}
              width={256}
              height={256}
              className="w-full"
            />
            <p className="mt-3 text-center font-mono text-sm tracking-[0.12em] text-ati-ink">
              {guestCode}
            </p>
          </div>

          <div>
            <p className="font-heading text-sm text-ati-gold">{eventLabel}</p>
            <p className="mt-1 font-heading text-[clamp(1.35rem,3vw,1.9rem)] font-semibold leading-tight text-ati-cream">
              {guestName}
            </p>

            <dl className="mt-5 border-t border-ati-cream/15 pt-5 text-ati-cream/70">
              <div className="flex gap-3">
                <dt className="sr-only">Tanggal</dt>
                <dd>{acara?.tanggal_label}</dd>
              </div>
              <div className="mt-1 flex gap-3">
                <dt className="sr-only">Waktu</dt>
                <dd>{acara?.jam_label}</dd>
              </div>
              <div className="mt-1 flex gap-3">
                <dt className="sr-only">Tempat</dt>
                <dd>{acara?.tempat}</dd>
              </div>
            </dl>

            <ul className="mt-6 border-t border-ati-cream/15 pt-5 text-sm leading-[1.7] text-ati-cream/60">
              {petunjuk.map((baris) => (
                <li key={baris} className="flex gap-2.5">
                  <span aria-hidden="true" className="text-ati-gold">&middot;</span>
                  {baris}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-12 border-t border-ati-cream/15 pt-6 text-sm text-ati-cream/55">
          Jika ada pertanyaan, hubungi panitia:{" "}
          <a
            href="mailto:redaksi@timesindonesia.co.id"
            className="text-ati-gold-light underline decoration-ati-gold/50 underline-offset-[5px] transition-colors hover:text-ati-cream"
          >
            redaksi@timesindonesia.co.id
          </a>{" "}
          <span className="text-ati-cream/35">|</span>{" "}
          <a
            href="https://wa.me/6285735084947"
            target="_blank"
            rel="noopener noreferrer"
            className="text-ati-gold-light underline decoration-ati-gold/50 underline-offset-[5px] transition-colors hover:text-ati-cream"
          >
            +62 857-3508-4947
          </a>
        </p>
      </div>
    </section>
  );
};
