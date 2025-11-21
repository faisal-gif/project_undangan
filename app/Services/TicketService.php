<?php

namespace App\Services;

use App\Models\Tamu;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;
use Intervention\Image\Typography\FontFactory;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Illuminate\Support\Str;

class TicketService
{
    /**
     * Create a new class instance.
     */
    public function generateTicket(Tamu $tamu)
    {
        // generate unique random code and attach it to the new Tamu via creating event
        // $randomCode = strtoupper(Str::random(8));

        // while (Tamu::where('code', $randomCode)->exists()) {
        //     $randomCode = strtoupper(Str::random(8));
        // }


        // Generate QR Code (misalnya berdasarkan ID atau kode unik)
        $qrCodeContent = $tamu->id; // atau $request->ticket_code
        $qrImage = QrCode::format('png')->size(300)->generate($qrCodeContent);

        // Simpan QR code ke storage
        $path = "qrcodes/{$tamu->id}.png";
        Storage::disk('public')->put($path, $qrImage);

        // Simpan path QR di database
        $tamu->qr_code = $path;
        // $tamu->code = $randomCode;
        $tamu->save();


        return 'succsess';
    }
}
