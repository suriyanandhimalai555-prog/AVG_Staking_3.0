import React from 'react';
import { Linkedin, Instagram, Facebook, ArrowUp } from 'lucide-react';
import Logo from '../assets/logo.png';
import FooterBg from '../assets/footer-bg.jpeg';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative w-full text-white pt-32 sm:pt-44 lg:pt-52 pb-10 px-6 sm:px-12 lg:px-20 overflow-hidden font-sans">
      
      {/* Background Image & Gradient Fade */}
      <div className="absolute inset-0 z-0">
        <img 
          src={FooterBg} 
          alt="Background View" 
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/85 via-[#0437cc]/85 to-[#021f7a]" />
      </div>

      {/* Fully Responsive Watermark that fits mobile & desktop without cutting off */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-full text-center pointer-events-none select-none z-0 overflow-hidden px-2">
        <h1 className="text-[12.5vw] sm:text-[13vw] font-black uppercase tracking-wider text-white/15 leading-none whitespace-nowrap">
          AGILAVETRI
        </h1>
      </div>

      <div className="max-w-7xl mx-auto relative z-10 border-t border-white/15 pt-8 sm:pt-12">
        
        {/* Main Footer Grid - Properly spaced for mobile stacks and desktop columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-16 pb-12 sm:pb-16 items-start justify-between">
          
          {/* Column 1: Brand & Description (Span 5) */}
          <div className="md:col-span-5 space-y-4">
            <a href="#" className="flex items-center gap-3">
              <img src={Logo} alt="AVG Staking Logo" className="w-8 h-8 object-contain" />
              <span className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                AVG Staking
              </span>
            </a>

            <div className="space-y-2 text-xs text-blue-100/75 leading-relaxed font-normal max-w-md">
              <p>© {new Date().getFullYear()} Agilavetri Primetech.</p>
              <p>AVG Staking offers a secure way to grow your crypto assets with consistent daily rewards, transparent plans, and industry-grade security built for long-term investors.</p>
            </div>
          </div>

          {/* Column 2: EXPLORE (Span 3) */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-blue-200/90">
              EXPLORE
            </h4>
            <ul className="space-y-2 text-xs text-blue-100/80 font-normal">
              <li><a href="#" className="hover:text-white transition-colors block py-0.5">Home</a></li>
              <li><a href="#guidelines" className="hover:text-white transition-colors block py-0.5">Guidelines</a></li>
              <li><a href="#compensation-plan" className="hover:text-white transition-colors block py-0.5">Direct & Level Income</a></li>
              <li><a href="#faqs" className="hover:text-white transition-colors block py-0.5">FAQs</a></li>
            </ul>
          </div>

          {/* Column 3: CONNECT & Social Links (Span 4) */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-blue-200/90">
              CONNECT
            </h4>
            <div className="space-y-2 text-xs text-blue-100/80 font-normal">
              <p>
                <a href="mailto:avgstake@gmail.com" className="hover:text-white transition-colors break-all">
                  avgstake@gmail.com
                </a>
              </p>
              {/* <p>
                <a href="tel:+919000000000" className="hover:text-white transition-colors">
                  +91 90000 00000
                </a>
              </p> */}
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-4 pt-2">
              <a href="#" aria-label="LinkedIn" className="text-white/80 hover:text-white transition-colors p-1">
                <Linkedin className="w-4 h-4 stroke-[1.75]" />
              </a>
              <a href="#" aria-label="Instagram" className="text-white/80 hover:text-white transition-colors p-1">
                <Instagram className="w-4 h-4 stroke-[1.75]" />
              </a>
              <a href="#" aria-label="Facebook" className="text-white/80 hover:text-white transition-colors p-1">
                <Facebook className="w-4 h-4 stroke-[1.75]" />
              </a>
            </div>
          </div>

        </div>

        {/* Minimal Bottom Line & Back to Top Trigger */}
        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-blue-100/60">
          <div className="flex items-center gap-6 text-[11px]">
            <a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-white transition-colors">Terms of Service</a>
          </div>

          <button 
            onClick={scrollToTop}
            className="text-white/80 hover:text-white transition-colors p-1 cursor-pointer flex items-center gap-1.5"
            aria-label="Back to top"
          >
            <span>Back to top</span>
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>

      </div>
    </footer>
  );
};

export default Footer;