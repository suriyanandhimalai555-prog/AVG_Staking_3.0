import React, { useEffect, useState } from "react";
import Sidebar from "../components/user/UserSidebar";
import Topbar from "../components/user/UserTopbar";
import API from "../utils/api";
import { toast } from "react-hot-toast";
import { 
  FiAward, 
  FiInfo, 
  FiCheckCircle, 
  FiClock, 
  FiXCircle, 
  FiLayers 
} from "react-icons/fi";

const UserReward = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ FETCH ALL REWARDS
  const fetchReward = async () => {
    try {
      setLoading(true);
      const res = await API.get("/ranks/user");
      setRewards(res.data || []);
    } catch (err) {
      console.error("Reward fetch error:", err);
      toast.error("Failed to load rewards");
      setRewards([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReward();
  }, []);

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
                Rewards
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                Track your reward milestone progress and dynamic dashboard metrics.
              </p>
            </div>

            {/* Policy Notice Box */}
            <div className="flex items-start md:items-center gap-3 bg-amber-500/10 border border-amber-500/20 px-4 py-3 rounded-2xl max-w-md">
              <div className="p-2 bg-amber-500/20 rounded-xl text-amber-600 flex items-center justify-center shrink-0">
                <FiInfo className="text-sm" />
              </div>
              <p className="text-xs leading-relaxed text-amber-900 font-medium">
                All achievement-based salaries are subject to a{" "}
                <span className="text-amber-700 font-bold font-mono">10%</span> deduction as per AVG Staking policy.
              </p>
            </div>
          </div>

          {/* BODY */}
          {loading ? (
            <div className="flex h-48 items-center justify-center bg-white border border-slate-200 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#0437cc] border-t-transparent" />
                <span className="text-xs font-bold text-slate-600 tracking-wide">
                  Loading rewards...
                </span>
              </div>
            </div>
          ) : rewards.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white border border-slate-200 rounded-2xl text-center space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-[#0437cc]/10 text-[#0437cc] flex items-center justify-center text-xl">
                <FiAward />
              </div>
              <h3 className="text-base font-bold text-slate-900">No reward available</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                You currently don't have any active milestone rewards assigned. Check back soon!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {rewards.map((reward, index) => {
                const isApproved = reward.status === "approved";
                const isRejected = reward.status === "rejected";
                const progressPercent = Math.min(
                  100,
                  (Number(reward.progress || 0) / Number(reward.target_amount || 1)) * 100
                );

                return (
                  <div
                    key={index}
                    className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden space-y-6"
                  >
                    {/* Top Accent Strip */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0437cc] via-[#f77704] to-emerald-500" />

                    {/* TOP HEADER */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg font-bold">
                          <FiAward />
                        </div>
                        <div>
                          <h3 className="text-base font-black text-slate-900 tracking-tight">
                            {reward.reward}
                          </h3>
                          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                            Target: ${Number(reward.target_amount || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isApproved
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : isRejected
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {isApproved ? <FiCheckCircle /> : isRejected ? <FiXCircle /> : <FiClock />}
                        {isApproved ? "Completed" : isRejected ? "Rejected" : "In Progress"}
                      </span>
                    </div>

                    {/* TIMELINE TABLE / WRAPPER */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            <th className="py-3.5 px-4">Target Amount</th>
                            <th className="py-3.5 px-4">Reward</th>
                            <th className="py-3.5 px-4">Timeline</th>
                            <th className="py-3.5 px-4">Status</th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                          <tr>
                            <td className="py-4 px-4 font-black text-slate-900">
                              ${Number(reward.target_amount || 0).toLocaleString()}
                            </td>
                            <td className="py-4 px-4 font-bold text-slate-800">
                              {reward.reward}
                            </td>

                            {/* TIMELINE */}
                            <td className="py-4 px-4 space-y-2">
                              <div className="space-y-2">
                                {reward.timeline?.map((t, i) => (
                                  <div
                                    key={i}
                                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border ${
                                      t.achieved
                                        ? "bg-emerald-50/50 border-emerald-100 text-emerald-900"
                                        : "bg-slate-50 border-slate-100 text-slate-600"
                                    }`}
                                  >
                                    <div
                                      className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                                        t.achieved
                                          ? "bg-emerald-500 text-white"
                                          : "bg-slate-200 text-slate-500"
                                      }`}
                                    >
                                      {t.achieved ? "✓" : i + 1}
                                    </div>
                                    <div className="flex-1 text-xs">
                                      <p className="font-bold">
                                        {t.percent}% - ${Number(t.amount || 0).toLocaleString()}
                                      </p>
                                      {t.achieved ? (
                                        <span className="text-[10px] font-semibold text-emerald-600">
                                          Completed by {t.by}
                                        </span>
                                      ) : (
                                        <span className="text-[10px] font-medium text-slate-400">
                                          Pending milestone
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </td>

                            {/* STATUS */}
                            <td className="py-4 px-4">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold ${
                                  isApproved
                                    ? "bg-emerald-50 text-emerald-700"
                                    : isRejected
                                    ? "bg-rose-50 text-rose-700"
                                    : "bg-amber-50 text-amber-700"
                                }`}
                              >
                                {isApproved ? "Approved" : isRejected ? "Rejected" : "Pending"}
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* PROGRESS BAR SECTION */}
                    <div className="space-y-2 bg-slate-50 border border-slate-100 rounded-xl p-4">
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span className="text-slate-600">Milestone Progress</span>
                        <span className="font-black text-slate-900">
                          ${Number(reward.progress || 0).toLocaleString()} / ${Number(reward.target_amount || 0).toLocaleString()}
                        </span>
                      </div>

                      <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#0437cc] rounded-full transition-all duration-500"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 text-right font-bold">
                        {progressPercent.toFixed(2)}% achieved
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

export default UserReward;