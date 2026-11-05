import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import ImageSlider from '../components/ImageSlider';
import FinancialGuidelines from '../components/FinancialGuidelines';
import CompensationPlan from '../components/CompensationPlan';
import FAQ from '../components/Faq';
import Footer from '../components/Footer';
import { FiBell, FiX } from 'react-icons/fi';

const Website = () => {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // Check if user previously chose "Don't show me again"
    const hidePopup = localStorage.getItem("hide_website_announcement");
    if (!hidePopup) {
      // Small delay for smooth popup entrance on visit
      const timer = setTimeout(() => setShowPopup(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleIgnore = () => {
    setShowPopup(false);
  };

  const handleDontShowAgain = () => {
    localStorage.setItem("hide_website_announcement", "true");
    setShowPopup(false);
  };

  return (
    <div className="relative">
        <Navbar />
        <section id="home">
            <Hero />
        </section>
        {/* <section id="">
            <ImageSlider />
        </section> */}
        <section id="guidelines">
            <FinancialGuidelines />
        </section>
        <section id="compensation-plan">
            <CompensationPlan />
        </section>
        <section id="faqs">
            <FAQ />
        </section>
        <Footer />

        {/* WEBSITE ANNOUNCEMENT POPUP */}
        {showPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-300">
            <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden p-6 sm:p-8 space-y-6 relative">
              
              {/* Close Button */}
              <button
                onClick={handleIgnore}
                className="absolute top-5 right-5 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition cursor-pointer"
              >
                <FiX className="text-sm" />
              </button>

              {/* Icon & Heading */}
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-[#0437cc]/10 text-[#0437cc] flex items-center justify-center text-xl shrink-0 shadow-inner">
                  <FiBell />
                </div>
                <div>
                  <span className="inline-block px-2 py-0.5 rounded bg-[#f77704]/10 text-[#f77704] text-[10px] font-black uppercase tracking-wider mb-1">
                    Announcement
                  </span>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">
                    Welcome to AVG Staking 3.0!
                  </h3>
                </div>
              </div>

              {/* Message Body */}
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                Welcome to the upgraded dashboard! Your session is active and securely connected. Easily track your ROI earnings, monitor your team network volume, and manage your staking portfolio all from one place. Enjoy the improved experience!
              </p>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <button
                  onClick={handleDontShowAgain}
                  className="w-full py-3 rounded-xl bg-[#0437cc] hover:bg-[#032da6] text-white text-xs sm:text-sm font-bold shadow-sm transition active:scale-95 cursor-pointer"
                >
                  Don't show me again
                </button>
                <button
                  onClick={handleIgnore}
                  className="w-full py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs sm:text-sm font-bold transition cursor-pointer"
                >
                  Ignore
                </button>
              </div>

            </div>
          </div>
        )}
    </div>
  )
}

export default Website;