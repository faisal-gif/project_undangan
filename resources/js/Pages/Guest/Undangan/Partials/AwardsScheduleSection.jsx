import Card from "@/Components/Card";
import { Clock } from "lucide-react";


const schedule = [
  { time: "17:30", title: "Registrasi & Welcome Drink", description: "Check-in tamu undangan" },
  { time: "18:00", title: "Pembukaan Acara", description: "Sambutan dari Master of Ceremony" },
  { time: "18:15", title: "Sambutan Ketua", description: "Pidato pembukaan dari CEO" },
  { time: "18:45", title: "Dinner", description: "Makan malam untuk seluruh tamu" },
  { time: "19:30", title: "Pemberian Penghargaan", description: "Pengumuman dan penyerahan awards" },
  { time: "21:00", title: "Hiburan & Entertainment", description: "Penampilan artis special guest" },
  { time: "21:45", title: "Penutupan & Foto Bersama", description: "Sesi foto dan networking" }
];

export const AwardsScheduleSection = () => {
  return (
    <section className="py-16 md:py-24 px-4 bg-base-300/30">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="font-serif text-4xl md:text-5xl mb-4">
            Rundown Acara
          </h2>
          <div className="w-24 h-1 bg-amber-400 mx-auto mb-6" />
          <p className="text-muted-foreground">
            Jadwal acara pemberian penghargaan
          </p>
        </div>

        <div className="space-y-4">
          {schedule.map((item, index) => (
            <Card 
              key={index} 
              className="p-6 border-l-4 bg-base-100 border-l-amber-400 hover:shadow-lg transition-all duration-300 hover:scale-105 animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s`, opacity: 0 }}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-lg bg-amber-400/10 flex flex-col items-center justify-center transition-transform duration-300 hover:scale-110">
                    <Clock className="h-5 w-5 text-amber-400 mb-1" />
                    <span className="text-xs font-bold text-amber-400">{item.time}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
