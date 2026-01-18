'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Phone, ArrowRight } from 'lucide-react';
import { translations } from '../lib/translations.js';
import { useLanguage } from '../context/LanguageContext';
import WhatsAppButton from './WhatsAppButton';
import BellaDentGPTButton from './BellaDentGPTButton';
import InstagramButton from './InstagramButton';

export default function Hero() {
  const { language, toggleLanguage } = useLanguage();
  const t = translations[language];
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-r from-primary/5 via-background to-primary/10">
    
      <div className="container mx-auto flex min-h-screen flex-col items-center justify-center px-6 pb-20 md:flex-row md:py-24 lg:gap-x-12">
        {/* Text content container */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="w-full max-w-2xl text-center md:w-1/2 md:text-left"
        >
          {/* Sub-headline for the dentist's name and title */}
          <p className="mb-2 text-2xl font-semibold text-primary">
            {t.HERO_DENTIST_NAME}, {t.HERO_DENTIST_TITLE}
          </p>

          {/* Main Headline: Large, bold, and welcoming */}
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            {t.HERO_WELCOME_HEADLINE}
          </h1>

          {/* Description: Softer, lighter font for readability */}
          <p className="mt-6 text-lg leading-8 text-muted-foreground">{t.HERO_SITE_DESCRIPTION}</p>

          {/* Call-to-Action Buttons */}
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row md:justify-start">
            <a
              href="/book-appointment/"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-2xl font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              {t.bookNow}
            </a>
            <a
              href="/services/"
              className="inline-flex items-center gap-x-2 rounded-lg px-6 py-3 text-2xl font-semibold text-foreground transition-colors hover:bg-accent"
            >
              {t.viewServices} <ArrowRight className="h-4 w-4" />
            </a>
          </div>
          
          {/* Phone number for accessibility and direct contact */}
          <div className="mt-8 flex items-center justify-center gap-x-3 md:justify-start">
            <Phone className="h-5 w-5 text-muted-foreground" />
            <a href={`tel:${t.PHONE_NUMBER}`} className="font-semibold text-foreground hover:text-primary text-2xl">
              {t.PHONE_NUMBER}
            </a>
          </div>
        </motion.div>

        {/* Image container with subtle animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          className="mt-12 w-full max-w-sm md:mt-0 md:w-1/2 lg:max-w-md aspect-square overflow-hidden"
        >
          <Image
            src="/images/belladent_logo_with_name.jpg" 
            alt={`Logo of the clinic`}
            width={400}
            height={400}
            className="rounded-full object-cover shadow-xl" 
            priority 
          />
        </motion.div>
      </div>
      <InstagramButton />
      <BellaDentGPTButton />
      <WhatsAppButton />
    </section>
  );
}
