"use client";

import { useLanguage } from '../context/LanguageContext';
import { translations } from '../lib/translations';

export default function Blogs() {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div className="min-h-screen flex items-center justify-center text-2xl font-semibold">
      {t.blogsTitle}
    </div>
  );
}
  
