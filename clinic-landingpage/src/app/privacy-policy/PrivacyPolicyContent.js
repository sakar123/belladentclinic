'use client';

import { useLanguage } from '../context/LanguageContext';
import { translations } from '../lib/translations';

export default function PrivacyPolicyContent() {
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

