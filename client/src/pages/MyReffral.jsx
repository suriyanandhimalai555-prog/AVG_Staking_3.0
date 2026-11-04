import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/user/UserSidebar";
import Topbar from "../components/user/UserTopbar";
import axios from "axios";
import toast from "react-hot-toast";
import { 
  FiUsers, 
  FiSearch, 
  FiFilter, 
  FiChevronLeft, 
  FiChevronRight, 
  FiX, 
  FiCalendar 
} from "react-icons/fi";

const MyReferral = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const [dateRange, setDateRange] = useState("Today");
  const [showFilter, setShowFilter] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    count: "",
  });

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const API = `${import.meta.env.VITE_APP_BASE_URL}/api/users`;

  // ================= FETCH =================
  const fetchReferrals = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(`${API}/my-referrals`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setData(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load referrals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, []);

  // reset page when filters/search/rows change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filters.startDate, filters.endDate, rowsPerPage, dateRange]);

  const getDateRange = (label) => {
    const today = new Date();
    const end = new Date(today);
    const start = new Date(today);

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    if (label === "Today") {
      return {
        startDate: start.toISOString().split("T")[0],
        endDate: end.toISOString().split("T")[0],
      };
    }

    if (label === "Last 7 Days") {
      const from = new Date(today);
      from.setDate(from.getDate() - 6);
      from.setHours(0, 0, 0, 0);
      return {
        startDate: from.toISOString().split("T")[0],
        endDate: end.toISOString().split("T")[0],
      };
    }

    if (label === "1 Month") {
      const from = new Date(today);
      from.setMonth(from.getMonth() - 1);
      from.setHours(0, 0, 0, 0);
      return {
        startDate: from.toISOString().split("T")[0],
        endDate: end.toISOString().split("T")[0],
      };
    }

    if (label === "3 Months") {
      const from = new Date(today);
      from.setMonth(from.getMonth() - 3);
      from.setHours(0, 0, 0, 0);
      return {
        startDate: from.toISOString().split("T")[0],
        endDate: end.toISOString().split("T")[0],
      };
    }

    return { startDate: "", endDate: "" };
  };

  // ================= FILTER + SEARCH =================
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const username = (item.username || "").toLowerCase();
      const phone = (item.phone || "").toLowerCase();
      const userCode = (item.user_code || "").toLowerCase();
      const searchValue = search.toLowerCase();

      const matchSearch =
        username.includes(searchValue) ||
        phone.includes(searchValue) ||
        userCode.includes(searchValue);

      const createdAt = item.created_at ? new Date(item.created_at) : null;

      const matchStart =
        !filters.startDate || (createdAt && createdAt >= new Date(filters.startDate));
      const matchEnd =
        !filters.endDate || (createdAt && createdAt <= new Date(filters.endDate));

      return matchSearch && matchStart && matchEnd;
    });
  }, [data, search, filters.startDate, filters.endDate]);

  // ================= PAGINATION =================
  const totalPages = Math.max(1, Math.ceil(filteredData.length / rowsPerPage));

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredData, currentPage, rowsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const getVisiblePages = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    if (currentPage <= 3) {
      startPage = 1;
      endPage = 5;
    } else if (currentPage >= totalPages - 2) {
      startPage = totalPages - 4;
      endPage = totalPages;
    }

    for (let i = startPage; i <= endPage; i++) pages.push(i);
    return pages;
  };

  // ================= DATE FORMAT =================
  const formatDate = (value) => {
    if (!value) return "-";

    const date = new Date(value);
    if (isNaN(date.getTime())) return "-";

    return new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }).format(date);
  };

  const handleDateRangeChange = (item) => {
    setDateRange(item);
    const { startDate, endDate } = getDateRange(item);
    setFilters((prev) => ({
      ...prev,
      startDate,
      endDate,
    }));
    setDropdownOpen(false);
  };

  const handlePrev = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  return (
    <div className="flex bg-slate-100 rounded-lg min-h-screen">
      {/* <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} /> */}

      <div className="flex-1 flex flex-col min-w-0">
        {/* <Topbar isOpen={isOpen} setIsOpen={setIsOpen} /> */}

        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8 bg-slate-100">
          
          {/* HEADER BANNER - Added relative and higher z-index so dropdown sits above search box */}
          <div className="relative z-30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-xs">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                My Referrals
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                View and filter all users registered directly under your referral code
              </p>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-auto">
              {/* DATE RANGE DROPDOWN */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  <FiCalendar className="text-slate-400" /> {dateRange} <span className="text-[10px]">▼</span>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 z-50 w-44 bg-white border border-slate-200 rounded-xl shadow-2xl py-1 overflow-hidden">
                    {["Today", "Last 7 Days", "1 Month", "3 Months"].map((item) => (
                      <div
                        key={item}
                        className={`px-4 py-2.5 text-xs font-semibold cursor-pointer transition ${
                          dateRange === item ? "bg-[#0437cc]/10 text-[#0437cc] font-bold" : "text-slate-700 hover:bg-slate-50"
                        }`}
                        onClick={() => handleDateRangeChange(item)}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition cursor-pointer"
                onClick={() => setShowFilter(true)}
              >
                <FiFilter className="text-slate-400" /> Filter
              </button>
            </div>
          </div>

          {/* TABLE CONTAINER & SEARCH */}
          <div className="relative z-10 bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
            
            {/* Search Bar */}
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 text-[#0437cc]">
                  <FiUsers className="text-lg" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Referral List</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Showing downline sponsored members</p>
                </div>
              </div>

              <div className="relative w-full sm:w-72">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <FiSearch className="text-sm" />
                </span>
                <input
                  type="text"
                  placeholder="Search name, phone, code..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
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
                    <th className="py-3.5 px-4">Username</th>
                    <th className="py-3.5 px-4">Lastname</th>
                    <th className="py-3.5 px-4">Phone Number</th>
                    <th className="py-3.5 px-4">Level</th>
                    <th className="py-3.5 px-4 sm:px-6">Created At</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-slate-500 font-medium">
                        Loading referrals...
                      </td>
                    </tr>
                  ) : paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-slate-500 font-medium">
                        No available options
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((item, index) => (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-4 px-4 sm:px-6 font-semibold text-slate-500">
                          {(currentPage - 1) * rowsPerPage + index + 1}
                        </td>

                        <td className="py-4 px-4">
                          <p className="font-bold text-slate-900">{item.username}</p>
                          <span className="text-[10px] font-semibold text-[#f77704]">{item.user_code}</span>
                        </td>

                        <td className="py-4 px-4 font-semibold text-slate-700">
                          {item.lastname || "-"}
                        </td>

                        <td className="py-4 px-4 font-medium text-slate-600">
                          {item.phone || "-"}
                        </td>

                        <td className="py-4 px-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-50 text-[#0437cc] text-xs font-bold">
                            Level {Number(item.level) || "-"}
                          </span>
                        </td>

                        <td className="py-4 px-4 sm:px-6 text-slate-500 font-medium text-xs">
                          {formatDate(item.created_at)}
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
                  onChange={(e) => setRowsPerPage(Number(e.target.value))}
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
                  onClick={handlePrev}
                  disabled={currentPage === 1}
                  className="h-8 px-3 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center text-xs font-bold transition cursor-pointer"
                >
                  {"< Prev"}
                </button>

                {getVisiblePages().map((page) => (
                  <button
                    key={page}
                    className={`h-8 min-w-[32px] px-2.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      currentPage === page
                        ? "bg-[#0437cc] text-white shadow-xs"
                        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={handleNext}
                  disabled={currentPage === totalPages}
                  className="h-8 px-3 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center text-xs font-bold transition cursor-pointer"
                >
                  {"Next >"}
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* FILTER MODAL */}
      {showFilter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 text-[#0437cc]">
                  <FiFilter className="text-base" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Filter Referrals
                </h3>
              </div>

              <button
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition cursor-pointer"
                onClick={() => setShowFilter(false)}
              >
                <FiX className="text-sm" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Start Date
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) =>
                    setFilters({ ...filters, startDate: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-hidden focus:border-[#0437cc] transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  End Date
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) =>
                    setFilters({ ...filters, endDate: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-hidden focus:border-[#0437cc] transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Direct Referral Count
                </label>
                <input
                  type="number"
                  placeholder="Enter count"
                  value={filters.count}
                  onChange={(e) =>
                    setFilters({ ...filters, count: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-hidden focus:border-[#0437cc] transition"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4 bg-slate-50/50">
              <button
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-xs sm:text-sm font-bold transition cursor-pointer"
                onClick={() => setShowFilter(false)}
              >
                Cancel
              </button>

              <button
                className="px-5 py-2.5 rounded-xl bg-[#0437cc] hover:bg-[#032da6] text-white text-xs sm:text-sm font-bold shadow-sm transition cursor-pointer"
                onClick={() => setShowFilter(false)}
              >
                Apply Filter
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default MyReferral;