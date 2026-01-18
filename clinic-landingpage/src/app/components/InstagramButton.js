'use client';

import { Instagram } from 'lucide-react';
import { INSTAGRAM_URL } from '@/lib/socialLinks';

export default function InstagramButton() {
  return (
    <a
      href={INSTAGRAM_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Open BellaDent Instagram"
      className="fixed bottom-64 right-6 bg-pink-600 hover:bg-pink-700 text-white p-4 rounded-full shadow-lg z-50 transition"
    >
      <Instagram className="h-6 w-6" />
    </a>
  );
}
