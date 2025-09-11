<?php

namespace App\Jobs;

use App\Mail\TicketMail;
use App\Models\EmailLog;
use App\Models\Tamu;
use App\Services\TicketService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendTicketJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tamuId;
    /**
     * Create a new job instance.
     */
    public function __construct($tamuId)
    {
        $this->tamuId = $tamuId;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $tamu = Tamu::find($this->tamuId);


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
    }
}
