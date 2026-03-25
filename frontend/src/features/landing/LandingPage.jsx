import React from 'react'
import Navbar from '../../components/ui/Navbar'
import Hero from './components/Hero'
import SectionOne from './components/SectionOne'
import Stats from './components/Stats'
import DoctorFinder from './components/DoctorFinder'
import Services from './components/Services'

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <Hero />
        <Stats />
        <DoctorFinder />
        <Services />
        <SectionOne />
      </main>
    </>
  )
}
