// /app/services/page.jsx
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// --- SEO Metadata Block ---
// Next.js automatically handles this plain object for metadata.
export const metadata = {
  title: 'Top Dental Services in Lalitpur, Nepal | Expert Dental Care',
  description: 'Explore a full range of dental services in Lalitpur, from cosmetic dentistry and orthodontics to dental implants and root canals. Book your consultation today for expert care.',
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
    description: 'Discover comprehensive and affordable dental solutions in the heart of Lalitpur. Your journey to a perfect smile starts here.',
    url: 'https://yourclinicwebsite.com.np/services', // Replace with your actual URL
    siteName: 'Your Dental Clinic Name', // Replace with your clinic name
    images: [
      {
        url: 'https://yourclinicwebsite.com.np/og-image.jpg', // Replace with a relevant OG image URL
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
};

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
      { name: "Teeth Whitening", description: "Brighten your smile safely and effectively with our professional teeth whitening services in Lalitpur. Erase years of stains from coffee, tea, and tobacco, and achieve a dramatically whiter smile in just one visit." },
      { name: "Full-mouth Rehabilitation", description: "For complex dental issues, full-mouth rehabilitation restores the health, function, and beauty of your entire mouth. This comprehensive approach rebuilds your smile from the ground up, ensuring long-term oral health." },
    ]
  },
  crownsAndBridge: {
    title: "Crowns and Bridge",
    services: [
        { name: "Metal-Ceramic Crown", description: "Combining the strength of a metal base with the aesthetics of a porcelain exterior, metal-ceramic crowns are a durable and reliable option for restoring damaged teeth. They provide a strong chewing surface and a natural look." },
        { name: "Metal-Ceramic Bridge", description: "A metal-ceramic bridge is a robust and time-tested solution for replacing one or more missing teeth. It consists of crowns fused together, anchored by your natural teeth to restore function and appearance." },
        { name: "Emax Crown", description: "Emax crowns are crafted from high-strength lithium disilicate ceramic, offering unparalleled aesthetics and translucency. They are the premier choice for front teeth, perfectly mimicking the look of natural enamel." },
        { name: "Emax Bridge", description: "For replacing missing front teeth where aesthetics are paramount, an Emax bridge provides a beautiful, metal-free restoration. It ensures your smile remains seamless, strong, and incredibly natural-looking." },
        { name: "Zirconia Crown", description: "Made from solid monolithic zirconia, these crowns are virtually unbreakable and incredibly biocompatible. Zirconia crowns are an excellent choice for molars, offering superior strength for heavy chewing forces." },
        { name: "Zirconia Bridge", description: "A zirconia bridge is the ultimate combination of strength and aesthetics for replacing multiple teeth anywhere in the mouth. This metal-free solution prevents dark lines at the gum level and ensures long-lasting results." },
    ]
  },
  implant: {
    title: "Dental Implant",
    services: [
      { name: "Single Dental Implant", description: "Replace a single missing tooth with a dental implant, the gold-standard solution that mimics a natural tooth root. An implant provides a secure foundation for a crown, preserving bone health and restoring your smile without affecting adjacent teeth." },
      { name: "Multiple Dental Implants", description: "For several missing teeth, multiple implants can support a bridge or dentures, offering unparalleled stability and function. This is the most effective long-term solution for extensive tooth loss available in Nepal." },
    ]
  },
  endodontics: {
    title: "Endodontics",
    services: [
      { name: "Root Canal Treatment", description: "Save an infected or severely decayed tooth with root canal therapy. Our gentle and precise treatment removes the infected pulp, relieves pain, and protects the tooth from extraction, preserving your natural smile." },
    ]
  },
  surgery: {
    title: "Oral and Maxillofacial Surgery",
    services: [
      { name: "Teeth Extraction", description: "When a tooth is too damaged to be saved, a safe and comfortable extraction is performed. We ensure the process is as painless as possible, providing clear aftercare instructions for a smooth recovery." },
      { name: "Impacted Wisdom Teeth Extraction", description: "Impacted wisdom teeth can cause pain, infection, and damage to neighboring teeth. Our oral surgeons in Lalitpur specialize in the safe and efficient removal of problematic wisdom teeth to protect your oral health." },
    ]
  },
  pediatric: {
    title: "Pediatric / Kids Dentistry",
    services: [
      { name: "Baby Tooth Filling", description: "Protect your child's oral health with gentle fillings for cavities in baby teeth. Early treatment prevents the spread of decay and ensures the proper development of their permanent teeth." },
      { name: "Baby Tooth Root Canal (Pulpectomy)", description: "When decay reaches the nerve of a baby tooth, a pulpectomy (baby root canal) can save it from premature extraction. This procedure is crucial for maintaining space for the adult tooth to erupt correctly." },
      { name: "Baby Tooth Extraction", description: "If a baby tooth is severely decayed or damaged, a gentle extraction may be necessary. We ensure a comfortable experience for your child, preserving the health of their developing smile." },
    ]
  },
  gum: {
    title: "Gum Treatment",
    services: [
      { name: "Teeth Scaling and Polishing", description: "Maintain optimal oral hygiene with professional teeth scaling to remove hardened plaque (tartar) and polishing to remove surface stains. This routine procedure is essential for preventing gum disease and keeping your smile bright." },
      { name: "Gingivectomy", description: "A gingivectomy reshapes or removes excess gum tissue to treat conditions like gingivitis or improve the aesthetics of a 'gummy smile'. This procedure enhances both the health and appearance of your gums." },
      { name: "Crown Lengthening", description: "Crown lengthening is a procedure to expose more of the tooth structure by reshaping the gum and bone tissue. It is often necessary when a tooth needs a crown but not enough of it is visible." },
    ]
  },
  appliances: {
    title: "Oral Appliances",
    services: [
      { name: "Night-guard", description: "Protect your teeth from nighttime grinding (bruxism) with a custom-fitted night-guard. This durable appliance prevents tooth wear, fractures, and jaw pain, ensuring you wake up comfortable and pain-free." },
      { name: "Retainers", description: "After orthodontic treatment, a custom-made retainer is essential to keep your newly aligned teeth in their perfect position. We offer both fixed and removable retainers to maintain your beautiful results for a lifetime." },
      { name: "Bleaching Trays", description: "Achieve professional whitening results from the comfort of your home with our custom-fit bleaching trays. These trays ensure even application of the whitening gel for a brighter, more consistent smile." },
    ]
  },
};

// --- Main Page Component ---
export default function ServicesPage() {
  const serviceKeys = Object.keys(dentalServices);

  return (
    <>
      {/* Hero Section */}
      <section className="py-20 md:py-32 text-center bg-muted/20 mt-40">
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
                         <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                           Book a Consultation
                         </Button>
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