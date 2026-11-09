# API Acara ATI

Satu titik baca: info acara Anugerah TIMES Indonesia yang sedang aktif — hitung
mundur, tanggal, dan lokasi. Hanya baca. Tidak memuat data tamu maupun pemenang.

```
GET https://ati.timesindonesia.co.id/api/v1/acara
```

Wajib mengirim kunci di header `x-api-key`. Kunci dikirim terpisah.

**Panggil dari server, bukan dari browser.** Kalau kuncinya dipakai di
JavaScript halaman, setiap pengunjung bisa membacanya dari tab Network.

## Contoh

```bash
curl -sS \
  -H 'x-api-key: KUNCI_ANDA' \
  https://ati.timesindonesia.co.id/api/v1/acara
```

```json
{
  "data": {
    "nama": "Anugerah TIMES Indonesia",
    "tahun": 2026,
    "mulai_iso": "2026-11-27T18:00:00+07:00",
    "selesai_iso": "2026-11-27T21:00:00+07:00",
    "tanggal_label": "Jumat, 27 November 2026",
    "tanggal_singkat": "27 November 2026",
    "jam_label": "18:00 - 21:00 WIB",
    "tempat": "Grand Ballroom",
    "alamat": "Grand Mercure Malang Mirama, Jl. Raden Panji Suroso No.7, Purwodadi, Kec. Blimbing, Kota Malang, Jawa Timur 65126",
    "peta_url": "https://maps.app.goo.gl/3sfP2FmW4SqXBiWw5",
    "video_embed": "https://www.youtube.com/embed/dv9VYYepFLo?autoplay=1&mute=1&playsinline=1",
    "status": "akan datang",
    "detik_tersisa": 2070000,
    "sekarang": "2026-11-03T20:00:00+07:00"
  }
}
```

## Medan

| Medan | Arti |
|---|---|
| `nama`, `tahun` | Nama acara dan tahunnya |
| `mulai_iso`, `selesai_iso` | ISO 8601 ber-offset `+07:00`. Pakai ini untuk jam yang berdetak. `selesai_iso` boleh null |
| `tanggal_label`, `tanggal_singkat`, `jam_label` | Teks siap tampil dalam Bahasa Indonesia |
| `tempat`, `alamat`, `peta_url` | Lokasi; `peta_url` boleh null |
| `video_embed` | Tautan sematan YouTube, atau null bila tidak diisi |
| `status` | `akan datang` / `berlangsung` / `selesai` |
| `detik_tersisa` | Detik menuju jam mulai; 0 bila sudah lewat |
| `sekarang` | Jam server saat balasan dibuat |

## Galat

Bentuknya selalu `{"error": "<pesan>", "status": <kode>}`.

| Kode | Arti | Tindakan |
|---|---|---|
| 401 | Kunci salah atau tidak dikirim | Periksa header `x-api-key` |
| 404 | Belum ada acara aktif | Sembunyikan hitung mundur |
| 429 | Lebih dari 60 permintaan per menit | Hormati `Cache-Control` |
| 503 | API belum dikonfigurasi di server | Hubungi pengelola ATI |

## Cache

Balasan membawa `Cache-Control: max-age=60, public`. Simpan di sisi Anda selama
60 detik; jangan memanggil sekali per pengunjung.

## Memakai `detik_tersisa` di balik cache

`detik_tersisa` adalah potret pada saat `sekarang`, jadi di dalam cache ia
menua. Koreksi dengan `sekarang`:

```php
$acara = json_decode($isi, true)['data'];

$umur = time() - strtotime($acara['sekarang']);      // umur balasan, dalam detik
$sisa = max(0, $acara['detik_tersisa'] - $umur);

printf('%d hari %d jam %d menit',
    intdiv($sisa, 86400),
    intdiv($sisa % 86400, 3600),
    intdiv($sisa % 3600, 60));
```

Untuk jam yang berdetak tiap detik di halaman, lebih baik kirimkan `mulai_iso`
ke browser dan hitung di sana:

```js
const sisaMs = new Date(mulai_iso) - new Date();
```

Offset `+07:00` membuat hasilnya sama di zona waktu mana pun, termasuk bagi
pengunjung di luar WIB.
