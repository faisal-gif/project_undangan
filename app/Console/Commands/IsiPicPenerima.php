<?php

namespace App\Console\Commands;

use App\Models\Tamu;
use Illuminate\Console\Command;

/**
 * Isi kolom PIC untuk 51 penerima penghargaan, dari berkas
 * "Penerima dengan PIC.xlsx".
 *
 * Undangannya sudah dikirim, jadi perintah ini sesempit mungkin:
 *
 *   - Baris dicari lewat KODE UNDANGAN. Berkas PIC memakai nama BARU (hasil
 *     Terbaru.xlsx) sementara basis data mungkin masih memakai nama lama,
 *     jadi mencocokkan lewat nama akan gagal atau - lebih buruk - mengenai
 *     baris yang salah. Pemetaan kode sudah diselesaikan di luar, dengan
 *     pencocokan PERSIS, karena nama seperti "Pemerintah Kabupaten X" hanya
 *     berbeda satu kata dan pencocokan samar memasangkannya silang.
 *   - HANYA kolom pic yang ditulis. Nama, lembaga, kategori, kode, meja,
 *     kursi, RSVP, dan status tidak disentuh.
 *   - Tidak ada baris yang dibuat atau dihapus.
 */
class IsiPicPenerima extends Command
{
    protected $signature = 'tamu:pic {--terapkan : Tulis PIC ke basis data}';

    protected $description = 'Isi PIC untuk penerima penghargaan dari berkas Penerima dengan PIC.xlsx';

    public function handle(): int
    {
        $terapkan = $this->option('terapkan');

        if (! $terapkan) {
            $this->warn('MODE COBA - tidak ada yang ditulis. Tambahkan --terapkan untuk menyimpan.');
            $this->newLine();
        }

        $hilang = [];
        $diisi = 0;
        $sama = 0;
        $tertimpa = [];
        $beban = [];

        foreach (self::DAFTAR as $p) {
            $tamu = Tamu::where('code', $p['kode'])->first();

            if (! $tamu) {
                $hilang[] = $p['kode'];

                continue;
            }

            $beban[$p['pic']] = ($beban[$p['pic']] ?? 0) + 1;

            if ($tamu->pic === $p['pic']) {
                $sama++;

                continue;
            }

            // PIC yang sudah terisi beda nilainya tidak dianggap wajar: bisa
            // jadi admin sudah mengubahnya sendiri lewat panel.
            if (filled($tamu->pic)) {
                $tertimpa[] = "{$p['kode']}  {$tamu->pic} -> {$p['pic']}";
            }

            $diisi++;
            $this->line(sprintf(
                '<fg=yellow>%s</>  %-46s  PIC <fg=red>%s</> -> <fg=green>%s</>',
                $tamu->code,
                mb_strimwidth($tamu->nama ?? '', 0, 46, '...'),
                $tamu->pic ?: '(kosong)',
                $p['pic']
            ));

            if ($terapkan) {
                $tamu->update(['pic' => $p['pic']]);
            }
        }

        $this->newLine();
        $this->line('Perlu diisi    : ' . $diisi);
        $this->line('Sudah sesuai   : ' . $sama);

        if ($hilang) {
            $this->newLine();
            $this->error('Kode tidak ditemukan di basis data (' . count($hilang) . '):');
            foreach ($hilang as $kode) {
                $this->line('  ' . $kode);
            }
        }

        if ($tertimpa) {
            $this->newLine();
            $this->error('PIC lama ditimpa - pastikan ini memang yang Anda mau:');
            foreach ($tertimpa as $t) {
                $this->line('  ' . $t);
            }
        }

        if ($beban) {
            arsort($beban);
            $this->newLine();
            $this->comment('Beban tiap PIC (penerima penghargaan saja):');
            foreach ($beban as $nama => $n) {
                $this->line(sprintf('  %-10s %d undangan', $nama, $n));
            }
        }

        $this->newLine();
        $this->comment('Catatan:');
        foreach (self::CATATAN as $c) {
            $this->line('  ' . $c);
        }

        if ($terapkan) {
            $this->newLine();
            $this->info('PIC tersimpan. Tidak ada kolom lain yang disentuh.');
        }

        return self::SUCCESS;
    }

    private const CATATAN = [
        'No 40 "Pemerintah Kabupaten Bondowoso" tidak ada di daftar ini: belum punya baris di basis data',
        'Tiga kode di bawah ikut diisi PIC walau namanya masih menunggu keputusan Anda -',
        '  PIC-nya sama siapa pun nama akhirnya: YNNC85RS (No 18), EBYAGOMP (No 22), TE9F98SS (No 30)',
        'Ejaan PIC dibiarkan apa adanya: No 1 dan 2 tertulis "AINUN", sisanya "Ainun"',
        'JUMLAH HADIR di berkas semuanya 2, sama dengan isi basis data, jadi tidak diubah',
    ];

    /**
     * kode undangan => PIC, hasil pencocokan persis dengan berkas
     * "Penerima dengan PIC.xlsx". Nomor di komentar adalah nomor baris berkas.
     */
    private const DAFTAR = [
        ['kode' => 'PMJTL8C8', 'pic' => 'AINUN'],  // 1 Dr. Fajar Riza Ul Haq, M.A.
        ['kode' => 'CKSHT2DG', 'pic' => 'AINUN'],  // 2 Nezar Patria, S.Fil., M.Sc., M.B.A.
        ['kode' => 'C2SYMVVO', 'pic' => 'Rudi'],  // 3 Dr. (H.C.) Dra. Hj. Khofifah Indar Parawansa, M.Si.
        ['kode' => 'EBHOKRLG', 'pic' => 'Hainor'],  // 4 Dr. Ernes Silvanus, S.Pi., M.M., M.H.
        ['kode' => 'FGN2TBA4', 'pic' => 'Hainor'],  // 5 Dr. R. Djoni Sudjatmoko, S.E., M.M.
        ['kode' => 'BI03AMKM', 'pic' => 'Dhina'],  // 6 dr. Ayu Widyaningrum, M.M., Master of AAAM
        ['kode' => 'VARQT1T0', 'pic' => 'Yuli'],  // 7 H. Syamsul Hadi, S.Sos., M.M.
        ['kode' => '5A49D4EX', 'pic' => 'Rudi'],  // 8 PT Dharma Lautan Utama
        ['kode' => 'YUACPHU4', 'pic' => 'Hainor'],  // 9 Prof. Dr. K.H. Nasaruddin Umar, M.A.
        ['kode' => 'KXOMQCVO', 'pic' => 'Dhina'],  // 10 Karina Icha, S.H.
        ['kode' => 'TISWMECB', 'pic' => 'Hainor'],  // 11 PT Superior Prima Sukses Tbk
        ['kode' => 'NODOTPOZ', 'pic' => 'Hainor'],  // 12 H. Widodo
        ['kode' => 'GDDSWNNT', 'pic' => 'Yuli'],  // 13 dr. Dhelya Widasmara, Sp.DVE, FINSDV, FAADV
        ['kode' => 'VM6UZZSS', 'pic' => 'Ainun'],  // 14 Yusuf Rio Wahyu Prayogo, S.Sos., M.SM.
        ['kode' => '94VMPAK4', 'pic' => 'Hainor'],  // 15 Prof. Dr. H. Hepni, S.Ag., M.M., CPEM.
        ['kode' => 'GNTSDJOA', 'pic' => 'Hainor'],  // 16 Ferry Hamid
        ['kode' => 'B5VVUEUR', 'pic' => 'Ainun'],  // 17 Dr. Ir. Budiar Anwar, M.Si.
        ['kode' => 'EOWJZBGF', 'pic' => 'Dhina'],  // 19 Siti Aisya, A.Md., S.T., M.M.
        ['kode' => '71MOA2FV', 'pic' => 'Yuli'],  // 20 Dwi Retno Palupi, M.Pd.
        ['kode' => 'MATOQR31', 'pic' => 'Yuli'],  // 21 Prof. Dr. Ir. Sutanto Hidayat, M.T.
        ['kode' => 'VPUFLWAS', 'pic' => 'Hainor'],  // 23 Pemerintah Kabupaten Probolinggo
        ['kode' => 'JGCRQAMM', 'pic' => 'Hainor'],  // 24 AKBP Dr. Gede Harimbawa, S.E., S.H., M.H., M.I.Kom.
        ['kode' => 'DBGTIYM2', 'pic' => 'Hainor'],  // 25 Eva Lestari, A.P., S.H., C.M.H.
        ['kode' => 'CBHNY353', 'pic' => 'Hainor'],  // 26 PT Freeport Indonesia
        ['kode' => 'KTFP2P9G', 'pic' => 'Ainun'],  // 27 AKBP Rulian Syauri, S.H., S.I.K., M.Si.
        ['kode' => 'OUKPE34P', 'pic' => 'Hainor'],  // 28 Ahmad Juhairi, S.IP., M.Phil.
        ['kode' => 'I2DWWWRT', 'pic' => 'Rudi'],  // 29 Dr. Ir. Nyono, S.T., S.H., IPU., ASEAN Eng.
        ['kode' => 'O4YG304B', 'pic' => 'Hainor'],  // 31 Dr. Gde Made Kartikajaya, SE, MM, M.AP, QGIA, CAFP.
        ['kode' => 'JI621DM7', 'pic' => 'Hainor'],  // 32 Drs. H. Eman Suherman, M.M.
        ['kode' => '59LDCORL', 'pic' => 'Hainor'],  // 33 Aeron Randi, A.P., M.P.
        ['kode' => 'NLR0H0H9', 'pic' => 'Hainor'],  // 34 Rd. Hendrian Surya Natanagara, S.E.
        ['kode' => '5TJJSCWA', 'pic' => 'Hainor'],  // 35 Anto Febrianto, M.Pd.
        ['kode' => 'OP8BGIJQ', 'pic' => 'Ainun'],  // 36 Amithya Ratnanggani Sirraduhita, S.S
        ['kode' => 'ZWI6QDHN', 'pic' => 'Ainun'],  // 37 Pemerintah Kabupaten Pasuruan
        ['kode' => '6XGPJ69I', 'pic' => 'Rudi'],  // 38 Dr. Hendro Puspito, S.E., M.PSDM.
        ['kode' => 'DRAQWUGC', 'pic' => 'Naning'],  // 39 Nur Vicky Wahyudi, S.Sn.
        ['kode' => '4BTHJ6CR', 'pic' => 'Rudi'],  // 41 AKBP Dr. Raden Erik Bangun Prakasa, S.H., S.I.K., M.
        ['kode' => 'BDZZTUU4', 'pic' => 'Ainun'],  // 42 Pemerintah Kota Malang
        ['kode' => 'TSJYMPQE', 'pic' => 'Hainor'],  // 43 H. Hari Wuryanto, S.H., M.Ak.
        ['kode' => 'GIFH8YBP', 'pic' => 'Imam'],  // 44 Iwhan Tri Cahyono
        ['kode' => 'RTBDNSPH', 'pic' => 'Hainor'],  // 45 MIN 1 Malang
        ['kode' => 'ZCWLGVI4', 'pic' => 'Hainor'],  // 46 Institut Agama Islam KH Ahmad Hasyim Muzadi
        ['kode' => 'P6MCVFRE', 'pic' => 'Hainor'],  // 47 Pemerintah Kabupaten Banyuwangi
        ['kode' => 'QOHXMM74', 'pic' => 'Hainor'],  // 48 Pemerintah Kabupaten Pacitan
        ['kode' => 'L5YZTH6B', 'pic' => 'Dhina'],  // 49 Gledy Webyansyah
        ['kode' => 'B2SDKOXX', 'pic' => 'Hainor'],  // 50 Dr. KH. Isroqunnajah, M.Ag.
        ['kode' => '0LUU1KHG', 'pic' => 'Hainor'],  // 51 MAN 2 Kota Malang
        ['kode' => '6AQRFKGQ', 'pic' => 'Fery'],  // 52 Pemerintah Kota Batu
        // Tiga baris yang namanya masih menunggu keputusan. Kodenya sudah
        // pasti - lihat PERLU_KEPUTUSAN di SelaraskanTamu - dan PIC-nya tidak
        // bergantung pada nama mana yang akhirnya dipakai.
        ['kode' => 'YNNC85RS', 'pic' => 'Hainor'],  // 18 Kantor Kemenag Kabupaten Bondowoso
        ['kode' => 'EBYAGOMP', 'pic' => 'Yuli'],  // 22 Pemerintah Kabupaten Malang
        ['kode' => 'TE9F98SS', 'pic' => 'Yuli'],  // 30 Hj. Jajuk Sulistyowati, S.E., M.M.
    ];
}
