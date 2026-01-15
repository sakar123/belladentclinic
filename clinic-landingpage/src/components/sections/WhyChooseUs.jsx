"use client";

import { motion } from "framer-motion";
import { CheckCircle, Zap, Gem, Users, CreditCard } from "lucide-react";
import Image from 'next/image';


const features = [
  {
    icon: <Zap className="h-10 w-10 text-electric-teal" />,
    title: "Modern Technology",
    description: "We use the latest digital X-rays, 3D imaging, and scanners for accurate and efficient treatment.",
  },
  {
    icon: <Gem className="h-10 w-10 text-vibrant-coral" />,
    title: "Premium Experience",
    description: "Your comfort is our priority. Enjoy a relaxing atmosphere and personalized care from our friendly team.",
  },
  {
    icon: <Users className="h-10 w-10 text-deep-purple" />,
    title: "Expert Team",
    description: "Our team of specialists has over 15 years of experience in creating beautiful, healthy smiles.",
  },
  {
    icon: <CreditCard className="h-10 w-10 text-sunny-yellow" />,
    title: "Flexible Payments",
    description: "We offer a variety of payment plans and financing options to make your dream smile affordable.",
  },
];

const WhyChooseUs = () => {
  return (
    <section id="about" className="py-24 bg-light-gray">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-extrabold font-poppins text-center mb-16"
          >
            Why Choose BellaDent?
        </motion.h2>
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="relative h-[500px] w-full">
            <Image 
                src="https://images.unsplash.com/photo-1579783902614-a345cd0e3df4?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                alt="BellaDent Clinic Interior"
                layout="fill"
                objectFit="cover"
                className="rounded-3xl shadow-2xl"
            />
          </div>
          <div className="space-y-10">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                viewport={{ once: true }}
                className="flex items-start"
              >
                <div className="flex-shrink-0">{feature.icon}</div>
                <div className="ml-6">
                  <h3 className="text-2xl font-bold font-poppins text-charcoal">{feature.title}</h3>
                  <p className="mt-2 text-lg text-charcoal/80 font-raleway">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;