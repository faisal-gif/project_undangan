import AtiLogo from "@/Components/AtiLogo";

const NewsHero = () => {
  return (
    <header className="mx-auto max-w-6xl px-6 pb-8 pt-32">
      <AtiLogo className="h-14 w-14" />

      <h1 className="mt-8 font-heading text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[0.9] tracking-[-0.045em] text-ati-cream">
        Berita Seputar{" "}
        <span className="text-ati-gold-light">ATI</span>
      </h1>

      <p className="mt-6 max-w-[58ch] border-t border-ati-cream/20 pt-6 text-lg leading-[1.6] text-ati-cream/80">
        Kabar terbaru seputar Anugerah TIMES Indonesia dan para penerimanya.
      </p>
    </header>
  );
};

export default NewsHero;
