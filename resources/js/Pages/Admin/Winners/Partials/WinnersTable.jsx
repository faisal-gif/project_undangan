import React from 'react';
import { Link } from '@inertiajs/react';
import { Edit } from 'lucide-react';
import WinnersTableRow from './WinnersTableRow';

/**
 * Di bawah md tabelnya diganti kartu. Lima kolom - dengan kategori dan
 * jabatan yang keduanya panjang - butuh sekitar 487px, jadi di layar 375px
 * kolom Jabatan dan tombol Ubah terpotong di luar layar.
 */
export default function WinnersTable({ winners }) {
    return (
        <>
            <ul className="grid gap-3 sm:grid-cols-2 md:hidden">
                {winners.map((winner) => (
                    <li
                        key={winner.id}
                        className="flex min-w-0 flex-col rounded-lg border border-gray-200 p-4"
                    >
                        <div className="flex items-start gap-3">
                            <span className="mt-0.5 shrink-0 text-xs text-gray-400">
                                {winner.id}
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="font-semibold leading-snug">{winner.nama}</p>
                                {winner.jabatan && (
                                    <p className="mt-0.5 text-sm text-gray-500">
                                        {winner.jabatan}
                                    </p>
                                )}
                            </div>
                        </div>

                        {winner.kategori && (
                            <p className="mb-3 mt-3 text-xs">
                                <span className="badge badge-ghost">{winner.kategori}</span>
                            </p>
                        )}

                        <div className="mt-auto border-t pt-3">
                            <Link
                                href={route("admin.winners.edit", winner.id)}
                                className="btn btn-sm btn-neutral gap-1.5"
                            >
                                <Edit size={14} />
                                Ubah
                            </Link>
                        </div>
                    </li>
                ))}

                {winners.length === 0 && (
                    <li className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500 sm:col-span-2">
                        Tidak ada pemenang yang cocok.
                    </li>
                )}
            </ul>

            <div className="hidden overflow-x-auto md:block">
                <table className="table table-zebra">
                    <thead>
                        <tr>
                            <th className="py-2 px-4 border-b">ID</th>
                            <th className="py-2 px-4 border-b">Nama</th>
                            <th className="py-2 px-4 border-b">Kategori</th>
                            <th className="py-2 px-4 border-b">Jabatan</th>
                            <th className="py-2 px-4 border-b">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {winners.map((winner) => (
                            <WinnersTableRow key={winner.id} winner={winner} />
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}
