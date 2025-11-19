'use client';

import { useState } from 'react';

const services = [
  {
    id: 1,
    title: 'Teeth Cleaning',
    description: 'Professional cleaning to keep your smile fresh and healthy.',
    icon: '🦷',
  },
  {
    id: 2,
    title: 'Dental Implants',
    description: 'Permanent solutions to replace missing teeth with natural look.',
    icon: '🔩',
  },
  {
    id: 3,
    title: 'Cosmetic Dentistry',
    description: 'Whitening, veneers, and smile makeovers tailored for you.',
    icon: '✨',
  },
];
// random
export default function ServicesPreview() {
  const [hovered, setHovered] = useState(null);

  return (
    <section className="max-w-6xl mx-auto mt-20 px-6">
      <h2 className="text-3xl font-bold mb-12 text-center">
        Our Core Services
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {services.map(({ id, title, description, icon }) => (
          <div
            key={id}
            onMouseEnter={() => setHovered(id)}
            onMouseLeave={() => setHovered(null)}
            className={`
              bg-white/20 backdrop-blur-md rounded-2xl p-8 cursor-pointer
              transition-transform duration-300 shadow-lg border border-white/30
              ${hovered === id ? 'scale-105 shadow-purple-500/50' : 'scale-100'}
            `}
            aria-label={title}
            role="article"
          >
            <div className="text-5xl mb-4">{icon}</div>
            <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
            <p className="">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
