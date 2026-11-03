import React from 'react';
import { Users, Award, ArrowRight, CheckCircle2, TrendingUp, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Buttons from './Buttons'; // Adjust import path if needed

const CompensationPlan = () => {
  const Navigate = useNavigate();

  const levels = [
    { level: 'Level 1', rate: '5%', req: '$20,000 eligible Level 1 volume unlocks Level 2', color: 'blue' },
    { level: 'Level 2', rate: '4%', req: '$40,000 eligible Level 2 volume unlocks Level 3', color: 'orange' },
    { level: 'Level 3', rate: '3%', req: '$80,000 eligible Level 3 volume unlocks Level 4', color: 'lime' },
    { level: 'Level 4', rate: '2.5%', req: '$100,000 eligible Level 4 volume unlocks Level 5', color: 'blue' },
    { level: 'Level 5', rate: '2%', req: '$120,000 eligible Level 5 volume unlocks Level 6', color: 'orange' },
    { level: 'Level 6', rate: '1.5%', req: '$150,000 eligible Level 6 volume unlocks Level 7', color: 'lime' },
    { level: 'Level 7', rate: '1%', req: '$200,000 eligible Level 7 volume (Final Level Target)', color: 'blue' },
  ];

  return (
    <section id="compensation" className="relative bg-gradient-to-b from-white via-gray-50/60 to-white py-16 px-4 sm:px-8 overflow-hidden border-t border-gray-100">
      
      {/* Background Soft Glow Accents */}
      <div className="absolute top-1/3 left-10 w-96 h-96 bg-[#0437cc]/5 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#f77704]/5 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#0437cc] text-xs font-semibold tracking-wide">
            <Award className="w-3.5 h-3.5 text-[#0437cc]" />
            <span>Ecosystem Earnings</span>
          </div>
          
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900 leading-[1.15]">
            Direct Referral & <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0437cc] to-[#18acfa]">7-Level Income</span>
          </h2>
          
          <p className="text-base text-gray-600 max-w-xl mx-auto">
            Earn immediate income on direct introductions and unlock sequential depth commissions as your network volume scales.
          </p>
        </div>

        {/* Sticky Scroll Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* LEFT COLUMN: Sticky Direct Referral Card */}
          <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-6">
            
            <div className="bg-white border border-gray-200/80 shadow-xl rounded-3xl p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full pointer-events-none -z-0" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3.5 rounded-2xl bg-blue-100 text-[#0437cc]">
                    <Users className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0437cc] bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                    Instant Payout
                  </span>
                </div>

                <div className="text-sm font-medium text-gray-400 mb-1">Direct Referral Commission</div>
                <div className="text-4xl font-black text-gray-900 tracking-tight mb-4">5% Rate</div>
                
                <p className="text-sm text-gray-600 leading-relaxed mb-6">
                  Earn immediate income by referring new members to the AVG Staking 3.0 network.
                </p>

                {/* How It Works Steps */}
                <div className="space-y-3 pt-4 border-t border-gray-100 mb-6">
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-400">How It Works</div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-50 text-[#0437cc] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">1</div>
                    <p className="text-xs sm:text-sm text-gray-600"><strong className="text-gray-900">Refer:</strong> Introduce new members via your direct referral link.</p>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-orange-50 text-[#f77704] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">2</div>
                    <p className="text-xs sm:text-sm text-gray-600"><strong className="text-gray-900">Build:</strong> Expand your direct referral network.</p>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-lime-50 text-[#65940c] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">3</div>
                    <p className="text-xs sm:text-sm text-gray-600"><strong className="text-gray-900">Earn:</strong> Receive 5% commission on your referral’s deposit/business value.</p>
                  </div>
                </div>

                {/* Example Callout Box */}
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 mb-6">
                  <div className="text-xs font-bold text-gray-900 mb-1 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-[#0437cc]" /> Example Calculation:
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    A <strong className="text-gray-900">$10,000 deposit</strong> from a direct referral earns you a <span className="text-[#0437cc] font-bold">$500 commission</span> ($10,000 × 5%).
                  </p>
                </div>

                {/* Custom Button Component */}
                <Buttons 
                  text="Start Referring" 
                  onClick={() => Navigate('/auth/register')} 
                  className="w-full justify-center" 
                />
              </div>
            </div>

          </div>


          {/* RIGHT COLUMN: Scrollable 7-Level Income Structure */}
          <div className="lg:col-span-7 space-y-4">
            
            <div className="bg-white border border-gray-200/80 shadow-xl rounded-3xl p-6 sm:p-8">
              
              <div className="flex items-center justify-between pb-6 mb-6 border-b border-gray-100">
                <div>
                  <h3 className="text-xl font-extrabold text-gray-900">7-Level Income Structure</h3>
                  <p className="text-xs text-gray-500">Unlock sequential levels of commissions as your network volume grows.</p>
                </div>
                <span className="hidden sm:inline-flex px-3 py-1 bg-lime-50 text-[#65940c] text-xs font-bold rounded-full border border-lime-200">
                  Multi-Tier Depth
                </span>
              </div>

              {/* Levels List Cards */}
              <div className="space-y-3">
                {levels.map((item, idx) => (
                  <div 
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gray-50/80 border border-gray-100 hover:border-blue-200 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#0437cc] font-black text-sm flex items-center justify-center shrink-0 group-hover:bg-[#0437cc] group-hover:text-white transition-colors">
                        L{idx + 1}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">{item.level}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{item.req}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                      <span className="text-xs text-gray-400 sm:hidden">Commission Rate:</span>
                      <span className="px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-[#0437cc] font-extrabold text-sm shadow-sm">
                        {item.rate}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#0437cc]" />
                  <span>Automated smart contract distribution</span>
                </div>
                <span className="text-gray-400">Secure & Verifiable</span>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

export default CompensationPlan;