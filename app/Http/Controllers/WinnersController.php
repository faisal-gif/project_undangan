<?php

namespace App\Http\Controllers;

use App\Models\Winners;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class WinnersController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $winners = Winners::query()
            ->when($request->input('search'), function ($query, $search) {
                $query->where('nama', 'like', "%{$search}%");
            })
            ->paginate(10)
            ->withQueryString();
        return Inertia::render('Admin/Winners/Index', [
            'winners' => $winners,
            'filters' => $request->only(['search'])
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/Winners/Create');
    }

    /**
     * Store a newly created resource in storage.
     */

    public function store(Request $request)
    {
        $request->validate([
            'nama' => 'required|string|max:255',
            'kategori' => 'required|string|max:255',
            'jabatan' => 'required|string|max:255',
            'tahun' => 'required|integer|digits:4|min:1900|max:' . (date('Y') + 10),
            'foto' => 'required|image|mimes:jpeg,png,jpg,webp|max:2048',
        ], [
            'nama.required' => 'Nama wajib diisi.',
            'kategori.required' => 'Kategori wajib diisi.',
            'jabatan.required' => 'Jabatan wajib diisi.',
            'tahun.required' => 'Tahun wajib diisi.',
            'tahun.digits' => 'Tahun harus 4 digit.',
            'tahun.min' => 'Tahun minimal 1900.',
            'tahun.max' => 'Tahun tidak valid.',
            'foto.required' => 'Foto wajib diupload.',
            'foto.image' => 'File harus berupa gambar.',
            'foto.mimes' => 'Format foto harus jpeg, png, jpg, atau webp.',
            'foto.max' => 'Ukuran foto maksimal 2MB.',
        ]);

        $fotoPath = null;

        if ($request->hasFile('foto')) {
            $file = $request->file('foto');
            $filename = time() . '_' . $file->getClientOriginalName();
            $fotoPath = $file->storeAs('winners', $filename, 'public');
        }

        Winners::create([
            'nama' => $request->nama,
            'kategori' => $request->kategori,
            'jabatan' => $request->jabatan,
            'tahun' => $request->tahun,
            'foto' => $fotoPath,
        ]);

        return redirect()->route('admin.winners.index')
            ->with('success', 'Pemenang berhasil ditambahkan.');
    }

    public function edit(Winners $winner)
    {
        return Inertia::render('Admin/Winners/Edit', [
            'winner' => $winner
        ]);
    }

    public function update(Request $request, Winners $winner)
    {
        $request->validate([
            'nama' => 'required|string|max:255',
            'kategori' => 'required|string|max:255',
            'jabatan' => 'required|string|max:255',
            'tahun' => 'required|integer|digits:4|min:1900|max:' . (date('Y') + 10),
            'foto' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        ], [
            'nama.required' => 'Nama wajib diisi.',
            'kategori.required' => 'Kategori wajib diisi.',
            'jabatan.required' => 'Jabatan wajib diisi.',
            'tahun.required' => 'Tahun wajib diisi.',
            'tahun.digits' => 'Tahun harus 4 digit.',
            'tahun.min' => 'Tahun minimal 1900.',
            'tahun.max' => 'Tahun tidak valid.',
            'foto.image' => 'File harus berupa gambar.',
            'foto.mimes' => 'Format foto harus jpeg, png, jpg, atau webp.',
            'foto.max' => 'Ukuran foto maksimal 2MB.',
        ]);

        $data = [
            'nama' => $request->nama,
            'kategori' => $request->kategori,
            'jabatan' => $request->jabatan,
            'tahun' => $request->tahun,
        ];

        // Handle foto upload
        if ($request->hasFile('foto')) {
            // Hapus foto lama jika ada
            if ($winner->foto && Storage::disk('public')->exists($winner->foto)) {
                Storage::disk('public')->delete($winner->foto);
            }

            // Upload foto baru
            $file = $request->file('foto');
            $filename = time() . '_' . $file->getClientOriginalName();
            $fotoPath = $file->storeAs('winners', $filename, 'public');
            $data['foto'] = $fotoPath;
        }

        $winner->update($data);

        return redirect()->route('admin.winners.index')
            ->with('success', 'Pemenang berhasil diupdate.');
    }


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Winners $winners)
    {
        //
    }
}
