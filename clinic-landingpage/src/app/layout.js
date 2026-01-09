import './globals.css';
import Header from './components/Header';
import Footer from './components/Footer';
import { LanguageProvider } from './context/LanguageContext';
import { Toaster } from 'sonner';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8"></meta>
      </head>
      <body className="bg-background text-foreground min-h-screen flex flex-col">
        <LanguageProvider>
          <Header />
          <main className="flex-grow pt-20">{children}</main>
          <Toaster />
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
