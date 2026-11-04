import React, { useState, useEffect } from "react";
import Sidebar from "../components/user/UserSidebar";
import Topbar from "../components/user/UserTopbar";
import axios from "axios";
import { toast } from "react-hot-toast";
import { 
  FiAward, 
  FiInfo, 
  FiCheckCircle, 
  FiClock, 
  FiLock, 
  FiUnlock 
} from "react-icons/fi";

const UserDirectReferralReward = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [tierData, setTierData] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUserRewardsData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${import.meta.env.VITE_APP_BASE_URL}/api/users/my-reward-progress`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setTierData(res.data.tiers || []);
      } catch (err) {
        console.error("Error fetching user tour rewards:", err);
        toast.error("Failed to load tour rewards");
      } finally {
        setLoading(false);
      }
    };

    fetchUserRewardsData();
  }, [token]);

  return (
    <div className="flex bg-slate-100 rounded-lg min-h-screen">
      {/* <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} /> */}

      <div className="flex-1 flex flex-col min-w-0">
        {/* <Topbar isOpen={isOpen} setIsOpen={setIsOpen} /> */}

        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8 bg-slate-100">
          
          {/* HEADER BANNER */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-200 bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-xs">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Level-wise Tour Rewards
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                Track your milestone progress and unlock exclusive global tours level by level.
              </p>
            </div>

            {/* Policy Notice Box */}
            <div className="flex items-start md:items-center gap-3 bg-amber-500/10 border border-amber-500/20 px-4 py-3 rounded-2xl max-w-md">
              <div className="p-2 bg-amber-500/20 rounded-xl text-amber-600 flex items-center justify-center shrink-0">
                <FiInfo className="text-sm" />
              </div>
              <p className="text-xs leading-relaxed text-amber-900 font-medium">
                Each tour reward tier corresponds to active business volume achieved at that specific referral level.
              </p>
            </div>
          </div>

          {/* BODY */}
          {loading ? (
            <div className="flex h-48 items-center justify-center bg-white border border-slate-200 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#0437cc] border-t-transparent" />
                <span className="text-xs font-bold text-slate-600 tracking-wide">
                  Loading tour rewards...
                </span>
              </div>
            </div>
          ) : tierData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white border border-slate-200 rounded-2xl text-center space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-[#0437cc]/10 text-[#0437cc] flex items-center justify-center text-xl">
                <FiAward />
              </div>
              <h3 className="text-base font-bold text-slate-900">No tour reward tiers available</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                No tour reward tiers have been configured for your account yet.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {tierData.map((tier, index) => {
                const progressPercent = Math.min(
                  100,
                  (Number(tier.currentVolume || 0) / Number(tier.target_volume || 1)) * 100
                );

                return (
                  <div
                    key={tier.id || index}
                    className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden space-y-6"
                  >
                    {/* Top Accent Strip */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0437cc] via-[#f77704] to-emerald-500" />

                    {/* TOP HEADER */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-blue-50 text-[#0437cc] flex items-center justify-center text-lg font-bold">
                          <FiAward />
                        </div>
                        <div>
                          <h3 className="text-base font-black text-slate-900 tracking-tight">
                            Level {tier.level}: {tier.tour_name}
                          </h3>
                          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                            Required Volume: ${Number(tier.target_volume || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          tier.isAchieved
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {tier.isAchieved ? <FiCheckCircle /> : <FiClock />}
                        {tier.isAchieved ? "Completed" : "In Progress"}
                      </span>
                    </div>

                    {/* TABLE */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            <th className="py-3.5 px-4">Level</th>
                            <th className="py-3.5 px-4">Target Volume</th>
                            <th className="py-3.5 px-4">Proposed Tour</th>
                            <th className="py-3.5 px-4">Status</th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                          <tr className="hover:bg-slate-50/60 transition">
                            <td className="py-4 px-4 font-bold text-slate-900">
                              Level {tier.level}
                            </td>
                            <td className="py-4 px-4 font-black text-slate-900">
                              ${Number(tier.target_volume || 0).toLocaleString()}
                            </td>
                            <td className="py-4 px-4 font-semibold text-[#0437cc]">
                              {tier.tour_name}
                            </td>
                            <td className="py-4 px-4">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${
                                  tier.isAchieved
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-amber-50 text-amber-700"
                                }`}
                              >
                                {tier.isAchieved ? <FiUnlock /> : <FiLock />}
                                {tier.isAchieved ? "Unlocked" : "Locked"}
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* PROGRESS BAR SECTION */}
                    <div className="space-y-2 bg-slate-50 border border-slate-100 rounded-xl p-4">
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span className="text-slate-600">Level {tier.level} Progress</span>
                        <span className="font-black text-slate-900">
                          ${Number(tier.currentVolume || 0).toLocaleString()} / ${Number(tier.target_volume || 0).toLocaleString()}
                        </span>
                      </div>

                      <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#0437cc] rounded-full transition-all duration-500"
                          style={{
                            width: `${tier.isAchieved ? 100 : progressPercent}%`,
                          }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 text-right font-bold">
                        {(tier.isAchieved ? 100 : progressPercent).toFixed(2)}% completed
                      </p>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default UserDirectReferralReward;