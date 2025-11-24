import GuestFeatures from '@/Pages/Guest/Welcome/Partials/GuestFeature'
import GuestHero from '@/Pages/Guest/Welcome/Partials/GuestHero'
import GuestNavigation from '@/Pages/Guest/Welcome/Partials/GuestNavigation'
import { Head } from '@inertiajs/react'
import React from 'react'
import GuestListNews from './Partials/GuestListNews'

function Index({ apiData }) {


  return (
    <>
      <Head>
        <title>Welcome</title>
        <meta name="description" content="Join us at Prestige Awards as we honor outstanding achievements and inspire future innovators across various industries." />
      </Head>
      <div className="min-h-screen">
        <GuestNavigation />
        <GuestHero />
        <GuestFeatures />
        <GuestListNews news={apiData} />
      </div>
    </>
  )
}

export default Index