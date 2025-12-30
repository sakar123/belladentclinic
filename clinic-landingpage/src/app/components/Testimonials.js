'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        // In a production environment, this URL should be configured properly.
        const response = await fetch('http://localhost:5000/api/landingpage/reviews');
        if (!response.ok) {
          throw new Error('Failed to fetch testimonials');
        }
        const data = await response.json();
        setTestimonials(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  // Auto-cycle testimonials every 7 seconds
  useEffect(() => {
    if (testimonials.length === 0) return;
    const timer = setTimeout(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 7000);
    return () => clearTimeout(timer);
  }, [current, testimonials]);

  return (
    <section className="max-w-4xl mx-auto mt-20 px-6 text-center">
      <h2 className="text-3xl font-bold mb-12">What Our Clients Say</h2>
      <div className="relative min-h-[150px] bg-white/20 backdrop-blur-md rounded-2xl p-8 shadow-lg border border-white/30">
        <AnimatePresence mode="wait">
          {loading && <p>Loading testimonials...</p>}
          {error && <p>Could not load testimonials at this time.</p>}
          {!loading && !error && testimonials.length > 0 && (
            <motion.blockquote
              key={testimonials[current].authorName}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="text-lg italic"
            >
              “{testimonials[current].text}”
              <footer className="mt-4 font-semibold text-blue-200">
                — {testimonials[current].authorName}
              </footer>
            </motion.blockquote>
          )}
        </AnimatePresence>

        {/* Dots navigation */}
        <div className="flex justify-center mt-8 space-x-4">
          {testimonials.map((t, i) => (
            <button
              key={i}
              aria-label={`Show testimonial from ${t.authorName}`}
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
