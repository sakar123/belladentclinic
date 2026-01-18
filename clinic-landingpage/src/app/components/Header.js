'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../lib/translations';

const navigationLinks = [
  { href: '/', key: 'navHome' },
  { href: '/about/', key: 'navAbout' },
  { href: '/services/', key: 'navServices' },
  { href: '/get-directions/', key: 'navGetDirections' },
  { href: '/contact/', key: 'navContact' },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { language, toggleLanguage } = useLanguage();
  const t = translations[language];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md shadow-sm">
      <div className="container mx-auto flex h-20 items-center justify-between px-6">
        <a href="/" className="text-2xl font-bold text-primary">
          BellaDent
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navigationLinks.map(({ href, key }) => (
            <a key={href} href={href} className="text-lg font-medium text-foreground hover:text-primary transition-colors">
              {t[key]}
            </a>
          ))}
        </nav>

        <div className="flex items-center space-x-4">
          <button onClick={toggleLanguage} className="text-sm font-semibold text-muted-foreground hover:text-primary">
            {language === 'en' ? 'ने' : 'EN'}
          </button>
          <a href="/book-appointment/" className="hidden md:inline-block bg-primary text-primary-foreground px-6 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
            {t.bookNow}
          </a>
          <button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-md">
          <nav className="flex flex-col items-center space-y-4 py-6">
            {navigationLinks.map(({ href, label }) => (
              <a key={href} href={href} className="text-lg font-medium text-foreground hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>
                {t[label]}
              </a>
            ))}
            <a href="/book-appointment/" className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
              {t.bookNow}
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
