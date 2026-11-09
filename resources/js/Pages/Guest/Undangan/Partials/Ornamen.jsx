/**
 * Pemisah seremonial: garis rambut emas yang memudar ke tepi dengan belah
 * ketupat kecil di tengah. Dipakai di bawah judul utama undangan.
 */
export const Ornamen = ({ className = '', ...sisa }) => (
    <div className={`flex items-center justify-center gap-3 ${className}`} aria-hidden="true" {...sisa}>
        <span className="h-px w-16 bg-gradient-to-r from-transparent to-ati-gold/60 sm:w-24" />
        <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 text-ati-gold" fill="currentColor">
            <path d="M6 0l6 6-6 6-6-6z" />
        </svg>
        <span className="h-px w-16 bg-gradient-to-l from-transparent to-ati-gold/60 sm:w-24" />
    </div>
);
