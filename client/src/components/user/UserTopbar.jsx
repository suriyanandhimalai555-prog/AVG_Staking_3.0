import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiLogOut, FiMenu, FiUser, FiShare2 } from "react-icons/fi";
import { FaWallet, FaCoins } from "react-icons/fa";
import API from "../../utils/api";
import { toast } from "react-hot-toast";

const Topbar = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState(0);
  const [avgCoin, setAvgCoin] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, summaryRes] = await Promise.all([
          API.get("/users/me"),
          API.get("/withdrawals/summary"),
        ]);

        setUser(profileRes.data);

        const roi = Number(summaryRes.data.roi || 0);
        const direct = Number(summaryRes.data.direct || 0);
        const level = Number(summaryRes.data.level || 0);

        const totalWallet = roi + direct + level;

        setWallet(totalWallet);
        setAvgCoin(totalWallet / 25);
      } catch (err) {
        console.error("Topbar fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");

    toast.success("Logged out successfully 👋");

    setTimeout(() => {
      navigate("/");
    }, 800);
  };

  return (
    <header className="sticky top-0 z-30 h-[72px] bg-[#02185c] border-b border-white/10 shadow-md px-4 sm:px-6 lg:px-8">
      <div className="h-full flex items-center justify-between gap-4 max-w-7xl mx-auto">
        
        {/* LEFT SECTION: Mobile Toggle & User Profile Badge */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="md:hidden flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 transition active:scale-95 cursor-pointer shrink-0"
            aria-label="Toggle menu"
          >
            <FiMenu className="text-lg" />
          </button>

          <div className="flex items-center gap-3">
            {/* User Avatar */}
            {/* <div className="h-10 w-10 rounded-xl bg-white/10 border border-white/15 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-inner">
              {loading ? (
                <FiUser className="text-base text-white/80" />
              ) : (
                user?.name?.charAt(0)?.toUpperCase() || "U"
              )}
            </div> */}

            {/* Name + Subtitle + Referral Tag */}
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs sm:text-sm font-bold text-white tracking-tight">
                  {loading ? "Loading..." : user?.name || "User Portal"}
                </span>

                {!loading && user?.user_code && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#f77704]/20 border border-[#f77704]/40 text-[#f77704] text-[10px] font-extrabold tracking-wider uppercase">
                    <FiShare2 className="text-[9px]" /> {user.user_code}
                  </span>
                )}
              </div>
              <span className="hidden sm:flex text-[11px] text-white/60 font-medium leading-none mt-1">
                {loading ? "Fetching account..." : "Welcome back to your dashboard"}
              </span>
              <span className="sm:hidden flex text-[11px] text-white/60 font-medium leading-none mt-2">
                {loading ? "Fetching account..." : "Wallet balance: $" + wallet.toFixed(2) + " | AVG Coin: " + avgCoin.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT SECTION: Floating Balance Badges + Logout */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* Live Balance Floating Pill Container */}
          <div className="hidden sm:flex items-center bg-white/5 border border-white/10 rounded-2xl p-1 gap-1">
            {/* Wallet Pill */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl">
              <div className="h-7 w-7 rounded-lg bg-[#f77704]/20 text-[#f77704] flex items-center justify-center text-xs shrink-0">
                <FaWallet />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] uppercase font-bold text-white/50 tracking-wider leading-none">
                  Wallet
                </span>
                <span className="text-xs font-black text-white mt-0.5">
                  {loading ? "..." : `$${wallet.toFixed(2)}`}
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="h-6 w-[1px] bg-white/10" />

            {/* AVG Coin Pill */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl">
              <div className="h-7 w-7 rounded-lg bg-[#a6e71c]/20 text-[#a6e71c] flex items-center justify-center text-xs shrink-0">
                <FaCoins />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] uppercase font-bold text-white/50 tracking-wider leading-none">
                  AVG Coin
                </span>
                <span className="text-xs font-black text-white mt-0.5">
                  {loading ? "..." : avgCoin.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Action: Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-100 text-[#02185c] px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black shadow-md transition duration-200 active:scale-95 cursor-pointer shrink-0"
          >
            <FiLogOut className="text-sm text-[#02185c]" />
            <span className="hidden sm:inline">Logout</span>
          </button>

        </div>

      </div>
    </header>
  );
};

export default Topbar;