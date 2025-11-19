'use client';

import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../lib/translations';

export default function Footer() {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <footer className="bg-[#0194d0] text-white pt-12 pb-8 px-6 sm:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">

        {/* Clinic Info */}
        <div>
          <h3 className="text-xl font-bold mb-4">{t.clinicName}</h3>
          <p className="text-sm leading-relaxed">
            {t.footerDescription}
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-lg font-semibold mb-3">{t.footerQuickLinks}</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/" className="hover:underline">{t.navHome}</Link></li>
            <li><Link href="/about" className="hover:underline">{t.navAbout}</Link></li>
            <li><Link href="/services" className="hover:underline">{t.navServices}</Link></li>
            <li><Link href="/contact" className="hover:underline">{t.navContact}</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="text-lg font-semibold mb-3">{t.footerContact}</h4>
          <ul className="text-sm space-y-2">
            <li>{t.phoneLabel}: <a href="tel:+977-9849220563" className="hover:underline">+९७७-९८४९२२०५६३</a></li>
            <li>{t.emailLabel}: <a href="mailto:info@belladent.com" className="hover:underline">info@belladent.com</a></li>
            <li>{t.addressLabel}: {t.addressValue}</li>
          </ul>
        </div>

        {/* Social / Booking */}
        <div>
          <h4 className="text-lg font-semibold mb-3">{t.footerConnect}</h4>
          <p className="text-sm mb-4">{t.footerStayConnected}</p>
          <div className="flex space-x-4">
            <Link href="#" className="hover:opacity-80" aria-label="Facebook">
              <img src="/icons/facebook.svg" alt="Facebook" className="h-6 w-6" />
            </Link>
            <Link href="#" className="hover:opacity-80" aria-label="Instagram">
              <img src="/icons/instagram.svg" alt="Instagram" className="h-6 w-6" />
            </Link>
            {/* Add more icons as needed */}
          </div>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="mt-12 border-t border-white/30 pt-6 text-center text-sm">
        &copy; {new Date().getFullYear()} {t.clinicName}. {t.footerRights}.
      </div>
    </footer>
  );
}
