import { useState } from "react";

import GuestNavigation from "../Welcome/Partials/GuestNavigation";
import { Head } from "@inertiajs/react";

const Winners = ({ winnersByYear }) => {
  // Mengambil tahun pertama sebagai default (tahun terbesar/terbaru)
  const sortedData = [...winnersByYear].sort((a, b) => b.year - a.year);
  const [selectedYear, setSelectedYear] = useState(sortedData[0]?.year || 2020);

  // Mendapatkan winners untuk tahun yang dipilih
  const currentYearData = sortedData.find(item => item.year === selectedYear);
  const currentWinners = currentYearData?.winners || [];

  return (
    <>
      <Head title="Para Peraih Anugerah" />

      <div className="ati-guest min-h-screen bg-ati-ink font-sans text-ati-cream">
        <GuestNavigation />

        <header className="mx-auto max-w-6xl px-6 pb-10 pt-32">
          <h1 className="font-heading text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[0.9] tracking-[-0.045em] text-ati-cream">
            Para Peraih{" "}
            <span className="text-ati-gold-light">Anugerah</span>
          </h1>

          <p className="mt-6 max-w-[58ch] border-t border-ati-cream/20 pt-6 text-lg leading-[1.6] text-ati-cream/80">
            Kami memberi penghormatan kepada para individu istimewa yang telah
            menorehkan kontribusi luar biasa.
          </p>
        </header>

        <main className="mx-auto max-w-6xl px-6 pb-28">
          {/* Tahun penganugerahan */}
          <div className="flex gap-8 overflow-x-auto border-b border-ati-cream/15">
            {sortedData.map((item) => {
              const active = selectedYear === item.year;
              return (
                <button
                  key={item.year}
                  type="button"
                  onClick={() => setSelectedYear(item.year)}
                  aria-pressed={active}
                  className={`-mb-px shrink-0 border-b-2 pb-3 font-heading text-xl tabular-nums transition-colors ${active
                    ? "border-ati-gold text-ati-gold-light"
                    : "border-transparent text-ati-cream/55 hover:text-ati-cream"
                    }`}
                >
                  {item.year}
                </button>
              );
            })}
          </div>

          {currentWinners.length > 0 ? (
            <>
              <p className="mt-6 font-heading text-base tabular-nums text-ati-cream/55">
                {currentWinners.length} peraih
              </p>

              <ul className="mt-2 grid gap-x-12 sm:grid-cols-2">
                {currentWinners.map((winner) => (
                  <li
                    key={winner.id}
                    className="flex items-start justify-between gap-4 border-b border-ati-cream/15 py-5"
                  >
                    <div>
                      {winner.kategori && (
                        <div className="font-heading text-sm leading-snug text-ati-gold">
                          {winner.kategori}
                        </div>
                      )}

                      <h2 className="mt-1 font-heading text-xl font-semibold leading-tight tracking-[-0.02em] text-ati-cream">
                        {winner.nama}
                      </h2>

                      {(winner.jabatan || winner.level) && (
                        <p className="mt-1 text-sm text-ati-cream/55">
                          {[winner.jabatan, winner.level].filter(Boolean).join(" · ")}
                        </p>
                      )}
                    </div>

                    {winner.foto && (
                      <img
                        src={`/storage/${winner.foto}`}
                        alt=""
                        loading="lazy"
                        // Sebagian berkas foto belum ada di storage; jangan
                        // tampilkan kotak gambar rusak.
                        onError={(e) => { e.currentTarget.hidden = true; }}
                        className="h-20 w-16 shrink-0 border border-ati-cream/15 object-cover"
                      />
                    )}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="mt-10 border-b border-ati-cream/15 py-12 text-center text-ati-cream/55">
              Belum ada peraih untuk tahun {selectedYear}.
            </p>
          )}
        </main>
      </div>
    </>
  );
};

export default Winners;
