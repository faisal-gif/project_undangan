import FlashMessage from '@/Components/FlashMessage';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import React, { useState } from 'react'
import SearchForm from './Partials/SearchForm';
import WinnersTable from './Partials/WinnersTable';
import Pagination from '@/Components/Pagination';
import WinnersPageHeader from './Partials/WinnersPageHeader';

function Index({ winners, filters }) {

    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search || "");

    // Handler untuk search tetap di sini karena memicu navigasi Inertia
    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route("admin.winners.index", { search }));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Pemenang" />
            
            {/* 1. Komponen Flash Message */}
            <FlashMessage flash={flash} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            
                          <WinnersPageHeader />


                            {/* 3. Komponen Form Pencarian */}
                            <SearchForm
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onSubmit={handleSearch}
                            />

                            {/* 4. Komponen Tabel Utama */}
                            <WinnersTable winners={winners.data} />

                            {/* 5. Komponen Pagination */}
                            <Pagination links={winners.links} />

                        </div>
                    </div>
                </div>
            </div>

        </AuthenticatedLayout>
    )
}

export default Index