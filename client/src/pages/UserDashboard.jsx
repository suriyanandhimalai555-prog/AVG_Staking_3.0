import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FiUsers,
  FiTrendingUp,
  FiLayers,
  FiCreditCard,
  FiArrowDownLeft,
  FiArrowUpRight,
  FiPieChart,
  FiZap,
  FiAward,
  FiCheckCircle,
  FiBell,
  FiX,
} from "react-icons/fi";
import toast from "react-hot-toast";

import Sidebar from "../components/user/UserSidebar";
import Topbar from "../components/user/UserTopbar";

const UserDashboard = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);

  // ✅ WALLET (AFTER DEDUCTION)
  const [wallet, setWallet] = useState({
    roi: 0,
    level: 0,
    direct: 0,
  });

  // ✅ EARNINGS (FULL TOTAL)
  const [earnings, setEarnings] = useState({
    roi: 0,
    level: 0,
    direct: 0,
  });

  const [stats, setStats] = useState({
    staking: 0,
    totalDeposits: 0,
    totalDepositAmount: 0,
    todayDeposits: 0,
    todayDepositAmount: 0,
    totalWithdraw: 0,
    totalWithdrawAmount: 0,
    todayWithdraw: 0,
    todayWithdrawAmount: 0,
    directCount: 0,
    teamCount: 0,
    teamBusiness: 0,
    todayBusiness: 0,
  });

  const [slides, setSlides] = useState([]);
  const [loadingSlides, setLoadingSlides] = useState(true);

  useEffect(() => {
    // Check dashboard notification preference
    const hideDashboardPopup = localStorage.getItem("hide_dashboard_announcement");
    if (!hideDashboardPopup) {
      const timer = setTimeout(() => setShowPopup(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem("token");
      try {
        const [
          summaryRes,
          withdrawRes,
          referralsRes,
          networkRes,
          depositRes,
          teamBusinessRes,
          bannerRes,
        ] = await Promise.all([
          axios.get(`${import.meta.env.VITE_APP_BASE_URL}/api/withdrawals/summary`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${import.meta.env.VITE_APP_BASE_URL}/api/withdrawals/my`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${import.meta.env.VITE_APP_BASE_URL}/api/users/my-referrals`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${import.meta.env.VITE_APP_BASE_URL}/api/users/my-network`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${import.meta.env.VITE_APP_BASE_URL}/api/users/my-deposits-stats`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${import.meta.env.VITE_APP_BASE_URL}/api/users/my-team-business`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${import.meta.env.VITE_APP_BASE_URL}/api/banner-slides/public`).catch(() => ({ data: [] })),
        ]);

        // ✅ WALLET (DEDUCTED)
        setWallet({
          roi: summaryRes.data.roi || 0,
          level: summaryRes.data.level || 0,
          direct: summaryRes.data.direct || 0,
        });

        // ✅ EARNINGS (TOTAL)
        setEarnings({
          roi: summaryRes.data.roiTotal || 0,
          level: summaryRes.data.levelTotal || 0,
          direct: summaryRes.data.directTotal || 0,
        });

        // ✅ WITHDRAW STATS
        const withdrawals = withdrawRes.data || [];
        const today = new Date().toDateString();

        const totalWithdraw = withdrawals.length;
        const totalWithdrawAmount = withdrawals.reduce(
          (sum, w) => sum + Number(w.amount || 0),
          0
        );

        const todayWithdrawList = withdrawals.filter(
          (w) => new Date(w.created_at).toDateString() === today
        );

        const todayWithdraw = todayWithdrawList.length;
        const todayWithdrawAmount = todayWithdrawList.reduce(
          (sum, w) => sum + Number(w.amount || 0),
          0
        );

        // ✅ DEPOSITS
        const totalDeposits = Number(depositRes.data.total_count || 0);
        const totalDepositAmount = Number(depositRes.data.total_amount || 0);
        const todayDeposits = Number(depositRes.data.today_count || 0);
        const todayDepositAmount = Number(depositRes.data.today_amount || 0);

        // ✅ REFERRALS
        const directCount = referralsRes.data.length;

        // ✅ TEAM COUNT
        const calcCount = (node) => {
          if (!node || !node.children) return 0;
          let count = node.children.length;
          node.children.forEach((child) => {
            count += calcCount(child);
          });
          return count;
        };

        const teamCount = calcCount(networkRes.data);
        const totalStaking = Number(depositRes.data.total_staking || 0);

        setStats({
          staking: totalStaking,
          totalDeposits,
          totalDepositAmount,
          todayDeposits,
          todayDepositAmount,
          totalWithdraw,
          totalWithdrawAmount,
          todayWithdraw,
          todayWithdrawAmount,
          directCount,
          teamCount,
          teamBusiness: teamBusinessRes.data.teamBusiness,
          todayBusiness: teamBusinessRes.data.todayBusiness,
        });

        setSlides(bannerRes.data || []);
      } catch (err) {
        console.error("Dashboard error:", err);
        toast.error("Failed to load user dashboard information");
      } finally {
        setLoading(false);
        setLoadingSlides(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleIgnore = () => {
    setShowPopup(false);
  };

  const handleDontShowAgain = () => {
    localStorage.setItem("hide_dashboard_announcement", "true");
    setShowPopup(false);
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 text-slate-500 font-medium">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#0437cc] border-t-transparent" />
          <span className="animate-pulse tracking-wide text-sm font-semibold text-slate-600">
            Loading User Dashboard...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-slate-100 rounded-lg min-h-screen relative">
      {/* <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} /> */}

      <div className="flex-1 flex flex-col min-w-0">
        {/* <Topbar isOpen={isOpen} setIsOpen={setIsOpen} /> */}

        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">

          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-xs">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                Overview of your account activity, earnings, and team performance
              </p>
            </div>

            <div className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 shadow-xs self-start sm:self-auto">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Account Active
            </div>
          </div>

          {/* AVG ACHIEVERS SLIDER CARD */}
          {!loadingSlides && slides.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="h-2 w-6 bg-amber-500 rounded-full" />
                <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500 flex items-center gap-1.5">
                  <FiAward className="text-amber-500 text-sm" /> AVG Achievers
                </h2>
              </div>

              <div className="overflow-hidden rounded-2xl">
                <style>{`
                  @keyframes avgScrollLeft {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                  }
                `}</style>
                <div
                  className="flex gap-4 md:gap-6 py-2"
                  style={{
                    width: "max-content",
                    animation: "avgScrollLeft 25s linear infinite",
                  }}
                >
                  {[...slides, ...slides].map((item, index) => (
                    <div
                      key={`achiever-${index}`}
                      className="flex w-[90vw] sm:w-[480px] overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all duration-300"
                    >
                      <div className="relative w-[130px] sm:w-[160px] flex-shrink-0 bg-slate-100">
                        <img
                          src={item.imageUrl}
                          alt={item.username}
                          className="h-full min-h-[160px] w-full object-cover"
                        />
                        <div className="absolute left-2 top-2 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                          🏆 ACHIEVER
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col justify-center p-4 space-y-2">
                        <span className="w-fit rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                          Target Completed
                        </span>

                        <h3 className="text-base font-bold text-slate-900 truncate">
                          {item.username}
                        </h3>

                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <div className="rounded-xl bg-slate-50 border border-slate-100 p-2">
                            <p className="text-[10px] text-slate-400 font-semibold">Target</p>
                            <h4 className="text-xs font-bold text-slate-800">
                              ${Number(item.target_amount || 0).toLocaleString()}
                            </h4>
                          </div>

                          <div className="rounded-xl bg-emerald-50/60 border border-emerald-100 p-2">
                            <p className="text-[10px] text-emerald-600 font-semibold">Achieved</p>
                            <h4 className="text-xs font-bold text-emerald-700">
                              ${Number(item.progress || 0).toLocaleString()}
                            </h4>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* WALLET BALANCE */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-6 bg-[#0437cc] rounded-full" />
              <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                Wallet Balance
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard title="ROI Income" value={`$${wallet.roi}`} icon={<FiTrendingUp />} accent="green" badge="Withdrawable" />
              <StatCard title="Level Income" value={`$${wallet.level}`} icon={<FiLayers />} accent="purple" badge="Withdrawable" />
              <StatCard title="Direct Income" value={`$${wallet.direct}`} icon={<FiCreditCard />} accent="blue" badge="Withdrawable" />
            </div>
          </div>

          {/* EARNINGS */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-6 bg-[#f77704] rounded-full" />
              <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                Total Earnings & Staking
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-r from-[#eef2fc] via-white to-white border border-blue-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Staking Balance</p>
                    <h3 className="text-2xl font-black mt-1 text-[#0437cc] tracking-tight">
                      {Number(stats.staking).toFixed(2)} <span className="text-sm font-bold text-[#f77704]">AVG</span>
                    </h3>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-[#0437cc] text-white flex items-center justify-center text-lg shadow-sm">
                    <FiPieChart />
                  </div>
                </div>
              </div>
              <StatCard title="Total ROI Income" value={`$${earnings.roi}`} icon={<FiTrendingUp />} accent="green" badge="Gross" />
              <StatCard title="Total Level Income" value={`$${earnings.level}`} icon={<FiLayers />} accent="purple" badge="Gross" />
              <StatCard title="Total Direct Income" value={`$${earnings.direct}`} icon={<FiCreditCard />} accent="blue" badge="Gross" />
            </div>
          </div>

          {/* TRANSACTIONS SECTION */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-6 bg-emerald-500 rounded-full" />
              <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                Transactions Overview
              </h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SectionBlock title="Deposits Overview" icon={<FiArrowDownLeft className="text-emerald-600 text-lg" />}>
                <MiniStat title="Total Deposits" value={stats.totalDeposits} />
                <MiniStat title="Total Amount" value={`$${stats.totalDepositAmount}`} highlight="emerald" />
                <MiniStat title="Today Deposits" value={stats.todayDeposits} />
                <MiniStat title="Today Amount" value={`$${stats.todayDepositAmount}`} highlight="emerald" />
              </SectionBlock>

              <SectionBlock title="Withdrawal Overview" icon={<FiArrowUpRight className="text-rose-600 text-lg" />}>
                <MiniStat title="Total Withdrawals" value={stats.totalWithdraw} />
                <MiniStat title="Total Amount" value={`$${stats.totalWithdrawAmount}`} highlight="rose" />
                <MiniStat title="Today Withdrawals" value={stats.todayWithdraw} />
                <MiniStat title="Today Amount" value={`$${stats.todayWithdrawAmount}`} highlight="rose" />
              </SectionBlock>
            </div>
          </div>

          {/* TEAM & BUSINESS */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-6 bg-purple-500 rounded-full" />
              <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                Business & Team Network
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Direct Referrals" value={stats.directCount} icon={<FiUsers />} accent="blue" badge="Network" />
              <StatCard title="Team Count" value={stats.teamCount} icon={<FiUsers />} accent="purple" badge="Network" />
              <StatCard title="Team Business" value={`$${stats.teamBusiness}`} icon={<FiZap />} accent="orange" badge="Volume" />
              <StatCard title="Today Business" value={`$${stats.todayBusiness}`} icon={<FiCheckCircle />} accent="green" badge="Volume" />
            </div>
          </div>

        </div>
      </div>

      {/* DASHBOARD WELCOME / NOTIFICATION POPUP */}
      {/* {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-300">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden p-6 sm:p-8 space-y-6 relative">

            <button
              onClick={handleIgnore}
              className="absolute top-5 right-5 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition cursor-pointer"
            >
              <FiX className="text-sm" />
            </button>

            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-[#0437cc]/10 text-[#0437cc] flex items-center justify-center text-xl shrink-0 shadow-inner">
                <FiBell />
              </div>
              <div>
                <span className="inline-block px-2 py-0.5 rounded bg-[#f77704]/10 text-[#f77704] text-[10px] font-black uppercase tracking-wider mb-1">
                  Important Announcement
                </span>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  Payout Notice
                </h3>
              </div>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              <p>
                Please note that payouts will not be processed on <span className="font-bold text-slate-900">November 6th, 7th, 8th, and 9th</span>. Regular payouts will resume right after this period.
              </p>
              <p className="text-slate-500 font-semibold italic text-xs">
                * All other dashboard operations, staking services, and system features will continue to work normally as usual.
              </p>
              <p className="text-sm sm:text-base font-bold text-[#f77704] pt-1">
                🪔 Wishing you and your family a Happy Diwali! ✨
              </p>
            </div>

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
      )} */}

    </div>
  );
};

export default UserDashboard;

/* UI HELPER COMPONENTS */

const StatCard = ({ title, value, icon, badge = "Stat", accent = "blue" }) => {
  const accentStyles = {
    blue: "border-l-4 border-l-[#0437cc]",
    green: "border-l-4 border-l-emerald-500",
    orange: "border-l-4 border-l-[#f77704]",
    purple: "border-l-4 border-l-purple-500",
  };

  const iconStyles = {
    blue: "bg-[#eef2fc] text-[#0437cc]",
    green: "bg-emerald-50 text-emerald-600",
    orange: "bg-orange-50 text-[#f77704]",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <div
      className={`bg-white border border-slate-200/90 rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5 shadow-xs hover:shadow-md ${accentStyles[accent] || accentStyles.blue
        }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
          {badge}
        </span>
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-lg ${iconStyles[accent]}`}>
          {icon}
        </div>
      </div>
      <div className="mt-3">
        <p className="text-xs font-semibold text-slate-500">{title}</p>
        <h3 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">{value}</h3>
      </div>
    </div>
  );
};

const SectionBlock = ({ title, children, icon }) => {
  return (
    <div className="border border-slate-200 bg-white rounded-2xl p-5 space-y-4 shadow-xs">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <div className="p-1.5 rounded-lg bg-slate-100">{icon}</div>
        <h3 className="font-bold text-sm text-slate-800 tracking-wide">{title}</h3>
      </div>
      <div className="grid grid-cols-2 gap-3.5">{children}</div>
    </div>
  );
};

const MiniStat = ({ title, value, highlight }) => {
  const getHighlightClass = () => {
    if (highlight === "emerald") return "text-emerald-600 font-black";
    if (highlight === "rose") return "text-rose-600 font-black";
    return "text-slate-900";
  };

  return (
    <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3.5 space-y-1">
      <p className="text-[11px] font-semibold text-slate-500 tracking-wide">{title}</p>
      <h4 className={`text-base font-bold tracking-tight ${getHighlightClass()}`}>
        {value}
      </h4>
    </div>
  );
};