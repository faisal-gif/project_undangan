import AtiLogo from "@/Components/AtiLogo";
import CountUp from "@/Components/CountUp";
import { Link } from "@inertiajs/react";
import { ArrowRight, Award, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

const GuestHero = () => {

  const calculateTimeLeft = () => {
    const targetDate = new Date("2025-11-27T23:59:59");
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
      <div className="relative z-10 text-center px-6 py-8 animate-fade-in max-w-5xl">
        <div className="inline-flex items-center gap-3 mb-8 px-6 py-2 rounded-full bg-white border-2 border-amber-500 shadow-gold animate-glow">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span className="text-black font-semibold">
            Sejak 2015
          </span>
          <Award className="w-5 h-5 text-amber-400" />
        </div>

        <AtiLogo className="w-32 h-full mx-auto mb-6" />

        <h1 className="text-4xl md:text-5xl font-display font-bold mb-8 text-gradient-gold leading-tight">
          Anugerah
          <br />
          TIMES Indonesia
        </h1>

        <p className="text-xl md:text-3xl text-white max-w-3xl mx-auto mb-12 font-light leading-relaxed">
          Merayakan pencapaian luar biasa dan{" "}
          <br />
          <span className="text-amber-400 font-semibold">
            memberikan penghargaan
          </span>{" "}
          kepada
          {" "}
          <span className="text-amber-400 font-semibold">insan inspiratif</span>{" "}
          yang membawa dampak positif bagi banyak orang.
        </p>

        <div className="my-4 flex justify-center gap-8">
          <iframe
            src="https://www.youtube.com/embed/dv9VYYepFLo?si=8fc7OHaK_XofVmIJ&autoplay=1&mute=1"
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share;"
            className="w-full h-52 md:h-[400px] rounded-xl"
          />
        </div>

        {/* Hitung Mundur */}
        <div className="my-8 flex justify-center text-white">
          <div className="grid grid-flow-col gap-5 text-center auto-cols-max">
            <div className="flex flex-col">
              <span className="countdown font-mono text-5xl">
                <span style={{ "--value": timeLeft.days }}></span>
              </span>
              Hari
            </div>
            <div className="flex flex-col">
              <span className="countdown font-mono text-5xl">
                <span style={{ "--value": timeLeft.hours }}></span>
              </span>
              Jam
            </div>
            <div className="flex flex-col">
              <span className="countdown font-mono text-5xl">
                <span style={{ "--value": timeLeft.minutes }}></span>
              </span>
              Menit
            </div>
            <div className="flex flex-col">
              <span className="countdown font-mono text-5xl">
                <span style={{ "--value": timeLeft.seconds }}></span>
              </span>
              Detik
            </div>
          </div>
        </div>

        <div className="flex gap-6 justify-center flex-row">
          {/* Button 1 */}
          <Link className="bg-gradient-gold text-primary-foreground hover:opacity-90 shadow-gold text-lg px-6 py-2 font-bold group border-2 border-amber-400/50 hover:scale-105 transition-all rounded-xl inline-flex items-center justify-center">
            Peraih
            <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-2 transition-transform" />
          </Link>

          {/* Button 2 */}
          <button className="bg-white/95 border-2 border-amber-400 text-card-foreground hover:bg-card hover:shadow-white text-lg px-10 py-2 font-bold hover:scale-105 transition-all backdrop-blur-sm rounded-xl inline-flex items-center justify-center">
            Lainnya
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
            <div className="text-sm uppercase tracking-wider">Pemenang</div>
          </div>
          <div className="w-px bg-amber-400/30" />
          <div className="text-center">
            <div className="text-4xl font-display font-bold text-white mb-2">
              <CountUp
                from={0}
                to={15}
                separator=","
                direction="up"
                duration={1}
                className="count-up-text"
              />
            </div>
            <div className="text-sm uppercase tracking-wider">Tahun</div>
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
            <div className="text-sm uppercase tracking-wider">Kategori</div>
          </div>
        </div>

        


      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent" />
    </section >
  );
};

export default GuestHero;
