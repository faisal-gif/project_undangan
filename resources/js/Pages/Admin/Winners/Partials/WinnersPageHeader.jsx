import React from 'react';
import { Link, router } from '@inertiajs/react';

export default function WinnersPageHeader() {
    return (
        <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Daftar Pemenang</h1>
            <div className="flex flex-row gap-4">
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