import AtiLogo from '@/Components/AtiLogo'
import { Award } from 'lucide-react'
import React from 'react'

function AwardHeroSection({ guestName, onOpenInvitation }) {
    return (
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(/awards-hero.jpg)` }}
            >
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/80" />
            </div>

            <div className="relative z-10 text-center px-4 max-w-4xl">
                <div className="mb-6 flex justify-center animate-scale-in">
                  <AtiLogo className="w-32 h-full mx-auto mb-6 animate-pulse" />
                </div>

                <p className="text-gold text-sm md:text-base mb-4 tracking-[0.3em] uppercase font-medium animate-fade-in" style={{ animationDelay: '0.2s', opacity: 0 }}>
                    Proudly Presents
                </p>

                <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl mb-6 text-white leading-tight animate-slide-up" style={{ animationDelay: '0.4s', opacity: 0 }}>
                    <span className="block mb-4">Anugrah</span>
                    <span className="block text-gold">TIMES Indonesia</span>

                </h1>

                <div className="border-t border-b border-gold/50 py-6 mb-8 max-w-md mx-auto animate-fade-in" >
                    <p className="text-white/80 text-sm md:text-base tracking-wide">
                        Kepada Yth.
                    </p>
                    <p className="text-white font-medium text-lg md:text-xl mt-2 animate-fade-in">
                        {guestName}
                    </p>
                </div>

                <div>
                    <button
                        onClick={onOpenInvitation}
                        className="btn"
                    >
                        <Award className="mr-2 h-5 w-5" />
                        Buka Undangan
                    </button>
                </div>
            </div>
        </section>
    )
}

export default AwardHeroSection