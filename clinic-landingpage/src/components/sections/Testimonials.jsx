"use client";

import React from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import Image from 'next/image'

const testimonials = [
  {
    quote: "BellaDent transformed my smile and my confidence. The care was exceptional, and the results are better than I ever imagined!",
    name: "Ramesh Sharma",
    treatment: "Dental Implant Patient",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    quote: "I used to be so anxious about visiting the dentist, but Dr. Poudel and her team made me feel completely at ease. A truly premium experience.",
    name: "Sita Rai",
    treatment: "Cosmetic Dentistry",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    quote: "The best dental clinic in Kathmandu, without a doubt. Professional, friendly, and they use the latest technology. Highly recommended!",
    name: "Hari Thapa",
    treatment: "Teeth Cleaning",
    avatar: "https://randomuser.me/api/portraits/men/46.jpg",
  },
];

const Testimonials = () => {
  const [emblaRef] = useEmblaCarousel({ loop: true });

  return (
    <section id="testimonials" className="py-24 bg-light-gray">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-extrabold font-poppins text-center mb-16"
        >
          What Our Patients Say
        </motion.h2>
        
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="flex-grow-0 flex-shrink-0 w-full min-w-0">
                <div className="bg-white rounded-3xl shadow-2xl p-10 md:p-12 max-w-3xl mx-auto">
                  <div className="flex text-sunny-yellow mb-4">
                    {[...Array(5)].map((_, i) => <Star key={i} fill="currentColor" className="h-6 w-6" />)}
                  </div>
                  <blockquote className="text-xl md:text-2xl font-raleway text-charcoal/80 leading-relaxed">
                    &ldquo;{testimonial.quote}&rdquo;
                  </blockquote>
                  <div className="mt-8 flex items-center">
                    <Image
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      width={60}
                      height={60}
                      className="rounded-full"
                    />
                    <div className="ml-4">
                      <p className="font-bold font-poppins text-lg text-charcoal">{testimonial.name}</p>
                      <p className="text-charcoal/70">{testimonial.treatment}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Testimonials