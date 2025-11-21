<?php

namespace App\Http\Controllers;

use App\Jobs\GenerateTicketJob;
use App\Jobs\SendTicketJob;
use App\Mail\TicketMail;
use App\Models\EmailLog;
use App\Models\Tamu;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
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
        $tamu->qr_code = $path;
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
                    ->orWhere('lembaga', 'like', "%{$search}%")
                    ->orWhere('pic', 'like', "%{$search}%");
            })
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Tamu/Index', [
            'tamus' => $tamus,
            'filters' => $request->only(['search'])
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/Tamu/Create');
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

        // generate unique random code and attach it to the new Tamu via creating event
        $randomCode = strtoupper(Str::random(8));

        while (Tamu::where('code', $randomCode)->exists()) {
            $randomCode = strtoupper(Str::random(8));
        }


        $tamu = Tamu::create([
            'nama' => $request->nama,
            'alamat' => $request->alamat,
            'lembaga' => $request->lembaga,
            'pic' => $request->pic,
            'code' => $randomCode,
        ]);

        $this->generateQrCode($tamu->id);

        return redirect()->route('admin.tamu.index')->with('success', 'Tamu berhasil ditambahkan.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Tamu $tamu)
    {
        $tamu->qrcode = $tamu->qrcode
            ? asset($tamu->qrcode)
            : null;

        return Inertia::render('Admin/Tamu/Show', [
            'participant' => $tamu,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Tamu $tamu)
    {
        return Inertia::render('Admin/Tamu/Edit', [
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
            'pic' => $request->pic,
        ]);

        return redirect()->route('admin.tamu.index')->with('success', 'Tamu berhasil diperbarui.');
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
                    ->orWhere('lembaga', 'like', "%{$search}%")
                    ->orWhere('pic', 'like', "%{$search}%");
            })
            ->paginate(10)
            ->withQueryString();


        return Inertia::render('Admin/QrScanner/Index', [
            'tamus' => $tamus,
            'filters' => $request->only(['search'])
        ]);
    }

    public function generatePdf($id)
    {

        $tamu = Tamu::find($id);
        // Ambil data dari database sesuai ID undangan
        // Contoh data dummy dulu
        $data = [
            'nama' => !empty($tamu->nama) ? $tamu->nama : $tamu->lembaga,
            'lembaga' => !empty($tamu->lembaga) ? $tamu->lembaga : '',
            'qrCode' => $tamu->qr_code,
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

    public function loopSendEmail()
    {

        Tamu::chunk(10, function ($tamus) {
            foreach ($tamus as $tamu) {
                dispatch(new SendTicketJob($tamu->id));
            }
        });


        return redirect()->back()->with('success', 'Email Sedang Dikirim!');;
    }

    public function sendEmail($id)
    {
        $tamu = Tamu::find($id);

        if ($tamu && $tamu->email) {
            $qrcodePath = storage_path('app/public/' . str_replace('storage/', '', $tamu->qrcode));

            try {
                Mail::to($tamu->email)->send(new TicketMail($tamu, $qrcodePath));

                // jika berhasil
                EmailLog::create([
                    'tamu_id' => $tamu->id,
                    'email'   => $tamu->email,
                    'status'  => 'success',
                    'message' => 'Email berhasil dikirim',
                ]);
            } catch (\Exception $e) {
                // jika gagal
                EmailLog::create([
                    'tamu_id' => $tamu->id,
                    'email'   => $tamu->email,
                    'status'  => 'failed',
                    'message' => $e->getMessage(),
                ]);
            }
        }

        return redirect()->back()->with('success', "Email {$tamu->nama} Sedang Dikirim!");
    }

    public function qrValidate($id)
    {
        // Contoh: cari berdasarkan data dari QR
        $tamu = Tamu::where('id', $id)->first();

        if (!$tamu) {
            throw ValidationException::withMessages([
                'message' => 'QR tidak valid atau tidak ditemukan.'
            ]);
        }

        if ($tamu->status === 'datang') {
            throw ValidationException::withMessages([
                'message' => 'Undangan sudah digunakan.'
            ]);
        }

        $tamu->status = 'datang';
        $tamu->save();

        // Tambahkan logika validasi tiket, cek status, dll

        return back()->with('success', 'Selamat Datang: ' . $tamu->nama);
    }

    public function attendance($id)
    {

        // Contoh: cari berdasarkan data dari QR
        $tamu = Tamu::where('id', $id)->first();

        if (!$tamu) {
            return back()->with('error', 'Undangan Tidak ditemukan');
        }

        if ($tamu->status === 'datang') {

            return back()->with('error', 'Undangan Sudah Digunakan');
        }

        $tamu->status = 'datang';
        $tamu->save();

        return back()->with('success', 'Selamat datang ' . $tamu->nama);
    }

    public function update_status(Request $request, $id)
    {
        $tamu = Tamu::find($id);
        $tamu->status = $request->status;
        $tamu->save();
        return redirect()->route('qrScanner')->with('success', 'Racepack atas nama: ' . $tamu->nama . ' sudah diambil');
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
