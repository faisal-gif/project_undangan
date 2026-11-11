<?php

namespace App\Models;

use Carbon\Carbon;
use DateTimeInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Acara extends Model
{
    public const ZONA = 'Asia/Jakarta';

    /**
     * Batas susunan grid cadangan, dalam persen terhadap LANTAI - bukan
     * terhadap seluruh ruangan. Panggung dan pintu berada di luar lantai dan
     * berukuran tetap, jadi tinggi ruangan boleh tumbuh tanpa ikut
     * meregangkan keduanya.
     *
     * Hanya untuk grid; meja yang digeser admin boleh ke mana saja.
     */
    public const DENAH_LANDSCAPE = 'landscape';
    public const DENAH_POTRET = 'potret';

    /**
     * Perbandingan lebar dibagi tinggi lantai untuk tiap orientasi. Dipakai
     * bersama oleh perhitungan kolom grid di sini dan ukuran lantai di layar,
     * jadi keduanya tidak bisa berselisih.
     */
    public const RASIO_LANTAI = [
        self::DENAH_LANDSCAPE => 1.95,
        self::DENAH_POTRET => 0.72,
    ];

    private const LANTAI_KIRI = 8;
    private const LANTAI_KANAN = 92;
    private const LANTAI_ATAS = 8;
    private const LANTAI_BAWAH = 92;

    protected $fillable = [
        'nama',
        'mulai',
        'selesai',
        'tempat',
        'alamat',
        'peta_url',
        'video_url',
        'musik_url',
        'jumlah_kursi',
        'kursi_per_meja',
        'meja_per_baris',
        'orientasi_denah',
        'denah',
        'aktif',
    ];

    protected $casts = [
        'denah' => 'array',
        'mulai' => 'datetime',
        'selesai' => 'datetime',
        'aktif' => 'boolean',
    ];

    /**
     * Waktu selalu disimpan dalam UTC. Tanpa ini Laravel menulis jam apa
     * adanya ("19:30") lalu membacanya kembali sebagai UTC, sehingga jam yang
     * diketik admin melompat 7 jam setiap kali disimpan.
     */
    public function setMulaiAttribute($value): void
    {
        $this->attributes['mulai'] = $this->keUtc($value);
    }

    public function setSelesaiAttribute($value): void
    {
        $this->attributes['selesai'] = $this->keUtc($value);
    }

    /**
     * Teks polos dari form dibaca sebagai WIB; nilai yang sudah membawa zona
     * waktu sendiri tinggal dipindah ke UTC.
     */
    private function keUtc($value): ?string
    {
        if (blank($value)) {
            return null;
        }

        $waktu = $value instanceof DateTimeInterface
            ? Carbon::instance($value)
            : Carbon::parse($value, self::ZONA);

        return $waktu->utc()->format('Y-m-d H:i:s');
    }

    public function tamus(): HasMany
    {
        return $this->hasMany(Tamu::class);
    }

    /**
     * Acara yang sedang aktif. Hanya satu yang dipakai di seluruh situs.
     */
    public static function aktif(): ?self
    {
        return static::where('aktif', true)->latest('mulai')->first();
    }

    /**
     * Edisi yang sedang dibuka admin. Dari ?acara=ID, jatuh ke edisi aktif
     * kalau kosong atau tidak ditemukan. Hanya untuk layar daftar - yang
     * menentukan perilaku situs tetap aktif().
     */
    public static function dilihat(?int $id = null): ?self
    {
        return ($id ? static::find($id) : null) ?? static::aktif();
    }

    /**
     * Label pendek untuk judul dan pilihan dropdown, mis. "ATI 2025".
     */
    /**
     * Berapa kursi di tiap meja. Enam bila belum diatur - susunan paling lazim
     * untuk meja bundar.
     */
    public function kursiPerMeja(): int
    {
        return max(1, (int) ($this->kursi_per_meja ?: 6));
    }

    /**
     * Banyak meja diturunkan dari dua angka di pengaturan, tidak disimpan.
     * Dengan begitu jumlah meja tidak pernah berselisih dengan jumlah kursi.
     *
     * Dibulatkan ke atas: 100 kursi dengan 6 per meja berarti 17 meja, yang
     * terakhir hanya terisi empat kursi - bukan dibuang.
     */
    public function jumlahMeja(): int
    {
        $kursi = (int) $this->jumlah_kursi;

        return $kursi > 0 ? (int) ceil($kursi / $this->kursiPerMeja()) : 0;
    }

    /**
     * Kursi yang benar-benar ada di meja tertentu. Meja terakhir bisa lebih
     * sedikit bila jumlah kursi tidak habis dibagi.
     */
    public function kursiDiMeja(int $meja): int
    {
        $total = (int) $this->jumlah_kursi;
        $per = $this->kursiPerMeja();

        if ($total <= 0 || $meja < 1 || $meja > $this->jumlahMeja()) {
            return 0;
        }

        return min($per, $total - ($meja - 1) * $per);
    }

    /**
     * Letak tiap meja dalam persen, lengkap untuk meja 1..N.
     *
     * Meja yang belum pernah digeser diberi tempat dalam susunan grid - jadi
     * denah selalu terbaca sejak awal, bahkan sebelum ada yang mengaturnya.
     */
    public function letakMeja(): array
    {
        $tersimpan = $this->denah ?? [];
        $jumlah = $this->jumlahMeja();
        $letak = [];

        $kolom = $this->kolomGrid();
        $baris = max(1, (int) ceil($jumlah / $kolom));

        for ($n = 1; $n <= $jumlah; $n++) {
            $ada = $tersimpan[(string) $n] ?? null;

            if (is_array($ada) && isset($ada['x'], $ada['y'])) {
                $letak[$n] = [
                    'x' => max(0, min(100, (float) $ada['x'])),
                    'y' => max(0, min(100, (float) $ada['y'])),
                ];

                continue;
            }

            // Dibatasi ke area lantai saja. Bagian atas ruangan dipakai
            // videotron dan panggung, jadi grid yang memakai seluruh tinggi
            // akan menaruh baris pertama tepat di atas panggung.
            $i = $n - 1;
            $letak[$n] = [
                'x' => round(self::LANTAI_KIRI + ($i % $kolom + 0.5) / $kolom
                    * (self::LANTAI_KANAN - self::LANTAI_KIRI), 2),
                'y' => round(self::LANTAI_ATAS + (intdiv($i, $kolom) + 0.5) / $baris
                    * (self::LANTAI_BAWAH - self::LANTAI_ATAS), 2),
            ];
        }

        return $letak;
    }

    /**
     * Banyak meja dalam satu baris pada susunan grid cadangan.
     *
     * Ikut rasio ruangan, bukan akar polos: ruangan yang lebih lebar daripada
     * tinggi butuh lebih banyak kolom, kalau tidak barisnya bertumpuk dan meja
     * saling menindih. Dipakai bersama oleh perhitungan letak di sini dan
     * ukuran gambar meja di layar, jadi keduanya tidak bisa berselisih.
     */
    public function kolomGrid(): int
    {
        $jumlah = $this->jumlahMeja();

        if ($jumlah < 1) {
            return 1;
        }

        // Pilihan admin menang: hanya dia yang tahu bentuk ruangan sebenarnya.
        if ($this->meja_per_baris > 0) {
            return min($jumlah, (int) $this->meja_per_baris);
        }

        // Kolom mengikuti bentuk lantai: ruangan melebar butuh baris yang
        // panjang, ruangan memanjang butuh yang pendek.
        return max(1, (int) ceil(sqrt($jumlah * $this->rasioLantai())));
    }

    public function orientasiDenah(): string
    {
        return $this->orientasi_denah === self::DENAH_POTRET
            ? self::DENAH_POTRET
            : self::DENAH_LANDSCAPE;
    }

    public function rasioLantai(): float
    {
        return self::RASIO_LANTAI[$this->orientasiDenah()];
    }

    public function barisGrid(): int
    {
        return max(1, (int) ceil($this->jumlahMeja() / $this->kolomGrid()));
    }

    public function label(): string
    {
        return 'ATI ' . $this->mulai?->timezone(self::ZONA)->year;
    }

    /**
     * Bentuk yang dikirim ke halaman. mulai_iso membawa offset +07:00 supaya
     * hitung mundur menunjuk saat yang sama di zona waktu mana pun.
     */
    public function toShare(): array
    {
        $mulai = $this->mulai?->timezone(self::ZONA);
        $selesai = $this->selesai?->timezone(self::ZONA);

        return [
            'nama' => $this->nama,
            'tahun' => $mulai?->year,
            'mulai_iso' => $mulai?->toIso8601String(),
            'selesai_iso' => $selesai?->toIso8601String(),
            'tanggal_label' => $mulai?->locale('id')->translatedFormat('l, j F Y'),
            'tanggal_singkat' => $mulai?->locale('id')->translatedFormat('j F Y'),
            'jam_label' => $this->jamLabel(),
            'tempat' => $this->tempat,
            'alamat' => $this->alamat,
            'peta_url' => $this->peta_url,
            'video_embed' => $this->videoEmbed(),
            'musik_url' => $this->musik_url,
        ];
    }

    /**
     * Bentuk untuk /api/v1/acara: sama dengan toShare() ditambah tiga angka
     * siap pakai, supaya situs pemakai tidak menghitung hitung mundurnya
     * sendiri. Memakai toShare() apa adanya agar situs ini dan API tidak
     * pernah bercerita beda.
     */
    public function toApi(): array
    {
        $sekarang = now();

        // Selisih dari cap waktu Unix: tidak bergantung zona waktu dan tidak
        // ikut berubah kalau Carbon mengubah arti diffInSeconds().
        $keMulai = $this->mulai->getTimestamp() - $sekarang->getTimestamp();
        // ponytail: selesai kosong dianggap berakhir tepat di jam mulai. Beri
        // durasi bawaan di sini kalau nanti ada edisi tanpa jam selesai.
        $keSelesai = ($this->selesai ?? $this->mulai)->getTimestamp() - $sekarang->getTimestamp();

        return $this->toShare() + [
            'status' => match (true) {
                $keMulai > 0 => 'akan datang',
                $keSelesai >= 0 => 'berlangsung',
                default => 'selesai',
            },
            'detik_tersisa' => max(0, $keMulai),
            // Jam server saat balasan dibuat, supaya pemakai bisa mengoreksi
            // detik_tersisa yang sudah menua di dalam cache.
            'sekarang' => $sekarang->timezone(self::ZONA)->toIso8601String(),
        ];
    }

    /**
     * Ubah tautan YouTube apa pun menjadi bentuk sematan. Admin boleh menempel
     * tautan biasa dari bilah alamat, tombol Bagikan, atau Shorts.
     */
    public function videoEmbed(): ?string
    {
        $id = self::idYoutube($this->video_url);

        return $id ? "https://www.youtube.com/embed/{$id}?autoplay=1&mute=1&playsinline=1" : null;
    }

    /**
     * Ambil id video dari bentuk watch?v=, youtu.be/, /embed/, /shorts/, atau
     * id telanjang. Mengembalikan null kalau bukan tautan YouTube.
     */
    public static function idYoutube(?string $url): ?string
    {
        $url = trim((string) $url);

        if ($url === '') {
            return null;
        }

        if (preg_match('~^[A-Za-z0-9_-]{11}$~', $url)) {
            return $url;
        }

        $pola = [
            '~youtube\.com/watch\?(?:.*&)?v=([A-Za-z0-9_-]{11})~i',
            '~youtu\.be/([A-Za-z0-9_-]{11})~i',
            '~youtube\.com/embed/([A-Za-z0-9_-]{11})~i',
            '~youtube\.com/shorts/([A-Za-z0-9_-]{11})~i',
            '~youtube\.com/live/([A-Za-z0-9_-]{11})~i',
        ];

        foreach ($pola as $satu) {
            if (preg_match($satu, $url, $cocok)) {
                return $cocok[1];
            }
        }

        return null;
    }

    private function jamLabel(): ?string
    {
        $mulai = $this->mulai?->timezone(self::ZONA);

        if (! $mulai) {
            return null;
        }

        $selesai = $this->selesai?->timezone(self::ZONA);

        return $selesai
            ? $mulai->format('H:i') . ' - ' . $selesai->format('H:i') . ' WIB'
            : $mulai->format('H:i') . ' WIB';
    }
}
