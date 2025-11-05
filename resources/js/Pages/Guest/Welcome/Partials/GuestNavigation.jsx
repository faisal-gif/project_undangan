
import AtiLogo from "@/Components/AtiLogo";
import { Link } from "@inertiajs/react";
import { Trophy } from "lucide-react";

const GuestNavigation = () => {
    return (
        <nav className="fixed top-0 w-full z-50 bg-background/95 backdrop-blur-lg border-b-2 border-primary/30 shadow-burgundy">
            <div className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="p-2 rounded-xl group-hover:scale-110 transition-transform">
                            <AtiLogo className="w-12 h-10" />
                        </div>
                        <span className="hidden md:block text-2xl font-display font-bold text-gradient-gold">
                            Anugerah TIMES Indonesia
                        </span>
                    </Link>

                    <div className="flex gap-8">
                        <Link
                            href="/"
                            className={`text-lg font-semibold transition-all text-guest-foreground hover:text-amber-400 relative group `}
                        >
                            Home
                            <span className={`absolute bottom-0 left-0 h-0.5 text-guest-foreground bg-amtext-amber-400 transition-all`} />
                        </Link>
                        <Link
                            href="/winners"
                            className={`text-lg font-semibold transition-all text-guest-foreground hover:text-amber-400 relative group`}
                        >
                            Winners
                            <span className={`absolute bottom-0 left-0 h-0.5 bg-amtext-amber-400 transition-all `} />
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default GuestNavigation;