<?php

namespace Tests\Feature;

use App\Models\Acara;
use PHPUnit\Framework\Attributes\DataProvider;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Video sorotan halaman depan diatur dari admin; tautan YouTube bentuk apa pun
 * harus berubah jadi URL sematan, dan yang bukan YouTube harus ditolak.
 */
class AcaraVideoTest extends TestCase
{
    use RefreshDatabase;

    public static function tautanYoutube(): array
    {
        return [
            'watch' => ['https://www.youtube.com/watch?v=dv9VYYepFLo'],
            'watch dengan parameter' => ['https://www.youtube.com/watch?app=desktop&v=dv9VYYepFLo&t=30s'],
            'bagikan pendek' => ['https://youtu.be/dv9VYYepFLo?si=8fc7OHaK_XofVmIJ'],
            'sudah embed' => ['https://www.youtube.com/embed/dv9VYYepFLo?autoplay=1'],
            'shorts' => ['https://www.youtube.com/shorts/dv9VYYepFLo'],
            'siaran langsung' => ['https://www.youtube.com/live/dv9VYYepFLo'],
            'id telanjang' => ['dv9VYYepFLo'],
        ];
    }

    #[DataProvider('tautanYoutube')]
    public function test_semua_bentuk_tautan_youtube_jadi_url_sematan(string $tautan): void
    {
        $acara = new Acara(['video_url' => $tautan]);

        $this->assertSame(
            'https://www.youtube.com/embed/dv9VYYepFLo?autoplay=1&mute=1&playsinline=1',
            $acara->videoEmbed()
        );
    }

    public function test_tautan_kosong_atau_bukan_youtube_tidak_menghasilkan_video(): void
    {
        $this->assertNull((new Acara(['video_url' => null]))->videoEmbed());
        $this->assertNull((new Acara(['video_url' => '   ']))->videoEmbed());
        $this->assertNull((new Acara(['video_url' => 'https://vimeo.com/123456789']))->videoEmbed());
    }

    public function test_admin_bisa_mengganti_video(): void
    {
        $this->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class);
        $acara = Acara::aktif();

        $this->actingAs(User::factory()->create(['role' => 'admin']))
            ->put(route('admin.acara.update', $acara->id), [
                'nama' => $acara->nama,
                'mulai' => $acara->mulai->timezone(Acara::ZONA)->format('Y-m-d\TH:i'),
                'video_url' => 'https://youtu.be/aaaaaaaaaaa',
            ])
            ->assertRedirect();

        $this->assertSame(
            'https://www.youtube.com/embed/aaaaaaaaaaa?autoplay=1&mute=1&playsinline=1',
            $acara->fresh()->videoEmbed()
        );
    }

    public function test_tautan_bukan_youtube_ditolak(): void
    {
        $this->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class);
        $acara = Acara::aktif();

        $this->actingAs(User::factory()->create(['role' => 'admin']))
            ->put(route('admin.acara.update', $acara->id), [
                'nama' => $acara->nama,
                'mulai' => $acara->mulai->timezone(Acara::ZONA)->format('Y-m-d\TH:i'),
                'video_url' => 'https://vimeo.com/123456789',
            ])
            ->assertSessionHasErrors('video_url');
    }
}
