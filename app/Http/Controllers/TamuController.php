<?php

namespace App\Http\Controllers;

use App\Jobs\GenerateTicketJob;
use App\Models\Tamu;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Intervention\Image\ImageManager;
use Intervention\Image\Typography\FontFactory;

class TamuController extends Controller
{

    public function generateQrCode($id)
    {
        $tamu = Tamu::find($id);

        // Generate QR Code (misalnya berdasarkan ID atau kode unik)
        $qrCodeContent = $tamu->id; // atau $request->ticket_code
        $qrImage = QrCode::format('png')->size(300)->generate($qrCodeContent);

        // Simpan QR code ke storage
        $path = "qrcodes/{$tamu->id}.png";
        Storage::disk('public')->put($path, $qrImage);

        // Simpan path QR di database
        $tamu->qrcode = $path;
        $tamu->save();
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $tamus = Tamu::query()
            ->when($request->input('search'), function ($query, $search) {
                $query->where('nama', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('no_kartu_identitas', 'like', "%{$search}%");
            })
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Tamu/Index', [
            'tamus' => $tamus,
            'filters' => $request->only(['search'])
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Tamu/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nama' => 'nullable|string|max:255',
            'alamat' => 'nullable|string|max:255',
            'lembaga' => 'nullable|string|max:255',
            'pic' => 'nullable|string|max:255',
        ]);

        $tamu = Tamu::create([
            'nama' => $request->nama,
            'alamat' => $request->alamat,
            'lembaga' => $request->lembaga,
            'pc' => $request->pic,
        ]);

        $this->generateQrCode($tamu->id);

        return redirect()->route('tamu.index')->with('success', 'Tamu berhasil ditambahkan.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Tamu $tamu)
    {
        $tamu->qrcode = $tamu->qrcode
            ? asset($tamu->qrcode)
            : null;

        return Inertia::render('Tamu/Show', [
            'participant' => $tamu,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Tamu $tamu)
    {
        return Inertia::render('Tamu/Edit', [
            'tamu' => $tamu
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Tamu $tamu)
    {

        $request->validate([
            'nama' => 'nullable|string|max:255',
            'alamat' => 'nullable|string|max:255',
            'lembaga' => 'nullable|string|max:255',
            'pic' => 'nullable|string|max:255',
        ]);

        $tamu->update([
            'nama' => $request->nama,
            'alamat' => $request->alamat,
            'lembaga' => $request->lembaga,
            'pc' => $request->pic,
        ]);

        return redirect()->route('tamu.index')->with('success', 'Tamu berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Tamu $tamu)
    {
        $tamu->delete();

        return redirect()->route('tamu.index')->with('success', 'Tamu berhasil dihapus.');
    }

    public function getTamu($id)
    {
        $tamu = Tamu::find($id);

        return json_decode($tamu);
    }

    public function qrScanner(Request $request)
    {
        $tamus = Tamu::query()
            ->when($request->input('search'), function ($query, $search) {
                $query->where('nama', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('no_kartu_identitas', 'like', "%{$search}%");
            })
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('QrScanner/Index', [
            'tamus' => $tamus,
            'filters' => $request->only(['search'])
        ]);
    }
    public function bubble()
    {
        return Inertia::render('Bubble');
    }

    public function generatePdf($id)
    {

        $tamu = Tamu::find($id);
        // Ambil data dari database sesuai ID undangan
        // Contoh data dummy dulu
        $data = [
            'nama' => !empty($tamu->nama) ? $tamu->nama : $tamu->lembaga,
            'lembaga' => !empty($tamu->lembaga) ? $tamu->lembaga : '',
            'qrCode' => $tamu->qrcode,
        ];

        $pdf = Pdf::loadView('pdf.undangan', compact('data'))
            ->setPaper('a4', 'portrait');

        $slugNama = str_replace(['/', '\\'], '', Str::slug($data['nama'], '-'));
        return $pdf->download('undangan-' . $slugNama . '.pdf');
    }





    public function loopQr()
    {

        Tamu::chunk(100, function ($tamus) {
            foreach ($tamus as $tamu) {
                dispatch(new GenerateTicketJob($tamu->id));
            }
        });


        return 'Proses generate ticket sudah masuk ke queue.';
    }

    public function qrValidate(Request $request)
    {
        $qrData = $request->qr_data;
        $phone = $request->phone;

        if (!$phone) {
            throw ValidationException::withMessages([
                'message' => 'Perlu Mengisikan Nomor HP'
            ]);
        }

        // Contoh: cari berdasarkan data dari QR
        $tamu = Tamu::where('id', $qrData)->first();

        if (!$tamu) {
            throw ValidationException::withMessages([
                'message' => 'QR tidak valid atau tidak ditemukan.'
            ]);
        }

        if ($tamu->status === 'attend') {
            throw ValidationException::withMessages([
                'message' => 'Undangan sudah digunakan.'
            ]);
        }

        $tamu->status = 'attend';
        $tamu->telepon = $phone;
        $tamu->save();

        // Tambahkan logika validasi tiket, cek status, dll

        return back()->with('success', 'Tiket valid: ' . $tamu->id);
    }

    public function attendance(Request $request)
    {

        $tamu = Tamu::find($request->tamu_id);
        $tamu->status = 'attend';
        $tamu->telepon = $request->telephone;
        $tamu->save();
        return back()->with('success', 'Tiket valid: ' . $tamu->id);
    }

    public function storeAttendance(Request $request)
    {
        $request->validate([
            'phone_number' => 'required|string|max:255',
            'tamu_id' => 'required|exists:tamus,id',
        ]);

        $tamu = Tamu::find($request->tamu_id);

        if ($tamu->status === 'attend') {
            throw ValidationException::withMessages([
                'message' => 'Undangan sudah digunakan.'
            ]);
        }

        $tamu->status = 'attend';
        $tamu->telepon = $request->phone_number;
        $tamu->save();

        return back()->with('success', 'Kehadiran berhasil dicatat: ' . $tamu->id);
    }
}
