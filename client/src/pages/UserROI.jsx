import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Sidebar from "../components/user/UserSidebar";
import Topbar from "../components/user/UserTopbar";
import { toast } from "react-hot-toast";
import { 
  FiTrendingUp, 
  FiSearch, 
  FiChevronLeft, 
  FiChevronRight 
} from "react-icons/fi";

const UserROI = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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

  // ✅ FETCH ROI
  const fetchROI = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${import.meta.env.VITE_APP_BASE_URL}/api/user-plans/roi-history`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const formatted = (res.data || []).map((item) => ({
        id: item.id,
        from: item.from_user || "Admin",
        fromId: item.from_id || "SYSTEM",
        to: item.to_user || "-",
        toId: item.to_id || "-",
        type: "Daily ROI Income",
        amount: Number(item.amount || 0),
        date: item.created_at,
      }));

      setData(formatted);
    } catch (err) {
      console.error("ROI fetch error:", err);
      toast.error("Failed to load ROI income history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchROI();
  }, []);

  // ✅ FILTER
  const filteredData = useMemo(() => {
    return data.filter((item) =>
      item.type.toLowerCase().includes(search.toLowerCase()) ||
      item.amount.toString().toLowerCase().includes(search.toLowerCase()) ||
      item.from.toLowerCase().includes(search.toLowerCase()) ||
      item.to.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, data]);

  // ✅ PAGINATION
  const totalPages = Math.max(1, Math.ceil(filteredData.length / rowsPerPage));

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, currentPage, rowsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [totalPages, currentPage]);

  // ✅ SMART PAGINATION
  const getPagination = () => {
    const pages = [];
    const maxVisible = 5;

    let start = Math.max(currentPage - 2, 1);
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
    <div className="flex bg-slate-100 rounded-lg min-h-screen">
      {/* <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} /> */}

      <div className="flex-1 flex flex-col min-w-0">
        {/* <Topbar isOpen={isOpen} setIsOpen={setIsOpen} /> */}

        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8 bg-slate-100">
          
          {/* HEADER BANNER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-xs">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                My ROI Income
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                Review all your daily return on investment (ROI) accruals and history
              </p>
            </div>

            <div className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 shadow-xs self-start sm:self-auto">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Accruals Active
            </div>
          </div>

          {/* TABLE CONTAINER & SEARCH */}
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
            
            {/* Search Bar */}
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <FiTrendingUp className="text-lg" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">ROI Ledger</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Detailed log of daily returns</p>
                </div>
              </div>

              <div className="relative w-full sm:w-72">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <FiSearch className="text-sm" />
                </span>
                <input
                  type="text"
                  placeholder="Search ROI records..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-hidden focus:border-[#0437cc] transition"
                />
              </div>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-3.5 px-4 sm:px-6">S.No</th>
                    <th className="py-3.5 px-4">From User</th>
                    <th className="py-3.5 px-4">To User</th>
                    <th className="py-3.5 px-4">Type</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4 sm:px-6">Created At</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-slate-500 font-medium">
                        Loading ROI records...
                      </td>
                    </tr>
                  ) : paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-slate-500 font-medium">
                        No ROI data found
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((item, index) => (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-4 px-4 sm:px-6 font-semibold text-slate-500">
                          {(currentPage - 1) * rowsPerPage + index + 1}
                        </td>

                        <td className="py-4 px-4">
                          <p className="font-bold text-slate-900">{item.from}</p>
                          <span className="text-[10px] font-semibold text-slate-400">ID: {item.fromId}</span>
                        </td>

                        <td className="py-4 px-4">
                          <p className="font-bold text-slate-900">{item.to}</p>
                          <span className="text-[10px] font-semibold text-slate-400">ID: {item.toId}</span>
                        </td>

                        <td className="py-4 px-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold">
                            {item.type}
                          </span>
                        </td>

                        <td className="py-4 px-4 font-black text-emerald-600">
                          ${item.amount.toFixed(2)}
                        </td>

                        <td className="py-4 px-4 sm:px-6 text-slate-500 font-medium text-xs">
                          {formatDateTime(item.date)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* FOOTER */}
            <div className="p-4 sm:p-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <span>Rows per page:</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-hidden"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-slate-400 ml-2">
                  Total: {filteredData.length} records
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  className="h-8 w-8 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center text-xs transition cursor-pointer"
                >
                  <FiChevronLeft />
                </button>

                {getPagination().map((p, i) =>
                  p === "..." ? (
                    <span key={i} className="px-2 text-xs text-slate-400 font-bold">...</span>
                  ) : (
                    <button
                      key={i}
                      className={`h-8 min-w-[32px] px-2.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        currentPage === p
                          ? "bg-[#0437cc] text-white shadow-xs"
                          : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                      onClick={() => setCurrentPage(p)}
                    >
                      {p}
                    </button>
                  )
                )}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  className="h-8 w-8 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center text-xs transition cursor-pointer"
                >
                  <FiChevronRight />
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default UserROI;