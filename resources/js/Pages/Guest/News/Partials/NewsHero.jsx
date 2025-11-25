import AtiLogo from "@/Components/AtiLogo";
import CountUp from "@/Components/CountUp";
import { Link } from "@inertiajs/react";
import { ArrowRight, Award, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

const NewsHero = () => {

  const calculateTimeLeft = () => {
    const targetDate = new Date("2025-11-27T18:00:00");
    const now = new Date();
    const difference = targetDate - now;

    let timeLeft = {};
    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / (1000 * 60)) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    } else {
      timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);


  return (
    <section className="relative min-h-full pt-24 pb-8 md:py-24 flex items-center justify-center overflow-hidden">
      {/* Animated Background Effects */}

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
      <div className="relative z-10 text-center px-6 py-8 animate-fade-in max-w-5xl">
        <div className="inline-flex items-center gap-3 mb-8 px-6 py-2 rounded-full bg-white border-2 border-amber-500 shadow-gold animate-glow">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span className="text-black font-semibold">
            News
          </span>
          <Award className="w-5 h-5 text-amber-400" />
        </div>

        <AtiLogo className="w-32 h-full mx-auto mb-6" />

        <h1 className="text-4xl md:text-5xl font-display font-bold mb-8 text-gradient-gold leading-tight font-serif">
          Anugerah
          <br />
          TIMES Indonesia
        </h1>

      </div>

      {/* Bottom Fade */}

    </section >
  );
};

export default NewsHero;
