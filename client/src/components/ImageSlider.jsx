import React, { useEffect, useMemo, useRef, useState } from 'react';
import { 
  ShieldCheck, 
  TrendingUp, 
  Sparkles, 
  Lock, 
  Building2, 
  Users, 
  CheckCircle2, 
  Trophy 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Buttons from './Buttons'; // Adjust import path as needed
import API from '../utils/api'; // Adjust import path as needed

const LandingPage = ({ onLoginClick }) => {
  const navigate = useNavigate();

  // --- ImageSlider / Achievers State & Logic ---
  const heroRef = useRef(null);
  const glowRef = useRef(null);
  const [showLogin, setShowLogin] = useState(false);
  const [slides, setSlides] = useState([]);
  const [loadingSlides, setLoadingSlides] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const setFavicon = () => {
      const existingFavicons = document.querySelectorAll(
        "link[rel*='icon'], link[rel*='apple-touch-icon']"
      );
      existingFavicons.forEach((favicon) => favicon.remove());
      document.title = "Avg Stake";
    };

    setFavicon();

    const handleMouseMove = (e) => {
      if (!heroRef.current || window.innerWidth < 768) return;

      const { clientX, clientY } = e;
      const { left, top, width, height } = heroRef.current.getBoundingClientRect();

      const x = (clientX - left - width / 2) / 25;
      const y = (clientY - top - height / 2) / 25;

      if (glowRef.current) {
        glowRef.current.style.transform = `translate(${x}px, ${y}px)`;
      }
    };

    const handleEscKey = (e) => {
      if (e.key === "Escape" && showLogin) {
        setShowLogin(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("keydown", handleEscKey);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("keydown", handleEscKey);
    };
  }, [showLogin]);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        setLoadingSlides(true);
        const res = await API.get("/banner-slides/public");
        setSlides(res.data || []);
      } catch (error) {
        console.error("Hero banner fetch error:", error);
        setSlides([]);
      } finally {
        setLoadingSlides(false);
      }
    };

    fetchSlides();
  }, []);

  // Ensure we have enough duplicated items for a smooth marquee loop even if there's only 1 item in DB
  const extendedSlides = useMemo(() => {
    if (!slides.length) return [];
    if (slides.length < 4) {
      // If fewer than 4 items (e.g., 1 item), multiply them to fill up the ticker track seamlessly
      let multiplier = Math.ceil(6 / slides.length);
      let repeated = [];
      for (let i = 0; i < multiplier; i++) {
        repeated = [...repeated, ...slides];
      }
      return [...repeated, ...repeated];
    }
    return [...slides, ...slides];
  }, [slides]);

  useEffect(() => {
    if (!slides.length) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3500);

    return () => clearInterval(timer);
  }, [slides]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowLogin(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login submitted");
  };

  return (
    <div className="w-full bg-white">
      {/* ---------------- Keyframes for Infinite Marquee ---------------- */}
      <style>{`
        @keyframes avgScrollLeft {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-avg-scroll {
          animation: avgScrollLeft 35s linear infinite;
        }
        .animate-avg-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* =================================================================== */}
      {/* 2. AVG ACHIEVERS SLIDER SECTION (Hero-Matched Clean Styling)        */}
      {/* =================================================================== */}
      <section 
        className="relative overflow-hidden bg-white py-16 px-4 sm:px-8 border-t border-gray-100" 
        ref={heroRef}
      >
        {/* Soft Multi-Color Background Glows matching the Hero section style */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#0437cc]/5 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[250px] bg-[#f77704]/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="mx-auto max-w-7xl relative z-10">

          {/* Section Header */}
          <div className="mb-14 text-center space-y-4 max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-semibold text-[#0437cc] uppercase tracking-wider shadow-sm">
              <Trophy className="w-4 h-4 text-[#f77704]" />
              AVG Achievers
            </span>

            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900 leading-[1.15]">
              Celebrating Our Top{' '}
              <span className="bg-gradient-to-r from-[#0437cc] via-[#f77704] to-[#7bb310] bg-clip-text text-transparent">
                Performers
              </span>
            </h2>

            <p className="text-base sm:text-lg text-gray-600 leading-relaxed font-normal">
              Dedicated members who achieved their targets and unlocked extraordinary rewards & global milestones.
            </p>
          </div>

          {loadingSlides ? (
            <div className="flex h-[260px] items-center justify-center text-gray-400">
              <div className="flex items-center gap-3 font-medium text-sm">
                <div className="h-4 w-4 rounded-full bg-[#0437cc] animate-ping" />
                <span>Loading top achievers...</span>
              </div>
            </div>
          ) : slides.length === 0 ? (
            <div className="flex h-[180px] items-center justify-center text-gray-500 border border-gray-100 rounded-3xl bg-gray-50/80 shadow-sm">
              <span className="text-sm font-medium">No achiever records available at the moment.</span>
            </div>
          ) : (
            /* Infinite Auto-Scrolling Carousel */
            <div className="overflow-hidden py-4">
              <div
                className="flex gap-6 animate-avg-scroll"
                style={{ width: "max-content" }}
              >
                {extendedSlides.map((item, index) => (
                  <div
                    key={`achiever-${index}`}
                    className="
                      flex
                      w-[88vw]
                      sm:w-[500px]
                      lg:w-[560px]
                      overflow-hidden
                      rounded-3xl
                      bg-white
                      border
                      border-gray-100
                      shadow-xl
                      shadow-gray-100/80
                      transition-all
                      duration-300
                      hover:-translate-y-1.5
                      hover:shadow-2xl
                    "
                  >
                    {/* Achiever Image */}
                    <div className="relative w-[130px] sm:w-[170px] lg:w-[200px] flex-shrink-0 bg-gray-50">
                      <img
                        src={item.imageUrl}
                        alt={item.username || "Achiever"}
                        className="h-full min-h-[200px] sm:min-h-[220px] w-full object-cover"
                      />
                      <div className="absolute left-2.5 top-2.5 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#f77704] to-amber-500 px-3 py-1 text-[10px] sm:text-xs font-bold text-white shadow-md">
                        <Trophy className="w-3.5 h-3.5" /> ACHIEVER
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="flex flex-1 flex-col justify-between p-5 sm:p-6 bg-white">
                      <div>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-lime-50 px-3 py-1 text-[11px] font-semibold text-[#7bb310] border border-lime-100">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Target Completed
                        </span>

                        <h3 className="mt-2.5 text-lg sm:text-xl font-bold text-gray-900 truncate">
                          {item.username}
                        </h3>

                        <p className="text-xs text-gray-500 font-medium">
                          AVG Elite Achiever
                        </p>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2.5">
                        <div className="rounded-2xl bg-gray-50 p-3 border border-gray-100">
                          <p className="text-[11px] font-medium text-gray-500">Target</p>
                          <h4 className="mt-0.5 text-xs sm:text-sm font-bold text-gray-900 truncate">
                            ${Number(item.target_amount || 0).toLocaleString()}
                          </h4>
                        </div>

                        <div className="rounded-2xl bg-lime-50/50 p-3 border border-lime-100">
                          <p className="text-[11px] font-medium text-[#7bb310]">Achieved</p>
                          <h4 className="mt-0.5 text-xs sm:text-sm font-bold text-gray-900 truncate">
                            ${Number(item.progress || 0).toLocaleString()}
                          </h4>
                        </div>
                      </div>

                      <div className="mt-3 rounded-2xl bg-orange-50/60 p-3 border border-orange-100">
                        <p className="text-[11px] font-medium text-[#f77704]">Reward Earned</p>
                        <h4 className="mt-0.5 text-xs sm:text-sm font-bold text-gray-900 line-clamp-1">
                          {item.reward}
                        </h4>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Dialog */}
        {showLogin && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
            onClick={handleBackdropClick}
          >
            <div className="relative w-full max-w-md rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 text-gray-900 shadow-2xl">
              <button
                className="absolute right-5 top-5 text-2xl font-semibold leading-none text-gray-400 hover:text-gray-700"
                onClick={() => setShowLogin(false)}
              >
                ×
              </button>

              <h2 className="text-2xl font-bold text-gray-900">Welcome to AVG Staking</h2>
              <p className="mt-1 text-sm text-gray-500">Sign in to continue to your dashboard</p>

              <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">User Code</label>
                  <input
                    type="text"
                    placeholder="Enter your user code"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none focus:border-[#0437cc] focus:bg-white focus:ring-1 focus:ring-[#0437cc] transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    placeholder="Enter password"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none focus:border-[#0437cc] focus:bg-white focus:ring-1 focus:ring-[#0437cc] transition-all"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-gradient-to-r from-[#0437cc] to-[#032899] px-4 py-3.5 font-semibold text-white transition-all shadow-lg shadow-blue-500/25 hover:opacity-95 active:scale-[0.99]"
                >
                  Continue
                </button>
              </form>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default LandingPage;