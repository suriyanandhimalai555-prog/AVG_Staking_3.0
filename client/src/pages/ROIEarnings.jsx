import React, { useMemo, useState, useEffect } from "react";
import { FaCoins, FaInfoCircle } from "react-icons/fa";
import axios from "axios";

const ROIEarnings = () => {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);

  const formatDateTime = (value) => {
    if (!value) return "-";

    const date = new Date(value.replace(" ", "T"));

    if (isNaN(date.getTime())) return "-";

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    const ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12 || 12;

    return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds} ${ampm}`;
  };

  // ✅ FETCH DATA
  const fetchROI = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${import.meta.env.VITE_APP_BASE_URL}/api/user-plans/roi-all`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const formatted = (res.data || []).map((item) => ({
        id: item.id,
        fromUser: `${item.from_user} (${item.from_id})`,
        toUser: `${item.to_user} (${item.to_id})`,
        type: "Daily ROI Income",
        amount: `$${Number(item.amount).toFixed(2)}`,
        createdAt: item.created_at,
      }));

      setData(formatted);
    } catch (err) {
      console.error("Admin ROI fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchROI();
  }, []);

  // ✅ SEARCH
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return data.filter((r) =>
      r.fromUser.toLowerCase().includes(q) ||
      r.toUser.toLowerCase().includes(q) ||
      r.type.toLowerCase().includes(q) ||
      r.amount.toLowerCase().includes(q)
    );
  }, [search, data]);

  // ✅ PAGINATION
  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));

  const pageItems = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

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

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 text-slate-800 select-none bg-white/90 p-6 rounded-2xl shadow-md">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">ROI Earnings Ledger</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">Auditing real-time daily returns generated globally</p>
        </div>

        <div className="relative w-full sm:w-72 lg:w-96">
          <input
            type="text"
            placeholder="Search matching profiles..."
            className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0437cc] focus:bg-white shadow-xs transition duration-200"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* DATA LEDGER CARD */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50/70 flex items-center gap-2">
          <h3 className="font-bold text-base text-slate-900">Daily Yield Distribution</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/70 text-slate-600 uppercase text-xs tracking-wider font-bold border-b border-slate-200">
                <th className="py-4 px-5 w-16 text-center">S.No</th>
                <th className="py-4 px-5">Source Node (From)</th>
                <th className="py-4 px-5">Beneficiary Node (To)</th>
                <th className="py-4 px-5">Allocation Stream</th>
                <th className="py-4 px-5">Disbursed Amount</th>
                <th className="py-4 px-5">Generation Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-16 text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-8 h-8 border-4 border-[#0437cc] border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs font-medium tracking-wide text-slate-500">Querying ROI indices...</span>
                    </div>
                  </td>
                </tr>
              ) : pageItems.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-500 font-medium">
                    <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                      <FaInfoCircle size={20} />
                      <span>No matching active yield configurations detected in runtime database.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                pageItems.map((row, i) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-5 text-center text-slate-500 font-medium">
                      {(page - 1) * rowsPerPage + i + 1}
                    </td>
                    <td className="py-4 px-5 font-bold text-slate-900 max-w-xs truncate">
                      {row.fromUser}
                    </td>
                    <td className="py-4 px-5 font-bold text-slate-900 max-w-xs truncate">
                      {row.toUser}
                    </td>
                    <td className="py-4 px-5">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold tracking-wide border bg-amber-50 text-amber-700 border-amber-200">
                        <FaCoins className="inline mr-1 text-amber-500" size={11} />
                        {row.type}
                      </span>
                    </td>
                    <td className="py-4 px-5 font-bold text-emerald-600 tracking-wide">
                      {row.amount}
                    </td>
                    <td className="py-4 px-5 text-xs text-slate-500 font-medium">
                      {formatDateTime(row.createdAt)}
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
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setPage(1);
              }}
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
    </div>
  );
};

export default ROIEarnings;