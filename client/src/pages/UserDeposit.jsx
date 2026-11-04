import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Sidebar from "../components/user/UserSidebar";
import Topbar from "../components/user/UserTopbar";
import { toast } from "react-hot-toast";
import { 
  FiArrowDownLeft, 
  FiSearch, 
  FiEye, 
  FiX, 
  FiCalendar, 
  FiLayers, 
  FiDollarSign, 
  FiUser, 
  FiHash,
  FiChevronLeft,
  FiChevronRight
} from "react-icons/fi";

const UserDeposit = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [loading, setLoading] = useState(true);

  const [data, setData] = useState([]);

  // ✅ PAGINATION
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const formatDateTime = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (isNaN(date.getTime())) return "-";

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;

    return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds} ${ampm}`;
  };

  // ✅ FETCH DATA
  const fetchDeposits = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${import.meta.env.VITE_APP_BASE_URL}/api/user-plans/deposits`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const formatted = (res.data || []).map((item) => ({
        id: item.id,
        from: item.from_user || "User",
        fromId: item.from_id || "-",
        to: "Admin",
        toId: "SYSTEM",
        hash: item.hash || "N/A",
        plan: item.plan_name,
        amount: Number(item.amount || 0),
        date: item.created_at
      }));

      setData(formatted);
    } catch (err) {
      console.error("Deposit fetch error:", err);
      toast.error("Failed to load deposit transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, []);

  // ✅ FILTER
  const filteredData = useMemo(() => {
    const q = search.toLowerCase();

    return data.filter(item =>
      item.from.toLowerCase().includes(q) ||
      item.plan.toLowerCase().includes(q) ||
      item.hash.toLowerCase().includes(q)
    );
  }, [search, data]);

  // ✅ PAGINATION
  const totalPages = Math.max(1, Math.ceil(filteredData.length / rowsPerPage));

  const paginatedData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages, page]);

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
    <div className="flex bg-slate-100 rounded-lg min-h-screen">
      {/* <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} /> */}

      <div className="flex-1 flex flex-col min-w-0">
        {/* <Topbar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} /> */}

        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8 bg-slate-100">
          
          {/* HEADER BANNER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-xs">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Deposit List
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                Monitor and review all your historical deposit transactions and plan fundings
              </p>
            </div>

            <div className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 shadow-xs self-start sm:self-auto">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Transactions Secured
            </div>
          </div>

          {/* TABLE CONTAINER & SEARCH */}
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
            
            {/* Search & Header Bar */}
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <FiArrowDownLeft className="text-lg" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Deposit History</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Showing all verified deposit operations</p>
                </div>
              </div>

              <div className="relative w-full sm:w-72">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <FiSearch className="text-sm" />
                </span>
                <input
                  type="text"
                  placeholder="Search user, plan, or hash..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
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
                    <th className="py-3.5 px-4">Hash</th>
                    <th className="py-3.5 px-4">Plan</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Created</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="py-12 text-center text-slate-500 font-medium">
                        Loading deposits...
                      </td>
                    </tr>
                  ) : paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-12 text-center text-slate-500 font-medium">
                        No deposits found
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((item, index) => (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-4 px-4 sm:px-6 font-semibold text-slate-500">
                          {(page - 1) * rowsPerPage + index + 1}
                        </td>

                        <td className="py-4 px-4">
                          <p className="font-bold text-slate-900">{item.from}</p>
                          <span className="text-[10px] font-semibold text-slate-400">ID: {item.fromId}</span>
                        </td>

                        <td className="py-4 px-4">
                          <p className="font-bold text-slate-900">{item.to}</p>
                          <span className="text-[10px] font-semibold text-slate-400">ID: {item.toId}</span>
                        </td>

                        <td className="py-4 px-4 font-mono text-xs text-slate-600 truncate max-w-[120px]">
                          {item.hash}
                        </td>

                        <td className="py-4 px-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 text-[#0437cc] text-xs font-bold">
                            {item.plan}
                          </span>
                        </td>

                        <td className="py-4 px-4 font-black text-emerald-600">
                          ${item.amount.toLocaleString()}
                        </td>

                        <td className="py-4 px-4 text-slate-500 font-medium text-xs">
                          {item.date ? formatDateTime(item.date) : "-"}
                        </td>

                        <td className="py-4 px-4 sm:px-6 text-right relative">
                          <button
                            onClick={() =>
                              setActiveDropdown(
                                activeDropdown === item.id ? null : item.id
                              )
                            }
                            className="h-8 w-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 inline-flex items-center justify-center font-bold transition cursor-pointer"
                          >
                            ⋮
                          </button>

                          {activeDropdown === item.id && (
                            <div className="absolute right-6 top-14 z-20 w-32 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 animate-in fade-in zoom-in-95 duration-150">
                              <button
                                onClick={() => {
                                  setSelectedRow(item);
                                  setActiveDropdown(null);
                                }}
                                className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                              >
                                <FiEye className="text-slate-400" /> View Details
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINATION FOOTER */}
            <div className="p-4 sm:p-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <span>Rows per page:</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setPage(1);
                  }}
                  className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-hidden"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                </select>
                <span className="text-slate-400 ml-2">
                  Total: {filteredData.length} records
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
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
                        page === p
                          ? "bg-[#0437cc] text-white shadow-xs"
                          : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  )
                )}

                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className="h-8 w-8 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center text-xs transition cursor-pointer"
                >
                  <FiChevronRight />
                </button>
              </div>
            </div>

          </div>

          {/* MODAL */}
          {selectedRow && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
              <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                      <FiArrowDownLeft className="text-base" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">
                      Deposit Transaction Details
                    </h3>
                  </div>

                  <button
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition cursor-pointer"
                    onClick={() => setSelectedRow(null)}
                  >
                    <FiX className="text-sm" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">From User</p>
                      <h4 className="text-sm font-bold text-slate-900">{selectedRow.from}</h4>
                      <span className="text-[10px] text-slate-400">ID: {selectedRow.fromId}</span>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">To Recipient</p>
                      <h4 className="text-sm font-bold text-slate-900">{selectedRow.to}</h4>
                      <span className="text-[10px] text-slate-400">ID: {selectedRow.toId}</span>
                    </div>
                  </div>

                  <div className="space-y-3 bg-slate-50/80 border border-slate-200/70 rounded-xl p-4 text-xs sm:text-sm">
                    <div className="flex justify-between items-center border-b border-slate-200/60 pb-2.5">
                      <span className="text-slate-500 font-medium">Staking Plan</span>
                      <span className="font-bold text-[#0437cc] bg-blue-50 px-2.5 py-0.5 rounded-md">{selectedRow.plan}</span>
                    </div>

                    <div className="flex justify-between items-center border-b border-slate-200/60 pb-2.5">
                      <span className="text-slate-500 font-medium">Deposit Amount</span>
                      <span className="font-black text-emerald-600 text-base">${selectedRow.amount.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between items-center border-b border-slate-200/60 pb-2.5">
                      <span className="text-slate-500 font-medium">Transaction Hash</span>
                      <span className="font-mono text-xs text-slate-700 truncate max-w-[180px]">{selectedRow.hash}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Date & Time</span>
                      <span className="font-semibold text-slate-700">{formatDateTime(selectedRow.date)}</span>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end border-t border-slate-100 px-6 py-4 bg-slate-50/50">
                  <button
                    className="px-5 py-2.5 rounded-xl bg-[#0437cc] hover:bg-[#032da6] text-white text-xs sm:text-sm font-bold shadow-sm transition cursor-pointer"
                    onClick={() => setSelectedRow(null)}
                  >
                    Close
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default UserDeposit;