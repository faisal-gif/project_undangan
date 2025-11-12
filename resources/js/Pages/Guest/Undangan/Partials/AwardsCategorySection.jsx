import Card from "@/Components/Card";
import { Award, Trophy, Star, Users, Lightbulb, Target } from "lucide-react";


const categories = [
  {
    icon: Trophy,
    title: "Lifetime Achievement Award",
    description: "Penghargaan untuk kontribusi luar biasa sepanjang karir"
  },
  {
    icon: Star,
    title: "Best Performance Award",
    description: "Penghargaan untuk performa terbaik tahun ini"
  },
  {
    icon: Users,
    title: "Team Excellence Award",
    description: "Penghargaan untuk tim dengan kolaborasi terbaik"
  },
  {
    icon: Lightbulb,
    title: "Innovation Award",
    description: "Penghargaan untuk ide dan inovasi terbaik"
  },
  {
    icon: Target,
    title: "Leadership Award",
    description: "Penghargaan untuk kepemimpinan yang inspiratif"
  },
  {
    icon: Award,
    title: "Rising Star Award",
    description: "Penghargaan untuk talenta muda yang menjanjikan"
  }
];

export const AwardsCategorySection = () => {
  return (
    <section className="py-16 md:py-24 px-4 bg-gradient-to-b from-[#4d0c0c] via-[#4d0c0c]/80 to-[#4d0c0c]/70 text-white">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="font-serif text-4xl md:text-5xl mb-4">
            Kategori Penghargaan
          </h2>
          <div className="w-24 h-1 bg-amber-400 mx-auto mb-6" />
          <p className="text-white/70 max-w-2xl mx-auto">
            Malam penghargaan yang mengakui prestasi luar biasa dalam berbagai kategori
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <Card 
                key={index} 
                className="p-6 bg-white/5 border-amber-400/20 backdrop-blur-sm hover:bg-white/10 transition-all hover:border-gold/50 hover:scale-105 group animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s`, opacity: 0 }}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-amber-400/10 flex items-center justify-center mb-4 group-hover:bg-gold/20 transition-all duration-300 group-hover:rotate-12">
                    <Icon className="h-8 w-8 text-amber-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-white">
                    {category.title}
                  </h3>
                  <p className="text-sm text-white/60">
                    {category.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
