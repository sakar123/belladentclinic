"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Award, Briefcase, Smile } from "lucide-react";

const credentials = [
  { icon: <Award className="h-8 w-8 text-sunny-yellow" />, text: "MDS Certified" },
  { icon: <Briefcase className="h-8 w-8 text-electric-teal" />, text: "15+ Years Experience" },
  { icon: <Smile className="h-8 w-8 text-vibrant-coral" />, text: "10K+ Happy Patients" },
];

const MeetTheDoctor = () => {
  return (
    <section className="py-24 bg-cream">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="relative inline-block"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-deep-purple to-electric-teal rounded-full blur-xl animate-pulse"></div>
          <Image
            src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Dr. Srishti Poudel"
            width={300}
            height={300}
            className="relative rounded-full object-cover border-8 border-white shadow-2xl"
          />
        </motion.div>
        
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-8 text-4xl md:text-5xl font-extrabold font-poppins text-charcoal"
        >
          Dr. Srishti Poudel
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-2 text-xl font-raleway text-deep-purple"
        >
          MDS, Perio-orthodontics Specialist
        </motion.p>

        <div className="mt-8 flex justify-center gap-8 md:gap-12">
            {credentials.map((cred, index) => (
                <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 + index * 0.15 }}
                    viewport={{ once: true }}
                    className="flex flex-col items-center gap-2"
                >
                    <div className="bg-white/70 backdrop-blur-sm p-4 rounded-full shadow-lg">{cred.icon}</div>
                    <span className="font-semibold font-raleway text-charcoal/90">{cred.text}</span>
                </motion.div>
            ))}
        </div>

        <motion.blockquote
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }} 
          className="mt-12 text-2xl italic font-raleway text-charcoal/80 max-w-3xl mx-auto"
        >
          &ldquo;I believe every smile tells a story... Let me help you write yours beautifully.&rdquo;
        </motion.blockquote>

        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            viewport={{ once: true }}
        >
            <Link href="/book-appointment/" className="mt-12 inline-block bg-gradient-to-r from-vibrant-coral to-sunny-yellow text-white font-bold py-4 px-10 rounded-full text-lg hover:scale-105 transition-transform transform-gpu">
                Book with Dr. Poudel
            </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default MeetTheDoctor;
