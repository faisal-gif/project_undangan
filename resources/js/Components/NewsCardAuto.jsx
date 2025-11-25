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

    function formatDate(dateString) {
        if (!dateString) return "";

        const date = new Date(dateString);

        return date.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }).replace(".", ""); // Hilangkan titik pada bulan
    }

    return (
        <a
            href={'https://timesindonesia.co.id' + url}
            target="_blank"
            rel="noopener noreferrer"
            className="block group h-full"
        >
            <Card
                className="relative h-64 md:h-80 w-full rounded-xl overflow-hidden 
                 shadow-lg hover:shadow-2xl transition-all duration-300"
            >

                {/* === FULL BACKGROUND IMAGE === */}
                {image && (
                    <div className="absolute inset-0">
                        <img
                            src={image}
                            alt={title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                    </div>
                )}

                {/* === OVERLAY GELAP / GRADIENT === */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/80" />

                {/* === CATEGORY BADGE === */}
                {category && (
                    <div className="absolute top-3 left-3 z-20">
                        <span className="bg-[#7a0f1f]/90 text-white px-3 py-1 rounded-full text-xs font-medium">
                            {category}
                        </span>
                    </div>
                )}

                {/* === TEKS DI BAWAH === */}
                <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                    <h3 className="text-white font-bold text-lg leading-tight line-clamp-2 mb-2 group-hover:text-amber-300 transition-colors">
                        {title}
                    </h3>

                    <div className="flex items-center justify-between text-xs text-white/80">
                        <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatDate(datePub)}</span>
                        </div>

                        <div className="flex items-center space-x-1">
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