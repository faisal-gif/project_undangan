import AtiLogo from '@/Components/AtiLogo';
import { Head, Link } from '@inertiajs/react';

export default function Selesai({ nama, edisi }) {
    return (
        <div className="ati-guest flex min-h-screen items-center justify-center bg-ati-ink px-6 py-20 font-sans text-ati-cream">
            <Head title="Acara Sudah Berlalu" />

            <div className="w-full max-w-xl text-center">
                <AtiLogo className="mx-auto h-16 w-16" />

                <h1 className="mt-8 font-heading text-[clamp(2rem,5vw,3rem)] font-bold leading-[0.95] tracking-[-0.03em] text-ati-cream">
                    Acara Sudah Berlalu
                </h1>

                <p className="mt-6 border-t border-ati-cream/20 pt-6 text-lg leading-[1.6] text-ati-cream/80">
                    Terima kasih, {nama}. Undangan ini berlaku untuk{' '}
                    <span className="text-ati-gold-light">
                        {edisi?.nama} {edisi?.tahun}
                    </span>
                    {edisi?.tanggal_singkat && <> yang telah berlangsung pada {edisi.tanggal_singkat}</>}.
                </p>

                <p className="mt-3 text-ati-cream/55">
                    Undangan untuk acara terbaru akan dikirimkan secara terpisah.
                </p>

                <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
                    <Link
                        href="/"
                        className="inline-flex items-baseline gap-2 bg-ati-gold px-6 py-3 font-semibold text-ati-ink transition-colors hover:bg-ati-gold-light"
                    >
                        Kembali ke Beranda
                    </Link>

                    <Link
                        href="/winners"
                        className="font-semibold text-ati-cream underline decoration-ati-gold decoration-1 underline-offset-[6px] transition-colors hover:text-ati-gold-light"
                    >
                        Lihat Para Peraih
                    </Link>
                </div>
            </div>
        </div>
    );
}
