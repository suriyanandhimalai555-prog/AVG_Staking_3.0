import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Menu, X, Shield, Coins, Award } from 'lucide-react';
import Logo from '../assets/logo.png';
import { useNavigate } from 'react-router-dom';
import Buttons from './Buttons'; // Adjust the import path if your Buttons component is located elsewhere

const Navbar = () => {
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const Navigate = useNavigate();
  
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setIsVisible(false);
        setIsProductsOpen(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProductsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div 
      className={`fixed top-0 left-0 right-0 w-full bg-white/80 backdrop-blur-md px-4 sm:px-8 z-50 transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <nav className="relative z-30 max-w-7xl mx-auto bg-white/95 backdrop-blur-md text-gray-900 rounded-b-3xl shadow-xl px-6 py-4 flex items-center justify-between border-b border-x border-gray-100 transition-all">
        
        {/* Left Navigation Items (Desktop) */}
        <div className="hidden md:flex items-center space-x-8 text-sm font-medium">
          <a href="#guidelines" className="text-gray-700 hover:text-[#0437cc] transition-colors font-bold">
            Guidelines
          </a>

          <a href="#compensation-plan" className="text-gray-700 hover:text-[#0437cc] transition-colors font-bold">
            Direct & Level Income
          </a>

          <a href="#faqs" className="text-gray-700 hover:text-[#0437cc] transition-colors font-bold">
            FAQs
          </a>
        </div>

        {/* Center Brand / Logo Section */}
        <a href="#" className="flex items-center gap-2.5 group">
          <img src={Logo} alt="AVG Staking Logo" className="w-10 h-10 object-contain" />
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-gray-900 flex items-center gap-1.5 mt-1">
              AVG Staking <span className="rounded bg-[#f77704] px-1.5 py-0.2 text-[9px] font-black uppercase text-white tracking-wider">
                    3.0
                  </span>
            </span>
            
          </div>
        </a>

        {/* Right CTA Actions using your separate Buttons component (Desktop) */}
        <div className="hidden md:flex items-center space-x-5 text-md">
          <a
            onClick={() => Navigate('/auth/login')}
            className="font-bold text-gray-700 hover:text-[#0437cc] transition-colors px-2 py-1 cursor-pointer"
          >
            Log In
          </a>

          <Buttons 
            text="Get Started" 
            onClick={() => Navigate('/auth/register')} 
          />
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            type="button"
            className="p-2 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown (Showing identical 3 links) */}
      {isMobileMenuOpen && (
        <div className="relative z-20 md:hidden max-w-7xl mx-auto mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 px-6 py-5 space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-400">Navigation</div>
          <div className="flex flex-col space-y-3 font-medium text-gray-700">
            <a href="#guidelines" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#0437cc] transition-colors">Guidelines</a>
            <a href="#compensation-plan" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#0437cc] transition-colors">Direct & Level Income</a>
            <a href="#faqs" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#0437cc] transition-colors">FAQs</a>
          </div>

          <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
            <a onClick={() => { setIsMobileMenuOpen(false); Navigate('/auth/login'); }} className="w-full text-center py-2.5 text-sm font-bold text-gray-700 hover:text-[#0437cc] rounded-xl border border-gray-200 cursor-pointer">
              Log In
            </a>
            
            <Buttons 
              text="Get Started" 
              onClick={() => { setIsMobileMenuOpen(false); Navigate('/auth/register'); }} 
              className="w-full justify-center"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;