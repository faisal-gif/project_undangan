import React, { useEffect, useState } from 'react'
import AtiLogo from '@/Components/AtiLogo';

function Index() {
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
    return (
        <div className="min-h-screen">
            <a href="https://ati.timesindonesia.co.id/" target="_blank" rel="noopener noreferrer">

            <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-burgundy">
                {/* Animated Background Effects */}
                <div className="absolute inset-0 bg-gradient-radial-burgundy opacity-60" />
                <div className="absolute inset-0 bg-pattern-dots" />

                {/* Floating Orbs */}
                <div className="absolute top-20 right-1/4 w-72 h-72 bg-gradient-radial-gold rounded-full blur-3xl animate-float" />
                <div
                    className="absolute bottom-20 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float"
                    style={{ animationDelay: "1s" }}
                />
                <div
                    className="absolute top-1/2 right-1/3 w-64 h-64 bg-secondary/20 rounded-full blur-3xl animate-float"
                    style={{ animationDelay: "2s" }}
                />

                {/* Content */}
                <div className="relative z-10 text-center px-6 py-8 animate-fade-in max-w-5xl">

                    <AtiLogo className="w-32 h-full mx-auto mb-6" />

                    <h1 className="text-4xl md:text-5xl font-display font-bold mb-8 text-gradient-gold leading-tight">
                        Anugerah
                        <br />
                        TIMES Indonesia
                    </h1>

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

                    {/* Decorative Elements */}
                    {/* <div className="mt-20 flex justify-center gap-8 text-white/60">
                        <div className="text-center">
                            <div className="text-4xl font-display font-bold text-white mb-2">

                                <CountUp
                                    from={0}
                                    to={500}
                                    separator=","
                                    direction="up"
                                    duration={1}
                                    className="count-up-text"
                                />
                                +
                            </div>
                            <div className="text-sm uppercase tracking-wider">Pemenang</div>
                        </div>
                        <div className="w-px bg-amber-400/30" />
                        <div className="text-center">
                            <div className="text-4xl font-display font-bold text-white mb-2">
                                <CountUp
                                    from={0}
                                    to={15}
                                    separator=","
                                    direction="up"
                                    duration={1}
                                    className="count-up-text"
                                />
                            </div>
                            <div className="text-sm uppercase tracking-wider">Tahun</div>
                        </div>
                        <div className="w-px bg-amber-400/30" />
                        <div className="text-center">
                            <div className="text-4xl font-display font-bold text-white mb-2">
                                <CountUp
                                    from={0}
                                    to={20}
                                    separator=","
                                    direction="up"
                                    duration={1}
                                    className="count-up-text"
                                />+
                            </div>
                            <div className="text-sm uppercase tracking-wider">Kategori</div>
                        </div>
                    </div> */}
                </div>

                {/* Bottom Fade */}
                <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent" />
            </section >
            </a>
        </div>
    )
}

export default Index