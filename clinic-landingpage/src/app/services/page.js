// /app/services/page.jsx (Server Component)
// Exports metadata and renders the client-side ServiceContent.

export const metadata = {
  title: 'Top Dental Services in Lalitpur, Nepal | Expert Dental Care',
  description:
    'Explore a full range of dental services in Lalitpur, from cosmetic dentistry and orthodontics to dental implants and root canals. Book your consultation today for expert care.',
  keywords: [
    'Dental Services in Lalitpur',
    'Lalitpur dental clinic',
    'cosmetic dentistry Nepal',
    'Invisalign in Lalitpur',
    'braces cost in Nepal',
    'dental implants Lalitpur',
    'root canal treatment Nepal',
    'teeth whitening Lalitpur',
    'pediatric dentistry Nepal',
    'smile makeover Nepal',
  ],
  openGraph: {
    title: 'Top Dental Services in Lalitpur, Nepal | Expert Dental Care',
    description:
      'Discover comprehensive and affordable dental solutions in the heart of Lalitpur. Your journey to a perfect smile starts here.',
    url: 'https://yourclinicwebsite.com.np/services',
    siteName: 'Your Dental Clinic Name',
    images: [
      {
        url: 'https://yourclinicwebsite.com.np/og-image.jpg',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
};

import ServiceContent from './ServiceContent';

export default function ServicesPage() {
  return <ServiceContent />;
}

