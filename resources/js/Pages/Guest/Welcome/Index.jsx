import GuestFeatures from '@/Pages/Guest/Welcome/Partials/GuestFeature'
import GuestHero from '@/Pages/Guest/Welcome/Partials/GuestHero'
import GuestNavigation from '@/Pages/Guest/Welcome/Partials/GuestNavigation'
import { Head, usePage } from '@inertiajs/react'
import React from 'react'
import GuestListNews from './Partials/GuestListNews'

function Index({ apiData }) {
  const { acara } = usePage().props

  return (
    <>
      {/* Meta untuk perayap dirender dari Blade (HomeController); ini hanya
          judul tab saat pindah halaman tanpa muat ulang. */}
      <Head title={['Anugerah TIMES Indonesia', acara?.tahun].filter(Boolean).join(' ')} />
      <div className="ati-guest min-h-screen bg-ati-ink font-sans text-ati-cream">
        <GuestNavigation />
        <GuestHero />
        <GuestFeatures />
        <GuestListNews news={apiData} />
      </div>

    </>
  )
}

export default Index
