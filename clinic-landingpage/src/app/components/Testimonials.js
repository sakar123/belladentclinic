'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const testimonials = [
  {
    id: 1,
    name: 'Sarah M.',
    role: 'Patient',
    content: 'The staff was friendly and professional. My teeth have never looked better!',
  },
  {
    id: 2,
    name: 'James T.',
    role: 'Patient',
    content: 'Highly recommend! They made my dental implant procedure easy and painless.',
  },
  {
    id: 3,
    name: 'Emily R.',
    role: 'Patient',
    content: 'Excellent care and modern equipment. A wonderful dental experience.',
  },
];

export default function Testimonials() {
  const [current, setCurrent] = useState(0);

  // Auto-cycle testimonials every 7 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 7000);
    return () => clearTimeout(timer);
  }, [current]);

  return (
    <section className="max-w-4xl mx-auto mt-20 px-6 text-center">
      <h2 className="text-3xl font-bold mb-12">What Our Clients Say</h2>
      <div className="relative min-h-[150px] bg-white/20 backdrop-blur-md rounded-2xl p-8 shadow-lg border border-white/30">
        <AnimatePresence mode="wait">
          <motion.blockquote
            key={testimonials[current].id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="text-lg italic"
          >
            “{testimonials[current].content}”
            <footer className="mt-4 font-semibold text-blue-200">
              — {testimonials[current].name}, <span className="text-sm">{testimonials[current].role}</span>
            </footer>
          </motion.blockquote>
        </AnimatePresence>

        {/* Dots navigation */}
        <div className="flex justify-center mt-8 space-x-4">
          {testimonials.map((t, i) => (
            <button
              key={t.id}
              aria-label={`Show testimonial from ${t.name}`}
              className={`w-3 h-3 rounded-full transition-colors ${
                i === current ? 'bg-purple-500' : 'bg-white/40'
              }`}
              onClick={() => setCurrent(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
