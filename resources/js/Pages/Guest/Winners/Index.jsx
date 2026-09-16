import { useState } from "react";
import { X } from "lucide-react";

import GuestNavigation from "../Welcome/Partials/GuestNavigation";
import { Head } from "@inertiajs/react";
import Modal from "@/Components/Modal";

const Winners = ({ winnersByYear }) => {
  // Mengambil tahun pertama sebagai default (tahun terbesar/terbaru)
  const sortedData = [...winnersByYear].sort((a, b) => b.year - a.year);
  const [selectedYear, setSelectedYear] = useState(sortedData[0]?.year || 2020);
  const [selectedWinner, setSelectedWinner] = useState(null);

  // Mendapatkan winners untuk tahun yang dipilih
  const currentYearData = sortedData.find(item => item.year === selectedYear);
  const currentWinners = currentYearData?.winners || [];

  return (
    <>
      <Head>
        <title>Winners</title>
        <meta name="description" content="Discover the distinguished winners of the Anugerah TIMES Indonesia, celebrating excellence and innovation across various industries since 2020." />
      </Head>

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
          <div className="flex gap-8 overflow-x-auto border-b border-ati-cream/15 pb-0">
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
            <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
              {currentWinners.map((winner) => (
                <li key={winner.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedWinner(winner)}
                    className="group block w-full text-left"
                  >
                    <div className="overflow-hidden border border-ati-cream/15 bg-ati-wine transition-colors group-hover:border-ati-gold/60">
                      <img
                        src={`/storage/${winner.foto}`}
                        alt={winner.nama}
                        loading="lazy"
                        className="aspect-[3/4] w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                    </div>

                    <div className="mt-3 font-heading text-sm text-ati-gold">
                      {winner.kategori}
                    </div>

                    <h2 className="mt-1 font-heading text-xl font-semibold leading-tight tracking-[-0.02em] text-ati-cream transition-colors group-hover:text-ati-gold-light">
                      {winner.nama}
                    </h2>

                    {winner.achievement && (
                      <p className="mt-1.5 text-sm leading-[1.55] text-ati-cream/60 line-clamp-2">
                        {winner.achievement}
                      </p>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-10 border-b border-ati-cream/15 py-12 text-center text-ati-cream/55">
              Belum ada peraih untuk tahun {selectedYear}.
            </p>
          )}
        </main>
      </div>

      <Modal
        show={!!selectedWinner}
        onClose={() => setSelectedWinner(null)}
        maxWidth="2xl"
      >
        {selectedWinner && (
          <div className="border-t-2 border-ati-gold bg-ati-ink">
            <div className="grid gap-6 p-8 sm:grid-cols-[minmax(0,14rem)_1fr]">
              <img
                src={`/storage/${selectedWinner.foto}`}
                alt={selectedWinner.nama}
                className="aspect-[3/4] w-full border border-ati-cream/15 object-cover"
              />

              <div>
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <div className="font-heading text-base text-ati-gold">
                      {selectedWinner.kategori}
                    </div>
                    <h2 className="mt-1 font-heading text-[clamp(1.6rem,3vw,2.25rem)] font-bold leading-tight tracking-[-0.025em] text-ati-cream">
                      {selectedWinner.nama}
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedWinner(null)}
                    aria-label="Tutup"
                    className="-mr-2 -mt-1 p-2 text-ati-cream/60 transition-colors hover:text-ati-gold-light"
                  >
                    <X className="h-5 w-5" strokeWidth={1.5} />
                  </button>
                </div>

                {selectedWinner.achievement && (
                  <p className="mt-5 border-t border-ati-cream/15 pt-5 leading-[1.65] text-ati-cream/80">
                    {selectedWinner.achievement}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default Winners;
