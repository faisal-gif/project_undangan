import NewsIndex from '@/Components/NewsIndex'
import { Link } from '@inertiajs/react'
import React from 'react'

function GuestListNews({ news = [] }) {
    return (
        <section className="mx-auto max-w-6xl px-6 pb-28">
            <div className="flex flex-wrap items-baseline justify-between gap-4 border-b-2 border-ati-gold pb-4">
                <h2 className="font-heading text-[clamp(1.9rem,3.4vw,2.75rem)] font-bold tracking-[-0.035em] text-ati-cream">
                    Berita Seputar ATI
                </h2>

                <Link
                    href="/news"
                    className="font-heading text-base text-ati-gold-light underline decoration-ati-gold/50 decoration-1 underline-offset-[6px] transition-colors hover:text-ati-cream"
                >
                    Lihat semua berita
                </Link>
            </div>

            <NewsIndex items={news} />
        </section>
    )
}

export default GuestListNews
