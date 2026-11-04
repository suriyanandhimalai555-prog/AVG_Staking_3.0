import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import axios from 'axios';
import { toast } from "react-hot-toast";
import * as XLSX from 'xlsx';
import { 
  FiMoreVertical, 
  FiSearch, 
  FiChevronLeft, 
  FiChevronRight, 
  FiEye, 
  FiToggleLeft, 
  FiToggleRight, 
  FiTrash2, 
  FiCheck, 
  FiX, 
  FiCalendar, 
  FiUser, 
  FiLayers,
  FiDownload
} from "react-icons/fi";

const ActivePlans = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [plansData, setPlansData] = useState([]);
  const [requestPlans, setRequestPlans] = useState([]);
  const [showRequests, setShowRequests] = useState(false);
  const [menuOpen, setMenuOpen] = useState(null);
  const dropdownRef = useRef(null);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);

  // Close context menu if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMenuOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ✅ DATE FORMATTING LOGIC */
  const formatDate = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "-";

    const istDate = new Date(d.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const day = String(istDate.getDate()).padStart(2, "0");
    const month = String(istDate.getMonth() + 1).padStart(2, "0");
    const year = istDate.getFullYear();

    let hours = istDate.getHours();
    const minutes = String(istDate.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;

    return `${day}/${month}/${year} • ${hours}:${minutes} ${ampm}`;
  };

  /* ================= FETCH DATA FUNCTIONS ================= */
  const fetchAllPlans = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(
        `${import.meta.env.VITE_APP_BASE_URL}/api/user-plans/all`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const formatted = (res.data || []).map((item) => ({
        id: item.id,
        user: item.user || 'N/A',
        userCode: item.user_code || '-',
        planName: item.plan_name || 'N/A',
        amountValue: Number(item.amount ?? 0),
        dailyROIValue: Number(item.daily_roi ?? 0),
        depositAmount: `$${Number(item.amount ?? 0).toLocaleString()}`,
        dailyROI: `$${Number(item.daily_roi ?? 0).toLocaleString()}`,
        status: String(item.status || '').toLowerCase() === 'active' ? 'Active' : 'Inactive',
        createdAt: formatDate(item.created_at),
      }));

      setPlansData(formatted);
    } catch (err) {
      console.error('Fetch error:', err);
      toast.error("Failed to load active plans");
    }
  }, []);

  const fetchRequests = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(
        `${import.meta.env.VITE_APP_BASE_URL}/api/user-plans/requests`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const formatted = (res.data || []).map((item) => ({
        id: item.id,
        user: item.user || 'N/A',
        userCode: item.user_code || '-',
        planName: item.plan_name || 'N/A',
        amount: `$${Number(item.amount ?? 0).toLocaleString()}`,
        status: String(item.status || '').toLowerCase() === 'pending' ? 'Pending' : String(item.status || ''),
        createdAt: formatDate(item.created_at),
      }));

      setRequestPlans(formatted);
    } catch (err) {
      console.error('Fetch requests error:', err);
      toast.error("Failed to load tier purchase requests");
    }
  }, []);

  useEffect(() => {
    fetchAllPlans();
  }, [fetchAllPlans]);

  useEffect(() => {
    if (showRequests) fetchRequests();
  }, [showRequests, fetchRequests]);

  useEffect(() => {
    setMenuOpen(null);
    setCurrentPage(1);
  }, [showRequests]);

  /* ================= EXCEL EXPORT FUNCTION ================= */
  const exportToExcel = () => {
    const dataToExport = showRequests ? requestPlans : plansData;

    if (!dataToExport || dataToExport.length === 0) {
      toast.error("No data available to export");
      return;
    }

    const excelData = dataToExport.map((item, index) => {
      if (showRequests) {
        return {
          "Index": index + 1,
          "User": item.user,
          "User Code": item.userCode,
          "Plan Name": item.planName,
          "Amount": item.amount,
          "Status": item.status,
          "Created At": item.createdAt,
        };
      } else {
        return {
          "Index": index + 1,
          "User": item.user,
          "User Code": item.userCode,
          "Plan Name": item.planName,
          "Deposit Amount": item.depositAmount,
          "Daily ROI": item.dailyROI,
          "Status": item.status,
          "Created At": item.createdAt,
        };
      }
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    const sheetName = showRequests ? "Plan Requests" : "Active Plans";

    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    const dateStr = new Date().toISOString().slice(0, 10);
    const fileName = `${showRequests ? 'Plan_Requests' : 'Active_Plans'}_${dateStr}.xlsx`;

    XLSX.writeFile(workbook, fileName);
    toast.success("Excel sheet downloaded successfully");
  };

  const handleApproveRequest = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${import.meta.env.VITE_APP_BASE_URL}/api/user-plans/${requestId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Investment allocation approved");
      fetchRequests();
      fetchAllPlans();
    } catch (err) {
      toast.error(err.response?.data?.message || "Approval transaction rejected");
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${import.meta.env.VITE_APP_BASE_URL}/api/user-plans/${requestId}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Allocation request voided successfully");
      fetchRequests();
      fetchAllPlans();
    } catch (err) {
      toast.error(err.response?.data?.message || "Rejection protocol failed");
    }
  };

  /* ================= ACTION HANDLERS ================= */
  const handleView = (plan) => {
    setSelectedPlan(plan);
    setModalType('view');
    setShowModal(true);
    setMenuOpen(null);
  };

  const handleDelete = (plan) => {
    setSelectedPlan(plan);
    setModalType('delete');
    setShowModal(true);
    setMenuOpen(null);
  };

  const handleStatusChange = async (plan) => {
    setMenuOpen(null);
    try {
      const token = localStorage.getItem('token');
      const newStatus = plan.status === 'Active' ? 'inactive' : 'active';

      await axios.put(
        `${import.meta.env.VITE_APP_BASE_URL}/api/user-plans/${plan.id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`Node state altered to ${newStatus}`);
      fetchAllPlans();
    } catch (err) {
      toast.error("Node status mutation failed");
    }
  };

  const handleModalConfirm = async () => {
    try {
      const token = localStorage.getItem('token');

      if (modalType === 'delete' && selectedPlan) {
        await axios.delete(
          `${import.meta.env.VITE_APP_BASE_URL}/api/user-plans/${selectedPlan.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("User allocation deleted permanently");
        fetchAllPlans();
        setShowModal(false);
        setSelectedPlan(null);
        return;
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Execution error encountered");
    }
  };

  const dataSource = showRequests ? requestPlans : plansData;

  const filteredData = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    return dataSource.filter((item) => {
      return (
        String(item.user || '').toLowerCase().includes(q) ||
        String(item.userCode || '').toLowerCase().includes(q) ||
        String(item.planName || '').toLowerCase().includes(q) ||
        String(item.depositAmount || item.amount || '').toLowerCase().includes(q) ||
        String(item.status || '').toLowerCase().includes(q)
      );
    });
  }, [dataSource, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / rowsPerPage));
  
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, currentPage, rowsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, rowsPerPage]);

  const getPagination = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(currentPage - 2, 1);
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

  const renderModal = () => {
    if (!showModal) return null;

    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden transform scale-100 transition-all">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h3 className="text-sm font-bold text-slate-900 tracking-wide">
              {modalType === 'delete' ? 'Revoke Allocations' : 'Inspecting Master Node'}
            </h3>
            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700 text-lg focus:outline-none cursor-pointer">×</button>
          </div>

          <div className="p-6 space-y-4">
            {modalType === 'delete' && (
              <p className="text-xs text-slate-600 leading-relaxed">
                Are you certain you want to purge the current plan subscription linked to account <span className="text-[#0437cc] font-bold">{selectedPlan?.user}</span>? This structural modification cannot be undone.
              </p>
            )}

            {modalType === 'view' && selectedPlan && (
              <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                {Object.entries(selectedPlan).map(([k, v]) => {
                  if (typeof v === 'object' || k.includes('Value')) return null;
                  return (
                    <div key={k} className="flex justify-between items-center bg-slate-50 px-3.5 py-2.5 border border-slate-200/70 rounded-xl text-xs">
                      <span className="text-slate-500 font-medium capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="text-slate-900 font-bold tracking-wide">{String(v)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 transition cursor-pointer">
              Dismiss
            </button>
            {modalType === 'delete' && (
              <button onClick={handleModalConfirm} className="px-5 py-2 text-xs font-bold rounded-xl bg-rose-600 text-white shadow-xs hover:bg-rose-500 transition cursor-pointer">
                Confirm Purge
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 text-slate-800 select-none bg-white/90 p-6 rounded-2xl shadow-md">
      
      {/* Dynamic Navigation & Filtering Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <FiLayers className="text-[#0437cc] text-lg" />
            {showRequests ? 'Subscription Authorization Ledger' : 'Active Portfolio Management'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            {showRequests ? 'Approve or dismiss incoming tier purchase protocols' : 'Live operational tracking of premium contract variables'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex items-center min-w-[240px]">
            <input
              type="text"
              placeholder="Search index metadata..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0437cc] shadow-xs transition"
            />
          </div>

          {/* Export Excel Button */}
          <button
            type="button"
            onClick={exportToExcel}
            className="px-4 py-2.5 text-xs font-bold rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-all flex items-center justify-center gap-2 shadow-xs active:scale-95 cursor-pointer"
          >
            <FiDownload className="text-sm" /> Export Excel
          </button>

          {/* Toggle Mode Button */}
          <button
            type="button"
            onClick={() => setShowRequests((prev) => !prev)}
            className={`px-5 py-2.5 text-xs font-bold rounded-xl shadow-xs border transition-all duration-200 active:scale-95 cursor-pointer ${
              showRequests 
                ? 'bg-[#0437cc] text-white border-transparent' 
                : 'bg-white border-slate-300 hover:bg-slate-100 text-slate-700'
            }`}
          >
            {showRequests ? "Active Plans" : "Requests Plans"}
          </button>
        </div>
      </div>

      {/* Table Wrapper */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 uppercase tracking-wider text-[10px] font-bold">
                <th className="py-4.5 px-6 w-16 text-center">Index</th>
                <th className="py-4.5 px-6"><span className="flex items-center gap-1.5"><FiUser className="text-[11px] text-[#0437cc]" /> Account Owner</span></th>
                <th className="py-4.5 px-6">Selected Tier</th>
                <th className="py-4.5 px-6">Principal Input</th>
                {!showRequests && <th className="py-4.5 px-6">Accrued Yield (ROI)</th>}
                <th className="py-4.5 px-6">Status Anchor</th>
                <th className="py-4.5 px-6"><span className="flex items-center gap-1.5"><FiCalendar className="text-[11px] text-[#3b52d4]" /> Timestamp</span></th>
                <th className="py-4.5 px-6 text-center">Operations</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
              {currentItems.length > 0 ? (
                currentItems.map((plan, index) => (
                  <tr 
                    key={plan.id} 
                    onClick={() => {
                      if (!showRequests) {
                        handleView(plan);
                      }
                    }} 
                    className="hover:bg-slate-50/80 transition duration-150 cursor-pointer"
                  >
                    <td className="py-4 px-6 text-center text-slate-400 font-mono">
                      {String((currentPage - 1) * rowsPerPage + index + 1).padStart(2, '0')}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-slate-900 font-bold tracking-wide">{plan.user}</span>
                        <span className="font-mono text-[10px] text-slate-400">{plan.userCode}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-[#0437cc] font-bold">{plan.planName}</td>
                    <td className="py-4 px-6 font-mono font-bold text-slate-900">
                      {showRequests ? plan.amount : plan.depositAmount}
                    </td>
                    {!showRequests && (
                      <td className="py-4 px-6 font-mono font-bold text-emerald-600">
                        {plan.dailyROI}
                      </td>
                    )}
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                        plan.status === "Active" 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                          : plan.status === "Pending"
                          ? 'bg-amber-50 text-amber-600 border-amber-200 animate-pulse'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        {plan.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-500 text-[11px] font-mono">{plan.createdAt}</td>
                    <td className="py-4 px-6 text-center relative" onClick={(e) => e.stopPropagation()}>
                      {showRequests ? (
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleApproveRequest(plan.id)}
                            title="Approve Protocol"
                            className="p-2 text-emerald-600 hover:text-white bg-emerald-50 hover:bg-emerald-600 border border-emerald-200 rounded-xl transition duration-150 cursor-pointer"
                          >
                            <FiCheck className="text-[10px]" />
                          </button>
                          <button
                            onClick={() => handleRejectRequest(plan.id)}
                            title="Reject Protocol"
                            className="p-2 text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 rounded-xl transition duration-150 cursor-pointer"
                          >
                            <FiX className="text-[10px]" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <button 
                            onClick={() => setMenuOpen(menuOpen === plan.id ? null : plan.id)}
                            className={`p-2 rounded-xl transition duration-150 cursor-pointer ${menuOpen === plan.id ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-700'}`}
                          >
                            <FiMoreVertical className="text-xs" />
                          </button>

                          {/* Dropdown Box Menu */}
                          {menuOpen === plan.id && (
                            <div ref={dropdownRef} className="absolute right-14 top-1/2 -translate-y-1/2 z-50 min-w-[150px] bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 space-y-0.5 text-left animate-fade-in">
                              <button onClick={() => handleView(plan)} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] text-slate-700 hover:bg-slate-50 transition cursor-pointer">
                                <FiEye className="text-[10px] text-[#0437cc]" /> View Plan
                              </button>
                              <button onClick={() => handleStatusChange(plan)} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] text-slate-700 hover:bg-slate-50 transition cursor-pointer">
                                {plan.status === 'Active' ? (
                                  <>
                                    <FiToggleLeft className="text-[10px] text-amber-500" /> Deactivate
                                  </>
                                ) : (
                                  <>
                                    <FiToggleRight className="text-[10px] text-emerald-600" /> Activate
                                  </>
                                )}
                              </button>
                              <hr className="border-slate-100 my-1" />
                              <button onClick={() => handleDelete(plan)} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] text-rose-600 hover:bg-rose-50 transition cursor-pointer">
                                <FiTrash2 className="text-[10px]" /> Delete Plan
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={showRequests ? "7" : "8"} className="py-20 text-center text-slate-400 font-medium tracking-wide">
                    No system parameters identified matching standard criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Matrix Pagination Footer */}
        <div className="bg-slate-50/50 border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-xs text-slate-500">
            <span>Rows visible per frame</span>
            <div className="relative">
              <select
                value={rowsPerPage}
                onChange={(e) => setRowsPerPage(Number(e.target.value))}
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
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-2 rounded-lg border border-slate-300 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition disabled:opacity-20 disabled:pointer-events-none cursor-pointer"
            >
              <FiChevronLeft className="text-xs" />
            </button>

            <div className="flex items-center gap-1">
              {getPagination().map((p, i) =>
                p === "..." ? (
                  <span key={i} className="px-2.5 text-slate-400 font-mono text-xs">...</span>
                ) : (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(p)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                      currentPage === p 
                        ? 'bg-[#0437cc] text-white shadow-xs' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-300 bg-white'
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
            </div>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-2 rounded-lg border border-slate-300 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition disabled:opacity-20 disabled:pointer-events-none cursor-pointer"
            >
              <FiChevronRight className="text-xs" />
            </button>
          </div>
        </div>
      </div>

      {renderModal()}
    </div>
  );
};

export default ActivePlans;