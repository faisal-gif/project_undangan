import Modal from "@/Components/Modal";
import { Crown, Users, Star, X } from "lucide-react";
import { useState } from "react";

const features = [
  {
    icon: Crown,
    title: "Man of The Year",
    description: "Figur laki-laki berpengaruh dan inspiratif",
    detail:
      "Kategori ini diberikan kepada sosok laki-laki yang memberi dampak besar, mampu menginspirasi banyak orang, dan menjadi teladan dalam karya maupun kontribusi sosial.",
  },
  {
    icon: Users,
    title: "Woman of The Year",
    description: "Figur perempuan berprestasi dan berdampak",
    detail:
      "Penghargaan ini diberikan kepada perempuan yang menunjukkan dedikasi, prestasi luar biasa, serta kontribusi nyata dalam memajukan masyarakat.",
  },
  {
    icon: Star,
    title: "Positive News Maker",
    description: "Tokoh pembawa narasi optimis",
    detail:
      "Diberikan kepada figur yang membawa berita positif, memberi harapan, dan menginspirasi publik melalui tindakan nyata maupun prestasinya.",
  },
];

const GuestFeatures = () => {
  const [selectedFeature, setSelectedFeature] = useState(null);

  return (
    <section className="mx-auto max-w-6xl px-6 py-24 lg:py-32">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,22rem)_1fr] lg:gap-16">
        <div>
          <h2 className="font-heading text-[clamp(1.9rem,3.4vw,2.75rem)] font-bold leading-[1.02] tracking-[-0.035em] text-ati-cream">
            Mengapa Kami Memberikan Penghargaan
          </h2>
          <p className="mt-5 max-w-[44ch] leading-[1.65] text-ati-cream/70">
            Mengapresiasi keteladanan dan menginspirasi generasi penerus untuk
            terus berkarya dan membawa perubahan positif.
          </p>
        </div>

        <ul>
          {features.map((feature) => (
            <li key={feature.title}>
              <button
                type="button"
                onClick={() => setSelectedFeature(feature)}
                className="group relative block w-full border-t border-ati-cream/15 py-8 text-left last:border-b"
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-px w-0 bg-ati-gold transition-[width] duration-500 ease-out group-hover:w-full"
                />

                <span className="flex items-baseline gap-4">
                  <feature.icon
                    aria-hidden="true"
                    className="h-5 w-5 shrink-0 translate-y-1 text-ati-gold/70 transition-colors group-hover:text-ati-gold"
                    strokeWidth={1.5}
                  />
                  <span>
                    <span className="block font-heading text-[clamp(1.5rem,2.6vw,2.1rem)] font-semibold leading-tight tracking-[-0.02em] text-ati-cream transition-colors group-hover:text-ati-gold-light">
                      {feature.title}
                    </span>
                    <span className="mt-1.5 block text-ati-cream/65">
                      {feature.description}
                    </span>
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* MODAL DETAIL */}
      <Modal
        show={!!selectedFeature}
        onClose={() => setSelectedFeature(null)}
        maxWidth="lg"
      >
        {selectedFeature && (
          <div className="border-t-2 border-ati-gold bg-ati-ink p-8">
            <div className="flex items-start justify-between gap-6">
              <h3 className="font-heading text-[clamp(1.6rem,3vw,2.1rem)] font-bold leading-tight tracking-[-0.02em] text-ati-cream">
                {selectedFeature.title}
              </h3>

              <button
                type="button"
                onClick={() => setSelectedFeature(null)}
                aria-label="Tutup"
                className="-mr-2 -mt-1 p-2 text-ati-cream/60 transition-colors hover:text-ati-gold-light"
              >
                <X className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </div>

            <p className="mt-5 border-t border-ati-cream/15 pt-5 text-lg leading-[1.65] text-ati-cream/80">
              {selectedFeature.detail}
            </p>
          </div>
        )}
      </Modal>
    </section>
  );
};

export default GuestFeatures;
