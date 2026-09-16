import CountUp from "@/Components/CountUp";
import useCountdown from "@/useCountdown";
import { Link, usePage } from "@inertiajs/react";

const pad = (value) => String(value).padStart(2, "0");

const stats = [
  { to: 500, suffix: "+", label: "Pemenang" },
  { to: 7, suffix: "", label: "Tahun" },
  { to: 20, suffix: "+", label: "Kategori" },
];

const GuestHero = () => {
  const { acara } = usePage().props;
  const timeLeft = useCountdown(acara?.mulai_iso);

  const units = [
    { value: timeLeft.days, label: "Hari", padded: false },
    { value: timeLeft.hours, label: "Jam", padded: true },
    { value: timeLeft.minutes, label: "Menit", padded: true },
    { value: timeLeft.seconds, label: "Detik", padded: true },
  ];

  return (
    <header>
      {/* The stage itself, not a simulation of one */}
      <div className="relative isolate flex min-h-[92svh] items-end overflow-hidden">
        <img
          src="/bg-ati.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10"
          style={{
            background:
              "linear-gradient(180deg, rgba(18,6,10,0.88) 0%, rgba(18,6,10,0.55) 38%, rgba(18,6,10,0.92) 82%, #12060A 100%)",
          }}
        />

        <div className="mx-auto w-full max-w-6xl px-6 pb-16 pt-32">
          <h1 className="ati-reveal max-w-[16ch] font-heading text-[clamp(3rem,7.4vw,5.75rem)] font-bold leading-[0.88] tracking-[-0.045em] text-ati-cream">
            Anugerah{" "}
            <span className="text-ati-gold-light">TIMES Indonesia</span>
          </h1>

          <div className="ati-reveal mt-10 grid gap-8 border-t border-ati-cream/20 pt-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:gap-12" style={{ animationDelay: "120ms" }}>
            <p className="max-w-[58ch] text-lg leading-[1.6] text-ati-cream/85 md:text-xl">
              Merayakan pencapaian luar biasa dan{" "}
              <em className="font-heading not-italic font-semibold text-ati-gold-light">
                memberikan penghargaan
              </em>{" "}
              kepada{" "}
              <em className="font-heading not-italic font-semibold text-ati-gold-light">
                insan inspiratif
              </em>{" "}
              yang membawa dampak positif bagi banyak orang.
            </p>

            <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
              <Link
                href="/winners"
                className="group inline-flex items-baseline gap-3 bg-ati-gold px-6 py-3 text-base font-semibold text-ati-ink transition-colors hover:bg-ati-gold-light"
              >
                Peraih
                <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
                  &rarr;
                </span>
              </Link>

              <button
                type="button"
                className="text-base font-semibold text-ati-cream underline decoration-ati-gold decoration-1 underline-offset-[6px] transition-colors hover:text-ati-gold-light"
              >
                Lainnya
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* The ledger: what the award has counted, and what is left to count */}
      <div className="mx-auto max-w-6xl px-6">
        <dl className="flex flex-wrap items-baseline gap-x-10 gap-y-4 border-b border-ati-cream/15 pb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-baseline gap-2">
              <dt className="sr-only">{stat.label}</dt>
              <dd className="flex items-baseline gap-2">
                <span className="font-heading text-[2.75rem] font-bold leading-none tabular-nums text-ati-cream">
                  <CountUp from={0} to={stat.to} separator="." duration={1} />
                  {stat.suffix}
                </span>
                <span className="font-heading text-base text-ati-cream/60">
                  {stat.label}
                </span>
              </dd>
            </div>
          ))}

          <span className="ml-auto font-heading text-base italic text-ati-gold-light">
            Sejak 2015
          </span>
        </dl>

        {acara && (
          <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1 pt-8 font-heading text-lg text-ati-cream/80">
            <span className="text-ati-gold-light">{acara.tanggal_label}</span>
            <span>{acara.jam_label}</span>
            {acara.tempat && <span>{acara.tempat}</span>}
          </p>
        )}

        <div className="grid grid-cols-2 gap-y-8 py-10 sm:grid-cols-4">
          {units.map((unit) => (
            <div key={unit.label} className="border-l border-ati-gold/35 pl-4 first:border-l-0 first:pl-0 sm:border-l sm:pl-6 sm:first:border-l-0 sm:first:pl-0">
              <div className="font-heading text-[clamp(2.75rem,6vw,4rem)] font-bold leading-none tabular-nums text-ati-cream">
                {unit.padded ? pad(unit.value) : unit.value}
              </div>
              <div className="mt-2 font-heading text-sm text-ati-cream/55">
                {unit.label}
              </div>
            </div>
          ))}
        </div>

        <div className="border border-ati-cream/15 bg-black">
          <iframe
            src="https://www.youtube.com/embed/dv9VYYepFLo?si=8fc7OHaK_XofVmIJ&autoplay=1&mute=1"
            title="Anugerah TIMES Indonesia"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share;"
            className="aspect-video w-full"
          />
        </div>
      </div>
    </header>
  );
};

export default GuestHero;
