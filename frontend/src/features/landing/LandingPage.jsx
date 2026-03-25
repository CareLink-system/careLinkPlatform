import React from 'react'
import Navbar from '../../components/ui/Navbar'
import Hero from './components/Hero'
import SectionOne from './components/SectionOne'

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <Hero />
        <SectionOne />
      </main>
    </>
  )
}
