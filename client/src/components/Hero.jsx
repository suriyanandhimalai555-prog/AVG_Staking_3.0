import React from 'react';
import { ShieldCheck, TrendingUp, Sparkles, Lock, Building2, Users, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Buttons from './Buttons'; // Adjust import path if needed

const Hero = () => {
  const Navigate = useNavigate();
  return (
    <section className="relative bg-white overflow-hidden pt-42 pb-16 px-4 sm:px-8">
      
      {/* Background Soft Multi-Color Glows */}
      {/* <div className="absolute top-24 left-1/4 -translate-x-1/2 w-[500px] h-[300px] bg-[#0437cc]/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-36 right-1/4 w-[400px] h-[250px] bg-[#f77704]/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[450px] h-[200px] bg-[#a6e71c]/15 blur-[100px] rounded-full pointer-events-none" /> */}

      <div className="max-w-7xl mx-auto w-full relative z-10">
        
        {/* Hero Title & Subtitle */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-gray-900 leading-[1.12]">
            Unlock Global Staking Rewards &{' '}
            <span className="bg-gradient-to-r from-[#0437cc] via-[#f77704] to-[#7bb310] bg-clip-text text-transparent">
              Real Estate Assets
            </span>
          </h1>

          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed font-normal">
            A transparent, level-based staking and compensation ecosystem offering direct referral commissions, luxury travel packages, real estate security, and high-value rewards.
          </p>

          {/* Integrated Custom Buttons Component */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Buttons 
              text="Get Started Now" 
              onClick={() => Navigate('/auth/register')} 
            />
          </div>
        </div>

        {/* Floating Interactive Visual Showcase Card */}
        <div className="mt-14 max-w-4xl mx-auto bg-white border border-gray-100 shadow-2xl rounded-3xl p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-full pointer-events-none -z-0" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50/80 border border-gray-100">
              <div className="p-3 rounded-xl bg-blue-100 text-[#0437cc]">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs text-gray-500 font-medium">Direct Commission</div>
                <div className="text-lg font-bold text-gray-900">5% Instant Payout</div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50/80 border border-gray-100">
              <div className="p-3 rounded-xl bg-orange-100 text-[#f77704]">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs text-gray-500 font-medium">Security Backing</div>
                <div className="text-lg font-bold text-gray-900">Property Surety Plan</div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50/80 border border-gray-100">
              <div className="p-3 rounded-xl bg-lime-100 text-[#7bb310]">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs text-gray-500 font-medium">Withdrawal Fee</div>
                <div className="text-lg font-bold text-gray-900">0% ($0 Fee)</div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-500 font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#0437cc]" />
              <span>Fixed Exchange Rate: $1 = ₹100</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#f77704]" />
              <span>48-Hour Processing Window</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#7bb310]" />
              <span>7-Level Deep Commission Structure</span>
            </div>
          </div>
        </div>

        {/* Bottom Feature Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 max-w-5xl mx-auto">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-blue-200 transition-colors">
            <div className="p-2 rounded-xl bg-blue-50 text-[#0437cc]">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-gray-900">7-Level Income</div>
              <div className="text-[11px] text-gray-500">Sequential structures</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-orange-200 transition-colors">
            <div className="p-2 rounded-xl bg-orange-50 text-[#f77704]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-gray-900">100% Secure</div>
              <div className="text-[11px] text-gray-500">Verified contracts</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-lime-200 transition-colors">
            <div className="p-2 rounded-xl bg-lime-50 text-[#7bb310]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-gray-900">Milestone Tours</div>
              <div className="text-[11px] text-gray-500">40:30:30 trips</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-blue-200 transition-colors">
            <div className="p-2 rounded-xl bg-blue-50 text-[#0437cc]">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-gray-900">Global Deposits</div>
              <div className="text-[11px] text-gray-500">Staking 3.0 scale</div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;