'use client';

import { Bot } from 'lucide-react';

const GPT_URL = 'https://chatgpt.com/g/g-696345c13e888191854597f3740e25b3-belladent-dental-care-assistant';

export default function BellaDentGPTButton() {
  return (
    <a
      href={GPT_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Open BellaDent Dental Care Assistant"
      className="fixed bottom-36 right-6 bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-full shadow-lg z-50 transition"
    >
      <Bot className="h-6 w-6" />
    </a>
  );
}
