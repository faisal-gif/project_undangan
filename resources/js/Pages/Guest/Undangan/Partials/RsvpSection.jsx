import { router } from '@inertiajs/react';
import { useState } from 'react';

/**
 * Konfirmasi kehadiran dari tamu. Terpisah dari kolom status kehadiran, yang
 * baru terisi saat QR dipindai di pintu masuk.
 *
 * Memakai router.post, bukan useForm: pilihannya ditentukan oleh tombol yang
 * ditekan, dan setData() baru berlaku pada render berikutnya - kiriman jadi
 * kosong kalau post dipanggil tepat setelahnya.
 */
export const RsvpSection = ({ kode, rsvp }) => {
    const [mengirim, setMengirim] = useState(null);
    const [galat, setGalat] = useState(null);

    const kirim = (pilihan) => {
        setGalat(null);
        setMengirim(pilihan);

        router.post(
            route('undangan.rsvp', kode),
            { rsvp: pilihan },
            {
                preserveScroll: true,
                onError: (e) => setGalat(e.rsvp ?? 'Konfirmasi gagal disimpan. Coba lagi.'),
                onFinish: () => setMengirim(null),
            }
        );
    };

    const sudah = rsvp === 'hadir' || rsvp === 'berhalangan';

    return (
        <section className="ati-rule px-6 py-20 lg:py-24">
            <div className="mx-auto max-w-4xl">
                <h2 data-tampil className="font-heading text-[clamp(1.9rem,4vw,2.75rem)] font-bold tracking-[-0.035em] text-ati-cream">
                    Konfirmasi Kehadiran
                </h2>

                {sudah ? (
                    <>
                        <p className="mt-3 max-w-[52ch] text-lg leading-[1.6] text-ati-cream/80">
                            {rsvp === 'hadir'
                                ? 'Terima kasih, kehadiran Anda sudah kami catat.'
                                : 'Terima kasih atas kabarnya. Kami mencatat Anda berhalangan hadir.'}
                        </p>

                        <button
                            type="button"
                            onClick={() => kirim(rsvp === 'hadir' ? 'berhalangan' : 'hadir')}
                            disabled={mengirim !== null}
                            className="mt-6 font-semibold text-ati-cream underline decoration-ati-gold decoration-1 underline-offset-[6px] transition-colors hover:text-ati-gold-light disabled:opacity-50"
                        >
                            {mengirim
                                ? 'Menyimpan...'
                                : rsvp === 'hadir'
                                    ? 'Ubah jadi berhalangan'
                                    : 'Ubah jadi hadir'}
                        </button>
                    </>
                ) : (
                    <>
                        <p className="mt-3 max-w-[52ch] text-lg leading-[1.6] text-ati-cream/80">
                            Mohon kabari kami agar tempat duduk dan konsumsi dapat kami siapkan.
                        </p>

                        <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
                            <button
                                type="button"
                                onClick={() => kirim('hadir')}
                                disabled={mengirim !== null}
                                className="inline-flex items-baseline gap-3 bg-ati-gold px-8 py-3.5 text-base font-semibold text-ati-ink transition-colors hover:bg-ati-gold-light disabled:opacity-60"
                            >
                                {mengirim === 'hadir' ? 'Menyimpan...' : 'Saya akan hadir'}
                                <span aria-hidden="true">&rarr;</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => kirim('berhalangan')}
                                disabled={mengirim !== null}
                                className="font-semibold text-ati-cream/75 underline decoration-ati-cream/30 decoration-1 underline-offset-[6px] transition-colors hover:text-ati-cream disabled:opacity-50"
                            >
                                {mengirim === 'berhalangan' ? 'Menyimpan...' : 'Berhalangan hadir'}
                            </button>
                        </div>
                    </>
                )}

                {galat && <p className="mt-4 text-sm text-red-300">{galat}</p>}
            </div>
        </section>
    );
};
