import { useState } from "react";
import { Trophy, Award, Medal, Crown } from "lucide-react";

import GuestNavigation from "../Welcome/Partials/GuestNavigation";
import { Head } from "@inertiajs/react";

const winnersData = {
  2024: [
    { name: "Sarah Chen", category: "Innovation Excellence", achievement: "Revolutionary AI Healthcare Platform" },
    { name: "Marcus Rodriguez", category: "Entrepreneurship", achievement: "Sustainable Energy Solutions" },
    { name: "Dr. Amelia Foster", category: "Research & Development", achievement: "Breakthrough in Renewable Materials" },
    { name: "James Patterson", category: "Lifetime Achievement", achievement: "40 Years of Industry Leadership" },
  ],
  2023: [
    { name: "Elena Volkov", category: "Technology Pioneer", achievement: "Quantum Computing Advancement" },
    { name: "David Okonkwo", category: "Social Impact", achievement: "Education Access Initiative" },
    { name: "Lisa Wang", category: "Creative Excellence", achievement: "Award-Winning Design Studio" },
    { name: "Robert Sterling", category: "Business Leadership", achievement: "Global Expansion Strategy" },
  ],
  2022: [
    { name: "Priya Sharma", category: "Scientific Innovation", achievement: "Medical Research Breakthrough" },
    { name: "Carlos Mendez", category: "Sustainability", achievement: "Green Technology Solutions" },
    { name: "Sophie Martin", category: "Arts & Culture", achievement: "International Cultural Exchange" },
    { name: "Thomas Anderson", category: "Digital Transformation", achievement: "Enterprise Software Revolution" },
  ],
  2021: [
    { name: "Yuki Tanaka", category: "Innovation in AI", achievement: "Machine Learning Applications" },
    { name: "Maria Santos", category: "Community Impact", achievement: "Urban Development Program" },
    { name: "Alexander Kim", category: "Financial Services", achievement: "Fintech Innovation Leader" },
    { name: "Rachel Cohen", category: "Healthcare Excellence", achievement: "Patient Care Revolution" },
  ],
  2020: [
    { name: "Ahmed Hassan", category: "Technology Innovation", achievement: "Cloud Infrastructure Pioneer" },
    { name: "Jennifer Liu", category: "Education Reform", achievement: "Digital Learning Platform" },
    { name: "Miguel Torres", category: "Environmental Impact", achievement: "Ocean Conservation Project" },
    { name: "Catherine Williams", category: "Industry Leadership", achievement: "Global Market Expansion" },
  ],
};

const Winners = () => {
  const [selectedYear, setSelectedYear] = useState(2024);
  const years = Object.keys(winnersData).map(Number).sort((a, b) => b - a);

  const icons = [Trophy, Award, Medal, Crown];
  const gradients = [
    "from-[hsl(45,100%,51%)] to-[hsl(0,72%,41%)]",
    "from-yellow-400 via-orange-400 to-amber-400",
    "from-[hsl(240,100%,50%)] to-[hsl(240,100%,40%)]",
    "from-[hsl(0,100%,50%)] to-[hsl(0,100%,40%)]",
    "from-[hsl(120,100%,50%)] via-[hsl(60,100%,50%)] to-[hsl(120,100%,40%)]",
  ];

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
          <div className="flex justify-center gap-4 mb-16 flex-row relative z-10">
            {years.map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`px-8 py-2 rounded-lg text-xl bg-white border-amber-400 font-bold border-2 transition-all ${
                  selectedYear === year
                    ? "bg-gradient-gold text-guest-primary-foreground shadow-gold border-amber-400 hover:opacity-90 hover:scale-105"
                    : "bg-card border-amber-400/50 text-card-foreground hover:bg-guest-card hover:border-amber-400 hover:shadow-white hover:scale-105"
                }`}
              >
                {year}
              </button>
            ))}
          </div>

          {/* Winners Grid */}
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto relative z-10">
            {winnersData[selectedYear].map((winner, index) => {
              const Icon = icons[index % icons.length];
              const gradient = gradients[index % gradients.length];
              return (
                <div
                  key={index}
                  className="p-8 rounded-2xl bg-guest-card border-amber-400/30 border-2  hover:border-amber-400 transition-all hover:shadow-white group animate-slide-up hover:scale-105"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start gap-6">
                    <div className={`p-5 rounded-2xl bg-gradient-to-br ${gradient} shrink-0 shadow-gold`}>
                      <Icon className="w-10 h-10 text-white" />
                    </div>

                    <div className="flex-1">
                      <h3 className="text-2xl font-display font-bold mb-3 text-guest-card-foreground group-hover:text-amber-400 transition-colors">
                        {winner.name}
                      </h3>

                      <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-amber-400/20 to-amber-400/10 border-2 border-amber-400/40 mb-3">
                        <span className="text-sm font-bold text-amber-400">
                          {winner.category}
                        </span>
                      </div>

                      <p className="text-guest-card-foreground/80 leading-relaxed font-medium">
                        {winner.achievement}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
    </>
  );
};

export default Winners;
