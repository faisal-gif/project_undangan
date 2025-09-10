<?php

namespace App\Jobs;

use App\Models\Tamu;
use App\Services\TicketService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class GenerateTicketJob implements ShouldQueue
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
    public function handle(TicketService $ticketService): void
    {
        $tamu = Tamu::find($this->tamuId);

        if ($tamu) {
            $ticketService->generateTicket($tamu);
        }
    }
}
