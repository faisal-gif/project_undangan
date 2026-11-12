<?php

namespace App\Console\Commands;

use App\Models\Tamu;
use Illuminate\Console\Command;

/**
 * Selaraskan data tamu dengan daftar pemenang terbaru.
 *
 * Undangannya sudah dikirim, jadi aturannya ketat:
 *
 *   - Baris dicari lewat KODE UNDANGAN, bukan nama. Kode itulah yang ada di
 *     tautan dan QR yang sudah beredar; mencari lewat nama berisiko mengenai
 *     baris yang salah justru karena namanya yang sedang diperbaiki.
 *   - Kolom code, meja, kursi, rsvp, rsvp_pada, dan status tidak pernah
 *     disentuh. Tautan tetap hidup, tempat duduk tetap, konfirmasi tetap.
 *   - Tidak ada baris yang dibuat atau dihapus.
 *
 * Pasangan di bawah sudah ditentukan dari hasil pencocokan dengan berkas
 * Terbaru.xlsx, bukan ditebak saat dijalankan - supaya hasilnya sama persis
 * dengan yang ditinjau saat mode coba.
 *
 * Nama dan lembaga kemudian ditimpa oleh "Update Undangan Penerima.xlsx" di
 * 14 baris, dan 2 baris yang dulu menunggu keputusan ikut ditambahkan. Kolom
 * kategori dan sub tidak ada di berkas itu, jadi tetap dari Terbaru.xlsx.
 * Sel LEMBAGA yang kosong di berkas baru dianggap "tidak diisi", bukan
 * "dikosongkan" - lihat PERLU_KEPUTUSAN.
 */
class SelaraskanTamu extends Command
{
    protected $signature = 'tamu:selaraskan {--terapkan : Tulis perubahan ke basis data}';

    protected $description = 'Selaraskan nama, lembaga, dan kategori tamu dengan daftar pemenang terbaru';

    public function handle(): int
    {
        $terapkan = $this->option('terapkan');

        if (! $terapkan) {
            $this->warn('MODE COBA - tidak ada yang ditulis. Tambahkan --terapkan untuk menyimpan.');
            $this->newLine();
        }

        $hilang = [];
        $berubah = 0;
        $sama = 0;

        foreach (self::PERUBAHAN as $p) {
            $tamu = Tamu::where('code', $p['kode'])->first();

            if (! $tamu) {
                $hilang[] = $p['kode'];

                continue;
            }

            $beda = $this->beda($tamu, $p);

            if (! $beda) {
                $sama++;

                continue;
            }

            $berubah++;
            $this->baris($tamu, $beda);

            if ($terapkan) {
                $tamu->update([
                    'nama' => $p['nama'],
                    'lembaga' => $p['lembaga'],
                    'kategori_penghargaan' => $p['kategori'],
                    'sub_kategori' => $p['sub'],
                ]);
            }
        }

        $this->newLine();
        $this->line('Perlu diubah   : ' . $berubah);
        $this->line('Sudah sesuai   : ' . $sama);

        if ($hilang) {
            $this->newLine();
            $this->error('Kode tidak ditemukan di basis data (' . count($hilang) . '):');
            foreach ($hilang as $kode) {
                $this->line('  ' . $kode);
            }
        }

        $this->newLine();
        $this->comment('Tidak ikut diubah - perlu keputusan Anda:');
        foreach (self::PERLU_KEPUTUSAN as $k) {
            $this->line('  ' . $k);
        }

        if ($terapkan) {
            $this->newLine();
            $this->info('Perubahan disimpan. Kode undangan, meja, kursi, dan RSVP tidak disentuh.');
        }

        return self::SUCCESS;
    }

    /**
     * Medan yang nilainya berbeda, beserta nilai lama dan barunya.
     */
    private function beda(Tamu $tamu, array $p): array
    {
        $peta = [
            'nama' => ['Nama', $tamu->nama],
            'lembaga' => ['Lembaga', $tamu->lembaga],
            'kategori' => ['Kategori', $tamu->kategori_penghargaan],
            'sub' => ['Subkategori', $tamu->sub_kategori],
        ];

        $beda = [];

        foreach ($peta as $kunci => [$label, $lama]) {
            if ((string) $lama !== (string) $p[$kunci]) {
                $beda[] = [$label, $lama, $p[$kunci]];
            }
        }

        return $beda;
    }

    private function baris(Tamu $tamu, array $beda): void
    {
        $duduk = $tamu->meja ? "  |  meja {$tamu->meja} kursi {$tamu->kursi}" : '';
        $rsvp = $tamu->rsvp && $tamu->rsvp !== 'belum' ? "  |  RSVP {$tamu->rsvp}" : '';

        $this->line("<fg=yellow>{$tamu->code}</>  {$tamu->nama}{$duduk}{$rsvp}");

        foreach ($beda as [$label, $lama, $baru]) {
            $this->line(sprintf('    %-12s <fg=red>%s</>', $label, $lama ?: '(kosong)'));
            $this->line(sprintf('    %-12s <fg=green>%s</>', '', $baru ?: '(kosong)'));
        }

        $this->newLine();
    }

    /**
     * Baris yang sengaja tidak diotomatiskan, lengkap dengan alasannya.
     */
    private const PERLU_KEPUTUSAN = [
        'LEMBAGA KOSONG di berkas baru - dibiarkan seperti sekarang, bukan dikosongkan -',
        '  GDDSWNNT (No 13) Dokter spesialis kulit dan kelamin/Akademisi',
        '  GNTSDJOA (No 16) Tokoh peduli masyarakat Malang Raya',
        '  MATOQR31 (No 21) Pakar Manajemen Infrastruktur dan Ekonomi Pembangunan',
        '  DRAQWUGC (No 39) Pengusaha Kota Batu',
        '94VMPAK4 (No 15) berkas baru menghapus "(wafat 19 Juni 2026)" dari lembaga - dibiarkan',
        'KXOMQCVO (No 10) berkas baru menulis "MErah" dan membuang "Aktris dan" serta "Laskar" - dipakai apa adanya',
        'No 40 Dr. H. Abdul Hamid Wahid, M.Ag. (Bupati Bondowoso) belum ada di basis data -',
        '  dibuatkan undangan baru oleh tamu:tambah, kategori penghargaannya masih kosong',
    ];

    private const PERUBAHAN = [
        ['kode' => 'CKSHT2DG', 'nama' => 'Nezar Patria, S.Fil., M.Sc., M.B.A.', 'lembaga' => 'Wakil Menteri Komunikasi dan Digital RI',
            'kategori' => 'Innovation in Digital Transformation', 'sub' => 'Best Innovation in Digital Transformation Policy'],
        ['kode' => 'C2SYMVVO', 'nama' => 'Dr. (H.C.) Dra. Hj. Khofifah Indar Parawansa, M.Si.', 'lembaga' => 'Gubernur Jawa Timur',
            'kategori' => 'Innovation in Government', 'sub' => 'Best Innovation in Sustainable Economic Connectivity'],
        ['kode' => 'EBHOKRLG', 'nama' => 'Dr. Ernes Silvanus, S.Pi., M.M., M.H.', 'lembaga' => 'Sekda Kabupaten Malinau',
            'kategori' => 'Innovation in Community Empowerment', 'sub' => 'Best Innovation in Sports Community Development'],
        ['kode' => 'VARQT1T0', 'nama' => 'H. Syamsul Hadi, S.Sos., M.M.', 'lembaga' => 'Direktur Utama Perumda Tirta Kanjuruhan',
            'kategori' => 'Man of The Year', 'sub' => 'Outstanding Leadership in Public Utility Services'],
        ['kode' => '5A49D4EX', 'nama' => 'Pimpinan', 'lembaga' => 'PT Dharma Lautan Utama',
            'kategori' => 'Innovation in Business Excellence', 'sub' => 'Best Innovation in Maritime Transportation Services'],
        ['kode' => 'YUACPHU4', 'nama' => 'Prof. Dr. K.H. Nasaruddin Umar, M.A.', 'lembaga' => 'Menteri Agama RI',
            'kategori' => 'Positive News Maker', 'sub' => 'Outstanding Leadership in Religious Affairs'],
        ['kode' => 'KXOMQCVO', 'nama' => 'Karina Icha, S.H.', 'lembaga' => 'Ketua Srikandi MErah Putih',
            'kategori' => 'Woman of The Year', 'sub' => 'Outstanding Woman in Social and Community Leadership'],
        ['kode' => 'TISWMECB', 'nama' => 'Pimpinan', 'lembaga' => 'PT Superior Prima Sukses Tbk',
            'kategori' => 'Innovation in Sustainability', 'sub' => 'Best Innovation in Green Manufacturing and Renewable Energy'],
        ['kode' => 'NODOTPOZ', 'nama' => 'H. Widodo', 'lembaga' => 'Penggagas Pelangi Kapuas Park',
            'kategori' => 'Innovation in Environment', 'sub' => 'Best Innovation in Community-Based Environmental Development'],
        ['kode' => 'GDDSWNNT', 'nama' => 'dr. Dhelya Widasmara, Sp.DVE, FINSDV, FAADV', 'lembaga' => 'Dokter spesialis kulit dan kelamin/Akademisi',
            'kategori' => 'Innovation in Digital Transformation', 'sub' => 'Best Innovation in Dermatology and Public Health Education'],
        ['kode' => 'VM6UZZSS', 'nama' => 'Yusuf Rio Wahyu Prayogo, S.Sos., M.SM.', 'lembaga' => 'Bupati Situbondo',
            'kategori' => 'Regional Positive News Maker Jatim', 'sub' => 'Excellent Leader in Digital Communication'],
        ['kode' => 'GNTSDJOA', 'nama' => 'Ferry Hamid', 'lembaga' => 'Tokoh peduli masyarakat Malang Raya',
            'kategori' => 'Innovation in Social Impact', 'sub' => 'Best Innovation in Community Social Action'],
        ['kode' => 'B5VVUEUR', 'nama' => 'Dr. Ir. Budiar Anwar, M.Si.', 'lembaga' => 'Sekretaris Daerah Kabupaten Malang',
            'kategori' => 'Innovation in Government', 'sub' => 'Best Innovation in Bureaucratic Governance'],
        ['kode' => 'EOWJZBGF', 'nama' => 'Siti Aisya, A.Md., S.T., M.M.', 'lembaga' => 'CEO PT Fortuna Badja Inti',
            'kategori' => 'Innovation in Business Excellence', 'sub' => 'Best Innovation in Industrial Supply Chain Development'],
        ['kode' => '71MOA2FV', 'nama' => 'Dwi Retno Palupi, M.Pd.', 'lembaga' => 'Kepala MTs Al Maarif 01 Singosari',
            'kategori' => 'Woman of The Year', 'sub' => 'Outstanding Woman in Child-Friendly and Inclusive Education'],
        ['kode' => 'MATOQR31', 'nama' => 'Prof. Dr. Ir. Sutanto Hidayat, M.T.', 'lembaga' => 'Pakar Manajemen Infrastruktur dan Ekonomi Pembangunan',
            'kategori' => 'Innovation in Education', 'sub' => 'Excellent in Infrastructure Development and Economic Strategist'],
        ['kode' => 'VPUFLWAS', 'nama' => 'dr. H. Mohammad Haris, M.Kes', 'lembaga' => 'Bupati Probolinggo',
            'kategori' => 'Innovation in Government', 'sub' => 'Best Innovation in Sustainable Nature Tourism Development'],
        ['kode' => 'JGCRQAMM', 'nama' => 'AKBP Dr. Gede Harimbawa, S.E., S.H., M.H., M.I.Kom.', 'lembaga' => 'Kapolres Ngada, Polda NTT',
            'kategori' => 'Innovation in Education', 'sub' => 'Best Innovation in Public Education and Literacy'],
        ['kode' => 'DBGTIYM2', 'nama' => 'Eva Lestari, A.P., S.H., C.M.H.', 'lembaga' => 'Pendiri EL-Law Office',
            'kategori' => 'Innovation in Integrity Movement', 'sub' => 'Best Innovation in Legal Integrity and Advocacy'],
        ['kode' => 'CBHNY353', 'nama' => 'Pimpinan', 'lembaga' => 'PT Freeport Indonesia',
            'kategori' => 'Innovation in Social Impact', 'sub' => 'Best Innovation in Community Empowerment and Environment'],
        ['kode' => 'KTFP2P9G', 'nama' => 'AKBP Rulian Syauri, S.H., S.I.K., M.Si.', 'lembaga' => 'Kapolres Malang',
            'kategori' => 'Innovation in Public Service', 'sub' => 'Best Achievement in Counter-Drug Trafficking'],
        ['kode' => 'I2DWWWRT', 'nama' => 'Dr. Ir. Nyono, S.T., S.H., IPU., ASEAN Eng.', 'lembaga' => 'Kepala Dinas Perhubungan Provinsi Jawa Timur',
            'kategori' => 'Innovation in Public Service', 'sub' => 'Best Innovation in Transportation Public Services'],
        ['kode' => 'B2SDKOXX', 'nama' => 'Dr. KH. Isroqunnajah, M.Ag.', 'lembaga' => 'Ketua PCNU Kota Malang',
            'kategori' => 'Regional Man of The Year', 'sub' => 'Outstanding Leadership in Religious and Community Affairs – Malang'],
        ['kode' => '0LUU1KHG', 'nama' => 'Kepala', 'lembaga' => 'MAN 2 Kota Malang',
            'kategori' => 'Innovation in Education', 'sub' => 'Best Innovation in Digital Madrasah Education'],
        ['kode' => 'JI621DM7', 'nama' => 'Drs. H. Eman Suherman, M.M.', 'lembaga' => 'Bupati Majalengka',
            'kategori' => 'Regional Positive News Maker Jabar', 'sub' => 'Best Innovation in Regional Development Leadership'],
        ['kode' => 'NLR0H0H9', 'nama' => 'Rd. Hendrian Surya Natanagara, S.E.', 'lembaga' => 'Ketua Kadin Majalengka',
            'kategori' => 'Innovation in Creative Economy', 'sub' => 'Best Innovation in Regional Business Development'],
        ['kode' => 'OP8BGIJQ', 'nama' => 'Amithya Ratnanggani Sirraduhita, S.S', 'lembaga' => 'Ketua DPRD Kota Malang',
            'kategori' => 'Innovation in Social Impact', 'sub' => 'Best Innovation in Women\'s Social Participation'],
        ['kode' => 'ZWI6QDHN', 'nama' => 'H. Mochamad Rusdi Sutejo, S.M.', 'lembaga' => 'Bupati Pasuruan',
            'kategori' => 'Innovation in Government', 'sub' => 'Best Innovation in Public Healthcare Service and Economic Empowerment'],
        ['kode' => 'BDZZTUU4', 'nama' => 'Dr. Ir. Wahyu Hidayat, M.M', 'lembaga' => 'Wali Kota Malang',
            'kategori' => 'Innovation in Government', 'sub' => null],
        ['kode' => '6XGPJ69I', 'nama' => 'Dr. Hendro Puspito, S.E., M.PSDM.', 'lembaga' => 'Direktur Utama PT Sinergi Inti Mineral',
            'kategori' => 'Innovation in Education', 'sub' => 'Best Innovation in Industry-Based Education'],
        ['kode' => '6AQRFKGQ', 'nama' => 'Nurochman, S.H., M.H.', 'lembaga' => 'Wali Kota Batu',
            'kategori' => 'Innovation in Public Service', 'sub' => 'Best Innovation in Local Public Services'],
        ['kode' => '4BTHJ6CR', 'nama' => 'AKBP Dr. Raden Erik Bangun Prakasa, S.H., S.I.K., M.M.', 'lembaga' => 'Kapolres Mojokerto',
            'kategori' => 'Innovation in Social Impact', 'sub' => 'Best Innovation in Community Public Safety'],
        ['kode' => 'GIFH8YBP', 'nama' => 'Iwhan Tri Cahyono', 'lembaga' => 'Public Relation Manager Gudang Garam',
            'kategori' => 'Innovation in Business Excellence', 'sub' => 'Best Innovation in Corporate Communication'],
        ['kode' => 'RTBDNSPH', 'nama' => 'Kepala', 'lembaga' => 'MIN 1 Malang',
            'kategori' => 'Innovation in Education', 'sub' => 'Best Innovation in Primary Education'],
        ['kode' => 'ZCWLGVI4', 'nama' => 'Kepala', 'lembaga' => 'Institut Agama Islam KH Ahmad Hasyim Muzadi',
            'kategori' => 'Innovation in Education', 'sub' => 'Best Innovation in Islamic Higher Education'],
        ['kode' => 'P6MCVFRE', 'nama' => 'Hj. Ipuk Fiestiandani Azwar Anas, S.Pd., M.KP.', 'lembaga' => 'Bupati Banyuwangi',
            'kategori' => 'Innovation in Public Service', 'sub' => 'Best Innovation in Digital and Accessible Public Services'],
        ['kode' => 'QOHXMM74', 'nama' => 'Indrata Nur Bayuaji, S.S.', 'lembaga' => 'Bupati Pacitan',
            'kategori' => 'Innovation in Public Service', 'sub' => 'Best Innovation in Inclusive Regional Public Service'],
        ['kode' => 'L5YZTH6B', 'nama' => 'Gledy Webyansyah', 'lembaga' => 'Marketing Communication',
            'kategori' => 'Innovation in Business Excellence', 'sub' => 'Innovative Marcom and Public Relation Campaign Strategist'],
        ['kode' => 'TSJYMPQE', 'nama' => 'H. Hari Wuryanto, S.H., M.Ak.', 'lembaga' => 'Bupati Madiun',
            'kategori' => 'Innovation in Public Service', 'sub' => 'Best Innovation in Decentralized Public Service Delivery'],
        ['kode' => 'O4YG304B', 'nama' => 'Dr. Gde Made Kartikajaya, SE, MM, M.AP, QGIA, CAFP.', 'lembaga' => 'Komisaris Utama PT. Multi Nitrotama Kimia',
            'kategori' => 'Innovation in Public Service', 'sub' => 'Best Innovation in Youth Empowerment'],

        // Dua baris yang dulu menunggu keputusan, sekarang dijawab oleh
        // "Update Undangan Penerima.xlsx". Kategori dan sub sengaja disalin
        // apa adanya dari basis data supaya kedua kolom itu tidak berubah.
        ['kode' => 'YNNC85RS', 'nama' => 'Kepala', 'lembaga' => 'Kantor Kemenag Kabupaten Bondowoso',
            'kategori' => 'Innovation in Public Service', 'sub' => 'Best Innovation in Religious Public Services'],
        ['kode' => 'TE9F98SS', 'nama' => 'Hj. Jajuk Sulistyowati, S.E., M.M.', 'lembaga' => 'Anggota DPRD Provinsi Jawa Timur',
            'kategori' => 'Woman of The Year', 'sub' => null],
    ];
}
