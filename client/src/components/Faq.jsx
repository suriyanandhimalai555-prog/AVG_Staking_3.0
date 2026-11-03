import React from 'react';

const faqData = [
    { 
        num: "01", 
        title: "What is the minimum amount required to join AVG Staking 3.0?", 
        desc: "The minimum deposit required is $500 USD (equivalent to ₹50,000 INR based on the fixed conversion rate).", 
        tag: "Minimum Deposit" 
    },
    { 
        num: "02", 
        title: "Are there any withdrawal fees?", 
        desc: "No, there are $0 fees on withdrawals, with a minimum withdrawal limit of $20 USD.", 
        tag: "Zero Fees" 
    },
    { 
        num: "03", 
        title: "How does the 40:30:30 ratio work for team rewards?", 
        desc: "To qualify for any team business reward milestone, your total team volume must meet a 40%:30%:30% balance across your network structures.", 
        tag: "Team Rewards" 
    },
    { 
        num: "04", 
        title: "How are property security backed deposits handled?", 
        desc: "High-value individual deposits starting from ₹25 Lakhs are assigned property surety options, ranging from plots in Mayilam to resort properties in Kodaikanal and Yelagiri.", 
        tag: "Property Security" 
    }
];

const FAQCom = () => {
    return (
        <section className="w-full bg-gray-50 text-gray-900 py-16 lg:py-24 px-6 md:px-12 lg:px-24 relative border-t border-gray-100">

            {/* Zero-Lag Radial Gradient Backgrounds */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-[60%] h-[60%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#0437cc]/5 to-transparent transform-gpu"></div>
                <div className="absolute bottom-0 right-0 w-[50%] h-[50%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#f77704]/5 to-transparent transform-gpu"></div>
            </div>

            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-24 relative z-10">

                <div className="lg:w-5/12">
                    {/* Sticky top-24 strictly optimized for 14-inch screens to clear 80px navbar */}
                    <div className="sticky top-24">
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight mb-4 text-gray-900">
                            Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0437cc] to-[#18acfa]">Questions</span>
                        </h2>
                        <p className="text-sm md:text-base lg:text-lg font-medium leading-relaxed text-gray-600 max-w-xl">
                            Everything you need to know about the AVG Staking 3.0 platform parameters, rewards, deposit thresholds, and property security.
                        </p>
                    </div>
                </div>

                <div className="lg:w-7/12 flex flex-col gap-6 md:gap-8 mt-8 lg:mt-0">
                    {faqData.map((item, index) => (
                        <div key={index} className="group relative flex flex-col sm:flex-row gap-5 md:gap-8 items-start p-6 md:p-8 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:border-[#0437cc]/20 transition-all duration-300 transform-gpu hover:-translate-y-1">
                            <div className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#f77704] to-[#f77704]/30 group-hover:scale-110 transition-transform duration-500 shrink-0">
                                {item.num}
                            </div>
                            <div className="flex flex-col">
                                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 group-hover:text-[#0437cc] transition-colors duration-300">{item.title}</h3>
                                <p className="text-sm md:text-base text-gray-600 leading-relaxed mb-4">{item.desc}</p>
                                <div className="inline-flex items-center self-start gap-2 px-3 py-1.5 rounded-md bg-gray-50 border border-gray-200 group-hover:border-[#a6e71c]/50 transition-colors duration-300">
                                    <span className="w-2 h-2 rounded-full bg-[#a6e71c]"></span>
                                    <span className="text-[10px] sm:text-xs font-bold text-gray-700 tracking-wider uppercase">{item.tag}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FAQCom;