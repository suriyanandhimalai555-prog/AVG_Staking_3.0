import React from 'react'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import FinancialGuidelines from '../components/FinancialGuidelines'
import CompensationPlan from '../components/CompensationPlan'
import FAQ from '../components/Faq'
import Footer from '../components/Footer'

const Website = () => {
  return (
    <div>
        <Navbar />
        <section id="home">
            <Hero />
        </section>
        <section id="guidelines">
            <FinancialGuidelines />
        </section>
        <section id="compensation-plan">
            <CompensationPlan />
        </section>
        <section id="faqs">
            <FAQ />
        </section>
        <Footer />
    </div>
  )
}

export default Website