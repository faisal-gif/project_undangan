import Modal from "@/Components/Modal";
import { Crown, Users, Star } from "lucide-react";
import { useState } from "react";

const features = [
  {
    icon: Crown,
    title: "Man of The Year",
    description: "Figur laki-laki berpengaruh dan inspiratif",
    gradient: "from-[hsl(45,100%,51%)] to-[hsl(0,72%,41%)]",
    detail:
      "Kategori ini diberikan kepada sosok laki-laki yang memberi dampak besar, mampu menginspirasi banyak orang, dan menjadi teladan dalam karya maupun kontribusi sosial.",
  },
  {
    icon: Users,
    title: "Woman of The Year",
    description: "Figur perempuan berprestasi dan berdampak",
    gradient: "from-[hsl(0,72%,41%)] to-[hsl(283,58%,20%)]",
    detail:
      "Penghargaan ini diberikan kepada perempuan yang menunjukkan dedikasi, prestasi luar biasa, serta kontribusi nyata dalam memajukan masyarakat.",
  },
  {
    icon: Star,
    title: "Positive News Maker",
    description: "Tokoh pembawa narasi optimis",
    gradient: "from-[hsl(283,58%,20%)] to-[hsl(0,72%,41%)]",
    detail:
      "Diberikan kepada figur yang membawa berita positif, memberi harapan, dan menginspirasi publik melalui tindakan nyata maupun prestasinya.",
  },
];



const GuestFeatures = () => {
  const [selectedFeature, setSelectedFeature] = useState(null);

  return (
    <section className="py-32 px-6 relative bg-guest-background">
      <div className="absolute inset-0 bg-pattern-dots opacity-30" />

      <div className="container mx-auto relative z-10">
        <div className="text-center mb-20 animate-slide-up">
          <h2 className="text-2xl md:text-5xl font-display font-bold mb-6 text-gradient-gold">
            Mengapa Kami Memberikan Penghargaan
          </h2>
          <p className="text-xl text-guest-foreground max-w-2xl mx-auto">
            Mengapresiasi keteladanan dan menginspirasi generasi penerus untuk terus berkarya dan membawa perubahan positif.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <button
              key={index}
              onClick={() => setSelectedFeature(feature)}
              className="p-8 rounded-2xl bg-guest-card border-2 border-guest-primary hover:border-guest-primary transition-all hover:shadow-white group animate-slide-up hover:scale-105"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div
                className={`mb-6 inline-block p-5 rounded-2xl bg-gradient-to-br ${feature.gradient}`}
              >
                <feature.icon className="w-10 h-10 text-white" />
              </div>

              <h3 className="text-2xl font-display font-bold mb-4 text-guest-card-foreground group-hover:text-amber-400 transition-colors">
                {feature.title}
              </h3>

              <p className="text-guest-card-foreground group-hover:text-amber-400 transition-colors leading-relaxed">
                {feature.description}
              </p>
            </button>
          ))}
        </div>
      </div>
      
      {/* MODAL DETAIL */}
      <Modal
        show={!!selectedFeature}
        onClose={() => setSelectedFeature(null)}
        maxWidth="lg"

      >
        {selectedFeature && (
          <div className="p-6  bg-gradient-burgundy">
            <div className="flex items-center gap-4 mb-4">
              <div
                className={`p-4 rounded-xl bg-gradient-to-br ${selectedFeature.gradient}`}
              >
                <selectedFeature.icon className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-display font-bold text-guest-foreground">
                {selectedFeature.title}
              </h3>
            </div>

            <p className="text-lg text-guest-foreground leading-relaxed">
              {selectedFeature.detail}
            </p>

            <div className="mt-8 text-right">
              <button
                onClick={() => setSelectedFeature(null)}
                className="px-6 py-2 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
};

export default GuestFeatures;
