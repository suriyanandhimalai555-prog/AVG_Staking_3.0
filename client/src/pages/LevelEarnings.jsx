import React, { useMemo, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { FaSitemap, FaUserAlt, FaCalendarAlt, FaDollarSign, FaFingerprint, FaEye, FaTimes } from "react-icons/fa";
import { formatDateTimeIST } from "../utils/dateFormat";

/**
 * LevelEarnings.jsx
 * Admin Page - Level Income (ALL USERS)
 */
const LevelEarnings = () => {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [viewItem, setViewItem] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH ================= */
  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${import.meta.env.VITE_APP_BASE_URL}/api/users/admin/level-income`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const formatted = (res.data || []).map((item) => ({
        id: item.id,
        fromUser: `${item.from_name || ""} ${item.from_lastname || ""} (${item.from_code || "-"})`,
        toUser: `${item.name || ""} ${item.lastname || ""} (${item.user_code || "-"})`,
        type: `Level ${item.level} Income`,
        amount: `$${Number(item.income || 0).toFixed(2)}`,
        createdAt: formatDateTimeIST(item.created_at),
      }));

      setData(formatted);
    } catch (err) {
      console.error("Fetch level income error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ================= SEARCH ================= */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data;

    return data.filter((r) =>
      r.fromUser.toLowerCase().includes(q) ||
      r.toUser.toLowerCase().includes(q) ||
      r.type.toLowerCase().includes(q) ||
      r.amount.toLowerCase().includes(q) ||
      r.createdAt.toLowerCase().includes(q)
    );
  }, [search, data]);

  /* ================= PAGINATION ================= */
  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));

  const pageItems = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    return filtered.slice(startIndex, startIndex + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  useEffect(() => {
    setPage(1);
  }, [search, rowsPerPage]);

  const getPagination = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= 1) return [1];

    let start = Math.max(page - 2, 1);
    let end = Math.min(start + maxVisible - 1, totalPages);

    if (end - start < maxVisible - 1) {
      start = Math.max(end - maxVisible + 1, 1);
    }

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push("...");
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };

  const startIndex = (page - 1) * rowsPerPage;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 text-slate-800 select-none bg-white/90 p-6 rounded-2xl shadow-md">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">Level Matrix Earnings</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">Audit multi-tier organizational downline payouts and generations</p>
        </div>

        <div className="relative w-full sm:w-72 lg:w-96">
          <input
            type="text"
            placeholder="Search level parameters, names, sums..."
            className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0437cc] focus:bg-white shadow-xs transition duration-200"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* DATA CARD ARCHITECTURE */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50/70">
          <h3 className="font-bold text-base text-slate-900">Multi-Tier Revenue Distribution</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/70 text-slate-600 uppercase text-xs tracking-wider font-bold border-b border-slate-200">
                <th className="py-4 px-5 w-16 text-center">S.No</th>
                <th className="py-4 px-5">Origin Node (From)</th>
                <th className="py-4 px-5">Target Affiliate (To)</th>
                <th className="py-4 px-5">Generation Tier</th>
                <th className="py-4 px-5">Allocated Sum</th>
                <th className="py-4 px-5">Settlement Timestamp</th>
                <th className="py-4 px-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-16 text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-8 h-8 border-4 border-[#0437cc] border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs font-medium tracking-wide text-slate-500">Compiling lineage payout trees...</span>
                    </div>
                  </td>
                </tr>
              ) : pageItems.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-500 font-medium">
                    No matching matrix level distribution logs tracked within current query parameters.
                  </td>
                </tr>
              ) : (
                pageItems.map((row, i) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-5 text-center text-slate-500 font-medium">
                      {startIndex + i + 1}
                    </td>
                    <td className="py-4 px-5 font-bold text-slate-900 max-w-xs truncate">
                      {row.fromUser}
                    </td>
                    <td className="py-4 px-5 font-bold text-slate-900 max-w-xs truncate">
                      {row.toUser}
                    </td>
                    <td className="py-4 px-5">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold tracking-wide border bg-[#eef2fc] text-[#0437cc] border-blue-100">
                        <FaSitemap className="mr-1.5 text-[#0437cc]" size={11} />
                        {row.type}
                      </span>
                    </td>
                    <td className="py-4 px-5 font-bold text-emerald-600 tracking-wide">
                      {row.amount}
                    </td>
                    <td className="py-4 px-5 text-xs text-slate-500 font-medium">
                      {row.createdAt}
                    </td>
                    <td className="py-4 px-5 text-center">
                      <button
                        onClick={() => setViewItem(row)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition-all active:scale-95 cursor-pointer"
                      >
                        <FaEye size={12} className="text-[#0437cc]" />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* CONTROLLER MATRIX (PAGINATION) */}
        <div className="p-5 bg-slate-50/50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-500">
          
          <div className="flex items-center gap-2.5">
            <span>Rows per view channel:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
              className="bg-white border border-slate-300 rounded-lg py-1 px-2.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0437cc] transition cursor-pointer"
            >
              <option value={10}>10 items</option>
              <option value={25}>25 items</option>
              <option value={50}>50 items</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white text-sm text-slate-700 transition hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none active:scale-95 cursor-pointer"
            >
              {"<"}
            </button>

            {getPagination().map((p, i) =>
              p === "..." ? (
                <span key={i} className="px-2 text-slate-400 text-sm tracking-wider">...</span>
              ) : (
                <button
                  key={i}
                  onClick={() => setPage(p)}
                  className={`h-8 w-8 inline-flex items-center justify-center rounded-lg text-xs font-bold transition duration-150 active:scale-95 cursor-pointer ${
                    page === p
                      ? "bg-[#0437cc] text-white shadow-xs"
                      : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {p}
                </button>
              )
            )}

            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white text-sm text-slate-700 transition hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none active:scale-95 cursor-pointer"
            >
              {">"}
            </button>
          </div>

        </div>
      </div>

      {/* AUDIT VIEW MODAL */}
      {viewItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden transform scale-100 transition-transform">
            
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 tracking-wide">Matrix Generation Scope</h3>
              <button 
                onClick={() => setViewItem(null)}
                className="text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <FaTimes size={16} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm text-slate-700">
              <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                <FaFingerprint className="text-[#0437cc] mt-1 shrink-0" size={16} />
                <div>
                  <div className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Transaction Index ID</div>
                  <div className="text-slate-900 mt-0.5 font-mono text-xs font-bold">{viewItem.id}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <FaUserAlt className="text-slate-400 mt-1 shrink-0" size={14} />
                  <div>
                    <div className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Origin Source Node</div>
                    <div className="text-slate-900 mt-0.5 font-semibold text-xs break-all">{viewItem.fromUser}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <FaUserAlt className="text-[#0437cc] mt-1 shrink-0" size={14} />
                  <div>
                    <div className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Target Affiliate Recipient</div>
                    <div className="text-slate-900 mt-0.5 font-semibold text-xs break-all">{viewItem.toUser}</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <FaDollarSign className="text-emerald-600 mt-1 shrink-0" size={14} />
                  <div>
                    <div className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Disbursed Value</div>
                    <div className="text-emerald-600 font-bold mt-0.5 text-base tracking-wide">{viewItem.amount}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <FaCalendarAlt className="text-slate-400 mt-1 shrink-0" size={14} />
                  <div>
                    <div className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Timestamp Log</div>
                    <div className="text-slate-600 mt-0.5 text-xs font-medium">{viewItem.createdAt}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setViewItem(null)}
                className="px-5 py-2 bg-white border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-100 transition active:scale-95 cursor-pointer"
              >
                Close Matrix View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LevelEarnings;