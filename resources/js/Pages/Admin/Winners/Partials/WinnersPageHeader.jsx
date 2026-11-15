import React from 'react';
import { Link, router } from '@inertiajs/react';

export default function WinnersPageHeader() {
    return (
        // flex-wrap wajib: tanpa itu tombol Refresh terdorong keluar layar di
        // ponsel, karena justify-between tidak pernah memindahkannya ke baris
        // berikutnya.
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl font-bold">Daftar Pemenang</h1>
            <div className="flex flex-row gap-2 sm:gap-4">
                <Link
                    href={route("admin.winners.create")}
                    className="btn btn-neutral btn-sm"
                >
                    Tambah Pemenang
                </Link>
                <button
                    onClick={() => router.reload({ only: ['winners'] })}
                    className="btn btn-primary btn-sm"
                >
                    Refresh
                </button>
            </div>
        </div>
    );
}
