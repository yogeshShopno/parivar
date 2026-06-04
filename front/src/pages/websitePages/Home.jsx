import React from 'react'
import WebHeader from '../../components/webComponents/WebHeader'
import Carousel from '../../components/webComponents/Carousel'
import About from '../../components/webComponents/About'
import Members from '../../components/webComponents/CommitteeMember'
import Memories from '../../components/webComponents/Memories'
import Events from '../../components/webComponents/Events'
import TopStudents from '../../components/webComponents/TopStudents'
import Donors from '../../components/webComponents/Donors'

/**
 * Home Page - Website Landing Page
 * Features professional carousel with brand colors
 */
export default function Home() {
  return (
    <div className="w-full bg-white">
      <WebHeader />
      <main className="w-full">
        {/* Hero Carousel Section */}
        <section id="home" className="w-full px-1 sm:px-2 lg:px-4 py-1 sm:py-2 lg:py-4 bg-gradient-to-b from-white via-white to-gray-50">
          <div className="max-w-7xl mx-auto">
            <Carousel
              autoplay={true}
              autoplayInterval={5000}
              showArrows={true}
              showDots={true}
              showCounter={false}
              
            />
          </div>
        </section>

        <About />
        <Members />
        <Memories />
        <Events />
        <TopStudents />
        <Donors />
      </main>
    </div>
  )
}

