const schedule = [
  { time: "18:00", title: "Registrasi & Welcome Drink", description: "Check-in tamu undangan" },
  { time: "19:00", title: "Opening Ceremony & Penampilan Musik Pembuka", description: "Sambutan dari Master of Ceremony" },
  { time: "19:15", title: "Sambutan Utama", description: "Pidato pembukaan dari CEO" },
  { time: "19:30", title: "Interlude & Hiburan Spesial", description: "Hiburan spesial untuk para tamu" },
  { time: "20.00", title: "Pemberian Anugerah TIMES Indonesia (ATI)", description: "Pengumuman dan penyerahan awards" },
  { time: "21:00", title: "Penutup & Networking", description: "Sesi foto dan networking" },
];

export const AwardsScheduleSection = () => {
  return (
    <section className="border-t border-ati-cream/15 px-6 py-20 lg:py-24">
      <div className="mx-auto max-w-4xl">
        <h2 className="font-heading text-[clamp(1.9rem,4vw,2.75rem)] font-bold tracking-[-0.035em] text-ati-cream">
          Rundown Acara
        </h2>
        <p className="mt-3 text-ati-cream/65">Jadwal acara pemberian penghargaan</p>

        <ol className="mt-8">
          {schedule.map((item) => (
            <li
              key={item.time + item.title}
              className="grid grid-cols-[4.5rem_1fr] items-baseline gap-x-5 border-t border-ati-cream/15 py-6 last:border-b sm:grid-cols-[6rem_1fr] sm:gap-x-8"
            >
              <span className="font-heading text-lg font-semibold tabular-nums text-ati-gold sm:text-xl">
                {item.time}
              </span>

              <span>
                <span className="block font-heading text-lg font-semibold leading-snug text-ati-cream sm:text-xl">
                  {item.title}
                </span>
                <span className="mt-1 block text-sm leading-[1.6] text-ati-cream/60">
                  {item.description}
                </span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};
