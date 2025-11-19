import './globals.css'; // Your Tailwind base styles
import Navbar from './components/Navbar';
import WhatsAppButton from './components/WhatsAppButton';
import Footer from './components/Footer';
import { LanguageProvider } from './context/LanguageContext';
import { Toaster } from 'sonner'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8"></meta>
      </head>
      <body className="bg-white text-gray-900 min-h-screen flex flex-col">
        <LanguageProvider>
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Toaster />
          <WhatsAppButton />
          <Footer />

        </LanguageProvider>
      </body>
    </html>
  );
}
