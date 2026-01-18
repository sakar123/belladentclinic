"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "#services", label: "Services" },
    { href: "#about", label: "About" },
    { href: "#testimonials", label: "Testimonials" },
    { href: "#contact", label: "Contact" },
  ];

  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-shadow duration-300 ${hasScrolled ? 'shadow-lg bg-white/90 backdrop-blur-sm' : 'bg-white/80'}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="text-2xl font-bold font-poppins text-deep-purple">
            BellaDent
          </Link>
          <nav className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-lg font-medium text-charcoal hover:text-deep-purple transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="hidden md:flex">
             <Link href="/book-appointment/" className="bg-gradient-to-r from-electric-teal to-deep-purple text-white font-bold py-3 px-6 rounded-full hover:opacity-90 transition-opacity">
                Book Now
              </Link>
          </div>
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-charcoal">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden bg-white/90 backdrop-blur-sm">
          <nav className="flex flex-col items-center space-y-4 py-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-xl font-medium text-charcoal hover:text-deep-purple transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link href="/book-appointment/" onClick={() => setIsOpen(false)} className="bg-gradient-to-r from-electric-teal to-deep-purple text-white font-bold py-3 px-8 rounded-full hover:opacity-90 transition-opacity">
                Book Now
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
