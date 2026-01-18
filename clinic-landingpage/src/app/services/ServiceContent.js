"use client";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { translations } from '../lib/translations.js';
import { useLanguage } from '../context/LanguageContext';

// --- Service Data (as a plain JavaScript object) ---
const dentalServices = {
  orthodontics: {
    title: "Orthodontics / Braces",
    services: [
      { name: "Aligners (Invisalign)", description: "Achieve a perfectly straight smile with Ialign clear aligners, the modern alternative to braces. These virtually invisible trays are custom-made to comfortably shift your teeth, offering an effective and discreet orthodontic solution available right here in Lalitpur." },
      { name: "Lingual Braces", description: "For the ultimate discreet treatment, lingual braces are placed behind your teeth, making them completely hidden from view. Get the powerful results of traditional braces without anyone knowing you’re undergoing treatment." },
      { name: "Self-ligating Braces", description: "Experience faster and more comfortable treatment with self-ligating braces. Using a specialized clip instead of elastic bands, these braces reduce friction and pressure, often leading to quicker appointments and excellent results." },
      { name: "Ceramic Braces", description: "Ceramic braces offer the same effectiveness as metal braces but with clear or tooth-colored brackets that blend in with your smile. They are a popular choice for patients in Lalitpur seeking a less noticeable orthodontic option." },
      { name: "Traditional Metal Braces", description: "A time-tested and highly effective solution, traditional metal braces reliably correct a wide range of orthodontic issues. They remain one of the most durable and cost-effective ways to achieve a straight, healthy smile." },
    ]
  },
  cosmetic: {
    title: "Cosmetic / Aesthetic Dentistry",
    services: [
      { name: "Porcelain Veneers", description: "Transform your smile with ultra-thin, custom-made porcelain veneers. They are the perfect solution for correcting chips, stains, or gaps, providing a durable and radiant smile makeover that looks completely natural." },
      { name: "Emax (Porcelain) Crown", description: "Emax crowns are renowned for their superior strength and lifelike appearance, making them an ideal choice for restoring front teeth. These all-ceramic crowns blend seamlessly with your natural teeth for a flawless finish." },
      { name: "Zirconia Crown", description: "Zirconia crowns offer exceptional durability and biocompatibility, perfect for restoring teeth anywhere in the mouth. They provide a strong, long-lasting, and aesthetically pleasing solution for damaged or decayed teeth." },
      { name: "Teeth Gap Closure", description: "Close unwanted gaps between your teeth using cosmetic bonding or veneers for a more uniform and confident smile. Our experts in Lalitpur will help you choose the best, minimally invasive option for your needs." },
      { name: "Smile Makeover", description: "A comprehensive smile makeover combines multiple cosmetic treatments to achieve your dream smile. We create a personalized plan, addressing everything from tooth color to alignment, to deliver stunning, life-changing results." },
      { name: "Tooth-colored Fillings", description: "Repair cavities discreetly with tooth-colored composite fillings. These modern fillings bond directly to your tooth, providing a strong, natural-looking restoration that matches your tooth shade perfectly." },
      { name: "Teeth Whitening", description: "Brighten your smile safely and effectively with our professional teeth whitening services in Lalitpur. Enjoy noticeable results with minimal sensitivity and long-lasting brightness." },
    ]
  },
  implants: {
    title: "Dental Implants",
    services: [
      { name: "Single Tooth Implant", description: "Replace a missing tooth with a natural-looking and fully functional implant. This long-lasting solution helps preserve jawbone and maintains smile aesthetics." },
      { name: "Implant-Supported Bridge", description: "Restore multiple missing teeth with an implant-supported bridge. This approach avoids the need for individual implants for each tooth and provides strong, stable support." },
      { name: "All-on-4 / Full Arch Implants", description: "A transformative solution for those with several missing teeth. Using as few as four implants, we can support a full arch of beautiful, functional teeth." },
      { name: "Bone Grafting & Sinus Lift", description: "Enhance jawbone volume and structure to support implants with advanced bone grafting and sinus lift techniques when necessary." },
    ]
  },
  restorative: {
    title: "Restorative Dentistry",
    services: [
      { name: "Root Canal Treatment (RCT)", description: "Save infected or severely decayed teeth with precise and comfortable root canal treatment, restoring function and relieving pain." },
      { name: "Crowns & Bridges", description: "Restore damaged or missing teeth with high-quality crowns and bridges that offer durability and natural aesthetics." },
      { name: "Inlays & Onlays", description: "Custom-made restorations ideal for rebuilding teeth with moderate decay or damage while preserving more natural tooth structure." },
    ]
  },
  periodontics: {
    title: "Gum Care (Periodontics)",
    services: [
      { name: "Scaling & Root Planing", description: "Deep cleaning treatment to remove plaque and tartar below the gum line, helping prevent gum disease progression." },
      { name: "Gum Contouring", description: "Reshape the gum line to improve aesthetics and smile proportions for a more balanced appearance." },
      { name: "Gum Grafting", description: "Treat gum recession and protect exposed tooth roots with grafting procedures that restore gum tissue." },
    ]
  },
  pediatric: {
    title: "Pediatric Dentistry",
    services: [
      { name: "Fluoride Treatment & Sealants", description: "Protect children’s teeth against decay with preventative fluoride applications and sealants on molars." },
      { name: "Space Maintainers", description: "Maintain proper spacing in the jaw after early tooth loss to prevent misalignment as permanent teeth erupt." },
      { name: "Habit Management", description: "Support for habits like thumb-sucking with gentle corrective strategies to protect bite development." },
    ]
  },
  oralSurgery: {
    title: "Oral Surgery",
    services: [
      { name: "Wisdom Tooth Extraction", description: "Safe and comfortable extraction of impacted or problematic wisdom teeth with careful aftercare guidance." },
      { name: "Tooth Extraction", description: "Gentle extraction of severely damaged or decayed teeth when necessary, with guidance on replacement options." },
      { name: "Cyst/Lesion Removal", description: "Surgical removal of oral cysts or benign lesions with precise techniques and proper healing care." },
    ]
  }
};

export default function ServiceContent() {
  const { language } = useLanguage();
  const t = translations[language];

  const serviceKeys = Object.keys(dentalServices);

  return (
    <>
      {/* Hero Section */}
      <section className="py-20 md:py-8 text-center bg-muted/20 mt-5">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-primary">
            Dental Services in Lalitpur, Nepal
          </h1>
          <p className="mt-4 max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground">
            Discover a complete range of expert dental care designed to give you a healthy, confident smile.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-12">
          
          {/* Sticky Sidebar - Shows on large screens */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24">
              <h3 className="text-xl font-semibold mb-4">Our Services</h3>
              <nav>
                <ul className="space-y-2">
                  {serviceKeys.map((key) => (
                    <li key={key}>
                      <a 
                        href={`#${key}`} 
                        className="text-muted-foreground hover:text-primary transition-colors duration-300 font-medium"
                      >
                        {dentalServices[key].title}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </aside>

          {/* Services Section */}
          <main className="lg:col-span-9 space-y-16">
            {serviceKeys.map((key, index) => {
              const category = dentalServices[key];
              return (
                <section key={key} id={key} className="scroll-mt-20">
                  <div className="mb-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-primary">{category.title}</h2>
                    <div className="mt-2 h-1 w-20 bg-primary/50 rounded-full"></div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {category.services.map((service) => (
                      <Card key={service.name} className="border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
                        <CardHeader>
                          <CardTitle className="text-xl text-foreground">{service.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <CardDescription className="text-base text-muted-foreground">
                            {service.description}
                          </CardDescription>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* CTA between sections - Example after first three sections */}
                  {(index === 2 || index === 5) && (
                    <div className="text-center my-16">
                       <Card className="bg-muted/30 p-8 flex flex-col items-center justify-center">
                         <h3 className="text-2xl font-semibold mb-2">Ready for Your Perfect Smile?</h3>
                         <p className="text-muted-foreground mb-4 max-w-md">Our expert team in Lalitpur is here to help you achieve your dental goals.</p>
                         <Link 
                          href="/book-appointment/"
                          className="px-5 py-3 font-semibold bg-primary text-primary-foreground rounded-md shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200"
                        >
                          {t.navBookAppointment}
                        </Link>
                       </Card>
                    </div>
                  )}
                </section>
              );
            })}
          </main>
        </div>
      </div>
    </>
  );
}
