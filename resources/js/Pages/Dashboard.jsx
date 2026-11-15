import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard({ edisi, totalTamu,totalTamuUndangan, totalTamuDatang, totalTamuBelumDatang, totalWinners }) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard{edisi ? ` — ${edisi}` : ''}
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                  <div className='grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4'>
                    <div className='bg-white overflow-hidden shadow-sm rounded-lg p-4 sm:p-6 border border-gray-200'>
                      <h3 className='text-sm sm:text-lg font-medium text-gray-700'>Total Undangan</h3>
                      <p className='mt-1 sm:mt-2 text-2xl sm:text-3xl font-bold text-gray-900'>{totalTamu}</p>
                    </div>
                     <div className='bg-white overflow-hidden shadow-sm rounded-lg p-4 sm:p-6 border border-gray-200'>
                      <h3 className='text-sm sm:text-lg font-medium text-gray-700'>Total Jumlah Orang</h3>
                      <p className='mt-1 sm:mt-2 text-2xl sm:text-3xl font-bold text-gray-900'>{totalTamuUndangan}</p>
                    </div>
                    <div className='bg-white overflow-hidden shadow-sm rounded-lg p-4 sm:p-6 border border-gray-200'>
                      <h3 className='text-sm sm:text-lg font-medium text-gray-700'>Tamu Datang</h3>
                      <p className='mt-1 sm:mt-2 text-2xl sm:text-3xl font-bold text-gray-900'>{totalTamuDatang}</p>
                    </div>
                    <div className='bg-white overflow-hidden shadow-sm rounded-lg p-4 sm:p-6 border border-gray-200'>
                      <h3 className='text-sm sm:text-lg font-medium text-gray-700'>Tamu Belum Datang</h3>
                      <p className='mt-1 sm:mt-2 text-2xl sm:text-3xl font-bold text-gray-900'>{totalTamuBelumDatang}</p>
                    </div>
                    <div className='bg-white overflow-hidden shadow-sm rounded-lg p-4 sm:p-6 border border-gray-200'>
                      <h3 className='text-sm sm:text-lg font-medium text-gray-700'>Total Peraih</h3>
                      <p className='mt-1 sm:mt-2 text-2xl sm:text-3xl font-bold text-gray-900'>{totalWinners}</p>
                    </div>
                  </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
