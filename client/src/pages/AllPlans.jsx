import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/user/UserSidebar";
import Topbar from "../components/user/UserTopbar";
import { toast } from "react-hot-toast";
import { FiLayers, FiCheck, FiX, FiShield, FiDollarSign } from "react-icons/fi";

const API = `${import.meta.env.VITE_APP_BASE_URL}/api/plans/all`;

const AllPlans = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [planAmount, setPlanAmount] = useState("");
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);

  // ✅ FETCH PLANS
  const fetchPlans = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(API, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPlans(res.data);
    } catch (err) {
      console.error("Fetch plans error:", err);
      toast.error("Failed to load plans");
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleBuyPlan = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!selectedPlan || !planAmount) {
        return toast.error("Please enter amount ⚠️", {
          duration: 3000,
        });
      }

      if (Number(planAmount) <= 0) {
        return toast.error("Amount must be greater than 0 ❌", {
          duration: 3000,
        });
      }

      const loadingToast = toast.loading("Processing purchase...");

      await axios.post(
        `${import.meta.env.VITE_APP_BASE_URL}/api/user-plans/buy`,
        {
          planId: selectedPlan.id || selectedPlan.plan_id,
          amount: Number(planAmount),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.dismiss(loadingToast);
      toast.success("Plan Requested successfully 🎉", {
        duration: 3000,
      });

      setIsPlanModalOpen(false);
      setPlanAmount("");
      fetchPlans();
    } catch (err) {
      toast.error(err.response?.data?.message || "Purchase failed ❌", {
        duration: 3000,
      });
      console.error("BUY ERROR:", err.response?.data || err.message);
    }
  };

  const openModal = (plan) => {
    setSelectedPlan(plan);
    setIsPlanModalOpen(true);
  };

  return (
    <div className="flex bg-slate-100 rounded-lg min-h-screen">
      {/* <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} /> */}

      <div className="flex-1 flex flex-col min-w-0">
        {/* <Topbar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} /> */}

        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
          
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-xs">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                All Plans
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                Explore available staking packages and request your activation plan
              </p>
            </div>

            <div className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 shadow-xs self-start sm:self-auto">
              <span className="h-2 w-2 rounded-full bg-[#0437cc] animate-pulse" />
              Active Staking Portal
            </div>
          </div>

          {/* Section Heading */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-6 bg-[#0437cc] rounded-full" />
              <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                Available Investment Packages
              </h2>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="bg-white border border-slate-200/90 rounded-2xl p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden group"
                >
                  {/* Top Accent Strip */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0437cc] to-[#f77704]" />

                  <div>
                    {/* Badge / Title */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#0437cc]/10 px-3 py-1 text-xs font-bold text-[#0437cc] tracking-wide">
                        <FiLayers className="text-sm" /> {plan.name}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded">
                        Verified
                      </span>
                    </div>

                    {/* Features List */}
                    <ul className="space-y-3.5 my-6">
                      <li className="flex items-center justify-between text-xs sm:text-sm border-b border-slate-100 pb-2.5">
                        <span className="text-slate-500 font-medium flex items-center gap-2">
                          <FiCheck className="text-emerald-500 font-bold" /> ROI Return
                        </span>
                        <span className="font-bold text-slate-900">{plan.roi}</span>
                      </li>

                      <li className="flex items-center justify-between text-xs sm:text-sm border-b border-slate-100 pb-2.5">
                        <span className="text-slate-500 font-medium flex items-center gap-2">
                          <FiCheck className="text-emerald-500 font-bold" /> Direct Referral
                        </span>
                        <span className="font-bold text-slate-900">{plan.direct_referral}</span>
                      </li>

                      <li className="flex items-center justify-between text-xs sm:text-sm border-b border-slate-100 pb-2.5">
                        <span className="text-slate-500 font-medium flex items-center gap-2">
                          <FiCheck className="text-emerald-500 font-bold" /> Ceiling Limit
                        </span>
                        <span className="font-bold text-slate-900">{plan.ceiling_limit}</span>
                      </li>

                      <li className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-slate-500 font-medium flex items-center gap-2">
                          <FiCheck className="text-emerald-500 font-bold" /> Investment Range
                        </span>
                        <span className="font-bold text-emerald-600">{plan.investment_range}</span>
                      </li>
                    </ul>
                  </div>

                  {/* Action Button */}
                  <button
                    className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-[#0437cc] hover:bg-[#032da6] text-white py-3 px-4 text-xs sm:text-sm font-bold shadow-sm transition-all duration-200 active:scale-95 cursor-pointer"
                    onClick={() => openModal(plan)}
                  >
                    <FiShield className="text-sm" /> Request Plan
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ✅ REQUEST PLAN MODAL */}
      {isPlanModalOpen && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#0437cc]/10 text-[#0437cc]">
                  <FiLayers className="text-base" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Request Plan: {selectedPlan.name}
                </h3>
              </div>

              <button
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition cursor-pointer"
                onClick={() => setIsPlanModalOpen(false)}
              >
                <FiX className="text-sm" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Plan Name
                </label>
                <input
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-600 font-semibold focus:outline-hidden cursor-not-allowed"
                  value={selectedPlan.name}
                  disabled
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Request Amount ($)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                    <FiDollarSign />
                  </span>
                  <input
                    type="number"
                    placeholder="Enter amount"
                    value={planAmount}
                    onChange={(e) => setPlanAmount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-3 text-xs sm:text-sm text-slate-900 font-semibold focus:outline-hidden focus:border-[#0437cc] focus:bg-white transition"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4 bg-slate-50/50">
              <button
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-xs sm:text-sm font-bold transition cursor-pointer"
                onClick={() => setIsPlanModalOpen(false)}
              >
                Cancel
              </button>

              <button
                className="px-5 py-2.5 rounded-xl bg-[#0437cc] hover:bg-[#032da6] text-white text-xs sm:text-sm font-bold shadow-sm transition cursor-pointer"
                onClick={handleBuyPlan}
              >
                Request Plan
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default AllPlans;