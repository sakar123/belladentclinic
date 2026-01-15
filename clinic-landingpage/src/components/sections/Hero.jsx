"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const Hero = () => {
  return (
    <section className="relative h-screen flex items-center justify-center bg-cream overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-soft-mint via-cream to-vibrant-coral/20 opacity-70"></div>
      
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="text-center md:text-left">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl md:text-7xl font-extrabold font-poppins tracking-tight"
            >
              <span className="bg-gradient-to-r from-deep-purple to-electric-teal bg-clip-text text-transparent">
                Your Dream Smile
              </span>
              <br />
              Starts Here ✨
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-6 text-xl text-charcoal/80 font-raleway max-w-xl mx-auto md:mx-0"
            >
              Modern dental care that feels like magic, not medicine.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-10 flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
            >
              <Link href="/book-appointment" className="bg-gradient-to-r from-electric-teal to-deep-purple text-white font-bold py-4 px-8 rounded-full text-lg hover:scale-105 transition-transform transform-gpu">
                Book Your Visit
              </Link>
              <Link href="#watch-video" className="border-2 border-deep-purple text-deep-purple font-bold py-4 px-8 rounded-full text-lg hover:bg-deep-purple hover:text-white transition-colors">
                Watch Our Story ▶
              </Link>
            </motion.div>
          </div>
          <div className="hidden md:block">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative w-full h-96"
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-vibrant-coral to-sunny-yellow rounded-full opacity-50 blur-2xl"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-tl from-electric-teal to-soft-mint rounded-full opacity-60 blur-xl animate-pulse"></div>
              <motion.p 
                animate={{ y: ["-10px", "10px", "-10px"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-9xl">🦷</motion.p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;