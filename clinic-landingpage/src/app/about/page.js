'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, HeartHandshake, Microscope, MessageSquare, Sparkles, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../lib/translations';
import Link from 'next/link';

const FADE_UP = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

// Hero Section
function HeroSection({ t }) {
  return (
    <section className="relative grid min-h-[700px] grid-cols-1 items-center lg:grid-cols-2 lg:h-screen">
      {/* Video/Image Side */}
      <div className="absolute inset-0 z-0 h-full w-full lg:relative lg:order-2">
        <video 
          className="h-full w-full object-cover brightness-[0.4] lg:brightness-100" 
          autoPlay 
          loop 
          muted 
          playsInline 
          preload="metadata"
          src="/videos/clinic-ambience.mp4"
          aria-label="BellaDent clinic interior video"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent lg:hidden" />
      </div>

      {/* Text Content */}
      <motion.div 
        initial="initial" 
        animate="animate" 
        variants={{ animate: { transition: { staggerChildren: 0.15 } } }} 
        className="relative z-10 flex flex-col items-start px-6 py-16 lg:order-1 lg:px-12 lg:py-24 xl:px-20"
      >
        <motion.h1 
          variants={FADE_UP} 
          className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl lg:text-black"
        >
          {t.aboutHeroTitle}
        </motion.h1>
        
        <motion.p 
          variants={FADE_UP} 
          className="mt-6 max-w-xl text-lg leading-relaxed text-white sm:text-xl lg:text-gray-700"
        >
          {t.aboutHeroSubtitle}
        </motion.p>
        
        <motion.div variants={FADE_UP} className="mt-8">
          <Button 
            asChild 
            size="lg" 
            className="group rounded-full bg-blue-500 px-8 py-6 text-lg font-semibold hover:bg-blue-600 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            aria-label="Book a dental consultation at BellaDent"
          >
            <Link href="/book-appointment">
              {t.bookYourVisit}
              <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}

// Our Approach Section
function ApproachSection({ t }) {
  return (
    <section className="bg-white py-24 sm:py-32">
      <motion.div 
        initial="initial" 
        whileInView="animate" 
        viewport={{ once: true, amount: 0.3 }} 
        variants={{ animate: { transition: { staggerChildren: 0.2 } } }} 
        className="container mx-auto max-w-4xl px-6 text-center"
      >
        <motion.h2 
          variants={FADE_UP} 
          className="text-3xl font-bold leading-tight tracking-tight text-black sm:text-4xl lg:text-5xl"
        >
          {t.ourApproachTitle}
        </motion.h2>
        
        <motion.p 
          variants={FADE_UP} 
          className="mx-auto mt-8 max-w-3xl text-lg leading-relaxed text-gray-700"
        >
          {t.ourApproachP1}
        </motion.p>
        
        <motion.p 
          variants={FADE_UP} 
          className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-gray-700"
        >
          {t.ourApproachP2}
        </motion.p>
        
        <motion.p 
          variants={FADE_UP} 
          className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-gray-700"
        >
          {t.ourApproachP3}
        </motion.p>
      </motion.div>
    </section>
  );
}

// What Guides Us Section
function GuidesSection({ t }) {
  const guides = [
    {
      icon: HeartHandshake,
      titleKey: 'guideListenTitle',
      descKey: 'guideListenDescription',
    },
    {
      icon: Microscope,
      titleKey: 'guideToolsTitle',
      descKey: 'guideToolsDescription',
    },
    {
      icon: MessageSquare,
      titleKey: 'guideInformedTitle',
      descKey: 'guideInformedDescription',
    },
  ];

  return (
    <section className="bg-gray-950 py-24 sm:py-32">
      <div className="container mx-auto max-w-7xl px-6">
        <motion.div initial="initial" whileInView="animate" viewport={{ once: true }}>
          <motion.h2 
            variants={FADE_UP} 
            className="text-center text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl"
          >
            {t.whatGuidesUsTitle}
          </motion.h2>
        </motion.div>

        <motion.div 
          initial="initial" 
          whileInView="animate" 
          viewport={{ once: true, amount: 0.2 }} 
          variants={{ animate: { transition: { staggerChildren: 0.2 } } }} 
          className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3"
        >
          {guides.map(({ icon: Icon, titleKey, descKey }) => (
            <motion.div
              key={titleKey}
              variants={FADE_UP}
              className="group flex flex-col items-start rounded-2xl border border-gray-800 bg-gray-900/50 p-8 transition-all duration-300 hover:border-gray-700 hover:bg-gray-900"
            >
              <Icon className="h-12 w-12 text-blue-400" aria-hidden="true" />
              <h3 className="mt-6 text-xl font-semibold text-white">
                {t[titleKey]}
              </h3>
              <p className="mt-3 leading-relaxed text-gray-300">
                {t[descKey]}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// Meet Dr. Poudel Section
function DoctorSection({ t }) {
  return (
    <section className="bg-white py-24 sm:py-32">
      <div className="container mx-auto max-w-7xl px-6">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          variants={{ animate: { transition: { staggerChildren: 0.2 } } }}
          className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16"
        >
          {/* Photo */}
          <motion.div variants={FADE_UP} className="relative">
            <div className="overflow-hidden rounded-2xl border-8 border-white shadow-2xl">
              <Image
                src="/images/team-1.jpg"
                alt="Dr. Srishti Poudel, Lead Dentist and MDS Perio-orthodontics Specialist at BellaDent Dental Clinic in Lalitpur"
                width={500}
                height={600}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          </motion.div>

          {/* Bio */}
          <motion.div variants={FADE_UP} className="flex flex-col">
            <h2 className="text-3xl font-bold leading-tight tracking-tight text-black sm:text-4xl lg:text-5xl">
              {t.meetDoctorTitle}
            </h2>
            
            <div className="mt-4 inline-block rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
              {t.doctorSpecialty}
            </div>

            <p className="mt-8 text-lg leading-relaxed text-gray-700">
              {t.doctorBioP1}
            </p>

            <p className="mt-6 text-lg leading-relaxed text-gray-700">
              {t.doctorBioP2}
            </p>

            <p className="mt-6 text-lg leading-relaxed text-gray-700">
              {t.doctorBioP3}
            </p>

            <div className="mt-8">
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-2 border-gray-900 px-8 py-6 text-lg font-semibold text-gray-900 hover:bg-gray-900 hover:text-white focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
                aria-label="Schedule an appointment with Dr. Srishti Poudel"
              >
                <Link href="/book-appointment">
                  {t.scheduleWithDoctor}
                </Link>
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// Why Choose Us Section
function WhyChooseSection({ t }) {
  const reasons = [
    {
      titleKey: 'whyCommTitle',
      descKey: 'whyCommDescription',
    },
    {
      titleKey: 'whyScheduleTitle',
      descKey: 'whyScheduleDescription',
    },
    {
      titleKey: 'whyServicesTitle',
      descKey: 'whyServicesDescription',
    },
    {
      titleKey: 'whyEnvironmentTitle',
      descKey: 'whyEnvironmentDescription',
    },
  ];

  return (
    <section className="bg-gray-50 py-24 sm:py-32">
      <div className="container mx-auto max-w-7xl px-6">
        <motion.div initial="initial" whileInView="animate" viewport={{ once: true }}>
          <motion.h2
            variants={FADE_UP}
            className="text-center text-3xl font-bold leading-tight tracking-tight text-black sm:text-4xl lg:text-5xl"
          >
            {t.whyChooseUsTitle}
          </motion.h2>
        </motion.div>

        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.2 }}
          variants={{ animate: { transition: { staggerChildren: 0.15 } } }}
          className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2"
        >
          {reasons.map(({ titleKey, descKey }) => (
            <motion.div
              key={titleKey}
              variants={FADE_UP}
              className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-gray-900 hover:shadow-md"
            >
              <Check className="h-6 w-6 shrink-0 text-blue-500" aria-hidden="true" />
              <div>
                <h3 className="text-lg font-semibold text-black">
                  {t[titleKey]}
                </h3>
                <p className="mt-2 leading-relaxed text-gray-600">
                  {t[descKey]}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// Final CTA Section
function FinalCtaSection({ t }) {
  return (
    <section className="bg-gray-950 py-24 text-center sm:py-32">
      <motion.div
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={{ animate: { transition: { staggerChildren: 0.2 } } }}
        className="container mx-auto max-w-4xl px-6"
      >
        <motion.div variants={FADE_UP}>
          <Sparkles className="mx-auto h-12 w-12 text-blue-400" aria-hidden="true" />
        </motion.div>

        <motion.h2
          variants={FADE_UP}
          className="mt-6 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl"
        >
          {t.readyToStartTitle}
        </motion.h2>

        <motion.p
          variants={FADE_UP}
          className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-300"
        >
          {t.readyToStartSubtitle}
        </motion.p>

        <motion.div variants={FADE_UP} className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button
            asChild
            size="lg"
            className="rounded-full bg-blue-500 px-8 py-6 text-lg font-semibold hover:bg-blue-600 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            aria-label="Book your dental visit at BellaDent"
          >
            <Link href="/book-appointment">
              {t.bookYourVisit}
            </Link>
          </Button>

          <Link
            href="/contact"
            className="text-lg font-medium text-gray-300 underline decoration-gray-500 underline-offset-4 transition-colors hover:text-white hover:decoration-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950"
          >
            {t.haveQuestions} →
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}

// Main Page Component
export default function AboutPage() {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <>
      {/* SEO Meta Tags */}
      <head>
        <title>About BellaDent | Expert Dental Care in Lalitpur, Nepal</title>
        <meta
          name="description"
          content="Meet Dr. Srishti Poudel (MDS, Perio-orthodontics) and the BellaDent team. Gentle, modern dental care in Lalitpur with a patient-first approach."
        />
        <meta
          name="keywords"
          content="dentist Lalitpur, dental clinic Nepal, Dr. Srishti Poudel, periodontics, orthodontics, gentle dentist, expert dental care, BellaDent"
        />
      </head>

      <main>
        <HeroSection t={t} />
        <ApproachSection t={t} />
        <GuidesSection t={t} />
        <DoctorSection t={t} />
        <WhyChooseSection t={t} />
        <FinalCtaSection t={t} />
      </main>
    </>
  );
}