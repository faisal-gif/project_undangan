import AtiLogo from '@/Components/AtiLogo'
import { usePage } from '@inertiajs/react'
import React from 'react'
import { Ornamen } from './Ornamen'

function AwardHeroSection({ guestName, lembaga, jumlah_orang, penerima, kategori, menutup, onOpenInvitation }) {
    const { acara } = usePage().props

    return (
        <section
            className={`ati-guest relative isolate flex min-h-[100svh] items-end overflow-hidden bg-ati-ink font-sans text-ati-cream ${menutup ? 'ati-sampul-tutup' : ''}`}
        >
            <img
                src="/bg-ati.jpg"
                alt=""
                aria-hidden="true"
                className="ati-bernapas absolute inset-0 -z-20 h-full w-full object-cover object-center"
            />
            <div
                aria-hidden="true"
                className="absolute inset-0 -z-10"
                style={{
                    background:
                        'linear-gradient(180deg, rgba(18,6,10,0.86) 0%, rgba(18,6,10,0.42) 32%, rgba(18,6,10,0.94) 84%, #12060A 100%)',
                }}
            />

            <div className="mx-auto w-full max-w-2xl px-6 pb-16 pt-28 text-center">
                <AtiLogo className="ati-reveal mx-auto h-20 w-auto" />

                <h1 className="ati-reveal mt-7 font-heading text-[clamp(2.25rem,7vw,3.5rem)] font-bold leading-[0.95] tracking-[-0.04em] text-ati-cream" style={{ animationDelay: '80ms' }}>
                    Anugerah
                    <br />
                    <span className="text-ati-gold-light">TIMES Indonesia</span>
                </h1>

                <Ornamen className="ati-reveal mt-6" />

                {acara?.tanggal_label && (
                    <p className="ati-reveal mt-6 font-heading text-lg text-ati-cream/75" style={{ animationDelay: '140ms' }}>
                        {acara.tanggal_label}
                    </p>
                )}

                {/* Nama tamu adalah pusat undangan ini: diberi ruang sendiri,
                    bingkai emas tipis, dan ukuran terbesar setelah judul. */}
                <div
                    className="ati-reveal relative mt-12 border-y border-ati-gold/40 px-6 py-9"
                    style={{ animationDelay: '220ms' }}
                >
                    <span aria-hidden="true" className="absolute left-0 top-0 h-3 w-3 border-l border-t border-ati-gold/70" />
                    <span aria-hidden="true" className="absolute right-0 top-0 h-3 w-3 border-r border-t border-ati-gold/70" />
                    <span aria-hidden="true" className="absolute bottom-0 left-0 h-3 w-3 border-b border-l border-ati-gold/70" />
                    <span aria-hidden="true" className="absolute bottom-0 right-0 h-3 w-3 border-b border-r border-ati-gold/70" />

                    <p className="text-[11px] uppercase tracking-[0.3em] text-ati-cream/55">
                        {penerima ? 'Dianugerahkan kepada' : 'Kepada Yth.'}
                    </p>

                    <p className="mt-4 font-heading text-[clamp(1.6rem,6vw,2.5rem)] font-bold leading-[1.1] tracking-[-0.03em] text-ati-cream">
                        {guestName}
                    </p>

                    {lembaga && <p className="mt-2 text-ati-cream/70">{lembaga}</p>}

                    {penerima && kategori && (
                        <p className="mt-4 font-heading text-lg italic text-ati-gold-light">{kategori}</p>
                    )}
                </div>

                {jumlah_orang && (
                    <p className="ati-reveal mt-4 text-sm text-ati-cream/60" style={{ animationDelay: '280ms' }}>
                        Berlaku untuk maksimal {jumlah_orang} orang
                    </p>
                )}

                <button
                    type="button"
                    onClick={onOpenInvitation}
                    className="ati-reveal group mt-10 inline-flex items-baseline gap-3 bg-ati-gold px-9 py-4 text-base font-semibold text-ati-ink shadow-[0_18px_50px_-20px_rgba(214,162,73,0.85)] transition-colors hover:bg-ati-gold-light"
                    style={{ animationDelay: '340ms' }}
                >
                    Buka Undangan
                    <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
                        &rarr;
                    </span>
                </button>
            </div>
        </section>
    )
}

export default AwardHeroSection
