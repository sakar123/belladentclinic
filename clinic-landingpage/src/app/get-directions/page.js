'use client';

import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Navigation } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../lib/translations';

export default function DirectionsPage() {
  const { language } = useLanguage();
  const t = translations[language];

  const [origin, setOrigin] = useState('');
  const destination = "27.66901480628321, 85.32179030264363";

  const handleRouteSubmit = (e) => {
    e.preventDefault();
    if (!origin) {
      alert(t.routeOriginAlert);
      return;
    }
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`;
    window.open(mapsUrl, '_blank', 'noopener,noreferrer');
  };

  const InfoItem = ({ icon: Icon, label, href, children }) => (
    <a href={href} className="flex items-start text-lg group">
      <Icon className="h-6 w-6 text-primary mt-1 mr-4 flex-shrink-0" />
      <span className="text-muted-foreground group-hover:text-primary transition-colors">
        {children || label}
      </span>
    </a>
  );

  return (
    <>
      <div className="container mx-auto px-4 py-16 md:py-24 mt-40">
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-primary tracking-tight">
            {t.directionsHeadline}
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            {t.directionsDescription}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Left Column: Clinic Info */}
          <div className="lg:col-span-2">
            <Card className="border-border/50 shadow-sm sticky top-24">
              <CardHeader>
                <CardTitle className="text-2xl">
                  {t.clinicInformation}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <h3 className="text-xl font-semibold text-foreground">
                  {t.dentalExperts}
                </h3>
                <InfoItem icon={MapPin} href="#map">
                  {t.addressValue}
                </InfoItem>
                <InfoItem
                  icon={Phone}
                  href={`tel:${t.PHONE_NUMBER}`}
                  label={t.PHONE_NUMBER}
                />
                <InfoItem
                  icon={Mail}
                  href={`mailto:${t.EMAIL}`}
                  label={t.EMAIL}
                />
                <div className="flex items-start text-lg">
                  <Clock className="h-6 w-6 text-primary mt-1 mr-4 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">
                      {t.openingHoursTitle}
                    </p>
                    <p className="text-muted-foreground">
                      {t.openingHoursWeekdays}
                    </p>
                    <p className="text-muted-foreground">
                      {t.openingHoursWeekends}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Map and Route Planner */}
          <div className="lg:col-span-3 space-y-8" id="map">
            {/* Map Embed */}
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="text-2xl">
                  {t.mapTitle}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-w-16 aspect-h-10 rounded-lg overflow-hidden border">
                  <iframe
                    src="https://www.google.com/maps?q=27.669024959910836,85.32176618189557&hl=en&z=16&output=embed"
                    width="100%"
                    height="450"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={t.mapIframeTitle}
                  ></iframe>
                </div>
              </CardContent>
            </Card>

            {/* Route Planner */}
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="text-2xl">
                  {t.routePlannerTitle}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRouteSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="origin" className="text-base font-medium">
                      {t.routeOriginLabel}
                    </Label>
                    <Input
                      id="origin"
                      type="text"
                      placeholder={t.routeOriginPlaceholder}
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                      required
                      className="mt-2"
                    />
                  </div>
                  <Button type="submit" size="lg" className="w-full">
                    <Navigation className="mr-2 h-5 w-5" />
                    {t.showRoute}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-24">
          <h2 className="text-3xl font-bold tracking-tight">
            {t.ctaHeadline}
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-muted-foreground">
            {t.ctaSubtext}
          </p>
          <div className="mt-8">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {t.bookNow}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
