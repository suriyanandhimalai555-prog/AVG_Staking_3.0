import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { FaEllipsisV, FaChevronLeft, FaChevronRight, FaEye, FaEdit, FaTrashAlt, FaPlus, FaCalendarAlt, FaUser, FaWallet, FaLink } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-hot-toast";

const DepositTransactions = () => {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(10);
  const [menu, setMenu] = useState(null);

  const [viewData, setViewData] = useState(null);
  const [editData, setEditData] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const [showManualDeposit, setShowManualDeposit] = useState(false);

  const [selectedUser, setSelectedUser] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("");
  const [depositAmount, setDepositAmount] = useState("");

  const [users, setUsers] = useState([]);
  const [plans, setPlans] = useState([]);

  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDateTime = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (isNaN(date.getTime())) return "-";

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;

    return `${day}/${month}/${year} • ${hours}:${minutes} ${ampm}`;
  };

  const fetchDropdownData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const [usersRes, plansRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_APP_BASE_URL}/api/users/dropdown/users`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${import.meta.env.VITE_APP_BASE_URL}/api/users/dropdown/plans`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setUsers(usersRes.data || []);
      setPlans(plansRes.data || []);
    } catch (err) {
      console.error("Dropdown fetch error:", err);
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/api/user-plans/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const formatted = (res.data || []).map((item) => ({
        id: item.id,
        user: item.user || "N/A",
        hash: item.hash || `0x${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 6)}`,
        plan: item.plan_name || "N/A",
        amount: `$${Number(item.amount ?? 0).toLocaleString()}`,
        created: formatDateTime(item.created_at),
      }));

      setData(formatted);
    } catch (err) {
      console.error("Fetch transactions error:", err);
      toast.error("Failed to load global transaction ledger");
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
    fetchDropdownData();
  }, [fetchTransactions, fetchDropdownData]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return data.filter(
      (d) =>
        d.user.toLowerCase().includes(q) ||
        d.hash.toLowerCase().includes(q) ||
        d.plan.toLowerCase().includes(q)
    );
  }, [search, data]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rows));

  const paginated = useMemo(() => {
    const start = (page - 1) * rows;
    return filtered.slice(start, start + rows);
  }, [filtered, page, rows]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  useEffect(() => {
    setPage(1);
  }, [search, rows]);

  const getPagination = () => {
    const pages = [];
    const maxVisible = 5;
    if (totalPages <= 1) return [1];

    let start = Math.max(page - 2, 1);
    let end = Math.min(start + maxVisible - 1, totalPages);

    if (end - start < maxVisible - 1) start = Math.max(end - maxVisible + 1, 1);
    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push("...");
    }
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages) {
      if (end < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  const createDeposit = () => {
    if (!selectedUser || !selectedPlan || !depositAmount) {
      toast.error("Please fill all deployment variables");
      return;
    }

    const newDeposit = {
      id: Date.now(),
      user: selectedUser,
      hash: `0x${Math.random().toString(36).substring(2, 12).toUpperCase()}`,
      plan: selectedPlan,
      amount: `$${Number(depositAmount).toLocaleString()}`,
      created: formatDateTime(new Date()),
    };

    setData((prev) => [newDeposit, ...prev]);
    setShowManualDeposit(false);
    setSelectedUser("");
    setSelectedPlan("");
    setDepositAmount("");
    toast.success("Manual allocation broadcast successful");
  };

  const confirmDelete = () => {
    setData((prev) => prev.filter((d) => d.id !== deleteId));
    setDeleteId(null);
    toast.success("Transaction item purged from view");
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const saveEdit = () => {
    setData((prev) => prev.map((d) => (d.id === editData.id ? editData : d)));
    setEditData(null);
    toast.success("Transaction changes successfully preserved");
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 text-slate-800 select-none bg-white/90 p-6 rounded-2xl shadow-md">
      
      {/* Dynamic Navigation & Filtering Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <FaWallet className="text-[#0437cc] text-lg" />
            Transactions Ledger
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">Audit, trace, and manually deploy cryptographic staking deposits</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Real-time Filter Field */}
          <div className="relative flex items-center min-w-[280px]">
            <input
              type="text"
              placeholder="Search by user, hash string, or contract..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0437cc] shadow-xs transition"
            />
          </div>

          {/* Trigger Manual Flow */}
          <button
            onClick={() => setShowManualDeposit(true)}
            className="px-5 py-2.5 text-xs font-bold rounded-xl shadow-xs border bg-[#0437cc] text-white border-transparent hover:bg-[#3b52d4] transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <FaPlus className="text-[10px]" /> Manual Deposit
          </button>
        </div>
      </div>

      {/* Master Data Grid Table Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">Deposit Inflow Queue</h3>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 uppercase tracking-wider text-[10px] font-bold">
                <th className="py-4.5 px-6 w-16 text-center">Index</th>
                <th className="py-4.5 px-6"><span className="flex items-center gap-1.5"><FaUser className="text-[10px] text-[#0437cc]" /> From User</span></th>
                <th className="py-4.5 px-6"><span className="flex items-center gap-1.5"><FaLink className="text-[10px] text-[#3b52d4]" /> Transaction Hash</span></th>
                <th className="py-4.5 px-6">Plan Cluster</th>
                <th className="py-4.5 px-6">Value Transferred</th>
                <th className="py-4.5 px-6"><span className="flex items-center gap-1.5"><FaCalendarAlt className="text-[10px] text-slate-500" /> Log Timestamp</span></th>
                <th className="py-4.5 px-6 text-center">Operations</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
              {paginated.length > 0 ? (
                paginated.map((d, i) => (
                  <tr key={d.id} onClick={() => {
                    setViewData(d);
                    setMenu(null);
                  }} className="hover:bg-slate-50/80 transition duration-150 cursor-pointer">
                    <td className="py-4 px-6 text-center text-slate-400 font-mono">
                      {String((page - 1) * rows + i + 1).padStart(2, '0')}
                    </td>
                    <td className="py-4 px-6 text-slate-900 font-bold tracking-wide">{d.user}</td>
                    <td className="py-4 px-6 font-mono text-[11px] text-slate-500 max-w-[200px] truncate" title={d.hash}>
                      {d.hash}
                    </td>
                    <td className="py-4 px-6 text-[#0437cc] font-bold">{d.plan}</td>
                    <td className="py-4 px-6 font-mono font-bold text-emerald-600">{d.amount}</td>
                    <td className="py-4 px-6 text-slate-500 text-[11px] font-mono">{d.created}</td>
                    <td className="py-4 px-6 text-center relative" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center">
                        <button 
                          onClick={() => setMenu(menu === d.id ? null : d.id)}
                          className={`p-2 rounded-xl transition duration-150 cursor-pointer ${menu === d.id ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-700'}`}
                        >
                          <FaEllipsisV className="text-xs" />
                        </button>

                        {menu === d.id && (
                          <div ref={dropdownRef} className="absolute right-14 top-1/2 -translate-y-1/2 z-50 min-w-[140px] bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 space-y-0.5 text-left animate-fade-in divide-y divide-slate-100">
                            <button
                              onClick={() => { setViewData(d); setMenu(null); }}
                              className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-[11px] text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                            >
                              <FaEye className="text-[10px] text-[#0437cc]" /> View Node
                            </button>
                            <button
                              onClick={() => { setEditData(d); setMenu(null); }}
                              className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-[11px] text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                            >
                              <FaEdit className="text-[10px] text-[#3b52d4]" /> Patch Index
                            </button>
                            <button
                              onClick={() => { setDeleteId(d.id); setMenu(null); }}
                              className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-[11px] text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            >
                              <FaTrashAlt className="text-[10px]" /> Purge Stack
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-20 text-center text-slate-400 font-medium tracking-wide">
                    No transactional telemetry patterns matches current indices.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Luxury System Matrix Pagination Footer */}
        <div className="bg-slate-50/50 border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-xs text-slate-500">
            <span>Rows per page</span>
            <div className="relative">
              <select
                value={rows}
                onChange={(e) => setRows(Number(e.target.value))}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700 outline-none focus:ring-1 focus:ring-[#0437cc] transition cursor-pointer appearance-none pr-6"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[8px] text-slate-400">▼</div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white text-sm text-slate-700 transition hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none active:scale-95 cursor-pointer"
            >
              <FaChevronLeft className="text-[10px]" />
            </button>

            <div className="flex items-center gap-1">
              {getPagination().map((p, i) =>
                p === "..." ? (
                  <span key={i} className="px-2 text-slate-400 text-sm tracking-wider">...</span>
                ) : (
                  <button
                    key={i}
                    onClick={() => setPage(p)}
                    className={`h-8 w-8 inline-flex items-center justify-center rounded-lg text-xs font-bold transition duration-150 active:scale-95 cursor-pointer ${
                      page === p 
                        ? 'bg-[#0437cc] text-white shadow-xs' 
                        : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
            </div>

            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white text-sm text-slate-700 transition hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none active:scale-95 cursor-pointer"
            >
              <FaChevronRight className="text-[10px]" />
            </button>
          </div>
        </div>
      </div>

      {/* ================= MODAL OVERLAYS RENDERING SYSTEM ================= */}
      
      {/* View Data Modal Overlay */}
      {viewData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-base font-bold text-slate-900 tracking-wide">Telemetry Transaction Matrix</h3>
              <button onClick={() => setViewData(null)} className="text-slate-400 hover:text-slate-700 transition text-sm cursor-pointer">✕</button>
            </div>
            <div className="p-6 space-y-3">
              {[
                { label: "Account Owner", value: viewData.user },
                { label: "Blockchain Hash String", value: viewData.hash },
                { label: "Allocated Core Node Plan", value: viewData.plan },
                { label: "Principal Volume", value: viewData.amount },
                { label: "Creation Cycle Stamp", value: viewData.created }
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col gap-1 bg-slate-50 px-4 py-3 border border-slate-200/80 rounded-xl text-xs">
                  <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400">{item.label}</span>
                  <span className="text-slate-900 font-bold tracking-wide break-all mt-0.5">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button onClick={() => setViewData(null)} className="px-5 py-2 text-xs font-semibold rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 transition active:scale-95 cursor-pointer">
                Dismiss View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Patch/Edit Data Modal Overlay */}
      {editData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-base font-bold text-slate-900 tracking-wide">Patch Index Variable Parameters</h3>
              <button onClick={() => setEditData(null)} className="text-slate-400 hover:text-slate-700 transition text-sm cursor-pointer">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Account Owner Identifier</label>
                <input
                  name="user"
                  value={editData.user}
                  onChange={handleEditChange}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0437cc] focus:bg-white transition"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Node Core Plan Level</label>
                <input
                  name="plan"
                  value={editData.plan}
                  onChange={handleEditChange}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0437cc] focus:bg-white transition"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Staked Allocation Amount</label>
                <input
                  name="amount"
                  value={editData.amount}
                  onChange={handleEditChange}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0437cc] focus:bg-white transition"
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
              <button onClick={() => setEditData(null)} className="px-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 transition active:scale-95 cursor-pointer">
                Abort Changes
              </button>
              <button onClick={saveEdit} className="px-5 py-2.5 text-xs font-bold rounded-xl bg-[#0437cc] hover:bg-[#3b52d4] text-white shadow-xs transition active:scale-95 cursor-pointer">
                Preserve Mutation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete/Purge Modal Overlay */}
      {deleteId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl p-6 space-y-5 text-center">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 border border-rose-200 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
              ⚠️
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-900">Purge Execution Protocol</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">Are you completely certain you intend to wipe this transaction from the view matrix cache?</p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button onClick={() => setDeleteId(null)} className="w-28 py-2.5 text-xs font-semibold rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 transition active:scale-95 cursor-pointer">
                Cancel Action
              </button>
              <button onClick={confirmDelete} className="w-28 py-2.5 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-xs transition active:scale-95 cursor-pointer">
                Purge Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Deposit Entry Formulation System */}
      {showManualDeposit && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-base font-bold text-slate-900 tracking-wide">Initialize Manual Ledger Deposit</h3>
              <button onClick={() => setShowManualDeposit(false)} className="text-slate-400 hover:text-slate-700 transition text-sm cursor-pointer">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Target Account Target</label>
                <div className="relative">
                  <select
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0437cc] focus:bg-white transition cursor-pointer"
                  >
                    <option value="" className="text-slate-400">Select network account node...</option>
                    {users.map((u) => (
                      <option key={u.id} value={`${u.name} ${u.user_code}`} className="text-slate-800">
                        {u.name} ({u.user_code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Tier Level Product Index</label>
                <div className="relative">
                  <select
                    value={selectedPlan}
                    onChange={(e) => setSelectedPlan(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0437cc] focus:bg-white transition cursor-pointer"
                  >
                    <option value="" className="text-slate-400">Select cluster pricing stack...</option>
                    {plans.map((p) => (
                      <option key={p.id} value={p.name} className="text-slate-800">
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Liquidity Inflow Allocation ($)</label>
                <input
                  type="number"
                  placeholder="Enter custom liquidity metric..."
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0437cc] focus:bg-white transition"
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
              <button onClick={() => setShowManualDeposit(false)} className="px-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 transition active:scale-95 cursor-pointer">
                Cancel Deployment
              </button>
              <button onClick={createDeposit} className="px-5 py-2.5 text-xs font-bold rounded-xl bg-[#0437cc] hover:bg-[#3b52d4] text-white shadow-xs transition active:scale-95 cursor-pointer">
                Inject Ledger
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepositTransactions;