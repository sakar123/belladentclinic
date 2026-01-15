"use client";

import { motion } from "framer-motion";
import CountUp from "react-countup";
import Tilt from "react-parallax-tilt";
import { Award, Heart, Smile, Users } from "lucide-react";

const stats = [
  {
    icon: <Award size={48} className="text-vibrant-coral" />,
    value: 15,
    suffix: "+",
    label: "Years of Experience",
  },
  {
    icon: <Users size={48} className="text-electric-teal" />,
    value: 10000,
    suffix: "+",
    label: "Happy Patients",
  },
  {
    icon: <Heart size={48} className="text-deep-purple" />,
    value: 98,
    suffix: "%",
    label: "Satisfaction Rate",
  },
  {
    icon: <Smile size={48} className="text-sunny-yellow" />,
    value: 5000,
    suffix: "+",
    label: "Dental Implants",
  },
];

const Stats = () => {
  return (
    <section className="py-24 bg-light-gray">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Tilt
                tiltMaxAngleX={10}
                tiltMaxAngleY={10}
                perspective={1000}
                glareEnable={true}
                glareMaxOpacity={0.15}
                glarePosition="all"
              >
                <div
                  className="bg-white/60 backdrop-blur-sm p-8 rounded-2xl shadow-lg text-center h-full"
                >
                  <div className="flex justify-center mb-4">{stat.icon}</div>
                  <h3 className="text-5xl font-bold font-poppins text-charcoal">
                    <CountUp end={stat.value} duration={3} />
                    {stat.suffix}
                  </h3>
                  <p className="mt-2 text-lg font-raleway text-charcoal/70">
                    {stat.label}
                  </p>
                </div>
              </Tilt>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;