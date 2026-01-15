'use client';

import { FaWhatsapp } from 'react-icons/fa';

export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/+9779849220563?text=Hi%20BellaDent%21%20I%E2%80%99d%20like%20to%20get%20in%20touch.%20Please%20help%20me%20with%20an%20appointment%20or%20question." // Replace with your number
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-8 right-6 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg z-50 transition"
    >
      <FaWhatsapp size={24} />
    </a>
  );
}
