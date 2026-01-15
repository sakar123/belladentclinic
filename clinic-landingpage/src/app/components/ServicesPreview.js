'use client';

import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../lib/translations';

export default function ServicesPreview() {
  const { language } = useLanguage();
  const t = translations[language];
  const [hovered, setHovered] = useState(null);

  const services = [
    {
      id: 1,
      title: t.servicesTeethCleaningTitle,
      description: t.servicesTeethCleaningDesc,
      icon: '🦷',
    },
    {
      id: 2,
      title: t.servicesDentalImplantsTitle,
      description: t.servicesDentalImplantsDesc,
      icon: '🔩',
    },
    {
      id: 3,
      title: t.servicesCosmeticDentistryTitle,
      description: t.servicesCosmeticDentistryDesc,
      icon: '✨',
    },
  ];

  return (
    <section className="max-w-6xl mx-auto mt-20 px-6">
      <h2 className="text-3xl font-bold mb-12 text-center text-foreground">
        {t.servicesPreviewTitle}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {services.map(({ id, title, description, icon }) => (
          <div
            key={id}
            onMouseEnter={() => setHovered(id)}
            onMouseLeave={() => setHovered(null)}
            className={`
              bg-card/20 backdrop-blur-md rounded-2xl p-8 cursor-pointer
              transition-transform duration-300 shadow-lg border border-white/30
              ${hovered === id ? 'scale-105 shadow-primary/40' : 'scale-100'}
            `}
            aria-label={title}
            role="article"
          >
            <div className="text-5xl mb-4">{icon}</div>
            <h3 className="text-xl font-semibold mb-2 text-foreground">{title}</h3>
            <p className="text-muted-foreground">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
