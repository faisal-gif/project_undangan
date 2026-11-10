import React, { useEffect, useRef, useState } from 'react'
import AwardHeroSection from './Partials/AwardHeroSection';
import AtiLogo from '@/Components/AtiLogo';
import PialaTiga from '@/Components/PialaTiga';
import useCountdown from '@/useCountdown';
import { Head, usePage } from '@inertiajs/react';
import { AwardsEventSection } from './Partials/AwardsEventSection';
import { AwardsScheduleSection } from './Partials/AwardsScheduleSection';
import { PanduanPenerimaSection } from './Partials/PanduanPenerimaSection';
import { QRCodeSection } from './Partials/QRCodeSectionProps';
import { MusikLatar } from './Partials/MusikLatar';
import { Ornamen } from './Partials/Ornamen';
import { RsvpSection } from './Partials/RsvpSection';

const pad = (value) => String(value).padStart(2, '0');

function Index({ tamu }) {
    // Isi dipasang lebih dulu DI BAWAH sampul, baru sampulnya menjauh. Kalau
    // urutannya dibalik, ada satu kedipan layar kosong di sela keduanya:
    // semua bagian isi memang mulai dari keadaan tak terlihat.
    const [dibuka, setDibuka] = useState(false);
    const [sampulAda, setSampulAda] = useState(true);
    const [menutupSampul, setMenutupSampul] = useState(false);
    const isi = useRef(null);
    const { acara } = usePage().props;
    const timeLeft = useCountdown(acara?.mulai_iso);

    // Undangan punya dua versi: tamu yang hadir, dan penerima penghargaan.
    const penerima = tamu.jenis === 'penerima';
    const kategori = tamu.kategori_penghargaan;
    const subKategori = tamu.sub_kategori;

    const bukaUndangan = () => {
        if (menutupSampul) return;

        setDibuka(true);
        setMenutupSampul(true);
        window.scrollTo(0, 0);

        // Sedikit lebih lama dari tirai yang 1,1 detik, supaya sampul tidak
        // dicabut saat kedua daunnya masih kelihatan.
        setTimeout(() => setSampulAda(false), 1250);
    };

    // Tiap bagian muncul saat masuk layar. Kalau pengamatnya tidak tersedia,
    // semuanya langsung ditampilkan - jangan sampai ada yang tak terbaca.
    useEffect(() => {
        if (!dibuka) return;

        const sasaran = isi.current?.querySelectorAll('[data-tampil]') ?? [];

        if (typeof IntersectionObserver === 'undefined') {
            sasaran.forEach((el) => el.classList.add('tampil'));
            return;
        }

        // Yang sudah berada di layar ditampilkan saat itu juga. Tanpa ini,
        // isi bergantung pada pengamat yang bisa tertunda - dan layar
        // pertama sempat kosong sebelum dia sempat berjalan.
        const sisa = [];
        sasaran.forEach((el) => {
            if (el.getBoundingClientRect().top < window.innerHeight * 1.1) {
                el.classList.add('tampil');
            } else {
                sisa.push(el);
            }
        });

        const pengamat = new IntersectionObserver(
            (entri) => entri.forEach((e) => {
                if (e.isIntersecting) {
                    e.target.classList.add('tampil');
                    pengamat.unobserve(e.target);
                }
            }),
            { rootMargin: '0px 0px -12% 0px' }
        );

        sisa.forEach((el) => pengamat.observe(el));
        return () => pengamat.disconnect();
    }, [dibuka]);

    const units = [
        { value: timeLeft.days, label: 'Hari', padded: false },
        { value: timeLeft.hours, label: 'Jam', padded: true },
        { value: timeLeft.minutes, label: 'Menit', padded: true },
        { value: timeLeft.seconds, label: 'Detik', padded: true },
    ];

    return (
        <div ref={isi} className="ati-guest min-h-screen bg-ati-ink font-sans text-ati-cream">
            <Head title={`Undangan Kepada Yth. ${tamu.nama}`} />

            <MusikLatar src={acara?.musik_url} mainkan={menutupSampul} />

            {/* Sampul tetap ada sampai kedua daun tirai selesai menepi.
                overflow-y-auto: di layar pendek isi sampul lebih tinggi dari
                layar, tanpa itu tombolnya terpotong dan tak bisa dijangkau. */}
            {sampulAda && (
                <div className={`fixed inset-0 z-40 overflow-y-auto ${menutupSampul ? 'overflow-hidden pointer-events-none' : ''}`}>
                    <AwardHeroSection
                        guestName={tamu.nama}
                        jumlah_orang={tamu.jumlah_orang}
                        lembaga={tamu.lembaga}
                        penerima={penerima}
                        kategori={kategori}
                        subKategori={subKategori}
                        menutup={menutupSampul}
                        onOpenInvitation={bukaUndangan}
                    />
                </div>
            )}

            {/* Isi dipasang dari awal, hanya disembunyikan - tanpa transisi,
                karena yang menyingkap isi adalah tirai di atasnya, bukan pudar. */}
            <div className={`ati-isi ${dibuka ? '' : 'opacity-0 pointer-events-none'}`}>
                {/* Pembuka */}
                <section className="relative overflow-hidden px-6 pb-20 pt-20">
                    {/* Sepasang piala mengapit judul, jatuh bergantian.
                        Disembunyikan di bawah lg: di layar sempit tidak ada
                        ruang di samping judul, dan memaksakannya hanya
                        menindih teks. */}
                    {dibuka && (
                        <>
                            <PialaTiga
                                sumber="/piala1baru.glb"
                                className="pointer-events-none absolute left-0 top-16 hidden w-[20%] max-w-[230px] lg:block"
                                tinggi="330px"
                                interaktif={false}
                            />
                            <PialaTiga
                                sumber="/piala2baru.glb"
                                alt="Piala Anugerah TIMES Indonesia, penghargaan kedua"
                                className="pointer-events-none absolute right-0 top-16 hidden w-[20%] max-w-[230px] lg:block"
                                tinggi="330px"
                                tunda={0.25}
                                interaktif={false}
                            />
                        </>
                    )}

                    <div className="mx-auto max-w-3xl text-center">
                        <AtiLogo data-tampil className="mx-auto h-16 w-auto" />
                        <h2 data-tampil className="mt-8 font-heading text-[clamp(2.25rem,7vw,3.5rem)] font-bold leading-[0.95] tracking-[-0.04em] text-ati-cream">
                            Anugerah
                            <br />
                            <span className="text-ati-gold-light">TIMES Indonesia</span>
                        </h2>
                        <Ornamen data-tampil className="mt-7" />

                        <p data-tampil className="mt-7 font-heading text-xl text-ati-cream/80">
                            {acara?.tanggal_label}
                        </p>

                        {penerima && (
                            <div data-tampil className="mx-auto mt-8 max-w-[52ch] border-t border-ati-cream/20 pt-8">
                                <p className="text-lg leading-[1.6] text-ati-cream/85">
                                    Dengan bangga kami mengabarkan bahwa Bapak/Ibu terpilih sebagai penerima{' '}
                                    Anugerah TIMES Indonesia 2026
                                    . Kehadiran Bapak/Ibu kami nantikan pada malam penganugerahan.
                                </p>

                                {/* Nama penghargaannya sendiri, diberi ruang terpisah
                                dan bingkai emas tipis: inilah yang sebenarnya
                                diterima, bukan sekadar kategorinya. */}
                                {subKategori && (
                                    <p className="mt-6 border-y border-ati-gold/35 px-5 py-4 font-heading text-[clamp(1.05rem,2.4vw,1.35rem)] italic leading-snug text-ati-gold-light">
                                        {subKategori}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Hitung mundur */}
                        <p data-tampil className="mt-14 text-sm text-ati-cream/55">Menghitung Hari</p>
                        <div data-tampil className="mt-4 grid grid-cols-4 border-y border-ati-cream/15">
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
                        <blockquote data-tampil className="mt-16">
                            <p className="font-heading text-[clamp(1.25rem,3.6vw,1.75rem)] italic leading-[1.45] text-ati-cream/85">
                                &ldquo;Excellence is not a destination; it is a continuous journey that never
                                ends.&rdquo;
                            </p>
                            <footer className="mt-4 text-sm text-ati-gold">&mdash; Brian Tracy</footer>
                        </blockquote>
                    </div>
                </section>

                <AwardsEventSection kode={tamu.code} />
                {penerima && <PanduanPenerimaSection kategori={kategori} />}
                <AwardsScheduleSection />
                <RsvpSection kode={tamu.code} rsvp={tamu.rsvp} />
                <QRCodeSection guestCode={tamu.code} guestName={tamu.nama} />

                <footer className="ati-rule px-6 py-14 text-center">
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
        </div>
    )
}

export default Index
