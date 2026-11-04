import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaPlane, FaTrophy, FaPlus, FaEdit, FaTrash, FaUsers, FaLayerGroup } from "react-icons/fa";
import toast from "react-hot-toast";

const DirectReferralReward = () => {
  const [tiers, setTiers] = useState([]);
  const [achievers, setAchievers] = useState([]);
  const [activeTab, setActiveTab] = useState("achievers"); // 'achievers' or 'tiers'
  const [loading, setLoading] = useState(true);

  // Modal / Form state for Tiers
  const [showModal, setShowModal] = useState(false);
  const [editingTier, setEditingTier] = useState(null);
  const [targetVolume, setTargetVolume] = useState("");
  const [tourName, setTourName] = useState("");

  const token = localStorage.getItem("token");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tiersRes, achieversRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_APP_BASE_URL}/api/users/admin/reward-tiers`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${import.meta.env.VITE_APP_BASE_URL}/api/users/admin/reward-achievers`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setTiers(tiersRes.data || []);
      setAchievers(achieversRes.data || []);
    } catch (err) {
      console.error("Error fetching reward data:", err);
      toast.error("Failed to load tour reward data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveTier = async (e) => {
    e.preventDefault();
    try {
      if (editingTier) {
        await axios.put(
          `${import.meta.env.VITE_APP_BASE_URL}/api/users/admin/reward-tiers/${editingTier.id}`,
          { target_volume: targetVolume, tour_name: tourName },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Reward tier updated successfully");
      } else {
        await axios.post(
          `${import.meta.env.VITE_APP_BASE_URL}/api/users/admin/reward-tiers`,
          { target_volume: targetVolume, tour_name: tourName },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Reward tier created successfully");
      }
      setShowModal(false);
      setEditingTier(null);
      setTargetVolume("");
      setTourName("");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save tier");
    }
  };

  const handleDeleteTier = async (id) => {
    if (!window.confirm("Are you sure you want to delete this reward tier?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_APP_BASE_URL}/api/users/admin/reward-tiers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Reward tier deleted");
      fetchData();
    } catch (err) {
      toast.error("Failed to delete tier");
    }
  };

  const openEditModal = (tier) => {
    setEditingTier(tier);
    setTargetVolume(tier.target_volume);
    setTourName(tier.tour_name);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center text-slate-500 font-bold">
        <div className="animate-pulse tracking-wide">Loading Direct Referral Tour Rewards...</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 text-slate-800 select-none bg-white/90 p-6 rounded-2xl shadow-md">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            Referral Tour Rewards
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Manage global tour reward tiers and view achievers
          </p>
        </div>

        {/* TAB TOGGLE SWITCH */}
        <div className="flex items-center bg-white border border-slate-200 p-1 rounded-xl shrink-0 shadow-xs">
          <button
            onClick={() => setActiveTab("achievers")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              activeTab === "achievers"
                ? "bg-[#0437cc] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FaUsers /> Achieved Users ({achievers.length})
          </button>
          <button
            onClick={() => setActiveTab("tiers")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              activeTab === "tiers"
                ? "bg-[#0437cc] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FaLayerGroup /> Manage Tiers ({tiers.length})
          </button>
        </div>
      </div>

      {/* METRIC SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="border border-slate-200 bg-white rounded-2xl p-5 flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Configured Tiers</p>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{tiers.length}</h3>
          </div>
          <div className="h-11 w-11 rounded-xl flex items-center justify-center bg-blue-50 text-[#0437cc] text-lg border border-blue-100">
            <FaLayerGroup />
          </div>
        </div>

        <div className="border border-slate-200 bg-white rounded-2xl p-5 flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Qualified Achievers</p>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{achievers.length}</h3>
          </div>
          <div className="h-11 w-11 rounded-xl flex items-center justify-center bg-emerald-50 text-emerald-600 text-lg border border-emerald-100">
            <FaTrophy />
          </div>
        </div>

        <div className="border border-slate-200 bg-white rounded-2xl p-5 flex items-center justify-between shadow-xs sm:col-span-2 lg:col-span-1">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Top Unlocked Destination</p>
            <h3 className="text-xl font-black text-[#0437cc] tracking-tight truncate max-w-[180px]">
              {achievers[0]?.unlocked_tour || "Dubai"}
            </h3>
          </div>
          <div className="h-11 w-11 rounded-xl flex items-center justify-center bg-amber-50 text-amber-600 text-lg shrink-0 border border-amber-100">
            <FaPlane />
          </div>
        </div>
      </div>

      {/* TAB 1: ACHIEVED USERS TABLE */}
      {activeTab === "achievers" && (
        <div className="border border-slate-200 bg-white rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <FaTrophy className="text-amber-500" /> Users Who Achieved Tour Rewards
            </h2>
            <span className="text-xs text-slate-500 font-semibold">{achievers.length} total achievers</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-slate-700 border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px] tracking-wider">
                  <th className="py-3.5 px-4 text-center">S.No</th>
                  <th className="py-3.5 px-4">User Name</th>
                  <th className="py-3.5 px-4">User Code</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4">Direct Volume</th>
                  <th className="py-3.5 px-4">Unlocked Reward</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {achievers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-500 font-medium">
                      No users have achieved tour rewards yet.
                    </td>
                  </tr>
                ) : (
                  achievers.map((item, index) => (
                    <tr key={item.id || index} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 text-center text-slate-500 font-medium">{index + 1}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {item.name} {item.lastname || ""}
                      </td>
                      <td className="py-3.5 px-4 text-[#0437cc] font-mono font-bold">{item.user_code}</td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">{item.phone || "-"}</td>
                      <td className="py-3.5 px-4 text-emerald-600 font-bold font-mono">
                        ${Number(item.total_direct_volume).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-blue-50 text-[#0437cc] border border-blue-100">
                          <FaPlane className="text-[10px]" /> {item.unlocked_tour}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: MANAGE TIERS TABLE */}
      {activeTab === "tiers" && (
        <div className="border border-slate-200 bg-white rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <FaLayerGroup className="text-[#0437cc]" /> Configured Tour Tiers
            </h2>
            <button
              onClick={() => {
                setEditingTier(null);
                setTargetVolume("");
                setTourName("");
                setShowModal(true);
              }}
              className="flex items-center gap-2 bg-[#0437cc] hover:bg-blue-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-xs cursor-pointer active:scale-95"
            >
              <FaPlus /> Add New Tier
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-slate-700 border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px] tracking-wider">
                  <th className="py-3.5 px-4 text-center">S.No</th>
                  <th className="py-3.5 px-4">Required Volume ($)</th>
                  <th className="py-3.5 px-4">Proposed Tour</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tiers.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-slate-500 font-medium">
                      No tour reward tiers configured yet.
                    </td>
                  </tr>
                ) : (
                  tiers.map((tier, index) => (
                    <tr key={tier.id || index} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 text-center text-slate-500 font-medium">{index + 1}</td>
                      <td className="py-3.5 px-4 font-bold text-[#0437cc] font-mono">
                        ${Number(tier.target_volume).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{tier.tour_name}</td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => openEditModal(tier)}
                          className="px-3 py-1.5 rounded-lg bg-blue-50 text-[#0437cc] hover:bg-blue-100 text-xs font-bold transition cursor-pointer"
                        >
                          <FaEdit className="inline mr-1" /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTier(tier.id)}
                          className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold transition cursor-pointer"
                        >
                          <FaTrash className="inline mr-1" /> Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-[100] flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md space-y-6 shadow-2xl">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-lg font-bold text-slate-900 tracking-wide">
                {editingTier ? "Edit Reward Tier" : "Add New Reward Tier"}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">Define volume limit and proposed tour destination</p>
            </div>

            <form onSubmit={handleSaveTier} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Target Direct Volume ($):</label>
                <input
                  type="number"
                  value={targetVolume}
                  onChange={(e) => setTargetVolume(e.target.value)}
                  placeholder="20000"
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0437cc] transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Proposed Tour Name:</label>
                <input
                  type="text"
                  value={tourName}
                  onChange={(e) => setTourName(e.target.value)}
                  placeholder="Dubai"
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0437cc] transition"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white rounded-xl bg-[#0437cc] hover:bg-blue-800 shadow-xs transition cursor-pointer active:scale-95"
                >
                  Save Tier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DirectReferralReward;