import AtiLogo from '@/Components/AtiLogo'
import { usePage } from '@inertiajs/react'
import React from 'react'

function AwardHeroSection({ guestName, lembaga, jumlah_orang, onOpenInvitation }) {
    const { acara } = usePage().props

    return (
        <section className="ati-guest relative isolate flex min-h-[100svh] items-end overflow-hidden bg-ati-ink font-sans text-ati-cream">
            <img
                src="/bg-ati.jpg"
                alt=""
                aria-hidden="true"
                className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
            />
            <div
                aria-hidden="true"
                className="absolute inset-0 -z-10"
                style={{
                    background:
                        'linear-gradient(180deg, rgba(18,6,10,0.86) 0%, rgba(18,6,10,0.5) 35%, rgba(18,6,10,0.94) 85%, #12060A 100%)',
                }}
            />

            <div className="mx-auto w-full max-w-2xl px-6 pb-16 pt-28 text-center">
                <AtiLogo className="ati-reveal mx-auto h-20 w-auto" />

                <h1 className="ati-reveal mt-8 font-heading text-[clamp(2.5rem,8vw,4rem)] font-bold leading-[0.95] tracking-[-0.04em] text-ati-cream" style={{ animationDelay: '80ms' }}>
                    Anugerah
                    <br />
                    <span className="text-ati-gold-light">TIMES Indonesia</span>
                </h1>

                {acara?.tanggal_label && (
                    <p className="ati-reveal mt-4 font-heading text-lg text-ati-cream/75" style={{ animationDelay: '140ms' }}>
                        {acara.tanggal_label}
                    </p>
                )}

                <div className="ati-reveal mt-10 border-y border-ati-gold/40 py-7" style={{ animationDelay: '220ms' }}>
                    <p className="text-sm text-ati-cream/65">Kepada Yth.</p>

                    <p className="mt-2 font-heading text-[clamp(1.35rem,4.5vw,1.9rem)] font-semibold leading-tight text-ati-cream">
                        {guestName}
                    </p>

                    {lembaga && <p className="mt-1 text-ati-cream/70">{lembaga}</p>}
                </div>

                {jumlah_orang && (
                    <p className="ati-reveal mt-4 text-sm text-ati-cream/60" style={{ animationDelay: '280ms' }}>
                        Berlaku untuk maksimal {jumlah_orang} orang
                    </p>
                )}

                <button
                    type="button"
                    onClick={onOpenInvitation}
                    className="ati-reveal mt-10 inline-flex items-baseline gap-3 bg-ati-gold px-8 py-3.5 text-base font-semibold text-ati-ink transition-colors hover:bg-ati-gold-light"
                    style={{ animationDelay: '340ms' }}
                >
                    Buka Undangan
                    <span aria-hidden="true">&rarr;</span>
                </button>
            </div>
        </section>
    )
}

export default AwardHeroSection
