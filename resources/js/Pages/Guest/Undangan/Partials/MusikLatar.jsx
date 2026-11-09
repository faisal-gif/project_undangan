import { useEffect, useRef, useState } from 'react';

/**
 * Musik latar undangan. Tidak pernah diputar tanpa sentuhan tamu: pemutaran
 * dimulai dari tombol "Buka Undangan" (prop `mainkan`), karena browser memang
 * memblokir audio yang berbunyi sendiri saat halaman dimuat.
 *
 * Tombolnya tetap terlihat supaya tamu bisa mendiamkannya kapan saja.
 */
export const MusikLatar = ({ src, mainkan }) => {
    const audioRef = useRef(null);
    const [berbunyi, setBerbunyi] = useState(false);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !mainkan) return;

        audio.volume = 0.35;
        audio.play().then(
            () => setBerbunyi(true),
            // Ditolak browser atau berkasnya gagal dimuat: diamkan saja,
            // tamu masih bisa menyalakan sendiri lewat tombol.
            () => setBerbunyi(false)
        );
    }, [mainkan]);

    if (!src) return null;

    const alihkan = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (audio.paused) {
            audio.play().then(() => setBerbunyi(true), () => setBerbunyi(false));
        } else {
            audio.pause();
            setBerbunyi(false);
        }
    };

    return (
        <>
            <audio ref={audioRef} src={src} loop preload="none" />

            {/* Di kanan atas: judul tiap bagian rata kiri, jadi sudut ini
                selalu kosong. Di kanan bawah tombol ini dilewati kartu QR. */}
            <button
                type="button"
                onClick={alihkan}
                aria-pressed={berbunyi}
                aria-label={berbunyi ? 'Matikan musik' : 'Nyalakan musik'}
                className="fixed right-4 top-4 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-ati-gold/40 bg-ati-ink/85 text-ati-gold-light backdrop-blur-md transition-colors hover:border-ati-gold hover:text-ati-cream"
            >
                {/* Ikon digambar sendiri agar setebal garis lain di halaman ini. */}
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18V5l10-2v13" />
                    <circle cx="6" cy="18" r="3" />
                    <circle cx="16" cy="16" r="3" />
                    {!berbunyi && <path d="M3 3l18 18" className="text-ati-cream/70" />}
                </svg>

                {berbunyi && (
                    <span
                        aria-hidden="true"
                        className="absolute inset-0 animate-ping rounded-full border border-ati-gold/30"
                        style={{ animationDuration: '2.4s' }}
                    />
                )}
            </button>
        </>
    );
};
