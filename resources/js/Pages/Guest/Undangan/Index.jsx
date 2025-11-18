import React, { useEffect, useState } from 'react'
import AwardHeroSection from './Partials/AwardHeroSection';
import { Award, Sparkles } from 'lucide-react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import AtiLogo from '@/Components/AtiLogo';
import { Head } from '@inertiajs/react';
import { AwardsCategorySection } from './Partials/AwardsCategorySection';
import { AwardsEventSection } from './Partials/AwardsEventSection';
import { AwardsScheduleSection } from './Partials/AwardsScheduleSection';
import { QRCodeSection } from './Partials/QRCodeSectionProps';

function Index({ tamu }) {
    const [isInvitationOpen, setIsInvitationOpen] = useState(false);
 

    const calculateTimeLeft = () => {
        const targetDate = new Date("2025-11-27T18:00:00");
        const now = new Date();
        const difference = targetDate - now;

        let timeLeft = {};
        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / (1000 * 60)) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        } else {
            timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }
        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, []);


    if (!isInvitationOpen) {
        return (
            <>
                <Head title='Undanga ATI' />
                <AwardHeroSection guestName={tamu.nama} onOpenInvitation={() => setIsInvitationOpen(true)} />
            </>
        );
    }
    return (
        <div className="min-h-screen">
            <Head title='Undanga ATI' />
            {/* Opening Section */}
            <section className="py-16 md:py-24 px-4 text-center bg-gradient-burgundy text-white">
                {/* Animated Background Effects */}
                <div className="absolute inset-0 bg-gradient-radial-burgundy opacity-60" />
                <div className="absolute inset-0 bg-pattern-dots" />

                <div className="container mx-auto max-w-4xl">
                    <div className="flex justify-center mb-6 animate-scale-in">
                        <AtiLogo className="w-32 h-full mx-auto mb-6 animate-pulse" />
                    </div>



                    <h2 className="font-serif text-5xl md:text-6xl lg:text-7xl mb-6 leading-tight animate-slide-up" style={{ animationDelay: '0.4s', opacity: 0 }}>
                        <span className="block mb-3">Anugerah</span>
                        <span className="block text-amber-400">TIMES INDONESIA</span>
                    </h2>

                    <p className="text-xl md:text-2xl text-white/80 mb-8 animate-fade-in" style={{ animationDelay: '0.6s', opacity: 0 }}>
                        Sabtu, 27 November 2025
                    </p>

                    <div className="mb-12 animate-fade-in" style={{ animationDelay: '0.8s', opacity: 0 }}>
                        <p className="text-sm md:text-base text-white/70 mb-6 uppercase tracking-wider">
                            Menghitung Hari
                        </p>
                        {/* Hitung Mundur */}
                        <div className="my-8 flex justify-center text-white">
                            <div className="grid grid-flow-col gap-5 text-center auto-cols-max">
                                <div className="flex flex-col">
                                    <span className="countdown font-mono text-5xl">
                                        <span style={{ "--value": timeLeft.days }}></span>
                                    </span>
                                    Hari
                                </div>
                                <div className="flex flex-col">
                                    <span className="countdown font-mono text-5xl">
                                        <span style={{ "--value": timeLeft.hours }}></span>
                                    </span>
                                    Jam
                                </div>
                                <div className="flex flex-col">
                                    <span className="countdown font-mono text-5xl">
                                        <span style={{ "--value": timeLeft.minutes }}></span>
                                    </span>
                                    Menit
                                </div>
                                <div className="flex flex-col">
                                    <span className="countdown font-mono text-5xl">
                                        <span style={{ "--value": timeLeft.seconds }}></span>
                                    </span>
                                    Detik
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="max-w-2xl mx-auto bg-white/5 backdrop-blur-sm border border-gold/20 rounded-lg p-8 animate-scale-in hover:scale-105 transition-transform duration-300" >
                        <Award className="h-12 w-12 text-gold mx-auto mb-4 animate-pulse" />
                        <p className="text-white/90 italic leading-relaxed">
                            "Excellence is not a destination; it is a continuous journey that never ends."
                        </p>
                        <p className="text-sm text-gold mt-3 font-medium">
                            - Brian Tracy
                        </p>
                    </div>
                </div>
            </section>

            <AwardsEventSection />
            <AwardsScheduleSection />

            {/* Why We Celebrate Section */}

            <QRCodeSection guestId={tamu.code} guestName={tamu.nama} qr_code={tamu.qr_code} />


            {/* Footer */}
            <footer className="py-12 px-4 text-center bg-[#4c0c0c] text-white">
                <div className="container mx-auto">
                    <AtiLogo className="w-12 h-full mx-auto mb-6 animate-pulse" />
                    <p className="font-serif text-2xl mb-2">Anugerah TIMES INDONESIA 2025</p>
                    <p className="text-sm text-white/70">
                        Terima kasih atas kehadiran Anda dalam malam penghargaan ini
                    </p>
                    <p className="text-xs text-white/50 mt-4">
                        © 2025 All Rights Reserved
                    </p>
                </div>
            </footer>
        </div>
    )
}

export default Index