import React from 'react'
import Card from './Card';
import { Link } from '@inertiajs/react';
import { Clock, Eye } from 'lucide-react';

function NewsCardAuto({
    title,
    description,
    datePub,
    views,
    image,
    url,
    category,
}) {

    function formatViews(num) {
        if (num == null) return "0";

        return num >= 1_000_000
            ? (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M"
            : num >= 1_000
                ? (num / 1_000).toFixed(1).replace(/\.0$/, "") + "k"
                : num.toString();
    }

    return (
        <a href={'https://timesindonesia.co.id' + url} target="_blank" rel="noopener noreferrer" className="block group h-full">
            <Card className="bg-white h-full transition-all duration-300 border-0 shadow-none overflow-hidden md:shadow-lg md:hover:shadow-2xl md:hover:-translate-y-1 flex flex-row md:flex-col">

                {/* === BAGIAN GAMBAR === */}
                {image && (
                    <div className="relative overflow-hidden flex-shrink-0 w-2/5 rounded-md md:w-full md:h-64 md:rounded-t-lg md:rounded-b-none">
                        <img
                            src={image}
                            alt={title}
                            className="object-cover h-full w-full group-hover:scale-105 transition-transform duration-300"
                        />
                        {category && (
                            <div className="absolute top-4 left-4 hidden md:block">
                                <span className="bg-[#7a0f1f] text-white px-3 py-1 rounded-full text-xs font-medium">
                                    {category}
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {/* === BAGIAN TEKS === */}
                <div className="flex flex-col justify-between flex-grow p-3 md:p-6 ">
                    {/* Judul & Deskripsi */}
                    <div>
                        <h3 className="font-semibold text-foreground text-sm leading-tight line-clamp-3 hover:text-red-600 md:font-bold md:text-base md:line-clamp-2 md:group-hover:text-[#7a0f1f] transition-colors mb-2 md:mb-3">
                            {title}
                        </h3>
                        <p className="text-black/50 text-xs leading-relaxed mb-3 line-clamp-2 md:text-muted-foreground md:line-clamp-3 hidden md:block ">
                            {description}
                        </p>
                    </div>

                    {/* Meta Info (Tanggal & Views) */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        {/* Tanggal (selalu ada) */}
                        <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>

                            </span>
                        </div>

                        {/* Views (HANYA tampil di desktop) */}
                        <div className="hidden md:flex items-center space-x-1">
                            <Eye className="h-3 w-3" />
                            <span>{formatViews(views)}</span>
                        </div>
                    </div>
                </div>
            </Card>
        </a>
    )
}

export default NewsCardAuto