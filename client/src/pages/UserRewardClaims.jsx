import React, { useEffect, useState } from "react";
import Sidebar from "../components/user/UserSidebar";
import Topbar from "../components/user/UserTopbar";
import API from "../utils/api";
import { toast } from "react-hot-toast";
import { FiAward, FiCalendar, FiCheckCircle, FiXCircle, FiClock, FiDollarSign } from "react-icons/fi";

const UserRewardClaims = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const res = await API.get("/ranks/claims/user");
      setClaims(res.data || []);
    } catch (err) {
      console.error("Claim fetch error:", err);
      toast.error("Failed to load reward claims");
      setClaims([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  return (
    <div className="flex bg-slate-100 rounded-lg min-h-screen">
      {/* <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} /> */}

      <div className="flex-1 flex flex-col min-w-0">
        {/* <Topbar isOpen={isOpen} setIsOpen={setIsOpen} /> */}

        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8 bg-slate-100">
          
          {/* HEADER BANNER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-xs">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Reward Claims
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                Track your monthly reward payouts and tranche payment schedules
              </p>
            </div>

            <div className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 shadow-xs self-start sm:self-auto">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Claims Active
            </div>
          </div>

          {/* BODY */}
          {loading ? (
            <div className="flex h-48 items-center justify-center bg-white border border-slate-200 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#0437cc] border-t-transparent" />
                <span className="text-xs font-bold text-slate-600 tracking-wide">
                  Loading claims...
                </span>
              </div>
            </div>
          ) : claims.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white border border-slate-200 rounded-2xl text-center space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-[#0437cc]/10 text-[#0437cc] flex items-center justify-center text-xl">
                <FiAward />
              </div>
              <h3 className="text-base font-bold text-slate-900">No reward claims available</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                You have no reward claim records generated at this time.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {claims.map((claim, index) => {
                const isClosed = claim.claim_status === "closed";

                return (
                  <div
                    key={index}
                    className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden space-y-6"
                  >
                    {/* Top Accent Strip */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0437cc] via-[#f77704] to-purple-500" />

                    {/* TOP HEADER */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-lg font-bold">
                          <FiAward />
                        </div>
                        <div>
                          <h3 className="text-base font-black text-slate-900 tracking-tight">
                            {claim.reward}
                          </h3>
                          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                            Target: ₹{Number(claim.target_amount || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isClosed
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}
                      >
                        {isClosed ? <FiXCircle /> : <FiCheckCircle />}
                        {isClosed ? "Closed" : "Active"}
                      </span>
                    </div>

                    {/* CLAIM METRICS GRID */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 border border-slate-100 rounded-xl p-4">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Monthly Amount</p>
                        <h4 className="text-base font-black text-emerald-600 mt-0.5">₹{Number(claim.monthly_amount || 0).toLocaleString()}</h4>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Start Date</p>
                        <h4 className="text-sm font-bold text-slate-800 mt-0.5">{claim.start_date || "-"}</h4>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Months</p>
                        <h4 className="text-sm font-bold text-slate-800 mt-0.5">{claim.months_count || 0} Months</h4>
                      </div>
                    </div>

                    {/* MONTHS TABLE */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            <th className="py-3.5 px-4">Month</th>
                            <th className="py-3.5 px-4">Due Date</th>
                            <th className="py-3.5 px-4">Amount</th>
                            <th className="py-3.5 px-4">Transaction ID</th>
                            <th className="py-3.5 px-4">Status</th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                          {claim.claim_months?.map((m, i) => {
                            const monthStatus = m.status || "pending";
                            const displayStatus =
                              isClosed && monthStatus === "pending"
                                ? "stopped"
                                : monthStatus;

                            return (
                              <tr key={i} className="hover:bg-slate-50/60 transition">
                                <td className="py-4 px-4 font-bold text-slate-900">
                                  Month {m.month_no}
                                </td>

                                <td className="py-4 px-4 text-slate-600 font-medium">
                                  {m.due_date
                                    ? new Date(m.due_date).toLocaleDateString("en-IN", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                      })
                                    : "-"}
                                </td>

                                <td className="py-4 px-4 font-black text-emerald-600">
                                  ₹{Number(m.amount || 0).toLocaleString()}
                                </td>

                                <td className="py-4 px-4 font-mono text-xs text-slate-600">
                                  {m.transaction_id || "-"}
                                </td>

                                <td className="py-4 px-4">
                                  <span
                                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold ${
                                      displayStatus === "completed"
                                        ? "bg-emerald-50 text-emerald-700"
                                        : displayStatus === "stopped"
                                        ? "bg-rose-50 text-rose-700"
                                        : "bg-amber-50 text-amber-700"
                                    }`}
                                  >
                                    {displayStatus === "completed"
                                      ? "Completed"
                                      : displayStatus === "stopped"
                                      ? "Stopped"
                                      : "Pending"}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
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

export default UserRewardClaims;