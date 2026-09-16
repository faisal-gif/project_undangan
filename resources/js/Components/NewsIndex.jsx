import React from 'react'

// Feed summaries arrive with markup and entities in them
export function plainText(value) {
    if (!value) return ''

    return String(value)
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&quot;/g, '"')
        .replace(/&#0?39;|&apos;/g, "'")
        .replace(/&amp;/g, '&')
        .trim()
}

function formatDate(dateString) {
    if (!dateString) return ''

    return new Date(dateString)
        .toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
        .replace('.', '')
}

function formatViews(value) {
    const num = Number(value)
    if (!num) return null

    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'jt'
    if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'rb'
    return String(num)
}

/**
 * Berita sebagai indeks bergaris: satu berita utama, sisanya baris ringkas.
 */
export default function NewsIndex({ items = [], lead = true }) {
    const list = Array.isArray(items) ? items : []

    if (list.length === 0) {
        return (
            <p className="border-b border-ati-cream/15 py-12 text-center text-ati-cream/55">
                Berita belum tersedia saat ini.
            </p>
        )
    }

    return (
        <ul>
            {list.map((item, index) => {
                const views = formatViews(item.pageviews)
                const isLead = lead && index === 0
                const summary = plainText(item.news_description)

                return (
                    <li key={item.news_id}>
                        <a
                            href={'https://timesindonesia.co.id' + item.url_ci4}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`group grid items-start gap-5 border-b border-ati-cream/15 py-6 ${isLead
                                ? 'sm:grid-cols-[minmax(0,22rem)_1fr] sm:gap-8'
                                : 'grid-cols-[5.5rem_1fr] sm:grid-cols-[8rem_1fr]'
                                }`}
                        >
                            {item.news_image_new && (
                                <div className="overflow-hidden bg-ati-wine">
                                    <img
                                        src={item.news_image_new}
                                        alt=""
                                        loading={isLead ? 'eager' : 'lazy'}
                                        className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                                    />
                                </div>
                            )}

                            <div>
                                <div className="flex flex-wrap items-baseline gap-x-3 text-sm text-ati-cream/50">
                                    {item.cat_title && (
                                        <span className="font-heading text-ati-gold">{item.cat_title}</span>
                                    )}
                                    <time dateTime={item.news_datepub}>{formatDate(item.news_datepub)}</time>
                                    {views && <span className="tabular-nums">{views} dibaca</span>}
                                </div>

                                <h3 className={`mt-2 font-heading font-semibold leading-[1.15] tracking-[-0.02em] text-ati-cream transition-colors group-hover:text-ati-gold-light ${isLead
                                    ? 'text-[clamp(1.5rem,3vw,2.25rem)]'
                                    : 'text-lg sm:text-2xl'
                                    }`}>
                                    {item.news_title}
                                </h3>

                                {isLead && summary && (
                                    <p className="mt-3 max-w-[62ch] leading-[1.6] text-ati-cream/65 line-clamp-3">
                                        {summary}
                                    </p>
                                )}
                            </div>
                        </a>
                    </li>
                )
            })}
        </ul>
    )
}
