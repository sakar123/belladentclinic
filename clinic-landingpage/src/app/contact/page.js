'use client';

import { useState } from 'react';
import { Send, Phone, Mail, MapPin, MessageCircle, Facebook, Instagram } from 'lucide-react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../lib/translations';

export default function ContactPage() {
  const { language } = useLanguage();
  const t = translations[language];

 const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    message: '',
  });
  const [status, setStatus] = useState({ sending: false, success: null, message: '' });

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.message) {
      setStatus({ sending: false, success: false, message: 'Please fill out all fields.' });
      return;
    }

    setStatus({ sending: true, success: null, message: 'Sending...' });

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setStatus({ sending: false, success: true, message: result.message });
        setFormData({ fullName: '', email: '', message: '' }); // Clear form
      } else {
        throw new Error(result.message || 'Something went wrong.');
      }
    } catch (error) {
      setStatus({ sending: false, success: false, message: error.message });
    }
  };
  const ContactLink = ({ icon: Icon, href, label, ariaLabel }) => (
    <div className="flex items-center space-x-3 text-sm">
      <Icon className="h-5 w-5 text-primary" />
      <a href={href} aria-label={ariaLabel} className="hover:underline text-muted-foreground">
        {label}
      </a>
    </div>
  );

  return (
    <main className="container mx-auto px-4 py-16 md:py-24 mt-40">
      <section className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-primary tracking-tight">{t.contactHeadline}</h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">{t.contactSubtext}</p>
      </section>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Contact Info Cards */}
        <div className="space-y-6">
          {/* Direct Contact Card */}
          <Card className="shadow-lg">
            <CardContent className="p-6 space-y-4">
              <CardTitle className="text-2xl">{t.contactDirectTitle}</CardTitle>
              <ContactLink icon={Phone} href={`tel:${t.PHONE_NUMBER}`} label={t.PHONE_NUMBER} ariaLabel={t.phoneLabel} />
              <ContactLink icon={Mail} href={`mailto:${t.EMAIL}`} label={t.EMAIL} ariaLabel={t.emailLabel} />
              <ContactLink icon={MessageCircle} href="https://wa.me/9779849220563?text=Hello%2C%20I%20have%20a%20dental%20question" label={t.whatsappLabel} ariaLabel={t.whatsappLabel} />
              <ContactLink icon={Instagram} href="https://instagram.com/yourclinic" label={t.instagramLabel} ariaLabel={t.instagramLabel} />
              <ContactLink icon={Facebook} href="https://facebook.com/yourclinic" label={t.facebookLabel} ariaLabel={t.facebookLabel} />
            </CardContent>
          </Card>

          {/* Location Card */}
          <Card className="shadow-lg">
            <CardContent className="p-6 space-y-4">
              <CardTitle className="text-2xl flex items-center">
                <MapPin className="h-7 w-7 text-primary mr-3" />
                {t.contactLocationTitle}
              </CardTitle>
              <p className="text-lg text-muted-foreground">{t.addressValue}</p>
              <div className="w-full h-64 rounded-md overflow-hidden shadow">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3532.2608753986185!2d85.31643711453802!3d27.70695673242951!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb1976997b68e3%3A0x6f1a0c42f4e9a97e!2sPatan%20City%20Dental%20Clinic!5e0!3m2!1sen!2snp!4v1688986707764!5m2!1sen!2snp"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="shadow-lg">
            <CardContent className="p-6 space-y-4">
              <CardTitle className="text-2xl">{t.contactFormTitle}</CardTitle>

              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-base">{t.formFullNameLabel}</Label>
                <Input id="fullName" placeholder={t.formFullNamePlaceholder} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-base">{t.formEmailLabel}</Label>
                <Input id="email" type="email" placeholder={t.formEmailPlaceholder} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-base">{t.formMessageLabel}</Label>
                <Textarea id="message" rows={5} placeholder={t.formMessagePlaceholder} required />
              </div>

              <Button type="submit" disabled={status.sending} className="w-full">
                <Send className="mr-2 h-5 w-5" />
                {status.sending ? t.formSending : t.formSubmit}
              </Button>

              {status.message && (
                <div className="mt-2 text-sm text-green-600 font-medium">
                  {status.message}
                </div>
              )}
            </CardContent>
          </Card>
        </form>
      </div>
    </main>
  );
}
