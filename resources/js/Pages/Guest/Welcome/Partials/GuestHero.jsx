import CountUp from "@/Components/CountUp";
import Particles from "@/Components/Particles";
import { Link } from "@inertiajs/react";
import { ArrowRight, Award, Sparkles } from "lucide-react";

const GuestHero = () => {
  return (
    <section className="relative min-h-screen pt-24 flex items-center justify-center overflow-hidden bg-gradient-burgundy">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 bg-gradient-radial-burgundy opacity-60" />
      <div className="absolute inset-0 bg-pattern-dots" />

      {/* Floating Orbs */}
      <div className="absolute top-20 right-1/4 w-72 h-72 bg-gradient-radial-gold rounded-full blur-3xl animate-float" />
      <div
        className="absolute bottom-20 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float"
        style={{ animationDelay: "1s" }}
      />
      <div
        className="absolute top-1/2 right-1/3 w-64 h-64 bg-secondary/20 rounded-full blur-3xl animate-float"
        style={{ animationDelay: "2s" }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-6 animate-fade-in max-w-5xl">
        <div className="inline-flex items-center gap-3 mb-8 px-6 py-3 rounded-full bg-white border-2 border-amber-500 shadow-gold animate-glow">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span className="text-black font-semibold">
            Excellence Since 2020
          </span>
          <Award className="w-5 h-5 text-amber-400" />
        </div>

        <h1 className="text-7xl md:text-7xl font-display font-bold mb-8 text-gradient-gold leading-tight">
          Anugerah
          <br />
          TIMES Indonesia
        </h1>

        <p className="text-2xl md:text-3xl text-white max-w-3xl mx-auto mb-12 font-light leading-relaxed">
          Celebrating{" "}
          <span className="text-amber-400 font-semibold">
            outstanding achievements
          </span>{" "}
          and honoring
          <br />
          the{" "}
          <span className="text-amber-400 font-semibold">finest talents</span>{" "}
          across industries
        </p>

        <div className="flex gap-6 justify-center flex-row">
          {/* Button 1 */}
          <Link className="bg-gradient-gold text-primary-foreground hover:opacity-90 shadow-gold text-lg px-10 py-3 font-bold group border-2 border-amber-400/50 hover:scale-105 transition-all rounded-xl inline-flex items-center justify-center">
            View Winners
            <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-2 transition-transform" />
          </Link>

          {/* Button 2 */}
          <button className="bg-white/95 border-2 border-amber-400 text-card-foreground hover:bg-card hover:shadow-white text-lg px-10 py-3 font-bold hover:scale-105 transition-all backdrop-blur-sm rounded-xl inline-flex items-center justify-center">
            Learn More
          </button>
        </div>

        {/* Decorative Elements */}
        <div className="mt-20 flex justify-center gap-8 text-white/60">
          <div className="text-center">
            <div className="text-4xl font-display font-bold text-white mb-2">
      
              <CountUp
                from={0}
                to={500}
                separator=","
                direction="up"
                duration={1}
                className="count-up-text"
              />
              +
            </div>
            <div className="text-sm uppercase tracking-wider">Winners</div>
          </div>
          <div className="w-px bg-amber-400/30" />
          <div className="text-center">
            <div className="text-4xl font-display font-bold text-white mb-2">
             <CountUp
                from={0}
                to={5}
                separator=","
                direction="up"
                duration={1}
                className="count-up-text"
              />
            </div>
            <div className="text-sm uppercase tracking-wider">Years</div>
          </div>
          <div className="w-px bg-amber-400/30" />
          <div className="text-center">
            <div className="text-4xl font-display font-bold text-white mb-2">
             <CountUp
                from={0}
                to={20}
                separator=","
                direction="up"
                duration={1}
                className="count-up-text"
              />+
            </div>
            <div className="text-sm uppercase tracking-wider">Categories</div>
          </div>
        </div>
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default GuestHero;
