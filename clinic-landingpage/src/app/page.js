import Hero from './components/Hero';
import Stats from './components/Stats';
import ServicesPreview from './components/ServicesPreview';
import Testimonials from './components/Testimonials';

export default function HomePage() {
  return (
    <main>
      <Hero />
      <Stats />
      <ServicesPreview />
      <Testimonials />
    </main>
  );
}
