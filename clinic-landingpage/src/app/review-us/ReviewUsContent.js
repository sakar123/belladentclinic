'use client';

import { Button } from '@/components/ui/button';
import { Facebook, Instagram, Music } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../lib/translations';
import { GOOGLE_REVIEW_URL, TIKTOK_URL, INSTAGRAM_URL, FACEBOOK_URL } from '@/lib/socialLinks';

export default function ReviewUsContent() {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <section className="container mx-auto max-w-xl px-6 py-16">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{t.reviewFollowTitle}</h1>
        <p className="text-muted-foreground mt-2">{t.reviewFollowSubtitle}</p>
      </div>

      <div className="space-y-4">
        <a href={GOOGLE_REVIEW_URL} target="_blank" rel="noopener noreferrer" className="block">
          <Button className="w-full h-14 text-base">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12 s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C33.045,6.053,28.727,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
              <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,16.108,18.961,14,24,14c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657 C33.045,6.053,28.727,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
              <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.197l-6.19-5.238C29.211,35.091,26.715,36,24,36 c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.022C9.505,39.556,16.227,44,24,44z"/>
              <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-3.994,5.565l0.003-0.002l6.19,5.238 C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
            </svg>
            {t.leaveGoogleReview}
          </Button>
        </a>

        <a href={TIKTOK_URL} target="_blank" rel="noopener noreferrer" className="block">
          <Button variant="secondary" className="w-full h-14 text-base">
            <Music className="h-5 w-5" aria-hidden="true" />
            {t.followOnTikTok}
          </Button>
        </a>

        <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="block">
          <Button variant="secondary" className="w-full h-14 text-base">
            <Instagram className="h-5 w-5" aria-hidden="true" />
            {t.followOnInstagram}
          </Button>
        </a>

        <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" className="block">
          <Button variant="secondary" className="w-full h-14 text-base">
            <Facebook className="h-5 w-5" aria-hidden="true" />
            {t.followOnFacebook}
          </Button>
        </a>
      </div>
    </section>
  );
}
