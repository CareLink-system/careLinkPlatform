import React from 'react'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'

export default function SectionOne() {
  return (
    <section className="py-12 px-6 flex justify-center">
      <Card>
        <h2 className="text-2xl font-bold mb-4">Welcome to CareLink</h2>
        <p className="text-sm text-gray-700 mb-6">This is a scaffolded landing section.</p>
        <Button>Get Started</Button>
      </Card>
    </section>
  )
}
