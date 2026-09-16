import { useEffect, useState } from 'react'

const zero = { days: 0, hours: 0, minutes: 0, seconds: 0 }

function timeLeft(target) {
    if (!target) return zero

    const difference = new Date(target) - new Date()
    if (!(difference > 0)) return zero

    return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / (1000 * 60)) % 60),
        seconds: Math.floor((difference / 1000) % 60),
    }
}

/**
 * Hitung mundur ke satu titik waktu. `target` berisi offset zona waktu
 * (mis. 2026-11-27T18:00:00+07:00), jadi hasilnya sama di mana pun pembaca.
 */
export default function useCountdown(target) {
    const [left, setLeft] = useState(() => timeLeft(target))

    useEffect(() => {
        setLeft(timeLeft(target))
        const timer = setInterval(() => setLeft(timeLeft(target)), 1000)
        return () => clearInterval(timer)
    }, [target])

    return left
}
