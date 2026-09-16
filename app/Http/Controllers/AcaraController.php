<?php

namespace App\Http\Controllers;

use App\Models\Acara;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AcaraController extends Controller
{
    public function edit(Request $request)
    {
        $acara = Acara::dilihat($request->integer('acara') ?: null);

        return Inertia::render('Admin/Acara/Edit', [
            'acara' => $acara ? [
                'id' => $acara->id,
                'nama' => $acara->nama,
                // Nilai untuk <input type="datetime-local">, dalam WIB
                'mulai' => $acara->mulai?->timezone(Acara::ZONA)->format('Y-m-d\TH:i'),
                'selesai' => $acara->selesai?->timezone(Acara::ZONA)->format('Y-m-d\TH:i'),
                'tempat' => $acara->tempat,
                'alamat' => $acara->alamat,
                'peta_url' => $acara->peta_url,
                'aktif' => $acara->aktif,
            ] : null,
            'acaras' => Acara::withCount('tamus')->orderByDesc('mulai')->get()
                ->map(fn(Acara $a) => [
                    'id' => $a->id,
                    'label' => $a->label(),
                    'jumlah' => $a->tamus_count,
                    'aktif' => $a->aktif,
                ]),
        ]);
    }

    public function store(Request $request)
    {
        // Edisi baru sengaja dibuat tidak aktif: membuat dan menayangkan
        // adalah dua keputusan yang berbeda.
        $acara = Acara::create($this->data($request) + ['aktif' => false]);

        return redirect()->route('admin.acara.edit', ['acara' => $acara->id])
            ->with('success', 'Edisi baru dibuat. Klik "Jadikan Aktif" bila sudah siap.');
    }

    public function update(Request $request, Acara $acara)
    {
        $acara->update($this->data($request));

        return back()->with('success', 'Data acara diperbarui.');
    }

    /**
     * Pindahkan status aktif ke satu edisi. Dalam transaksi supaya tidak
     * pernah ada dua baris aktif - Acara::aktif() harus selalu tidak ambigu.
     */
    public function aktifkan(Acara $acara)
    {
        DB::transaction(function () use ($acara) {
            Acara::where('aktif', true)->update(['aktif' => false]);
            $acara->update(['aktif' => true]);
        });

        return back()->with('success', $acara->label() . ' sekarang menjadi acara aktif.');
    }

    private function data(Request $request): array
    {
        $data = $request->validate([
            'nama' => 'required|string|max:255',
            'mulai' => 'required|date',
            'selesai' => 'nullable|date|after:mulai',
            'tempat' => 'nullable|string|max:255',
            'alamat' => 'nullable|string|max:1000',
            'peta_url' => 'nullable|url|max:255',
        ], [
            'nama.required' => 'Nama acara wajib diisi.',
            'mulai.required' => 'Tanggal dan jam mulai wajib diisi.',
            'mulai.date' => 'Tanggal mulai tidak valid.',
            'selesai.after' => 'Jam selesai harus setelah jam mulai.',
            'peta_url.url' => 'Tautan peta harus berupa URL lengkap.',
        ]);

        // Yang diketik admin adalah waktu WIB
        $data['mulai'] = Carbon::parse($data['mulai'], Acara::ZONA);
        $data['selesai'] = $data['selesai'] ? Carbon::parse($data['selesai'], Acara::ZONA) : null;

        return $data;
    }
}
