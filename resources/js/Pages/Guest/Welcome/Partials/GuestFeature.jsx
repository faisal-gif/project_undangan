import { Crown, Users, Star } from "lucide-react";

const features = [
  {
    icon: Crown,
    title: "Man of The Year",
    description:
      "Honoring excellence with prestigious awards across multiple categories",
    gradient: "from-[hsl(45,100%,51%)] to-[hsl(0,72%,41%)]",
  },
  {
    icon: Users,
    title: "Woman of The Year",
    description:
      "Celebrating innovators and visionaries who shape their fields",
    gradient: "from-[hsl(0,72%,41%)] to-[hsl(283,58%,20%)]",
  },
  {
    icon: Star,
    title: "Positive News Maker",
    description:
      "Building a tradition of recognizing outstanding achievements",
    gradient: "from-[hsl(283,58%,20%)] to-[hsl(0,72%,41%)]",
  },
];

const GuestFeatures = () => {
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
            <div
              key={index}
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GuestFeatures;
