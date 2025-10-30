import GuestFeatures from '@/Pages/Guest/Welcome/Partials/GuestFeature'
import GuestHero from '@/Pages/Guest/Welcome/Partials/GuestHero'
import GuestNavigation from '@/Pages/Guest/Welcome/Partials/GuestNavigation'
import { Head } from '@inertiajs/react'
import React from 'react'

function Index() {
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
    </div>
    </>
  )
}

export default Index