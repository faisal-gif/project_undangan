import { useState } from "react";
import { Trophy, Award, Medal, Crown } from "lucide-react";

import GuestNavigation from "../Welcome/Partials/GuestNavigation";
import { Head } from "@inertiajs/react";
import CardWinners from "./Partials/CardWinners";
import Card from "@/Components/Card";
import Modal from "@/Components/Modal";

const Winners = ({ winnersByYear }) => {
  // Mengambil tahun pertama sebagai default (tahun terbesar/terbaru)
  const sortedData = [...winnersByYear].sort((a, b) => b.year - a.year);
  const [selectedYear, setSelectedYear] = useState(sortedData[0]?.year || 2020);
  const [selectedWinner, setSelectedWinner] = useState(null);

  const icons = [Trophy, Award, Medal, Crown];
  const gradients = [
    "from-[hsl(45,100%,51%)] to-[hsl(0,72%,41%)]",
    "from-yellow-400 via-orange-400 to-amber-400",
    "from-[hsl(240,100%,50%)] to-[hsl(240,100%,40%)]",
    "from-[hsl(0,100%,50%)] to-[hsl(0,100%,40%)]",
    "from-[hsl(120,100%,50%)] via-[hsl(60,100%,50%)] to-[hsl(120,100%,40%)]",
  ];

  // Mendapatkan winners untuk tahun yang dipilih
  const currentYearData = sortedData.find(item => item.year === selectedYear);
  const currentWinners = currentYearData?.winners || [];

  return (
    <>
      <Head>
        <title>Winners</title>
        <meta name="description" content="Discover the distinguished winners of the Anugerah TIMES Indonesia, celebrating excellence and innovation across various industries since 2020." />
      </Head>
      <div className="min-h-screen bg-gradient-burgundy relative overflow-hidden">
        <GuestNavigation />

        <main className="pt-32 pb-20 px-6 relative z-10">
          <div className="container mx-auto">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-pattern-dots opacity-20 pointer-events-none" />

            {/* Header */}
            <div className="text-center mb-16 animate-fade-in relative z-10">
              <div className="inline-block mb-6 p-4 rounded-2xl bg-gradient-gold shadow-gold animate-glow">
                <Trophy className="w-16 h-16 text-guest-primary-foreground" />
              </div>
              <h1 className="text-6xl md:text-8xl font-display font-bold mb-6 text-gradient-gold">
                Hall of Excellence
              </h1>
              <p className="text-xl text-guest-foreground max-w-2xl mx-auto">
                Honoring remarkable individuals who have made extraordinary contributions
              </p>
            </div>

            {/* Year Selector */}
            <div className="flex justify-start md:justify-center gap-4 mb-16 flex-row relative z-10 overflow-x-auto whitespace-nowrap p-4">
              {sortedData.map((item) => (
                <button
                  key={item.year}
                  onClick={() => setSelectedYear(item.year)}
                  className={`px-8 py-2 rounded-lg text-xl bg-white border-amber-400 font-bold border-2 transition-all flex-shrink-0 ${selectedYear === item.year
                    ? "bg-gradient-gold text-guest-primary-foreground shadow-gold border-amber-400 hover:opacity-90 hover:scale-105"
                    : "bg-card border-amber-400/50 text-card-foreground hover:bg-guest-card hover:border-amber-400 hover:shadow-white hover:scale-105"
                    }`}
                >
                  {item.year}
                </button>
              ))}
            </div>

            {/* Winners Grid */}
            <div className="grid md:grid-cols-4 gap-4 max-w-7xl mx-auto relative z-10">
              {currentWinners.map((winner, index) => {
                const Icon = icons[index % icons.length];
                const gradient = gradients[index % gradients.length];
                return (
                  <button
                    key={winner.id}
                    onClick={() => setSelectedWinner(winner)}
                  >
                    <Card
                       key={winner.id}
                      style={{ animationDelay: `${index * 100}ms` }}
                      className="relative overflow-hidden group  border-2 border-amber-400/30 hover:border-amber-400 transition-all hover:shadow-gold hover:scale-105 animate-slide-up h-[400px]"
                    >
                      {/* Background Image */}
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                        style={{ backgroundImage: `url('/storage/${winner.foto}')` }}
                      />

                      {/* Dark Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/20 group-hover:from-black/100 group-hover:via-black/70 transition-all duration-300" />

                      {/* Card Body */}
                      <Card.Body className="relative h-full flex flex-col justify-end p-6">
                        {/* Icon Badge */}
                        <div className={`absolute top-4 right-4 p-3 rounded-full bg-gradient-to-br ${gradient} shadow-gold border-2 border-white/20 animate-glow`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>

                        <div className="mt-auto">
                          {/* Winner Name */}
                          <Card.Title className="text-xl font-display font-bold mb-2 text-white group-hover:text-gradient-gold transition-all">
                            {winner.nama}
                          </Card.Title>

                          {/* Category Badge */}
                          <div className="inline-flex self-start px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-200/30 to-amber-400/20 border border-amber-400/50 mb-2 backdrop-blur-sm">
                            <span className="text-xs font-bold text-amber-400">
                              {winner.kategori}
                            </span>
                          </div>

                          {/* Achievement */}
                          <p className="text-sm text-white/90 leading-relaxed line-clamp-2">
                            {winner.achievement}
                          </p>
                        </div>
                      </Card.Body>
                    </Card>
                  </button>

                );
              })}
            </div>
          </div>
        </main>
      </div>
      <Modal
        show={!!selectedWinner}
        onClose={() => setSelectedWinner(null)}
        maxWidth="2xl"
      >

        {selectedWinner && (
          <>
            <div className="relative h-80 overflow-hidden">
              <div
                className="absolute inset-0 bg-contain bg-center bg-no-repeat"
                style={{ backgroundImage: `url('/storage/${selectedWinner.foto}')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#4d0c0c] via-black/50 to-black/30" />
              <div className="absolute top-6 left-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-gold text-primary-foreground font-bold shadow-gold">
                <Trophy className="w-4 h-4" />
                <span>{selectedWinner.year} Winner</span>
              </div>
            </div>
            <div className="relative p-8">
              <div className="absolute inset-0 bg-pattern-dots opacity-5 pointer-events-none" />

              <div className="relative text-center">
                {/* Winner Name */}
                <h2 className="text-4xl font-display font-bold mb-4 text-gradient-gold">
                  {selectedWinner.nama}
                </h2>

                {/* Category */}
                <div className="inline-flex px-6 py-3 rounded-full bg-gradient-to-r from-amber-400/20 to-amber-400/10 border-2 border-amber-400/50 mb-6">
                  <span className="text-lg font-bold text-amber-400">
                    {selectedWinner.kategori}
                  </span>
                </div>
              </div>

            </div>
          </>
        )}

      </Modal>
    </>
  );
};

export default Winners;