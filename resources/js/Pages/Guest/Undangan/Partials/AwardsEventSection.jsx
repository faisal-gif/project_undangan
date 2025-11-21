import { Calendar, Clock, MapPin, Users } from "lucide-react";

import Card from "@/Components/Card";


export const AwardsEventSection = () => {
    return (
        <section className="py-16 md:py-24 px-4">
            <div className="container mx-auto max-w-6xl">
                <div className="text-center mb-12">
                    <h2 className="font-serif text-4xl md:text-5xl mb-4">
                        Informasi Acara
                    </h2>
                    <div className="w-24 h-1 bg-gold mx-auto" />
                </div>

                <Card className="p-8 md:p-12 border-2 border-amber-400/30 shadow-2xl bg-gradient-to-br from-slate-100 to-slate-200/30 animate-scale-in">
                    <div className="grid md:grid-cols-2 gap-8 mb-8">
                        <div className="space-y-6">
                            <div className="flex items-start gap-4 animate-slide-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
                                <div className="w-12 h-12 rounded-lg bg-amber-400/10 flex items-center justify-center flex-shrink-0 transition-transform duration-300 hover:scale-110">
                                    <Calendar className="h-6 w-6 text-amber-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Tanggal</p>
                                    <p className="text-xl font-semibold">Kamis, 27 Desember 2025</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 animate-slide-up" style={{ animationDelay: '0.2s', opacity: 0 }}>
                                <div className="w-12 h-12 rounded-lg bg-amber-400/10 flex items-center justify-center flex-shrink-0 transition-transform duration-300 hover:scale-110">
                                    <Clock className="h-6 w-6 text-amber-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Waktu</p>
                                    <p className="text-xl font-semibold">18:00 - 22:30 WIB</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Registrasi: 17:30 WIB
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4 animate-slide-up" style={{ animationDelay: '0.3s', opacity: 0 }}>
                                <div className="w-12 h-12 rounded-lg bg-amber-400/10 flex items-center justify-center flex-shrink-0 transition-transform duration-300 hover:scale-110">
                                    <MapPin className="h-6 w-6 text-amber-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Lokasi</p>
                                    <p className="text-xl font-semibold">Grand Ballroom</p>
                                    <p className="text-base text-muted-foreground mt-1">
                                        Grand Mercure Malang Mirama<br />
                                        Jl. Raden Panji Suroso No.7, Purwodadi, Kec. Blimbing, Kota Malang, Jawa Timur 65126
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 animate-slide-up" style={{ animationDelay: '0.4s', opacity: 0 }}>
                                <div className="w-12 h-12 rounded-lg bg-amber-400/10 flex items-center justify-center flex-shrink-0 transition-transform duration-300 hover:scale-110">
                                    <Users className="h-6 w-6 text-amber-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Dress Code</p>
                                    <p className="text-xl font-semibold">Batik / Formal</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-border animate-fade-in" style={{ animationDelay: '0.5s', opacity: 0 }}>

                        <a
                            href="https://maps.app.goo.gl/3sfP2FmW4SqXBiWw5"
                            target="_blank"
                            className="btn bg-amber-400 w-full"
                            rel="noopener noreferrer"
                        >
                            <MapPin className="mr-2 h-5 w-5" />
                            Lihat Peta Lokasi
                        </a>
                    </div>
                </Card>
            </div>
        </section>
    );
};
