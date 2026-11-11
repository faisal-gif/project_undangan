<?php

namespace App\Http\Middleware;

use App\Models\Acara;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'flash' => [
                'success' => fn() => $request->session()->get('success'),
                'error'   => fn() => $request->session()->get('error'),
                // Tempat duduk hasil pemindaian QR, dipakai layar penerima tamu.
                'duduk'   => fn() => $request->session()->get('duduk'),
            ],
            // Satu sumber tanggal & lokasi acara untuk seluruh halaman
            'acara' => fn() => Acara::aktif()?->toShare(),
        ];
    }
}
