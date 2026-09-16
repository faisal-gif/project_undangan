import NewsIndex from '@/Components/NewsIndex'
import { Link, usePage } from '@inertiajs/react';
import React from 'react'

function ListNews({ news }) {
    const { page, limit } = usePage().props;

    const items = Array.isArray(news) ? news : []
    const hasNext = items.length === limit;
    const hasPrev = page > 1;

    const linkClass =
        "font-heading text-lg text-ati-gold-light underline decoration-ati-gold/50 decoration-1 underline-offset-[6px] transition-colors hover:text-ati-cream"

    return (
        <section className="mx-auto max-w-6xl px-6 pb-28">
            <NewsIndex items={items} lead={page <= 1} />

            <nav className="mt-10 flex items-baseline justify-between gap-4">
                {hasPrev ? (
                    <Link href={`?page=${Number(page) - 1}`} className={linkClass} rel="prev">
                        &larr; <span className="hidden sm:inline">Sebelumnya</span>
                    </Link>
                ) : (
                    <span className="font-heading text-lg text-ati-cream/30">
                        &larr; <span className="hidden sm:inline">Sebelumnya</span>
                    </span>
                )}

                <span className="font-heading text-base tabular-nums text-ati-cream/55">
                    Halaman {page}
                </span>

                {hasNext ? (
                    <Link href={`?page=${Number(page) + 1}`} className={linkClass} rel="next">
                        <span className="hidden sm:inline">Berikutnya</span> &rarr;
                    </Link>
                ) : (
                    <span className="font-heading text-lg text-ati-cream/30">
                        <span className="hidden sm:inline">Berikutnya</span> &rarr;
                    </span>
                )}
            </nav>
        </section>
    )
}

export default ListNews
