import React from 'react';
import { DollarSign, ArrowUpRight, ArrowDownLeft, Clock, ShieldCheck, Zap, ShieldAlert, ArrowRight } from 'lucide-react';

const FinancialGuidelines = () => {
  const guidelines = [
    {
      title: "Fixed Currency Rate",
      value: "$1 USD = ₹100 INR",
      description: "Guaranteed stable conversion rate across all platform deposits and withdrawals.",
      icon: DollarSign,
      themeColor: "blue",
      badge: "Stable"
    },
    {
      title: "Minimum Member Deposit",
      value: "$500 USD",
      subValue: "(₹50,000 INR)",
      description: "Standard qualifying deposit to activate your staking accounts and tiers.",
      icon: ArrowDownLeft,
      themeColor: "orange",
      badge: "Entry Tier"
    },
    {
      title: "Maximum Deposit Limit",
      value: "Unlimited",
      description: "Scale your staking capacity and rewards without artificial ceiling restrictions.",
      icon: ArrowUpRight,
      themeColor: "lime",
      badge: "No Caps"
    },
    {
      title: "Minimum Withdrawal",
      value: "$20 USD",
      description: "Low threshold enabling quick and frequent liquidity access for members.",
      icon: ArrowUpRight,
      themeColor: "blue",
      badge: "Low Threshold"
    },
    {
      title: "Processing Time & Fee",
      value: "48 Hours",
      subValue: "$0 Fee",
      description: "Guaranteed 48-hour processing window with absolutely zero transaction fees.",
      icon: Clock,
      themeColor: "orange",
      badge: "Fast & Free"
    },
    {
      title: "KYC Requirement",
      value: "Mandatory",
      description: "Required prior to unlocking eligible financial transactions and payouts.",
      icon: ShieldAlert,
      themeColor: "lime",
      badge: "Verification"
    }
  ];

  return (
    <section className="relative bg-gradient-to-b from-white via-gray-50/50 to-white py-16 px-4 sm:px-8 overflow-hidden border-t border-gray-100">
      
      {/* Background Soft Glow Accents */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-[#0437cc]/5 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-[#f77704]/5 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 pb-8 border-b border-gray-200/60 gap-6">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#0437cc] text-xs font-semibold tracking-wide">
              <Zap className="w-3.5 h-3.5 text-[#0437cc]" />
              <span>Transparent Platform Parameters</span>
            </div>
            
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900 leading-[1.15]">
              Financial & Transaction <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0437cc] to-[#18acfa]">Guidelines</span>
            </h2>
          </div>
          
          <p className="text-base text-gray-600 max-w-md">
            Engineered for seamless, transparent, and fee-free global operations with predictable, locked parameters.
          </p>
        </div>

        {/* Modern Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guidelines.map((item, index) => {
            const IconComponent = item.icon;
            
            // Dynamic theme styling classes
            const isBlue = item.themeColor === 'blue';
            const isOrange = item.themeColor === 'orange';

            const iconBgClass = isBlue 
              ? 'bg-blue-100 text-[#0437cc] group-hover:bg-[#0437cc] group-hover:text-white' 
              : isOrange 
              ? 'bg-orange-100 text-[#f77704] group-hover:bg-[#f77704] group-hover:text-white' 
              : 'bg-lime-100 text-[#65940c] group-hover:bg-[#a6e71c] group-hover:text-gray-900';

            const badgeClass = isBlue
              ? 'bg-blue-50 text-[#0437cc] border-blue-100'
              : isOrange
              ? 'bg-orange-50 text-[#f77704] border-orange-100'
              : 'bg-lime-50 text-[#65940c] border-lime-100';

            const hoverBorderClass = isBlue
              ? 'hover:border-blue-300 hover:shadow-blue-500/5'
              : isOrange
              ? 'hover:border-orange-300 hover:shadow-orange-500/5'
              : 'hover:border-lime-300 hover:shadow-lime-500/5';

            return (
              <div 
                key={index}
                className={`bg-white border border-gray-200/80 p-8 rounded-3xl transition-all duration-300 shadow-sm hover:shadow-xl group flex flex-col justify-between ${hoverBorderClass}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className={`p-3.5 rounded-2xl transition-colors duration-300 ${iconBgClass}`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${badgeClass}`}>
                      {item.badge}
                    </span>
                  </div>

                  <div className="text-sm font-medium text-gray-400 mb-1">{item.title}</div>
                  <div className="text-3xl font-black text-gray-900 tracking-tight flex items-baseline gap-2">
                    {item.value}
                    {item.subValue && <span className="text-sm font-semibold text-gray-400">{item.subValue}</span>}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-gray-500 mt-4 pt-4 border-t border-gray-100 leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Bottom Trust Banner */}
        <div className="mt-12 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-8 sm:p-10 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#f77704]/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-2 text-center sm:text-left relative z-10">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#a6e71c] tracking-wider uppercase">
              <ShieldCheck className="w-4 h-4" /> Secure Escrow Infrastructure
            </div>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight">Ready to begin your staking journey?</h3>
            <p className="text-gray-400 text-sm max-w-xl">Join thousands of global investors maximizing returns securely with zero hidden fees.</p>
          </div>

          <a 
            href="/auth/register" 
            className="relative z-10 inline-flex items-center gap-2 bg-[#f77704] hover:bg-[#e06802] text-white font-bold px-7 py-3.5 rounded-2xl shadow-lg shadow-orange-500/25 transition-all duration-200 active:scale-95 whitespace-nowrap"
          >
            <span>Create Account</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

      </div>
    </section>
  );
};

export default FinancialGuidelines;