<?php

namespace Database\Seeders;

use App\Models\Acara;
use App\Models\Tamu;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Daftar penerima penghargaan, disalin dari berkas "List Pemenang.xlsx".
 *
 * Masuk ke edisi acara yang sedang aktif sebagai tamu berjenis "penerima",
 * sehingga undangan mereka memakai versi penerima penghargaan.
 *
 * Dicocokkan berdasarkan nama di dalam satu edisi, jadi seeder ini aman
 * dijalankan berulang: nama yang sudah ada diperbarui, bukan digandakan. Kode
 * undangannya tidak pernah diganti - tautan yang sudah dibagikan ke tamu harus
 * tetap hidup.
 */
class PemenangUndanganSeeder extends Seeder
{
    public function run(): void
    {
        $acara = Acara::aktif();

        if (! $acara) {
            $this->command?->warn('Tidak ada acara aktif. Daftar pemenang dilewati.');

            return;
        }

        $baru = 0;
        $diperbarui = 0;

        foreach (self::PEMENANG as $p) {
            $tamu = Tamu::firstOrNew([
                'acara_id' => $acara->id,
                'nama' => $p['nama'],
            ]);

            $tamu->fill([
                'lembaga' => $p['lembaga'] ?: null,
                'jenis' => 'penerima',
                'kategori_penghargaan' => $p['kategori'] ?: null,
                'sub_kategori' => $p['sub'] ?: null,
            ]);

            if ($tamu->exists) {
                $diperbarui++;
            } else {
                $baru++;
                $tamu->code = self::kodeUnik();
                $tamu->jumlah_orang = 2;
                $tamu->status = 'belum';
            }

            $tamu->save();
        }

        $this->command?->info("Pemenang: {$baru} ditambahkan, {$diperbarui} diperbarui.");
    }

    private static function kodeUnik(): string
    {
        do {
            $kode = strtoupper(Str::random(8));
        } while (Tamu::where('code', $kode)->exists());

        return $kode;
    }

    private const PEMENANG = [
        ['nama' => 'Dr. Fajar Riza Ul Haq, M.A.', 'lembaga' => 'Wakil Menteri Pendidikan Dasar dan Menengah RI', 'kategori' => 'Innovation in Education', 'sub' => 'Best Innovation in Basic Education Transformation'],
        ['nama' => 'Nezar Patria, S.Fil., M.Sc., M.B.A.', 'lembaga' => 'Wakil Menteri Komunikasi dan Digital RI', 'kategori' => 'Innovation in Digital Transformation', 'sub' => 'Best Innovation in Digital Governance'],
        ['nama' => 'Khofifah Indar Parawansa, M.Si.', 'lembaga' => 'Gubernur Jawa Timur', 'kategori' => 'Innovation in Government', 'sub' => 'Best Innovation in Regional Government Leadership'],
        ['nama' => 'Dr. Ernes Silvanus, S.Pi., M.M., M.H.', 'lembaga' => 'Sekda Kabupaten Malinau/Ketua Umum KONI Malinau', 'kategori' => 'Innovation in Government', 'sub' => 'Best Innovation in Regional Governance'],
        ['nama' => 'Dr. R. Djoni Sudjatmoko, S.E., M.M.', 'lembaga' => 'Tokoh pemerhati dan penggerak UMKM nasional', 'kategori' => 'Innovation in Community Empowerment', 'sub' => 'Best Innovation in MSME Empowerment'],
        ['nama' => 'dr. Ayu Widyaningrum, M.M., Master of AAAM', 'lembaga' => 'Praktisi kesehatan dan estetika', 'kategori' => 'Innovation in Social Impact', 'sub' => 'Best Innovation in Healthcare and Social Contribution'],
        ['nama' => 'H. Syamsul Hadi, S.Sos., M.M.', 'lembaga' => 'Direktur Utama Perumda Tirta Kanjuruhan', 'kategori' => 'Man of The Year', 'sub' => 'Outstanding Leadership in Public Service'],
        ['nama' => 'PT Dharma Lautan Utama', 'lembaga' => 'Perusahaan transportasi laut', 'kategori' => 'Innovation in Business Excellence', 'sub' => 'Best Innovation in Maritime Transportation'],
        ['nama' => 'Prof. Dr. K.H. Nasaruddin Umar, M.A.', 'lembaga' => 'Menteri Agama RI', 'kategori' => 'Man of The Year', 'sub' => 'Outstanding National Leadership in Religious Affairs'],
        ['nama' => 'Karina Icha, S.H.', 'lembaga' => 'Aktris dan Ketua Srikandi Laskar Merah Putih', 'kategori' => 'Woman of The Year', 'sub' => 'Outstanding Woman Leadership in Creative Industry and Organization'],
        ['nama' => 'PT Superior Prima Sukses Tbk', 'lembaga' => 'Perusahaan manufaktur', 'kategori' => 'Innovation in Business Excellence', 'sub' => 'Best Innovation in Building Materials Manufacturing'],
        ['nama' => 'H. Widodo', 'lembaga' => 'Tokoh masyarakat/Penggagas Pelangi Kapuas Park', 'kategori' => 'Innovation in Environment', 'sub' => 'Best Innovation in Community-Based Environmental Development'],
        ['nama' => 'dr. Dhelya Widasmara, Sp.DVE, FINSDV, FAADV', 'lembaga' => 'Dokter spesialis kulit dan kelamin/Akademisi', 'kategori' => 'Innovation in Social Impact', 'sub' => 'Best Innovation in Dermatology and Public Health Education'],
        ['nama' => 'Yusuf Rio Wahyu Prayogo, S.Sos., M.SM.', 'lembaga' => 'Bupati Situbondo', 'kategori' => 'Positive News Maker', 'sub' => 'Regional Positive News Maker – Situbondo'],
        ['nama' => 'Prof. Dr. H. Hepni, S.Ag., M.M., CPEM.', 'lembaga' => 'Rektor UIN KHAS Jember periode 2023–2027 (wafat 19 Juni 2026)', 'kategori' => 'Innovation in Education', 'sub' => 'Best Innovation in Higher Education Leadership'],
        ['nama' => 'Ferry Hamid', 'lembaga' => 'Tokoh peduli masyarakat Malang Raya', 'kategori' => 'Innovation in Social Impact', 'sub' => 'Best Innovation in Social and Community Contribution'],
        ['nama' => 'Dr. Ir. Budiar Anwar, M.Si.', 'lembaga' => 'Sekretaris Daerah Kabupaten Malang', 'kategori' => 'Innovation in Government', 'sub' => 'Best Innovation in Bureaucratic Transformation'],
        ['nama' => 'H. Moh. Ali Masyhur, S.Ag., M.HI.', 'lembaga' => 'Kepala Kantor Kemenag Kabupaten Bondowoso', 'kategori' => 'Innovation in Public Service', 'sub' => 'Best Innovation in Religious Public Services'],
        ['nama' => 'Siti Aisya, A.Md., S.T., M.M.', 'lembaga' => 'CEO PT Fortuna Badja Inti', 'kategori' => 'Woman of The Year', 'sub' => 'Outstanding Woman Leadership in Business'],
        ['nama' => 'Dwi Retno Palupi, M.Pd.', 'lembaga' => 'Kepala MTs Al Ma\'arif 01 Singosari', 'kategori' => 'Innovation in Education', 'sub' => 'Best Innovation in Madrasah Education Development'],
        ['nama' => 'Prof. Dr. Ir. Sutanto Hidayat, M.T.', 'lembaga' => 'Pakar Manajemen Infrastruktur dan Ekonomi Pembangunan', 'kategori' => 'Innovation in Technology', 'sub' => 'Best Innovation in Infrastructure and Development Technology'],
        ['nama' => 'Drs. H. M. Sanusi, M.M.', 'lembaga' => 'Bupati Malang', 'kategori' => 'Innovation in Government', 'sub' => 'Best Innovation in Regional Development Leadership'],
        ['nama' => 'Pemerintah Kabupaten Probolinggo', 'lembaga' => 'Instansi Pemerintah Daerah', 'kategori' => 'Innovation in Government', 'sub' => 'Best Innovation in Local Government Programs'],
        ['nama' => 'AKBP Dr. Gede Harimbawa, S.E., S.H., M.H., M.I.Kom.', 'lembaga' => 'Kapolres Ngada, Polda NTT', 'kategori' => 'Innovation in Integrity Movement', 'sub' => 'Best Innovation in Law Enforcement Integrity'],
        ['nama' => 'Eva Lestari, A.P., S.H., C.M.H.', 'lembaga' => 'Pendiri EL-Law Office', 'kategori' => 'Innovation in Integrity Movement', 'sub' => 'Best Innovation in Legal Advocacy and Public Integrity'],
        ['nama' => 'PT Freeport Indonesia – Smelter Gresik', 'lembaga' => 'Perusahaan/Industri', 'kategori' => 'Innovation in Sustainability', 'sub' => 'Best Innovation in Sustainable Mineral Processing'],
        ['nama' => 'AKBP Rulian Syauri, S.H., S.I.K., M.Si.', 'lembaga' => 'Kapolres Malang', 'kategori' => 'Innovation in Integrity Movement', 'sub' => 'Best Innovation in Community Policing and Public Safety'],
        ['nama' => 'Ahmad Juhairi, S.IP., M.Phil.', 'lembaga' => 'Anggota DPRD Kabupaten Sumenep', 'kategori' => 'Innovation in Community Empowerment', 'sub' => 'Best Innovation in Coastal Community Empowerment'],
        ['nama' => 'Dr. Ir. Nyono, S.T., S.H., IPU', 'lembaga' => 'Kepala Dinas Perhubungan Provinsi Jawa Timur', 'kategori' => 'Innovation in Public Service', 'sub' => 'Best Innovation in Transportation Services'],
        ['nama' => 'Dr. KH. Isroqunnajah, M.Ag.', 'lembaga' => 'Ketua PCNU Kota Malang', 'kategori' => 'Man of The Year', 'sub' => 'Man of The Year – Kota Malang'],
        ['nama' => 'MAN 2 Kota Malang', 'lembaga' => 'Lembaga pendidikan', 'kategori' => 'Innovation in Education', 'sub' => 'Best Innovation in Madrasah Education Excellence'],
        ['nama' => 'Drs. H. Eman Suherman, M.M.', 'lembaga' => 'Bupati Majalengka', 'kategori' => 'Innovation in Government', 'sub' => 'Best Innovation in Regional Governance'],
        ['nama' => 'Aeron Randi, A.P., M.P.', 'lembaga' => 'Sekretaris Daerah Majalengka', 'kategori' => 'Innovation in Public Service', 'sub' => 'Best Innovation in Bureaucratic Public Services'],
        ['nama' => 'Rd. Hendrian Surya Natanagara, S.E.', 'lembaga' => 'Ketua Kadin Majalengka', 'kategori' => 'Innovation in Business Excellence', 'sub' => 'Best Innovation in Regional Business Ecosystem'],
        ['nama' => 'Anto Febrianto, M.Pd.', 'lembaga' => 'Ketua KNPI Majalengka', 'kategori' => 'Innovation in Community Empowerment', 'sub' => 'Best Innovation in Youth Empowerment'],
        ['nama' => 'Amithya Ratnanggani Sirraduhita', 'lembaga' => 'Tokoh politisi perempuan Jawa Timur', 'kategori' => 'Innovation in Social Impact', 'sub' => 'Best Innovation in Women\'s Social Contribution'],
        ['nama' => 'Pemerintah Kabupaten Pasuruan', 'lembaga' => 'Instansi Pemerintah Daerah', 'kategori' => 'Innovation in Government', 'sub' => 'Best Innovation in Local Government Programs'],
        ['nama' => 'Pemerintah Kota Malang', 'lembaga' => 'Instansi Pemerintah Daerah', 'kategori' => 'Innovation in Government', 'sub' => 'Best Innovation in Urban Governance'],
        ['nama' => 'Dr. Hendro Puspito, S.E., M.PSDM.', 'lembaga' => 'Direktur Utama PT Sinergi Inti Mineral', 'kategori' => 'Innovation in Education', 'sub' => 'Best Innovation in Industry–Education Collaboration'],
        ['nama' => 'Nur Vicky Wahyudi, S.Sn.', 'lembaga' => 'Pengusaha Kota Batu', 'kategori' => 'Innovation in Business Excellence', 'sub' => 'Best Innovation in Creative Entrepreneurship'],
        ['nama' => 'Pemerintah Kota Batu', 'lembaga' => 'Instansi Pemerintah Daerah', 'kategori' => 'Innovation in Public Service', 'sub' => 'Best Innovation in Regional Public Services'],
        ['nama' => 'Mahenda Abdillah Kamil', 'lembaga' => 'Ketua Pengprov ORADO Jawa Timur', 'kategori' => 'Innovation in Social Impact', 'sub' => 'Best Innovation in Sports Community Development'],
        ['nama' => 'Iwhan Tri Cahyono', 'lembaga' => 'Public Relation Manager Gudang Garam', 'kategori' => 'Innovation in Business Excellence', 'sub' => 'Best Innovation in Corporate Communication and Stakeholder Relations'],
        ['nama' => 'MIN 1 Malang', 'lembaga' => 'Instansi pendidikan', 'kategori' => 'Innovation in Education', 'sub' => 'Best Innovation in Madrasah Education Development'],
        ['nama' => 'IAI KH Hasyim Muzadi', 'lembaga' => 'Lembaga pendidikan', 'kategori' => 'Innovation in Education', 'sub' => 'Best Innovation in Islamic Higher Education'],
        ['nama' => 'Pemerintah Kabupaten Banyuwangi', 'lembaga' => 'Instansi Pemerintah Daerah', 'kategori' => 'Innovation in Public Service', 'sub' => 'Best Innovation in Regional Public Services'],
        ['nama' => 'Pemerintah Kabupaten Pacitan', 'lembaga' => 'Instansi Pemerintah Daerah', 'kategori' => 'Innovation in Public Service', 'sub' => 'Best Innovation in Regional Public Services'],
    ];
}
