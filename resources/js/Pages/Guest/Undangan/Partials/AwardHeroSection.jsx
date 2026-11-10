import AtiLogo from '@/Components/AtiLogo'
import { usePage } from '@inertiajs/react'
import { motion, useReducedMotion } from 'motion/react'
import React from 'react'
import { Ornamen } from './Ornamen'

const LAPISAN_GELAP =
    'linear-gradient(180deg, rgba(18,6,10,0.86) 0%, rgba(18,6,10,0.42) 32%, rgba(18,6,10,0.94) 84%, #12060A 100%)'

/**
 * Satu daun tirai: separuh lebar layar yang di dalamnya memuat gambar sampul
 * berukuran penuh, lalu dipotong oleh overflow-hidden.
 *
 * Lapisan dalamnya sengaja selebar 200% daun (= selebar layar) dan ditempel ke
 * tepi luar, supaya kedua daun memperlihatkan potongan gambar yang sama persis
 * seperti satu gambar utuh. Saat dibuka, gambarnya benar-benar terbelah di
 * tengah - bukan dua gambar berbeda yang kebetulan bersebelahan.
 */
const Tirai = ({ kanan, menutup, diam }) => (
    <motion.div
        aria-hidden="true"
        initial={false}
        animate={{ x: menutup ? (kanan ? '100%' : '-100%') : '0%' }}
        transition={{ duration: diam ? 0 : 1.1, ease: [0.76, 0, 0.24, 1] }}
        className={`absolute inset-y-0 w-1/2 overflow-hidden ${
            kanan
                ? 'right-0 shadow-[inset_1px_0_0_rgba(214,162,73,0.45)]'
                : 'left-0 shadow-[inset_-1px_0_0_rgba(214,162,73,0.45)]'
        }`}
    >
        <div className={`absolute inset-y-0 w-[200%] ${kanan ? 'right-0' : 'left-0'}`}>
            <img
                src="/bg-ati.jpg"
                alt=""
                className="ati-bernapas h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0" style={{ background: LAPISAN_GELAP }} />
        </div>
    </motion.div>
)

function AwardHeroSection({ guestName, lembaga, jumlah_orang, penerima, kategori, subKategori, menutup, onOpenInvitation }) {
    const { acara } = usePage().props
    const diam = useReducedMotion()

    return (
        <section className="ati-guest relative isolate flex min-h-[100svh] items-end overflow-hidden bg-ati-ink font-sans text-ati-cream">
            {/* Cahaya panggung yang bocor dari celah tirai saat mulai terbuka. */}
            {menutup && !diam && (
                <motion.div
                    aria-hidden="true"
                    initial={{ opacity: 0.75 }}
                    animate={{ opacity: 0 }}
                    transition={{ duration: 1.1, ease: 'easeOut' }}
                    className="absolute inset-0"
                    style={{
                        background:
                            'radial-gradient(ellipse 22% 70% at 50% 50%, rgba(214,162,73,0.55) 0%, rgba(214,162,73,0.12) 45%, transparent 75%)',
                    }}
                />
            )}

            <Tirai menutup={menutup} diam={diam} />
            <Tirai kanan menutup={menutup} diam={diam} />

            <motion.div
                initial={false}
                animate={{ opacity: menutup ? 0 : 1, y: menutup ? -28 : 0 }}
                transition={{ duration: diam ? 0 : 0.45, ease: [0.4, 0, 1, 1] }}
                className="relative z-10 mx-auto w-full max-w-2xl px-6 pb-16 pt-28 text-center"
            >
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

                    {/* Nama penghargaan yang spesifik, di bawah kategorinya:
                        lebih kecil dan lebih tenang, supaya nama tamu tetap
                        yang terbesar di bingkai ini. */}
                    {penerima && subKategori && (
                        <p className="mx-auto mt-2 max-w-[38ch] text-sm leading-[1.5] text-ati-cream/70">
                            {subKategori}
                        </p>
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
            </motion.div>
        </section>
    )
}

export default AwardHeroSection
