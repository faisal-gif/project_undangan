<?php

namespace App\Http\Controllers;

use App\Models\Acara;
use App\Models\Tamu;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

/**
 * Tindakan yang dilakukan tamu dari halaman undangannya: menyimpan acara ke
 * kalender dan mengonfirmasi kehadiran. Keduanya dikunci kode undangan yang
 * acak - sama seperti halaman undangannya sendiri.
 */
class UndanganController extends Controller
{
    /**
     * Berkas .ics supaya tamu bisa menyimpan acara ke kalender ponselnya.
     */
    public function kalender(string $kode): Response
    {
        $tamu = Tamu::with('acara')->where('code', $kode)->firstOrFail();
        $acara = $tamu->acara;

        abort_unless($acara, 404);

        $mulai = $acara->mulai->utc();
        // Tanpa jam selesai, pakai tiga jam sebagai perkiraan durasi acara.
        $selesai = ($acara->selesai ?? $acara->mulai->copy()->addHours(3))->utc();
        $lokasi = trim(implode(', ', array_filter([$acara->tempat, $acara->alamat])));

        $ics = implode("\r\n", [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//Anugerah TIMES Indonesia//Undangan//ID',
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH',
            'BEGIN:VEVENT',
            'UID:' . $tamu->code . '@' . (parse_url(config('app.url'), PHP_URL_HOST) ?: 'ati.local'),
            'DTSTAMP:' . now()->utc()->format('Ymd\THis\Z'),
            'DTSTART:' . $mulai->format('Ymd\THis\Z'),
            'DTEND:' . $selesai->format('Ymd\THis\Z'),
            'SUMMARY:' . $this->escapeIcs(trim($acara->nama . ' ' . $acara->mulai->timezone(Acara::ZONA)->year)),
            'LOCATION:' . $this->escapeIcs($lokasi),
            'DESCRIPTION:' . $this->escapeIcs('Undangan atas nama ' . $tamu->nama . '. Tunjukkan QR pada halaman undangan saat registrasi.'),
            'URL:' . route('undangan', [$tamu->code]),
            'END:VEVENT',
            'END:VCALENDAR',
        ]) . "\r\n";

        return response($ics, 200, [
            'Content-Type' => 'text/calendar; charset=utf-8',
            'Content-Disposition' => 'attachment; filename="anugerah-times-indonesia.ics"',
        ]);
    }

    /**
     * Konfirmasi kehadiran dari tamu. Terpisah dari kolom `status`, yang baru
     * terisi saat QR dipindai di pintu masuk.
     */
    public function rsvp(Request $request, string $kode)
    {
        $data = $request->validate([
            'rsvp' => 'required|in:hadir,berhalangan',
        ], [
            'rsvp.required' => 'Pilih dulu hadir atau berhalangan.',
            'rsvp.in' => 'Pilihan konfirmasi tidak dikenal.',
        ]);

        $tamu = Tamu::where('code', $kode)->firstOrFail();

        // Undangan edisi lama sudah ditutup; jangan terima konfirmasi lagi.
        abort_unless($tamu->acara_id === Acara::aktif()?->id, 404);

        $tamu->update([
            'rsvp' => $data['rsvp'],
            'rsvp_pada' => now(),
        ]);

        return back()->with('success', $data['rsvp'] === 'hadir'
            ? 'Terima kasih, kehadiran Anda sudah kami catat.'
            : 'Terima kasih atas kabarnya.');
    }

    /**
     * Baris .ics tidak boleh memuat koma, titik koma, atau baris baru mentah.
     */
    private function escapeIcs(?string $teks): string
    {
        return str_replace(
            ['\\', "\r\n", "\n", ',', ';'],
            ['\\\\', '\\n', '\\n', '\\,', '\\;'],
            (string) $teks
        );
    }
}
