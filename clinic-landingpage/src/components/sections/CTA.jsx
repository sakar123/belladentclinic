"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const CTA = () => {
  return (
    <section className="relative py-24 bg-gradient-to-r from-deep-purple to-electric-teal overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true }}
          className="text-4xl md:text-6xl font-extrabold font-poppins text-white"
        >
          Ready For Your Best Smile? 😊
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          viewport={{ once: true }}
          className="mt-6 text-xl text-white/80 font-raleway max-w-2xl mx-auto"
        >
          Book your appointment today and get 20% off your first cleaning!
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
          viewport={{ once: true }}
          className="mt-12 flex flex-col sm:flex-row gap-6 justify-center"
        >
          <Link href="/book-appointment" className="bg-white text-deep-purple font-bold py-4 px-10 rounded-full text-lg hover:scale-105 transition-transform transform-gpu shadow-2xl">
            Book Appointment
          </Link>
          <Link href="tel:01-5456555" className="border-2 border-white text-white font-bold py-4 px-10 rounded-full text-lg hover:bg-white hover:text-deep-purple transition-colors">
            Call Now: 01-5456555
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;