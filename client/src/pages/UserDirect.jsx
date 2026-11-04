import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Sidebar from "../components/user/UserSidebar";
import Topbar from "../components/user/UserTopbar";
import { formatDateTimeIST } from "../utils/dateFormat";
import { toast } from "react-hot-toast";
import { 
  FiUsers, 
  FiSearch, 
  FiChevronLeft, 
  FiChevronRight 
} from "react-icons/fi";

const UserDirect = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [data, setData] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDirectIncome = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          `${import.meta.env.VITE_APP_BASE_URL}/api/users/my-direct-income`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setData(res.data || []);
      } catch (err) {
        console.error("Failed to fetch direct income:", err);
        toast.error("Failed to load direct income data");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDirectIncome();
  }, []);

  const filteredData = useMemo(() => {
    const q = search.toLowerCase();

    return data.filter((item) => {
      const from = (item.from || "").toLowerCase();
      const to = (item.to || "").toLowerCase();
      const type = (item.type || "").toLowerCase();
      const fromId = (item.fromId || "").toLowerCase();
      const toId = (item.toId || "").toLowerCase();

      return (
        from.includes(q) ||
        to.includes(q) ||
        type.includes(q) ||
        fromId.includes(q) ||
        toId.includes(q)
      );
    });
  }, [data, search]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / rowsPerPage));

  const paginatedData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages, page]);

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
                My Direct Income
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                Track direct referral rewards earned from your sponsored team members
              </p>
            </div>

            <div className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 shadow-xs self-start sm:self-auto">
              <span className="h-2 w-2 rounded-full bg-[#f77704] animate-pulse" />
              Direct Rewards Active
            </div>
          </div>

          {/* TABLE CONTAINER & SEARCH */}
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
            
            {/* Search Bar */}
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-orange-50 text-[#f77704]">
                  <FiUsers className="text-lg" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Direct Commission History</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Unified ledger of direct referral bonuses</p>
                </div>
              </div>

              <div className="relative w-full sm:w-72">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <FiSearch className="text-sm" />
                </span>
                <input
                  type="text"
                  placeholder="Search user, ID..."
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
                    <th className="py-3.5 px-4">Type</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4 sm:px-6">Created At</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-slate-500 font-medium">
                        Loading direct income...
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
                      <tr key={`${item.id}-${item.level}-${index}`} className="hover:bg-slate-50/60 transition">
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

                        <td className="py-4 px-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-orange-50 text-[#f77704] text-xs font-bold">
                            {item.type || "Direct Income"}
                          </span>
                        </td>

                        <td className="py-4 px-4 font-black text-emerald-600">
                          ${Number(item.amount || 0).toFixed(2)}
                        </td>

                        <td className="py-4 px-4 sm:px-6 text-slate-500 font-medium text-xs">
                          {formatDateTimeIST(item.date)}
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
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="h-8 w-8 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center text-xs transition cursor-pointer"
                >
                  <FiChevronLeft />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    className={`h-8 min-w-[32px] px-2.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      page === p
                        ? "bg-[#0437cc] text-white shadow-xs"
                        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                ))}

                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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

export default UserDirect;