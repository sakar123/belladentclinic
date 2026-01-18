'use client';

import { FaWhatsapp } from 'react-icons/fa';
import { WHATSAPP_URL } from '@/lib/socialLinks';

export default function WhatsAppButton() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-8 right-6 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg z-50 transition"
    >
      <FaWhatsapp size={24} />
    </a>
  );
}
