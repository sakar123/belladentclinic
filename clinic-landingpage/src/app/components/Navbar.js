'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../lib/translations.js';

// Helper component for the animated menu icon
const MenuIcon = ({ isOpen }) => (
    <svg
        className="w-6 h-6 text-gray-800"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        {/* These paths animate to form an 'X' when the menu is open */}
        <path d={isOpen ? "M18 6L6 18" : "M3 12h18"} className="transition-all duration-300 ease-in-out" />
        <path d="M6 6l12 12" className={`transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0'}`} />
        <path d={isOpen ? "M6 6l12 12" : "M3 6h18"} className="transition-all duration-300 ease-in-out" />
        <path d={isOpen ? "" : "M3 18h18"} className="transition-all duration-300 ease-in-out" />
    </svg>
);


export default function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    
    // Using your actual language context and translations
    const { language, toggleLanguage } = useLanguage();
    const t = translations[language];
    const pathname = usePathname();
  
    // --- Navigation Links Configuration ---
    // Separated for clarity and easier maintenance
    const navLinks = [
      { href: '/', label: t.navHome },
      { href: '/about', label: t.navAbout },
      { href: '/services', label: t.navServices },
      { href: '/contact', label: t.navContact },
      { href: '/blogs', label: t.navBlogs },
      { href: '/get-directions', label: t.navGetDirections },
    ];
  
    // --- Effect for Scroll Detection ---
    // This effect adds a scroll event listener to track the page's scroll position.
    useEffect(() => {
      const handleScroll = () => {
        // Sets 'isScrolled' to true if user has scrolled more than 10px
        setIsScrolled(window.scrollY > 10);
      };
      // Add listener when component mounts
      window.addEventListener('scroll', handleScroll);
      // Clean up listener when component unmounts
      return () => window.removeEventListener('scroll', handleScroll);
    }, []); // Empty dependency array means this effect runs only once on mount
  
    // --- Effect for Body Scroll Lock on Mobile Menu ---
    // This effect prevents the page from scrolling in the background when the mobile menu is open.
    useEffect(() => {
      if (mobileMenuOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'auto';
      }
      // Cleanup function to restore scrolling when the component unmounts
      return () => {
        document.body.style.overflow = 'auto';
      };
    }, [mobileMenuOpen]); // This effect runs whenever 'mobileMenuOpen' changes
  

  return (
    <>
      <nav className={`fixed top-0 left-0 pt-10 right-0 z-50 transition-all duration-300 ease-in-out ${isScrolled ? 'bg-white/80 backdrop-blur-lg shadow-md' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* --- Logo and Clinic Name --- */}
            <Link href="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
              <Image
                src="/images/belladent-logo.svg"
                alt="BellaDent Dental Clinic and Implant Center"
                width={250}
                height={250}
                className="rounded-lg"
                onError={(e) => { e.currentTarget.src = '/images/belladent-logo.svg'; }}
              />
              <span className="hidden sm:block text-xl font-bold text-gray-800 tracking-tight">{t.clinicName}</span>
            </Link>

            <span className="hidden sm:block text-base md:text-xl font-bold text-gray-800 tracking-tight">
              {t.clinicName}
            </span>
            {/* --- Desktop Navigation --- */}
            <div className="hidden md:flex items-center space-x-8">
              <ul className="flex items-center space-x-6 text-gray-600 font-medium">
                {navLinks.map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href} className={`transition-colors duration-200 hover:text-purple-600 ${pathname === href ? 'text-purple-600 font-semibold' : ''}`}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleLanguage}
                  className="px-3 py-2 text-sm font-semibold rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors duration-200"
                  aria-label="Toggle language"
                >
                  {language === 'en' ? 'ने' : 'EN'}
                </button>
                <Link href="/book-appointment" className="px-5 py-2 text-sm font-semibold text-white bg-purple-600 rounded-md shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200">
                  {t.navBookAppointment}
                </Link>
              </div>
            </div>

            {/* --- Mobile Menu Button --- */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md inline-flex items-center justify-center text-gray-800 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500"
                aria-expanded={mobileMenuOpen}
                aria-label="Open main menu"
              >
                <MenuIcon isOpen={mobileMenuOpen} />
              </button>
            </div>
          </div>
        </div>

        {/* --- Mobile Menu Drawer --- */}
        <div 
            className={`fixed inset-0 z-40 transform transition-transform duration-300 ease-in-out md:hidden ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
            {/* Overlay */}
            <div 
                className={`absolute inset-0 bg-black/40 transition-opacity duration-300 pointer-events-none ${mobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
                onClick={() => setMobileMenuOpen(false)}
            ></div>

            {/* Drawer Content */}
            <div className={`absolute top-0 right-0 h-full w-4/5 max-w-xs bg-white shadow-lg p-6 flex flex-col`}>
                <div className="flex justify-between items-center mb-8">
                    <span className="text-lg font-bold text-gray-800">Menu</span>
                    <button
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-2 rounded-md text-gray-800 hover:bg-gray-200"
                        aria-label="Close menu"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                <nav className="flex-grow">
                    <ul className="space-y-4">
                        {navLinks.map(({ href, label }) => (
                            <li key={href}>
                                <Link 
                                    href={href} 
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`block py-2 text-lg font-medium transition-colors duration-200 hover:text-purple-600 ${pathname === href ? 'text-purple-600' : 'text-gray-700'}`}
                                >
                                    {label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div className="mt-8 space-y-4">
                    <Link 
                        href="/book-appointment" 
                        onClick={() => setMobileMenuOpen(false)}
                        className="block w-full text-center px-5 py-3 font-semibold text-white bg-purple-600 rounded-md shadow-sm hover:bg-purple-700 transition-all duration-200"
                    >
                        {t.navBookAppointment}
                    </Link>
                     <button
                        onClick={toggleLanguage}
                        className="block w-full px-3 py-3 font-semibold rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors duration-200"
                        aria-label="Toggle language"
                    >
                        {language === 'en' ? 'नेपालीमा स्विच गर्नुहोस्' : 'Switch to English'}
                    </button>
                </div>
            </div>
        </div>
      </nav>
    </>
  );
}
