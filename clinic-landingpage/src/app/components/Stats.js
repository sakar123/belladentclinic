"use client";

import { useLanguage } from '../context/LanguageContext';
import { translations } from '../lib/translations';

export default function Stats() {
  const { language } = useLanguage();
  const t = translations[language];

  const stats = [
    { label: t.statsYearsExperience, value: '15+' },
    { label: t.statsPatientsServed, value: '10,000+' },
    { label: t.statsCertifiedDentists, value: '8' },
  ];

  return (
    <section className="bg-secondary/50 backdrop-blur-md rounded-xl p-8 max-w-5xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center shadow-lg border border-white/30">
      {stats.map(({ label, value }) => (
        <div key={label}>
          <h3 className="text-4xl font-bold text-primary mb-2">{value}</h3>
          <p className="text-muted-foreground text-lg">{label}</p>
        </div>
      ))}
    </section>
  );
}
  
