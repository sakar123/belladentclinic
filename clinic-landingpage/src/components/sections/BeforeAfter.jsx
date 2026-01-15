"use client";

import { motion } from "framer-motion";
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';

const gallery = [
  {
    before: "https://images.unsplash.com/photo-1618037219902-793544537b94?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    after: "https://images.unsplash.com/photo-1618037219902-793544537b94?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ps=true",
    title: "Teeth Whitening"
  },
  {
    before: "https://images.unsplash.com/photo-1600701554167-5febf9168922?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    after: "https://images.unsplash.com/photo-1600701554167-5febf9168922?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ps=true",
    title: "Dental Implants"
  },
  {
    before: "https://images.unsplash.com/photo-1599300764723-0ed5a3b73376?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    after: "https://images.unsplash.com/photo-1599300764723-0ed5a3b73376?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ps=true",
    title: "Braces"
  }
];

const BeforeAfter = () => {
  return (
    <section className="py-24 bg-cream">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-extrabold font-poppins text-center mb-16"
        >
          See The Transformation
        </motion.h2>
        <div className="grid md:grid-cols-3 gap-8">
          {gallery.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="rounded-3xl overflow-hidden shadow-2xl"
            >
              <ReactCompareSlider
                itemOne={<ReactCompareSliderImage src={item.before} alt="Before" />}
                itemTwo={<ReactCompareSliderImage src={item.after} alt="After" />}
              />
              <div className="p-4 bg-white text-center">
                <h3 className="text-xl font-bold font-poppins text-charcoal">{item.title}</h3>
              </div>
            </motion.div>
          ))}
        </div>
        <p className="text-center mt-8 text-lg text-charcoal/70 font-raleway">
          Drag the slider to see the magic ✨
        </p>
      </div>
    </section>
  );
};

export default BeforeAfter;