import React from 'react';
import { Link } from '@inertiajs/react';
import { Edit, Eye, Send } from 'lucide-react';

export default function WinnersTableRow({ winner }) {
    
    // Fungsi helper bisa diletakkan di sini
    const getStatusBadge = (status) => {
        if (status === "ambil") {
            return <span className="badge badge-success p-4">Sudah Ambil</span>;
        }
        if (status === "belum") {
            return <span className="badge badge-warning text-xs p-4">Belum</span>;
        }
        return <span className="badge">{status}</span>;
    };



    return (
        <tr key={winner.id}>
            <td className="py-2 px-4 border-b text-center">{winner.id}</td>
            <td className="py-2 px-4 border-b">{winner.nama}</td>
            <td className="py-2 px-4 border-b">{winner.kategori}</td>
            <td className="py-2 px-4 border-b">{winner.jabatan}</td>
            <td className="py-2 px-4 border-b">
                <div className=" text-center flex flex-row gap-2">
                    <Link
                        href={route("admin.winners.edit", winner.id)}
                        className="btn btn-xs btn-neutral"
                    >
                        <Edit size={16} />
                    </Link>
                </div>
            </td>
        </tr>
    );
}