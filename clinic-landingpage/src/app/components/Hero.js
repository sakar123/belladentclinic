// components/Hero.js
'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Phone, ArrowRight } from 'lucide-react'; 
import { translations } from '../lib/translations.js';
import { useLanguage } from '../context/LanguageContext';

export default function Hero() {
  const { language, toggleLanguage } = useLanguage();
  const t = translations[language];
  return (
    // Section container: Full width, light gray background for a soft, clean look.
    // Ample vertical padding (py-20) for spacing, centered content.
    <section className="w-full bg-slate-50">
      <div className="container mx-auto flex min-h-screen flex-col items-center justify-center px-6 py-20 md:flex-row md:py-24 lg:gap-x-12">
        {/* Text content container */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="w-full max-w-2xl text-center md:w-1/2 md:text-left"
        >
          {/* Sub-headline for the dentist's name and title */}
          <p className="mb-2 text-2xl font-semibold text-sky-600">
            {t.HERO_DENTIST_NAME}, {t.HERO_DENTIST_TITLE}
          </p>

          {/* Main Headline: Large, bold, and welcoming */}
          <h1 className="text-4xl font-bold tracking-tight text-slate-800 sm:text-5xl md:text-6xl">
            {t.HERO_WELCOME_HEADLINE}
          </h1>

          {/* Description: Softer, lighter font for readability */}
          <p className="mt-6 text-lg leading-8 text-slate-600">{t.HERO_SITE_DESCRIPTION}</p>

          {/* Call-to-Action Buttons */}
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row md:justify-start">
            <a
              href="/book-appointment"
              className="inline-flex items-center justify-center rounded-lg bg-sky-600 px-6 py-3 text-2xl font-semibold text-white shadow-sm transition-colors hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
            >
              {t.bookNow}
            </a>
            <a
              href="/services"
              className="inline-flex items-center gap-x-2 rounded-lg px-6 py-3 text-2xl font-semibold text-slate-700 transition-colors hover:bg-slate-200"
            >
              {t.viewServices} <ArrowRight className="h-4 w-4" />
            </a>
          </div>
          
          {/* Phone number for accessibility and direct contact */}
          <div className="mt-8 flex items-center justify-center gap-x-3 md:justify-start">
            <Phone className="h-5 w-5 text-slate-500" />
            <a href={`tel:${t.PHONE_NUMBER}`} className="font-semibold text-slate-700 hover:text-sky-600 text-2xl">
              {t.PHONE_NUMBER}
            </a>
          </div>
        </motion.div>

        {/* Image container with subtle animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          className="mt-12 w-full max-w-sm md:mt-0 md:w-1/2 lg:max-w-md"
        >
          <Image
            src="/images/TempHeadShot.png" // Use a professional, warm headshot
            alt={`A portrait of ${t.HERO_DENTIST_NAME}`}
            width={500}
            height={500}
            className="rounded-full object-cover shadow-xl" // A circular image feels friendly and modern
            priority // Load the hero image first
          />
        </motion.div>
      </div>
    </section>
  );
}