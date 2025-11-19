// app/page.js
import Hero from './components/Hero';
import Stats from './components/Stats'
import ServicesPreview from './components/ServicesPreview';
import Testimonials from './components/Testimonials';
import WhatsAppButton from './components/WhatsAppButton';
import {Raleway} from 'next/font/google'

const raleway = Raleway({
    weight:['100'],
    preload: true,
    subsets: ['latin']
  })

export default function HomePage() {

  

  return (
    <main className={raleway.className}>
      <Hero />
      <Stats />
      <ServicesPreview />
      <Testimonials />
    </main>
  );
}
