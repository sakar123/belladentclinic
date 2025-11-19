// Updated app/about/page.jsx with language context and full translations

'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, HeartHandshake, Microscope, BotMessageSquare, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Button } from '@/components/ui/button';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../lib/translations';

const teamMembers = [
  { name: 'Dr. Srishti Poudel', role: 'Lead Dentist', image: '/images/team-1.jpg' },
];

const values = [
  { icon: HeartHandshake, key: 'valueEmpathy' },
  { icon: Microscope, key: 'valuePrecision' },
  { icon: BotMessageSquare, key: 'valueCommunication' },
];

const FADE_UP = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

function HeroSection({ t }) {
  return (
    <section className="relative grid h-screen min-h-[700px] grid-cols-1 items-center md:grid-cols-2">
      <div className="absolute inset-0 z-0 h-full w-full md:relative">
        <video className="h-full w-full object-cover brightness-[0.4] md:brightness-100" autoPlay loop muted playsInline src="/videos/clinic-ambience.mp4" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent md:hidden" />
      </div>
      <motion.div initial="initial" animate="animate" variants={{ animate: { transition: { staggerChildren: 0.15 } } }} className="z-10 flex flex-col items-start p-8 lg:p-16">
        <motion.h1 variants={FADE_UP} className="text-4xl font-bold leading-tight tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">{t.aboutHeroTitle}</motion.h1>
        <motion.p variants={FADE_UP} className="mt-6 max-w-xl text-lg sm:text-xl">{t.aboutHeroSubtitle}</motion.p>
        <motion.div variants={FADE_UP} className="mt-8">
          <Button asChild size="lg" className="group rounded-full bg-blue-500 px-8 py-6 text-lg hover:bg-blue-600">
            <a href="/book-appointment">{t.bookConsultation}<ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" /></a>
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}

function StorySection({ t }) {
  return (
    <section className="py-24 sm:py-32">
      <motion.div initial="initial" whileInView="animate" viewport={{ once: true, amount: 0.3 }} variants={{ animate: { transition: { staggerChildren: 0.2 } } }} className="container mx-auto max-w-4xl px-6 text-center">
        <motion.h2 variants={FADE_UP} className="text-3xl font-bold tracking-tight  sm:text-4xl">{t.ourStoryTitle}</motion.h2>
        <motion.p variants={FADE_UP} className="mx-auto mt-6 max-w-3xl text-lg leading-8">{t.ourStoryDescription}</motion.p>
      </motion.div>
    </section>
  );
}

function ValuesGrid({ t }) {
  return (
    <section className="bg-gray-950 py-24 sm:py-32">
      <div className="container mx-auto px-6 text-center">
        <motion.div initial="initial" whileInView="animate" viewport={{ once: true }}>
          <motion.h2 variants={FADE_UP} className="text-3xl font-bold tracking-tight sm:text-4xl">{t.ourValuesTitle}</motion.h2>
        </motion.div>
        <motion.div initial="initial" whileInView="animate" viewport={{ once: true, amount: 0.2 }} variants={{ animate: { transition: { staggerChildren: 0.2 } } }} className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          {values.map(({ icon: Icon, key }) => (
            <motion.div key={key} variants={FADE_UP} className="flex flex-col items-center p-8 border border-gray-800 rounded-2xl bg-gray-900/50">
              <Icon className="h-10 w-10 text-blue-400" />
              <h3 className="mt-6 text-xl font-semibold">{t[key + 'Title']}</h3>
              <p className="mt-2">{t[key + 'Description']}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function TeamCarousel({ t }) {
  return (
    <section className="py-24 sm:py-32 overflow-hidden">
      <div className="container mx-auto px-6 text-center">
        <motion.h2 initial="initial" whileInView="animate" viewport={{ once: true }} variants={FADE_UP} className="text-3xl font-bold tracking-tight sm:text-4xl">{t.meetTeamTitle}</motion.h2>
        <motion.p initial="initial" whileInView="animate" viewport={{ once: true }} variants={FADE_UP} className="mt-4 max-w-2xl mx-auto text-lg">{t.meetTeamSubtitle}</motion.p>
      </div>
      <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
        <Carousel opts={{ align: "start", loop: true }} className="w-full max-w-7xl mx-auto mt-16">
          <CarouselContent className="-ml-4">
            {teamMembers.map((member) => (
              <CarouselItem key={member.name} className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                <Card className="overflow-hidden border-gray-800 bg-transparent group">
                  <CardContent className="flex aspect-[4/5] items-center justify-center p-0">
                    <Image src={member.image} alt={`Photo of ${member.name}`} width={400} height={500} className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-6">
                      <h4 className="text-xl font-semibold">{member.name}</h4>
                      <p className="text-blue-400">{member.role}</p>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-[-10px] sm:left-4  bg-white/10 hover:bg-white/20 border-gray-700" />
          <CarouselNext className="right-[-10px] sm:right-4 bg-white/10 hover:bg-white/20 border-gray-700" />
        </Carousel>
      </motion.div>
    </section>
  );
}

function CtaSection({ t }) {
  return (
    <section className="py-24 sm:py-32 text-center bg-gray-950">
      <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={{ animate: { transition: { staggerChildren: 0.2 } } }}>
        <motion.div variants={FADE_UP}><Sparkles className="mx-auto h-12 w-12 text-blue-400" /></motion.div>
        <motion.h2 variants={FADE_UP} className="mt-6 text-3xl font-bold tracking-tight  sm:text-4xl">{t.trustTitle}</motion.h2>
        <motion.p variants={FADE_UP} className="mx-auto mt-6 max-w-2xl text-lg leading-8">{t.trustDescription}</motion.p>
        <motion.div variants={FADE_UP} className="mt-10">
          <Button asChild size="lg" className="group rounded-full bg-blue-500 px-8 py-6 text-lg hover:bg-blue-600 shadow-lg shadow-blue-500/20">
            <a href="/book-appointment">{t.bookConsultation}</a>
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}

export default function AboutPage() {
  const { language } = useLanguage();
  const t = translations[language];
  return (
    <main>
      <HeroSection t={t} />
      <StorySection t={t} />
      <ValuesGrid t={t} />
      <TeamCarousel t={t} />
      <CtaSection t={t} />
    </main>
  );
}
