import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { FiLogOut, FiMenu } from "react-icons/fi";

const Topbar = ({ onMenuClick }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");

    toast.success("Logged out successfully 👋");

    setTimeout(() => {
      navigate("/");
    }, 800);
  };

  return (
    <header className="sticky top-0 z-30 h-[75px] border-b border-white/10 bg-[#02185c]/95 backdrop-blur-md relative overflow-hidden shadow-sm md:ml-[-20px]">
      {/* Soft ambient lighting matching the theme */}
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-white/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex h-full items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        
        {/* Left Side: Mobile Toggle & Brand Text */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onMenuClick}
            className="md:hidden flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white shadow-sm transition duration-200 hover:bg-white/20 active:scale-95"
            aria-label="Open menu"
          >
            <FiMenu className="text-lg" />
          </button>

          <div>
            <p className="text-[11px] font-semibold text-white/60 uppercase tracking-wider hidden sm:block">
              Welcome back
            </p>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-white mt-0.5">
              Admin Panel
            </h1>
          </div>
        </div>

        {/* Right Side: Action Control Items */}
        <div className="flex items-center gap-3">
          <button
            className="inline-flex items-center gap-2 rounded-xl bg-white text-[#3b52d4] hover:bg-white/90 px-4 py-2.5 text-xs sm:text-sm font-bold shadow-md transition duration-200 active:scale-95 cursor-pointer"
            onClick={handleLogout}
            type="button"
          >
            <FiLogOut className="text-sm sm:text-base" />
            <span>Logout</span>
          </button>
        </div>

      </div>
    </header>
  );
};

export default Topbar;