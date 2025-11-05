import { useState } from "react";
import { Trophy, Award, Medal, Crown } from "lucide-react";

import GuestNavigation from "../Welcome/Partials/GuestNavigation";
import { Head } from "@inertiajs/react";
import CardWinners from "./Partials/CardWinners";
import Card from "@/Components/Card";

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
                  className={`px-8 py-2 rounded-lg text-xl bg-white border-amber-400 font-bold border-2 transition-all ${selectedYear === year
                    ? "bg-gradient-gold text-guest-primary-foreground shadow-gold border-amber-400 hover:opacity-90 hover:scale-105"
                    : "bg-card border-amber-400/50 text-card-foreground hover:bg-guest-card hover:border-amber-400 hover:shadow-white hover:scale-105"
                    }`}
                >
                  {year}
                </button>
              ))}
            </div>

            {/* Winners Grid */}
            <div className="grid md:grid-cols-4 gap-4 max-w-7xl mx-auto relative z-10">
              {winnersData[selectedYear].map((winner, index) => {
                const Icon = icons[index % icons.length];
                const gradient = gradients[index % gradients.length];
                return (
                  <Card
                    key={index}
                    style={{ animationDelay: `${index * 100}ms` }}
                    className="relative overflow-hidden group cursor-pointer border-2 border-amber-400/30 hover:border-amber-400 transition-all hover:shadow-gold hover:scale-105 animate-slide-up h-[400px]"
                  >
                    {/* Background Image */}
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                      style={{ backgroundImage: `url('https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp')` }}
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
                          {winner.name}
                        </Card.Title>

                        {/* Category Badge */}
                        <div className="inline-flex self-start px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-200/30 to-amber-400/20 border border-amber-400/50 mb-2 backdrop-blur-sm">
                          <span className="text-xs font-bold text-amber-400">
                            {winner.category}
                          </span>
                        </div>

                        {/* Achievement */}
                        <p className="text-sm text-white/90 leading-relaxed line-clamp-2">
                          {winner.achievement}
                        </p>
                      </div>
                    </Card.Body>
                  </Card>

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
