import React from 'react';
import WinnersTableRow from './WinnersTableRow';

export default function WinnersTable({ winners }) {
    return (
        <div className="overflow-x-auto">
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
                        <WinnersTableRow
                            key={winner.id}
                            winner={winner}
                       
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}