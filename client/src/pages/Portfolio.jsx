import React, { useState, useEffect } from "react";
import axios from "axios";
// import Sidebar from "../components/user/UserSidebar";
// import Topbar from "../components/user/UserTopbar";
import { toast } from "react-hot-toast";
import {
  FiLayers,
  FiDollarSign,
  FiTrendingUp,
  FiAward,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiDownload,
  FiX
} from "react-icons/fi";

const Portfolio = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  // User details for certificate branding
  const [userName, setUserName] = useState("Valued Member");
  const [userCode, setUserCode] = useState("AVG-VIP");

  // States for Celebration Badge Modal
  const [showCelebrationModal, setShowCelebrationModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // ✅ FIXED DATE & TIME FORMAT FUNCTION (Matches Admin Panel)
  const formatDate = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "-";

    const istDate = new Date(d.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const day = String(istDate.getDate()).padStart(2, "0");
    const month = String(istDate.getMonth() + 1).padStart(2, "0");
    const year = istDate.getFullYear();

    let hours = istDate.getHours();
    const minutes = String(istDate.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;

    return `${day}/${month}/${year} • ${hours}:${minutes} ${ampm}`;
  };

  const fetchPortfolioAndUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const [plansRes, userRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_APP_BASE_URL}/api/user-plans/my`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${import.meta.env.VITE_APP_BASE_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => null)
      ]);

      setPlans(plansRes.data || []);
      if (userRes && userRes.data) {
        setUserName(`${userRes.data.name || ""} ${userRes.data.lastname || ""}`.trim());
        setUserCode(userRes.data.user_code || localStorage.getItem("user_code") || "AVG-VIP");
      }
    } catch (err) {
      console.error("Portfolio fetch error:", err);
      toast.error("Failed to load portfolio items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolioAndUser();
  }, []);

  const handleOpenCelebration = (plan) => {
    setSelectedPlan(plan);
    setShowCelebrationModal(true);
  };

  // ================= STUNNING ELITE CERTIFICATE CANVAS GENERATOR =================
  const downloadCelebrationCard = () => {
    if (!selectedPlan) return;
    setIsDownloading(true);
    const toastId = toast.loading("Generating your elite investment certificate...");

    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 1400;
      const ctx = canvas.getContext("2d");

      // 1. Rich Deep Luxury Navy Background
      const bgGrad = ctx.createLinearGradient(0, 0, 1200, 1400);
      bgGrad.addColorStop(0, "#010c30");
      bgGrad.addColorStop(0.5, "#02185c");
      bgGrad.addColorStop(1, "#010822");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1200, 1400);

      // 2. Double Gold & Fine White Borders
      ctx.strokeStyle = "#f77704";
      ctx.lineWidth = 10;
      ctx.strokeRect(40, 40, 1120, 1320);

      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
      ctx.lineWidth = 2;
      ctx.strokeRect(60, 60, 1080, 1280);

      // 3. Top Header Badge Ribbon
      ctx.fillStyle = "rgba(247, 119, 4, 0.2)";
      ctx.strokeStyle = "#f77704";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(330, 100, 540, 65, 32);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#f77704";
      ctx.font = "bold 22px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("★ CERTIFICATE OF STAKING EXCELLENCE ★", 600, 142);

      // 4. Subtitle & Investor Name
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.font = "bold 20px sans-serif";
      ctx.fillText("THIS CERTIFICATE IS PROUDLY PRESENTED TO", 600, 230);

      ctx.fillStyle = "#ffffff";
      ctx.font = "900 48px sans-serif";
      ctx.fillText(userName.toUpperCase(), 600, 300);

      ctx.fillStyle = "#f77704";
      ctx.font = "bold 20px monospace";
      ctx.fillText(`INVESTOR ID / CODE: ${userCode}`, 600, 345);

      // 5. Package Name Callout Box
      ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(120, 395, 960, 130, 20);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.font = "bold 18px sans-serif";
      ctx.fillText("ACTIVE INVESTMENT PACKAGE", 600, 440);

      ctx.fillStyle = "#ffffff";
      ctx.font = "900 40px sans-serif";
      ctx.fillText((selectedPlan.plan_name || "Staking Package").toUpperCase(), 600, 495);

      // 6. Triple Financial Metrics (Deposit, Daily ROI, Max Return)
      const boxWidth = 300;
      const boxHeight = 180;
      const startX = 120;
      const gapX = 30;
      const boxY = 575;

      const metrics = [
        { label: "STAKING DEPOSIT", value: `$${Number(selectedPlan.amount || 0).toLocaleString()}`, color: "#f77704" },
        { label: "ESTIMATED DAILY ROI", value: `$${Number(selectedPlan.daily_roi || 0).toFixed(2)}`, color: "#a6e71c" },
        { label: "MAX CEILING RETURN", value: `$${Number(selectedPlan.max_return || 0).toLocaleString()}`, color: "#00e5ff" }
      ];

      metrics.forEach((m, idx) => {
        const bx = startX + idx * (boxWidth + gapX);
        ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
        ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(bx, boxY, boxWidth, boxHeight, 20);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.font = "bold 16px sans-serif";
        ctx.fillText(m.label, bx + boxWidth / 2, boxY + 50);

        ctx.fillStyle = m.color;
        ctx.font = "900 36px sans-serif";
        ctx.fillText(m.value, bx + boxWidth / 2, boxY + 130);
      });

      // 7. Bottom Security Stamp & Signatures Divider
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(120, 840);
      ctx.lineTo(1080, 840);
      ctx.stroke();

      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.font = "bold 16px monospace";
      ctx.fillText(`PURCHASE DATE: ${formatDate(selectedPlan.created_at)}`, 320, 910);
      ctx.fillText(`PACKAGE ID: #${selectedPlan.id || "101"}`, 920, 910);

      // Verified Hologram Seal
      ctx.fillStyle = "#0437cc";
      ctx.beginPath();
      ctx.arc(600, 910, 55, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "#f77704";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(600, 910, 48, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 13px sans-serif";
      ctx.fillText("VERIFIED", 600, 900);
      ctx.fillText("SECURE", 600, 920);
      ctx.fillText("VIP", 600, 935);

      // Footer brand web link
      ctx.fillStyle = "#f77704";
      ctx.font = "bold 20px sans-serif";
      ctx.fillText("OFFICIAL PLATFORM: AVGSTAKING.COM", 600, 1200);

      // Trigger Download
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `AVG-Elite-Certificate-${selectedPlan?.plan_name || "Package"}.png`;
      link.click();

      toast.success("Elite portfolio certificate downloaded! 🎉", { id: toastId });
      setShowCelebrationModal(false);
    } catch (err) {
      console.error("Canvas export error:", err);
      toast.error("Failed to generate certificate", { id: toastId });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex bg-slate-100 rounded-lg min-h-screen">
      <div className="flex-1 flex flex-col min-w-0">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8 bg-slate-100">

          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-xs">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                My Portfolio
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                Track your active staking packages, earnings breakdown, and performance progress
              </p>
            </div>

            <div className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 shadow-xs self-start sm:self-auto">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Active Staking Portfolio
            </div>
          </div>

          {/* Section Heading */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-6 bg-[#0437cc] rounded-full" />
              <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                Active & Completed Packages
              </h2>
            </div>

            {loading ? (
              <div className="flex h-48 items-center justify-center bg-white border border-slate-200 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#0437cc] border-t-transparent" />
                  <span className="text-xs font-bold text-slate-600 tracking-wide">
                    Loading Portfolio...
                  </span>
                </div>
              </div>
            ) : plans.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 bg-white border border-slate-200 rounded-2xl text-center space-y-3">
                <div className="h-12 w-12 rounded-2xl bg-[#0437cc]/10 text-[#0437cc] flex items-center justify-center text-xl">
                  <FiLayers />
                </div>
                <h3 className="text-base font-bold text-slate-900">No active plans found</h3>
                <p className="text-xs text-slate-500 max-w-sm">
                  You haven't requested or activated any investment packages yet. Visit the plans section to get started.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {plans.map((plan, index) => {
                  const deposit = Number(plan.amount || 0);
                  const dailyROI = Number(plan.daily_roi || 0);

                  const roiIncome = Number(plan.roi_income || 0);
                  const directIncome = Number(plan.direct_income || 0);
                  const levelIncome = Number(plan.level_income || 0);

                  const maxReturn = Number(plan.max_return || 0);

                  const rawTotal = roiIncome + directIncome + levelIncome;
                  const totalEarned = Math.min(rawTotal, maxReturn);

                  const roiProgress =
                    maxReturn > 0
                      ? Math.min((roiIncome / maxReturn) * 100, 100).toFixed(2)
                      : "0.00";

                  const directProgress =
                    maxReturn > 0
                      ? Math.min((directIncome / maxReturn) * 100, 100).toFixed(2)
                      : "0.00";

                  const levelProgress =
                    maxReturn > 0
                      ? Math.min((levelIncome / maxReturn) * 100, 100).toFixed(2)
                      : "0.00";

                  const isCompleted = totalEarned >= maxReturn;

                  return (
                    <div
                      key={index}
                      className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden flex flex-col justify-between space-y-6"
                    >
                      {/* Top Accent Strip */}
                      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0437cc] via-[#f77704] to-emerald-500" />

                      {/* Card Header */}
                      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-[#0437cc]/10 text-[#0437cc] flex items-center justify-center font-bold">
                            <FiLayers className="text-lg" />
                          </div>
                          <div>
                            <h3 className="text-base font-black text-slate-900 tracking-tight">
                              {plan.plan_name}
                            </h3>
                            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                              Staking Investment Package
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5">
                          {/* Action Button with Icon & Text */}
                          <button
                            type="button"
                            onClick={() => handleOpenCelebration(plan)}
                            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#f77704]/10 text-[#f77704] text-xs font-semibold transition-all duration-200 hover:bg-[#f77704] hover:text-white hover:shadow-md hover:shadow-[#f77704]/20 active:scale-95 focus:outline-hidden focus:ring-2 focus:ring-[#f77704]/30 cursor-pointer"
                          >
                            <FiDownload className="h-3.5 w-3.5 shrink-0" />
                            <span>Download</span>
                          </button>

                          {/* Status Badge */}
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide shadow-xs ${
                              isCompleted
                                ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20"
                                : "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20"
                            }`}
                          >
                            {isCompleted ? (
                              <FiCheckCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                            ) : (
                              <FiClock className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                            )}
                            <span>{isCompleted ? "Completed" : "Ongoing"}</span>
                          </span>
                        </div>
                      </div>

                      {/* Deposit & Daily ROI Grid */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 space-y-1">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Deposit Amount
                          </p>
                          <h4 className="text-lg font-black text-slate-900 tracking-tight">
                            ${deposit.toLocaleString()}
                          </h4>
                        </div>

                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 space-y-1">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Daily ROI
                          </p>
                          <h4 className="text-lg font-black text-emerald-600 tracking-tight">
                            ${dailyROI.toFixed(2)}
                          </h4>
                        </div>
                      </div>

                      {/* Progress Sections */}
                      <div className="space-y-4 pt-2">
                        {/* ROI Progress */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs font-semibold">
                            <span className="text-slate-600">ROI Progress</span>
                            <span className="text-slate-900 font-bold">${roiIncome.toFixed(2)}</span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                              style={{ width: `${roiProgress}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-slate-400 text-right font-medium">{roiProgress}% completed</p>
                        </div>

                        {/* Direct Referral Progress */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs font-semibold">
                            <span className="text-slate-600">Direct Referral Income</span>
                            <span className="text-slate-900 font-bold">${directIncome.toFixed(2)}</span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#0437cc] rounded-full transition-all duration-500"
                              style={{ width: `${directProgress}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-slate-400 text-right font-medium">{directProgress}% completed</p>
                        </div>

                        {/* Level Progress */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs font-semibold">
                            <span className="text-slate-600">Level Income</span>
                            <span className="text-slate-900 font-bold">${levelIncome.toFixed(2)}</span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#f77704] rounded-full transition-all duration-500"
                              style={{ width: `${levelProgress}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-slate-400 text-right font-medium">{levelProgress}% completed</p>
                        </div>
                      </div>

                      {/* Total Earned Summary Box */}
                      <div className="bg-slate-900 text-white rounded-xl p-4 flex items-center justify-between shadow-xs">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                            Total Earned / Ceiling Limit
                          </p>
                          <h4 className="text-base font-black tracking-tight mt-0.5 text-emerald-400">
                            ${totalEarned.toFixed(2)}{" "}
                            <span className="text-xs text-white/60 font-medium">
                              / ${maxReturn.toFixed(2)}
                            </span>
                          </h4>
                        </div>
                        <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center text-white/80">
                          <FiTrendingUp className="text-sm" />
                        </div>
                      </div>

                      {/* Footer Dates & Details */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <div className="flex items-center gap-1.5 font-medium">
                          <FiCalendar className="text-slate-400" />
                          <span>Purchased: <strong className="text-slate-700">{formatDate(plan.created_at)}</strong></span>
                        </div>

                        <div className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                          ID: #{plan.id || index + 1}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ================= ELITE CERTIFICATE PREVIEW MODAL ================= */}
      {showCelebrationModal && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col">

            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">Elite Portfolio Certificate</h3>
              <button
                onClick={() => setShowCelebrationModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300 transition cursor-pointer"
              >
                <FiX className="text-sm" />
              </button>
            </div>

            {/* PREVIEW CARD */}
            <div className="p-6 flex justify-center bg-slate-100">
              <div className="w-full bg-[#02185c] border-4 border-[#f77704] rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden flex flex-col items-center text-center space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f77704]/20 border border-[#f77704]/40 text-[#f77704] text-[10px] font-black uppercase tracking-widest">
                  ★ ELITE INVESTMENT CERTIFICATE ★
                </div>

                <div className="space-y-1">
                  <p className="text-[9px] text-white/50 font-bold uppercase tracking-wider">Presented to</p>
                  <h3 className="text-base font-black text-white">{userName}</h3>
                  <p className="text-[10px] text-[#f77704] font-mono font-bold">Code: {userCode}</p>
                </div>

                <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
                  <p className="text-[9px] uppercase tracking-wider text-white/50 font-bold">{selectedPlan.plan_name}</p>
                  <p className="text-lg font-black text-[#f77704] mt-0.5">${Number(selectedPlan.amount || 0).toLocaleString()}</p>
                </div>

                <div className="w-full grid grid-cols-2 gap-2">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-center">
                    <p className="text-[8px] uppercase tracking-wider text-white/50 font-bold">Daily ROI</p>
                    <p className="text-xs font-black text-[#a6e71c] mt-0.5">${Number(selectedPlan.daily_roi || 0).toFixed(2)}</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-center">
                    <p className="text-[8px] uppercase tracking-wider text-white/50 font-bold">Max Return</p>
                    <p className="text-xs font-black text-[#00e5ff] mt-0.5">${Number(selectedPlan.max_return || 0).toLocaleString()}</p>
                  </div>
                </div>

                <div className="pt-1 text-[9px] text-white/40 font-mono tracking-wider uppercase">
                  Verified Certificate • avgstaking.com
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4 bg-slate-50">
              <button
                onClick={() => setShowCelebrationModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-xs font-bold transition cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={downloadCelebrationCard}
                disabled={isDownloading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0437cc] hover:bg-[#032da6] text-white text-xs font-bold shadow-sm transition active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <FiDownload /> {isDownloading ? "Generating..." : "Download Certificate"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Portfolio;