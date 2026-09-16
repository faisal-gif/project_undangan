import AtiLogo from "@/Components/AtiLogo";
import { Link, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";

const links = [
    { href: "/", label: "Beranda" },
    { href: "/winners", label: "Peraih" },
];

const GuestNavigation = () => {
    const { url } = usePage();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 24);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <nav
            className={`fixed top-0 z-50 w-full transition-colors duration-300 ${scrolled ? "bg-ati-ink/90 backdrop-blur-md" : "bg-transparent"
                }`}
        >
            <div className="mx-auto flex h-20 max-w-6xl items-center justify-between gap-6 border-b border-ati-cream/15 px-6">
                <Link href="/" className="flex items-center gap-3">
                    <AtiLogo className="h-9 w-9" />
                    <span className="hidden font-heading text-lg font-semibold tracking-[-0.02em] text-ati-cream md:block">
                        Anugerah TIMES Indonesia
                    </span>
                </Link>

                <div className="flex items-baseline gap-8">
                    {links.map((link) => {
                        const active = url === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                aria-current={active ? "page" : undefined}
                                className={`font-heading text-lg transition-colors ${active
                                    ? "text-ati-gold-light underline decoration-ati-gold decoration-1 underline-offset-[10px]"
                                    : "text-ati-cream/75 hover:text-ati-cream"
                                    }`}
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
};

export default GuestNavigation;
