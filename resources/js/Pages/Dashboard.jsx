import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard({ totalTamu, totalTamuDatang, totalTamuBelumDatang, totalWinners }) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                  <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                    <div className='bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 border border-gray-200'>
                      <h3 className='text-lg font-medium text-gray-700'>Total Tamu</h3>
                      <p className='mt-2 text-3xl font-bold text-gray-900'>{totalTamu}</p>
                    </div>
                    <div className='bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 border border-gray-200'>
                      <h3 className='text-lg font-medium text-gray-700'>Tamu Datang</h3>
                      <p className='mt-2 text-3xl font-bold text-gray-900'>{totalTamuDatang}</p>
                    </div>
                    <div className='bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 border border-gray-200'>
                      <h3 className='text-lg font-medium text-gray-700'>Tamu Belum Datang</h3>
                      <p className='mt-2 text-3xl font-bold text-gray-900'>{totalTamuBelumDatang}</p>
                    </div>
                    <div className='bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 border border-gray-200'>
                      <h3 className='text-lg font-medium text-gray-700'>Total Peraih</h3>
                      <p className='mt-2 text-3xl font-bold text-gray-900'>{totalWinners}</p>
                    </div>
                  </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
