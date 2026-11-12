<?php

namespace App\Console\Commands;

use App\Models\Acara;
use App\Models\Tamu;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

/**
 * Tambahkan tamu undangan biasa (bukan penerima penghargaan) dari dua
 * berkas: "Undangan Tamu.xlsx" (No 52-85) dan "Undangan External.xlsx"
 * (No 70-76, diberi awalan E di laporan karena nomornya bertabrakan).
 *
 * Aturannya kebalikan dari tamu:selaraskan: perintah ini HANYA membuat baris
 * baru, tidak pernah mengubah atau menghapus baris yang sudah ada. Undangan
 * untuk 51 penerima penghargaan sudah dikirim, jadi tidak boleh tersentuh.
 *
 * Baris dianggap sudah ada bila nama DAN lembaganya sama di edisi acara yang
 * sama. Namanya saja tidak cukup: ada tiga baris bernama "Pimpinan" yang
 * dibedakan hanya oleh lembaganya.
 */
class TambahTamuUndangan extends Command
{
    protected $signature = 'tamu:tambah {--terapkan : Tulis ke basis data}';

    protected $description = 'Tambahkan 35 tamu undangan dan external sebagai undangan baru';

    public function handle(): int
    {
        $acara = Acara::aktif();

        if (! $acara) {
            $this->error('Tidak ada acara yang aktif. Aktifkan satu edisi dulu.');

            return self::FAILURE;
        }

        $terapkan = $this->option('terapkan');

        if (! $terapkan) {
            $this->warn('MODE COBA - tidak ada yang ditulis. Tambahkan --terapkan untuk menyimpan.');
        }

        $this->line('Acara: ' . $acara->nama);
        $this->newLine();

        // Kode harus unik di seluruh tabel: tautan undangan dan QR memakainya.
        $terpakai = Tamu::whereNotNull('code')->pluck('code')->map('strtoupper')->flip();

        $baru = 0;
        $ada = 0;

        foreach (self::DAFTAR as $t) {
            $cocok = Tamu::where('acara_id', $acara->id)
                ->where('nama', $t['nama'])
                ->where('lembaga', $t['lembaga'])
                ->first();

            if ($cocok) {
                $ada++;
                $this->line(sprintf('  <fg=gray>%-3s sudah ada  %s  (%s)</>', $t['no'], $t['nama'], $cocok->code));

                continue;
            }

            $baru++;
            $this->line(sprintf('<fg=green>%-3s</> %s', $t['no'], $t['nama']));
            $this->line(sprintf('    %s', $t['lembaga'] ?: '(tanpa lembaga)'));
            $this->line(sprintf('    %d orang  |  PIC %s', $t['jumlah'], $t['pic'] ?: '-'));

            if (! $terapkan) {
                continue;
            }

            do {
                $kode = strtoupper(Str::random(8));
            } while ($terpakai->has($kode));

            $terpakai->put($kode, true);

            Tamu::create([
                'acara_id' => $acara->id,
                'code' => $kode,
                'jenis' => $t['jenis'] ?? 'hadir',
                'nama' => $t['nama'],
                'lembaga' => $t['lembaga'],
                'jumlah_orang' => $t['jumlah'],
                'pic' => $t['pic'],
                'status' => 'belum',
                'rsvp' => 'belum',
            ]);

            $this->line(sprintf('    <fg=yellow>kode %s</>', $kode));
        }

        $this->newLine();
        $this->line('Akan ditambah  : ' . $baru);
        $this->line('Sudah ada      : ' . $ada);

        $this->newLine();
        $this->comment('Catatan dari berkasnya:');
        foreach (self::CATATAN as $c) {
            $this->line('  ' . $c);
        }

        if ($terapkan) {
            $this->newLine();
            $this->info('Tersimpan. Tidak ada baris lama yang diubah atau dihapus.');
        }

        return self::SUCCESS;
    }

    private const CATATAN = [
        'No 65 Monica Felisitas Gracia - JUMLAH HADIR dan PIC kosong di berkas, dipakai 1 orang tanpa PIC',
        'No 56 Bayhaqi Kadmi (Gus Bay) - kolom LEMBAGA kosong di berkas',
        'No 71-76 tidak ada di Undangan Tamu.xlsx - celah itu diisi E71-E76 dari berkas external',
        'Kolom ALAMAT dan TELEPON kosong di seluruh berkas, jadi dibiarkan kosong',
        'No 83 "Pimpinan - Gudang Garam" terpisah dari penerima GIFH8YBP (Iwhan Tri Cahyono)',
        '7 baris E70-E76 dari Undangan External.xlsx: tanpa lembaga, tanpa PIC, 1 orang masing-masing',
        'Tidak ada penanda "external" di basis data - kolom jenis hanya punya hadir/penerima,',
        '  dan lembaga tidak dipakai sebagai label karena kolom itu tampil di undangan tamunya',
        'P40 Dr. H. Abdul Hamid Wahid, M.Ag. adalah PENERIMA, bukan tamu biasa -',
        '  kategori penghargaannya belum ada di berkas mana pun, isi lewat admin sebelum dikirim',
        'Dengan P40, total kursi yang dibutuhkan jadi 146 sedangkan denah baru punya 144',
    ];

    /**
     * Isi berkas "Undangan Tamu.xlsx" apa adanya, ditanam supaya hasil mode
     * coba sama persis dengan yang dijalankan sungguhan.
     */
    private const DAFTAR = [
        ['no' => '52', 'nama' => 'Ir R Agoes Soerjanto', 'lembaga' => 'Ketua PD XIII GM FKPPI Jatim', 'jumlah' => 1, 'pic' => 'Imad'],
        ['no' => '53', 'nama' => 'Rahmat', 'lembaga' => 'PT BAC', 'jumlah' => 1, 'pic' => 'Rahman'],
        ['no' => '54', 'nama' => 'Dr. Imam Fauzi Surahmat, S.AB, M.AB', 'lembaga' => 'LSI Jatim', 'jumlah' => 1, 'pic' => 'Hainor'],
        ['no' => '55', 'nama' => 'Sugito Adhi', 'lembaga' => 'Cluster General Manager Grand Mercure Malang Mirama', 'jumlah' => 2, 'pic' => 'Dhina'],
        ['no' => '56', 'nama' => 'Bayhaqi Kadmi (Gus Bay)', 'lembaga' => null, 'jumlah' => 1, 'pic' => 'Fery'],
        ['no' => '57', 'nama' => 'Wansesleus Manggut', 'lembaga' => 'Dewan Pakar AMSI', 'jumlah' => 1, 'pic' => 'Ainun'],
        ['no' => '58', 'nama' => 'Habib Ahmad', 'lembaga' => 'Darul Hadist', 'jumlah' => 1, 'pic' => 'Ainun'],
        ['no' => '59', 'nama' => 'Dwi Eko Lokononto', 'lembaga' => 'Berita Jatim', 'jumlah' => 1, 'pic' => 'Ainun'],
        ['no' => '60', 'nama' => 'Saptini Darmaningrum', 'lembaga' => 'AMSI Jatim', 'jumlah' => 1, 'pic' => 'Ainun'],
        ['no' => '61', 'nama' => 'Yuliana Kansrini', 'lembaga' => 'Plt Direktut Polbangtan Malang', 'jumlah' => 1, 'pic' => 'Ainun'],
        ['no' => '62', 'nama' => 'Titik S. Ariyanto', 'lembaga' => 'Manajer Marketing dan Public Relations (PR) di Jawa Timur Park (JTP) Group', 'jumlah' => 1, 'pic' => 'Fery'],
        ['no' => '63', 'nama' => 'Sujud Hariadi', 'lembaga' => 'Ketua PHRI Kota Batu', 'jumlah' => 1, 'pic' => 'Fery'],
        ['no' => '64', 'nama' => 'Sikstus Santos', 'lembaga' => 'General Manager Regional 2 East Area di PT. Varnion Technology Semesta', 'jumlah' => 1, 'pic' => 'Fery'],
        ['no' => '65', 'nama' => 'Monica Felisitas Gracia', 'lembaga' => 'Public Relations SPS Grup', 'jumlah' => 1, 'pic' => null],
        ['no' => '66', 'nama' => 'Pimpinan', 'lembaga' => 'PT Astra Agro Lestari', 'jumlah' => 2, 'pic' => 'Yuli'],
        ['no' => '67', 'nama' => 'Manager Cepu & ADK Field', 'lembaga' => 'PT Pertamina EP Cepu Field', 'jumlah' => 2, 'pic' => 'Novi'],
        ['no' => '68', 'nama' => 'External Engagement & Socioeconomic Manager ExxonMobil Cepu Limited', 'lembaga' => 'ExxonMobil', 'jumlah' => 2, 'pic' => 'Novi'],
        ['no' => '69', 'nama' => 'Kepala Perwakilan', 'lembaga' => 'SKK Migas Jabanusa', 'jumlah' => 2, 'pic' => 'Novi'],
        ['no' => '70', 'nama' => 'Pimpinan', 'lembaga' => 'AGS Berkah Jaya', 'jumlah' => 2, 'pic' => 'Hainor'],
        ['no' => '77', 'nama' => 'Yan Christian', 'lembaga' => 'Direktur PT Dwi Putra Sakti', 'jumlah' => 1, 'pic' => 'Yuli'],
        ['no' => '78', 'nama' => 'Ir. Maranatha Wijayaningtyas, S.T., M.MT., PhD, IPU, ASEAN Eng.', 'lembaga' => 'Dosen ITN', 'jumlah' => 1, 'pic' => 'Yuli'],
        ['no' => '79', 'nama' => 'Prof. Dr. Dyah Sawitri, S.E., M.M.', 'lembaga' => 'Kepala LLDIKTI Wilayah VII (Jawa Timur)', 'jumlah' => 1, 'pic' => 'Yuli'],
        ['no' => '80', 'nama' => 'Direktur Utama', 'lembaga' => 'Direktur Utama PT Intelegensia Grahatama (KEK Singhasari)', 'jumlah' => 1, 'pic' => 'Yuli'],
        ['no' => '81', 'nama' => 'Syahrul Karim', 'lembaga' => 'CEO CV Jawa Mulia', 'jumlah' => 1, 'pic' => 'Ainun'],
        ['no' => '82', 'nama' => 'H Fatkhurrosi', 'lembaga' => 'Ketua PC GP Ansor Kab Malang', 'jumlah' => 1, 'pic' => 'Ainun'],
        ['no' => '83', 'nama' => 'Pimpinan', 'lembaga' => 'Gudang Garam', 'jumlah' => 2, 'pic' => 'Imam'],
        ['no' => '84', 'nama' => 'Fifi Trisjanti', 'lembaga' => 'Dirut Lippo Mall Jatim', 'jumlah' => 1, 'pic' => 'Naning'],
        ['no' => '85', 'nama' => 'Very Ardianto', 'lembaga' => 'Ketua Ikatan Pengusaha Muslim Indonesia Malang Raya', 'jumlah' => 1, 'pic' => 'Naning'],

        // Berkas "Undangan External.xlsx" - No 70-76, diberi awalan E
        // karena nomornya bertabrakan dengan No 70 di berkas tamu biasa.
        // Tidak punya lembaga, dan "External" tidak ditaruh di kolom
        // lembaga karena kolom itu tampil di undangan tamunya.
        ['no' => 'E70', 'nama' => 'P. Anwar', 'lembaga' => null, 'jumlah' => 1, 'pic' => null],
        ['no' => 'E71', 'nama' => 'B. Elok', 'lembaga' => null, 'jumlah' => 1, 'pic' => null],
        ['no' => 'E72', 'nama' => 'B. Ida', 'lembaga' => null, 'jumlah' => 1, 'pic' => null],
        ['no' => 'E73', 'nama' => 'B. Naning', 'lembaga' => null, 'jumlah' => 1, 'pic' => null],
        ['no' => 'E74', 'nama' => 'P. Ainun', 'lembaga' => null, 'jumlah' => 1, 'pic' => null],
        ['no' => 'E75', 'nama' => 'P. Yuli', 'lembaga' => null, 'jumlah' => 1, 'pic' => null],
        ['no' => 'E76', 'nama' => 'P. Wahyu', 'lembaga' => null, 'jumlah' => 1, 'pic' => null],

        // Satu-satunya penerima penghargaan di daftar ini. Dia ada di
        // "Update Undangan Penerima.xlsx" No 40 tapi belum punya baris di
        // basis data, jadi undangannya dibuat di sini. Kategori
        // penghargaannya tidak ada di berkas itu, jadi masih kosong dan
        // harus diisi lewat admin sebelum undangannya dikirim.
        ['no' => 'P40', 'nama' => 'Dr. H. Abdul Hamid Wahid, M.Ag.', 'lembaga' => 'Bupati Bondowoso', 'jumlah' => 2, 'pic' => 'Hainor', 'jenis' => 'penerima'],
    ];
}
