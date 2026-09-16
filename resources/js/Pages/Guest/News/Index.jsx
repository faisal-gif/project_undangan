import { Head } from '@inertiajs/react'
import React from 'react'
import GuestNavigation from '../Welcome/Partials/GuestNavigation'
import NewsHero from './Partials/NewsHero'
import ListNews from './Partials/ListNews'

function Index({ items }) {
  return (
    <>
      <Head title="Berita Seputar ATI" />
      <div className="ati-guest min-h-screen bg-ati-ink font-sans text-ati-cream">
        <GuestNavigation />
        <NewsHero />
        <ListNews news={items} />
      </div>

    </>
  )
}

export default Index
