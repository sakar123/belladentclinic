"use client";

import { useLanguage } from '../context/LanguageContext';
import { translations } from '../lib/translations';

export const metadata = {
  title: 'Privacy Policy',
  description:
    "Read BellaDent Clinic's privacy policy to understand how we collect, use, and protect your personal data.",
};

export default function PrivacyPolicyPage() {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">{t.privacyHeadline}</h1>
      <p>{t.privacyIntro}</p>
      <p className="mt-4">{t.privacyBody1}</p>
    </div>
  );
}
