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
      <div className="flex h-[60vh] w-full items-center justify-center text-slate-400 font-medium">
        <div className="animate-pulse tracking-wide">Loading Direct Referral Tour Rewards...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b1e] p-4 sm:p-6 lg:p-8 text-white space-y-8 rounded-2xl shadow-xl">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
            {/* <FaPlane className="text-cyan-400 text-xl sm:text-2xl" /> */}
            Direct Referral Tour Rewards
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage global tour reward tiers and view achievers
          </p>
        </div>

        {/* TAB TOGGLE SWITCH */}
        <div className="flex items-center bg-[#111936] border border-white/5 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setActiveTab("achievers")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === "achievers"
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-950/50"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <FaUsers /> Achieved Users ({achievers.length})
          </button>
          <button
            onClick={() => setActiveTab("tiers")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === "tiers"
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-950/50"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <FaLayerGroup /> Manage Tiers ({tiers.length})
          </button>
        </div>
      </div>

      {/* METRIC SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div 
          className="border border-white/5 bg-[#111936] rounded-2xl p-5 flex items-center justify-between shadow-lg"
          style={{ boxShadow: "0 10px 30px -10px rgba(147,51,234,0.15)" }}
        >
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-400 tracking-wide">Total Configured Tiers</p>
            <h3 className="text-2xl font-bold text-white tracking-tight">{tiers.length}</h3>
          </div>
          <div className="h-11 w-11 rounded-xl flex items-center justify-center bg-purple-500/10 text-purple-400 text-lg">
            <FaLayerGroup />
          </div>
        </div>

        <div 
          className="border border-white/5 bg-[#111936] rounded-2xl p-5 flex items-center justify-between shadow-lg"
          style={{ boxShadow: "0 10px 30px -10px rgba(34,197,94,0.15)" }}
        >
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-400 tracking-wide">Qualified Achievers</p>
            <h3 className="text-2xl font-bold text-white tracking-tight">{achievers.length}</h3>
          </div>
          <div className="h-11 w-11 rounded-xl flex items-center justify-center bg-green-500/10 text-green-400 text-lg">
            <FaTrophy />
          </div>
        </div>

        <div 
          className="border border-white/5 bg-[#111936] rounded-2xl p-5 flex items-center justify-between shadow-lg sm:col-span-2 lg:col-span-1"
          style={{ boxShadow: "0 10px 30px -10px rgba(6,182,212,0.15)" }}
        >
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-400 tracking-wide">Top Unlocked Destination</p>
            <h3 className="text-xl font-bold text-cyan-400 tracking-tight truncate max-w-[180px]">
              {achievers[0]?.unlocked_tour || "Dubai"}
            </h3>
          </div>
          <div className="h-11 w-11 rounded-xl flex items-center justify-center bg-cyan-500/10 text-cyan-400 text-lg shrink-0">
            <FaPlane />
          </div>
        </div>
      </div>

      {/* TAB 1: ACHIEVED USERS TABLE */}
      {activeTab === "achievers" && (
        <div className="border border-white/5 bg-[#111936] rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <FaTrophy className="text-amber-400" /> Users Who Achieved Tour Rewards
            </h2>
            <span className="text-xs text-slate-400">{achievers.length} total achievers</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-slate-300 border-collapse">
              <thead>
                <tr className="bg-[#090f26] border-b border-white/5 text-slate-400 font-semibold uppercase text-[11px] tracking-wider">
                  <th className="py-3 px-4">S.No</th>
                  <th className="py-3 px-4">User Name</th>
                  <th className="py-3 px-4">User Code</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Direct Volume</th>
                  <th className="py-3 px-4">Unlocked Reward</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {achievers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-500 font-medium">
                      No users have achieved tour rewards yet.
                    </td>
                  </tr>
                ) : (
                  achievers.map((item, index) => (
                    <tr key={item.id || index} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4 text-slate-400">{index + 1}</td>
                      <td className="py-3.5 px-4 font-semibold text-white">
                        {item.name} {item.lastname || ""}
                      </td>
                      <td className="py-3.5 px-4 text-purple-400 font-mono font-medium">{item.user_code}</td>
                      <td className="py-3.5 px-4 text-slate-400">{item.phone || "-"}</td>
                      <td className="py-3.5 px-4 text-emerald-400 font-bold font-mono">
                        ${Number(item.total_direct_volume).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
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
        <div className="border border-white/5 bg-[#111936] rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <FaLayerGroup className="text-purple-400" /> Configured Tour Tiers
            </h2>
            <button
              onClick={() => {
                setEditingTier(null);
                setTargetVolume("");
                setTourName("");
                setShowModal(true);
              }}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition duration-200 shadow-md shadow-emerald-950/50"
            >
              <FaPlus /> Add New Tier
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-slate-300 border-collapse">
              <thead>
                <tr className="bg-[#090f26] border-b border-white/5 text-slate-400 font-semibold uppercase text-[11px] tracking-wider">
                  <th className="py-3 px-4">S.No</th>
                  <th className="py-3 px-4">Required Volume ($)</th>
                  <th className="py-3 px-4">Proposed Tour</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {tiers.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-slate-500 font-medium">
                      No tour reward tiers configured yet.
                    </td>
                  </tr>
                ) : (
                  tiers.map((tier, index) => (
                    <tr key={tier.id || index} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4 text-slate-400">{index + 1}</td>
                      <td className="py-3.5 px-4 font-bold text-indigo-400 font-mono">
                        ${Number(tier.target_volume).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-white">{tier.tour_name}</td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => openEditModal(tier)}
                          className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 text-xs font-semibold transition-colors"
                        >
                          <FaEdit className="inline mr-1" /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTier(tier.id)}
                          className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs font-semibold transition-colors"
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111936] border border-white/10 rounded-2xl p-6 w-full max-w-md space-y-6 shadow-2xl">
            <div className="border-b border-white/5 pb-3">
              <h3 className="text-lg font-bold text-white tracking-wide">
                {editingTier ? "Edit Reward Tier" : "Add New Reward Tier"}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Define volume limit and proposed tour destination</p>
            </div>

            <form onSubmit={handleSaveTier} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Target Direct Volume ($):</label>
                <input
                  type="number"
                  value={targetVolume}
                  onChange={(e) => setTargetVolume(e.target.value)}
                  placeholder="20000"
                  required
                  className="w-full bg-[#090f26] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Proposed Tour Name:</label>
                <input
                  type="text"
                  value={tourName}
                  onChange={(e) => setTourName(e.target.value)}
                  placeholder="Dubai"
                  required
                  className="w-full bg-[#090f26] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-md shadow-purple-950/50 transition-all"
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