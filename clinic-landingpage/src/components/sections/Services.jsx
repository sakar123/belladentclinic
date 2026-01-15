"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const services = [
  {
    title: "Dental Implants",
    description: "State-of-the-art implants that look and feel natural.",
    gridClass: "md:col-span-2 md:row-span-2",
    bgColor: "bg-gradient-to-br from-electric-teal/20 to-cream",
  },
  {
    title: "Teeth Cleaning",
    description: "Comprehensive cleaning for a healthier smile.",
    gridClass: "md:col-span-1",
    bgColor: "bg-gradient-to-br from-soft-mint/30 to-cream",
  },
  {
    title: "Teeth Whitening",
    description: "Brighten your smile with our professional whitening services.",
    gridClass: "md:col-span-1",
    bgColor: "bg-gradient-to-br from-sunny-yellow/20 to-cream",
  },
  {
    title: "Cosmetic Dentistry",
    description: "Transform your smile with veneers, bonding, and more.",
    gridClass: "md:col-span-1",
    bgColor: "bg-gradient-to-br from-vibrant-coral/20 to-cream",
  },
  {
    title: "Root Canal Therapy",
    description: "Painless procedures to save your natural teeth.",
    gridClass: "md:col-span-1",
    bgColor: "bg-gradient-to-br from-deep-purple/10 to-cream",
  },
];

const Services = () => {
  return (
    <section id="services" className="py-24 bg-cream">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-extrabold font-poppins text-center mb-16"
        >
          Our Services
        </motion.h2>
        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`rounded-3xl p-8 flex flex-col justify-between shadow-xl hover:shadow-2xl transition-shadow duration-300 ${service.gridClass} ${service.bgColor} group`}
            >
              <div>
                <h3 className="text-3xl font-bold font-poppins text-charcoal">{service.title}</h3>
                <p className="mt-4 text-lg text-charcoal/80 font-raleway">{service.description}</p>
              </div>
              <button className="mt-8 flex items-center text-deep-purple font-bold group-hover:text-electric-teal transition-colors">
                Learn More <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;