import Link from "next/link";
import { Facebook, Instagram, Twitter } from "lucide-react";
import { INSTAGRAM_URL, FACEBOOK_URL } from '@/lib/socialLinks';

const Footer = () => {
  return (
    <footer className="bg-rich-navy text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold font-poppins text-electric-teal">BellaDent</h3>
            <p className="mt-4 text-light-gray/80">
              Your smile, our passion.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-lg text-white tracking-wider">Quick Links</h4>
            <ul className="mt-4 space-y-2">
              <li><Link href="/" className="hover:text-electric-teal transition-colors">Home</Link></li>
              <li><Link href="#about" className="hover:text-electric-teal transition-colors">About</Link></li>
              <li><Link href="#services" className="hover:text-electric-teal transition-colors">Services</Link></li>
              <li><Link href="#contact" className="hover:text-electric-teal transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg text-white tracking-wider">Contact</h4>
            <ul className="mt-4 space-y-2">
              <li><p>New Baneshwor, Kathmandu</p></li>
              <li><p>info@belladent.com</p></li>
              <li><p>+977-9876543210</p></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg text-white tracking-wider">Follow Us</h4>
            <div className="flex mt-4 space-x-4">
              <Link href={FACEBOOK_URL} className="hover:text-electric-teal transition-colors"><Facebook size={24} /></Link>
              <Link href={INSTAGRAM_URL} className="hover:text-electric-teal transition-colors"><Instagram size={24} /></Link>
              <Link href="#" className="hover:text-electric-teal transition-colors"><Twitter size={24} /></Link>
            </div>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-light-gray/20 text-center text-light-gray/60">
          <p>&copy; {new Date().getFullYear()} BellaDent. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
