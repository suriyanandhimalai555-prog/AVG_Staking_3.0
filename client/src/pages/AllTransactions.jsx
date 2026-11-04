import React, { useState, useMemo, useEffect } from "react";
import { FaExchangeAlt, FaUserCheck, FaSitemap } from "react-icons/fa";
import axios from "axios";
import { formatDateTimeIST } from "../utils/dateFormat";

const AllTransactions = () => {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(10);

  const token = localStorage.getItem("token");

  // ✅ FETCH ALL (TX + DIRECT + LEVEL)
  const fetchTransactions = async () => {
    try {
      const [txRes, directRes, levelRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_APP_BASE_URL}/api/user-plans/transactions-all`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${import.meta.env.VITE_APP_BASE_URL}/api/users/admin/direct-income`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${import.meta.env.VITE_APP_BASE_URL}/api/users/admin/level-income`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      // ✅ TRANSACTIONS
      const txData = (txRes.data || []).map((d, i) => ({
        id: `T-${d.id}-${i}`,
        from: `${d.from_user} (${d.from_id})`,
        to: `${d.to_user} (${d.to_id})`,
        type: d.type || "Transaction",
        amount: `$${Number(d.amount || 0).toFixed(2)}`,
        created: d.created_at,
      }));

      // ✅ DIRECT
      const directData = (directRes.data || []).map((d, i) => ({
        id: `D-${d.id}-${i}`,
        from: d.from_user || "-",
        to: d.to_user || "-",
        type: "Direct Income",
        amount: `$${Number(d.income || 0).toFixed(2)}`,
        created: d.created_at,
      }));

      // ✅ LEVEL
      const levelData = (levelRes.data || []).map((d, i) => ({
        id: `L-${d.id}-${i}`,
        from: `${d.from_name} ${d.from_lastname}`,
        to: `${d.name} ${d.lastname}`,
        type: `Level ${d.level}`,
        amount: `$${Number(d.income || 0).toFixed(2)}`,
        created: d.created_at,
      }));

      // ✅ MERGE + SORT
      const merged = [...txData, ...directData, ...levelData].sort(
        (a, b) => new Date(b.created) - new Date(a.created)
      );

      setData(merged);
    } catch (err) {
      console.error("Admin TX fetch error:", err);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // ✅ SEARCH
  const filtered = useMemo(() => {
    return data.filter((d) =>
      d.from.toLowerCase().includes(search.toLowerCase()) ||
      d.to.toLowerCase().includes(search.toLowerCase()) ||
      d.type.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, data]);

  // ✅ PAGINATION
  const totalPages = Math.max(1, Math.ceil(filtered.length / rows));
  const paginated = filtered.slice((page - 1) * rows, page * rows);

  // ✅ SMART PAGINATION
  const getPagination = () => {
    const pages = [];
    const maxVisible = 5;

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

  const getTypeBadgeStyles = (type) => {
    if (type.includes("Direct")) {
      return "bg-emerald-50 text-emerald-600 border border-emerald-200";
    }
    if (type.includes("Level")) {
      return "bg-[#eef2fc] text-[#0437cc] border border-blue-100";
    }
    return "bg-slate-100 text-slate-600 border border-slate-200";
  };

  const getTypeIcon = (type) => {
    if (type.includes("Direct")) return <FaUserCheck className="inline mr-1 text-emerald-600" size={12} />;
    if (type.includes("Level")) return <FaSitemap className="inline mr-1 text-[#0437cc]" size={12} />;
    return <FaExchangeAlt className="inline mr-1 text-slate-500" size={12} />;
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 text-slate-800 select-none bg-white/90 p-6 rounded-2xl shadow-md">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">Transactions Management</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">Unified ledger auditing across platform channels</p>
        </div>

        <div className="relative w-full sm:w-72 lg:w-96">
          <input
            type="text"
            placeholder="Search accounts, pathways..."
            className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0437cc] focus:bg-white shadow-xs transition duration-200"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* TABLE DATA ARCHITECTURE */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50/70">
          <h3 className="font-bold text-base text-slate-900">Master Transaction Log</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/70 text-slate-600 uppercase text-xs tracking-wider font-bold border-b border-slate-200">
                <th className="py-4 px-5 w-16 text-center">S.No</th>
                <th className="py-4 px-5">Origin Account (From)</th>
                <th className="py-4 px-5">Target Recipient (To)</th>
                <th className="py-4 px-5">Channel Type</th>
                <th className="py-4 px-5">Transferred Sum</th>
                <th className="py-4 px-5">Settled Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-500 font-medium">
                    No matching transactional data records found inside history profiles.
                  </td>
                </tr>
              ) : (
                paginated.map((d, i) => (
                  <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-5 text-center text-slate-500 font-medium">
                      {(page - 1) * rows + i + 1}
                    </td>
                    <td className="py-4 px-5 font-bold text-slate-900 max-w-xs truncate">
                      {d.from}
                    </td>
                    <td className="py-4 px-5 font-bold text-slate-900 max-w-xs truncate">
                      {d.to}
                    </td>
                    <td className="py-4 px-5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold tracking-wide border ${getTypeBadgeStyles(d.type)}`}>
                        {getTypeIcon(d.type)}
                        {d.type}
                      </span>
                    </td>
                    <td className="py-4 px-5 font-bold text-emerald-600 tracking-wide">
                      {d.amount}
                    </td>
                    <td className="py-4 px-5 text-xs text-slate-500 font-medium">
                      {formatDateTimeIST(d.created)}
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
            <span>Rows per page</span>
            <select
              value={rows}
              onChange={(e) => {
                setRows(Number(e.target.value));
                setPage(1);
              }}
              className="bg-white border border-slate-300 rounded-lg py-1 px-2.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0437cc] transition cursor-pointer"
            >
              <option value={5}>5 records</option>
              <option value={10}>10 records</option>
              <option value={25}>25 records</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
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
              onClick={() => setPage((p) => p + 1)}
              className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white text-sm text-slate-700 transition hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none active:scale-95 cursor-pointer"
            >
              {">"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AllTransactions;