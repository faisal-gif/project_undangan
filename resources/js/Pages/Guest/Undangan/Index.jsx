import React, { useState } from 'react'
import AwardHeroSection from './Partials/AwardHeroSection';
import AtiLogo from '@/Components/AtiLogo';
import useCountdown from '@/useCountdown';
import { Head, usePage } from '@inertiajs/react';
import { AwardsEventSection } from './Partials/AwardsEventSection';
import { AwardsScheduleSection } from './Partials/AwardsScheduleSection';
import { QRCodeSection } from './Partials/QRCodeSectionProps';

const pad = (value) => String(value).padStart(2, '0');

function Index({ tamu }) {
    const [isInvitationOpen, setIsInvitationOpen] = useState(false);
    const { acara } = usePage().props;
    const timeLeft = useCountdown(acara?.mulai_iso);

    const units = [
        { value: timeLeft.days, label: 'Hari', padded: false },
        { value: timeLeft.hours, label: 'Jam', padded: true },
        { value: timeLeft.minutes, label: 'Menit', padded: true },
        { value: timeLeft.seconds, label: 'Detik', padded: true },
    ];

    if (!isInvitationOpen) {
        return (
            <>
                <Head title={`Undangan Kepada Yth. ${tamu.nama}`} />
                <AwardHeroSection guestName={tamu.nama} jumlah_orang={tamu.jumlah_orang} lembaga={tamu.lembaga} onOpenInvitation={() => setIsInvitationOpen(true)} />
            </>
        );
    }

    return (
        <div className="ati-guest min-h-screen bg-ati-ink font-sans text-ati-cream">
            <Head title={`Undangan Kepada Yth. ${tamu.nama}`} />

            {/* Pembuka */}
            <section className="mx-auto max-w-3xl px-6 pb-20 pt-20 text-center">
                <AtiLogo className="mx-auto h-16 w-auto" />

                <h2 className="mt-8 font-heading text-[clamp(2.25rem,7vw,3.5rem)] font-bold leading-[0.95] tracking-[-0.04em] text-ati-cream">
                    Anugerah
                    <br />
                    <span className="text-ati-gold-light">TIMES Indonesia</span>
                </h2>

                <p className="mt-5 font-heading text-xl text-ati-cream/80">
                    {acara?.tanggal_label}
                </p>

                {/* Hitung mundur */}
                <p className="mt-14 text-sm text-ati-cream/55">Menghitung Hari</p>

                <div className="mt-4 grid grid-cols-4 border-y border-ati-cream/15">
                    {units.map((unit, index) => (
                        <div
                            key={unit.label}
                            className={`px-1 py-5 ${index > 0 ? 'border-l border-ati-cream/15' : ''}`}
                        >
                            <div className="font-heading text-[clamp(1.75rem,7vw,2.75rem)] font-bold leading-none tabular-nums text-ati-gold-light">
                                {unit.padded ? pad(unit.value) : unit.value}
                            </div>
                            <div className="mt-2 text-[11px] uppercase tracking-[0.18em] text-ati-cream/55">
                                {unit.label}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Kutipan */}
                <blockquote className="mt-16">
                    <p className="font-heading text-[clamp(1.25rem,3.6vw,1.75rem)] italic leading-[1.45] text-ati-cream/85">
                        &ldquo;Excellence is not a destination; it is a continuous journey that never
                        ends.&rdquo;
                    </p>
                    <footer className="mt-4 text-sm text-ati-gold">&mdash; Brian Tracy</footer>
                </blockquote>
            </section>

            <AwardsEventSection />
            <AwardsScheduleSection />

            <QRCodeSection guestCode={tamu.code} guestName={tamu.nama} />

            <footer className="border-t border-ati-cream/15 px-6 py-14 text-center">
                <AtiLogo className="mx-auto h-12 w-auto" />

                <p className="mt-6 font-heading text-2xl font-semibold tracking-[-0.02em] text-ati-cream">
                    {acara?.nama} {acara?.tahun}
                </p>

                <p className="mt-2 text-ati-cream/65">
                    Terima kasih atas kehadiran Anda dalam malam penghargaan ini
                </p>

                <p className="mt-6 text-xs text-ati-cream/40">
                    © {acara?.tahun} All Rights Reserved
                </p>
            </footer>
        </div>
    )
}

export default Index
