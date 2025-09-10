<?php

namespace App\Services;

use App\Models\Tamu;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;
use Intervention\Image\Typography\FontFactory;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class TicketService
{
    /**
     * Create a new class instance.
     */
   public function generateTicket(Tamu $tamu)
    {
        $url = route('tamu.show', $tamu->id);


        // generate QR code PNG
        $qrCode = QrCode::format('png')
            ->size(300)
            ->encoding('UTF-8') // <— penting!
            ->generate($url);

        $qrPath = 'qrcodes/' . $tamu->id . '.png';
        Storage::disk('public')->put($qrPath, $qrCode);


        $manager = new ImageManager(new \Intervention\Image\Drivers\Gd\Driver());

        // Baca template tiket
        $template = $manager->read(public_path('ticket_template.png'));

        // Baca QR Code (sudah digenerate pakai simple-qrcode dan disimpan)
        $qrPath = storage_path('app/public/qrcodes/' . $tamu->id . '.png');
        $qrImage = $manager->read($qrPath)->resize(500, 500);



        // Tempel QR di posisi tertentu
        $template->place($qrImage, 'center', 0, 550);

        // Tambahkan teks nama peserta
        $template->text($tamu->nama, 550, 1150, function (FontFactory $font) {
            $font->filename(public_path('ARIAL.TTF'));
            $font->size(40);
            $font->color('#FFFFFF');
            $font->align('center');
        });

        // Simpan hasil ke storage
        $outputPath = storage_path('app/public/tickets/' . $tamu->id . '.png');
        $template->save($outputPath);

        $tamu->qrcode = 'storage/tickets/' . $tamu->id . '.png';
        $tamu->save();


        return 'succsess';
    }
}
