import React, { useMemo, useState, useEffect } from "react";
import API from "../utils/api";
import * as XLSX from "xlsx";
import { 
  FaSearch, FaFilter, FaFileExcel, FaTrophy, FaCalendarAlt, 
  FaUserAlt, FaPhoneAlt, FaEye, FaEdit, FaTrashAlt, 
  FaCheckCircle, FaTimesCircle, FaClock, FaTimes, FaEllipsisV, FaUndo 
} from "react-icons/fa";

const formatDateOnly = (value) => {
  if (!value) return "-";

  const raw = String(value);
  const normalized = raw.includes("T") ? raw : `${raw}T00:00:00`;
  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(date);
};

const RankRewards = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [rewardsData, setRewardsData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [selectedReward, setSelectedReward] = useState(null);

  const [popupMessage, setPopupMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);

  const fetchRewards = async () => {
    try {
      setLoading(true);
      const res = await API.get("/ranks/admin");

      const formatted = (res.data || []).map((item, index) => ({
        sno: index + 1,
        userId: item.userId,
        userCode: item.userCode || "-",
        rewardName: item.reward,
        target_amount: item.target_amount,
        progress: item.progress,
        username: item.username || "-",
        phoneNo: item.phone || "-",
        reward: `${item.reward} ($${item.progress} / $${item.target_amount})`,
        status: item.status || "pending",
        achievedDate: formatDateOnly(item.achieved_date),
        bankDetails: item.bankDetails || {},
      }));

      setRewardsData(formatted);
    } catch (err) {
      console.error("Fetch rewards error:", err);
      setRewardsData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRewards();
  }, []);

  const showPopupMessage = (message) => {
    setPopupMessage(message);
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 3000);
  };

  const handleActionClick = (reward, type) => {
    setSelectedReward(reward);
    setModalType(type);
    setShowModal(true);
    setActiveMenuId(null);
  };

  const handleUpdateStatus = async (reward, status) => {
    try {
      setActiveMenuId(null);
      await API.post("/ranks/status", {
        userId: reward.userId,
        reward: reward.rewardName,
        target_amount: reward.target_amount,
        progress: reward.progress,
        status,
      });
      fetchRewards();
      showPopupMessage(`Status changed to ${status.toUpperCase()} successfully`);
    } catch (err) {
      console.error("Status update error:", err);
      showPopupMessage("Failed to update status");
    }
  };

  const handleModalConfirm = () => {
    if (modalType === "delete" && selectedReward) {
      const updatedData = rewardsData.filter((item) => item.sno !== selectedReward.sno);
      setRewardsData(updatedData);
      showPopupMessage(`Reward for ${selectedReward.username} deleted successfully`);
    } else if (modalType === "edit" && selectedReward) {
      showPopupMessage(`Reward for ${selectedReward.username} updated successfully`);
    }
    setShowModal(false);
    setSelectedReward(null);
  };

  // EXCEL EXPORT INCLUDING BANK DETAILS
  const handleDownloadExcel = (statusType) => {
    const dataToExport = rewardsData.filter(
      (item) => item.status.toLowerCase() === statusType.toLowerCase()
    );

    if (dataToExport.length === 0) {
      showPopupMessage(`No ${statusType} rewards data found to export.`);
      return;
    }

    const excelRows = dataToExport.map((item, idx) => ({
      "S.No": idx + 1,
      "Username": item.username,
      "User Code": item.userCode,
      "Phone No": item.phoneNo,
      "Reward Details": item.reward,
      "Achieved Date": item.achievedDate,
      "Status": item.status.toUpperCase(),
      "Account Holder Name": item.bankDetails?.accountHolderName || "-",
      "Bank Name": item.bankDetails?.bankName || "-",
      "Account Number": item.bankDetails?.accountNumber || "-",
      "IFSC Code": item.bankDetails?.ifscCode || "-",
      "Branch": item.bankDetails?.branch || "-",
      "UPI ID": item.bankDetails?.upiId || "-",
      "GPay Number": item.bankDetails?.gpayNumber || "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `${statusType.toUpperCase()} Rewards`);

    worksheet["!cols"] = [
      { wch: 6 },  // S.No
      { wch: 20 }, // Username
      { wch: 15 }, // User Code
      { wch: 15 }, // Phone No
      { wch: 30 }, // Reward Details
      { wch: 15 }, // Achieved Date
      { wch: 12 }, // Status
      { wch: 22 }, // Account Holder Name
      { wch: 20 }, // Bank Name
      { wch: 20 }, // Account Number
      { wch: 15 }, // IFSC Code
      { wch: 18 }, // Branch
      { wch: 22 }, // UPI ID
      { wch: 16 }, // GPay Number
    ];

    const fileName = `Rank_Rewards_${statusType}_${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const filteredData = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return rewardsData.filter((item) => {
      const matchesSearch =
        item.username.toLowerCase().includes(q) ||
        item.reward.toLowerCase().includes(q) ||
        item.status.toLowerCase().includes(q) ||
        item.phoneNo.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || item.status.toLowerCase() === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [rewardsData, searchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / rowsPerPage));
  const pageItems = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredData, currentPage, rowsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, rowsPerPage, statusFilter]);

  const getPagination = () => {
    const pages = [];
    const maxVisible = 5;
    if (totalPages <= 1) return [1];

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

  const startIndex = (currentPage - 1) * rowsPerPage;

  const getStatusStyle = (status) => {
    switch ((status || "").toLowerCase()) {
      case "approved":
        return "bg-emerald-50 text-emerald-600 border-emerald-200";
      case "rejected":
        return "bg-rose-50 text-rose-600 border-rose-200";
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 text-slate-800 select-none bg-white/90 p-6 rounded-2xl shadow-md">
      
      {/* HEADER PANELS */}
      <div className="bg-white border border-slate-200/90 p-6 rounded-2xl shadow-xs space-y-6">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2">
              <FaTrophy className="text-amber-500" size={22} />
              Rank Milestone Rewards
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">Manage global target metrics, processing checkpoints, and audit distributions</p>
          </div>

          {/* EXCEL ACTION CONTROL MATRIX */}
          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => handleDownloadExcel("pending")}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-amber-300 hover:border-amber-500 text-amber-700 text-xs font-semibold rounded-xl transition-all shadow-2xs cursor-pointer active:scale-95"
            >
              <FaFileExcel size={13} className="text-amber-600" /> Export Pending
            </button>
            <button
              onClick={() => handleDownloadExcel("approved")}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-emerald-300 hover:border-emerald-500 text-emerald-700 text-xs font-semibold rounded-xl transition-all shadow-2xs cursor-pointer active:scale-95"
            >
              <FaFileExcel size={13} className="text-emerald-600" /> Export Approved
            </button>
            <button
              onClick={() => handleDownloadExcel("rejected")}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-rose-300 hover:border-rose-500 text-rose-700 text-xs font-semibold rounded-xl transition-all shadow-2xs cursor-pointer active:scale-95"
            >
              <FaFileExcel size={13} className="text-rose-600" /> Export Rejected
            </button>
          </div>
        </div>

        <hr className="border-slate-200" />

        {/* INPUT FILTERS CONTROL BAR */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <input
              type="text"
              placeholder="Search users, phone tags, status arrays..."
              className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0437cc] shadow-xs transition duration-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <span className="text-slate-500 text-xs flex items-center gap-1.5 whitespace-nowrap font-medium">
              <FaFilter size={12} className="text-slate-400" /> Segment Status:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-44 bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0437cc] cursor-pointer"
            >
              <option value="all">All</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* REWARDS LEDGER CARD */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/70 text-slate-600 uppercase text-xs tracking-wider font-bold border-b border-slate-200">
                <th className="py-4 px-5 w-16 text-center">S.No</th>
                <th className="py-4 px-5">User Identification Profile</th>
                <th className="py-4 px-5">Phone Link</th>
                <th className="py-4 px-5">Target Progression Track</th>
                <th className="py-4 px-5">Achieved Window</th>
                <th className="py-4 px-5">State Status</th>
                <th className="py-4 px-5 text-center w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-20">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-8 h-8 border-4 border-[#0437cc] border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs text-slate-500 font-medium">Extracting profile bonus matrices...</span>
                    </div>
                  </td>
                </tr>
              ) : pageItems.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-16 text-slate-500 font-medium">
                    No reward targets logged matching structural context parameters.
                  </td>
                </tr>
              ) : (
                pageItems.map((reward, i) => (
                  <tr key={reward.sno} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-5 text-center text-slate-500 font-medium">{startIndex + i + 1}</td>
                    <td className="py-4 px-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{reward.username}</span>
                        <span className="text-xs text-slate-500 font-mono mt-0.5 font-bold">{reward.userCode}</span>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-slate-700 font-medium">{reward.phoneNo}</td>
                    <td className="py-4 px-5">
                      <span className="text-amber-700 font-semibold bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg text-xs">
                        {reward.reward}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-xs text-slate-500 font-medium">{reward.achievedDate}</td>
                    <td className="py-4 px-5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${getStatusStyle(reward.status)}`}>
                        {reward.status.toUpperCase()}
                      </span>
                    </td>
                    
                    <td className="py-4 px-5 text-center relative">
                      <button
                        onClick={() => setActiveMenuId(activeMenuId === reward.sno ? null : reward.sno)}
                        className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
                      >
                        <FaEllipsisV size={14} />
                      </button>

                      {activeMenuId === reward.sno && (
                        <>
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setActiveMenuId(null)}
                          />
                          <div className="absolute right-6 mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-20 overflow-hidden text-left py-1">
                            <button
                              onClick={() => handleActionClick(reward, "view")}
                              className="w-full px-4 py-2 text-xs font-semibold flex items-center gap-2 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                              <FaEye size={12} className="text-[#0437cc]" /> View Profiles
                            </button>
                            <button
                              onClick={() => handleActionClick(reward, "edit")}
                              className="w-full px-4 py-2 text-xs font-semibold flex items-center gap-2 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                              <FaEdit size={12} className="text-amber-600" /> Adjust Parameters
                            </button>

                            {reward.status === "pending" && (
                              <>
                                <button
                                  onClick={() => handleUpdateStatus(reward, "approved")}
                                  className="w-full px-4 py-2 text-xs font-semibold flex items-center gap-2 text-slate-700 hover:bg-slate-100 hover:text-emerald-600 transition-colors cursor-pointer"
                                >
                                  <FaCheckCircle size={12} className="text-emerald-600" /> Verify Approval
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(reward, "rejected")}
                                  className="w-full px-4 py-2 text-xs font-semibold flex items-center gap-2 text-slate-700 hover:bg-slate-100 hover:text-rose-600 transition-colors cursor-pointer"
                                >
                                  <FaTimesCircle size={12} className="text-rose-600" /> Terminate Reject
                                </button>
                              </>
                            )}

                            {reward.status === "approved" && (
                              <>
                                <button
                                  onClick={() => handleUpdateStatus(reward, "pending")}
                                  className="w-full px-4 py-2 text-xs font-semibold flex items-center gap-2 text-slate-700 hover:bg-slate-100 hover:text-amber-600 transition-colors cursor-pointer"
                                >
                                  <FaUndo size={12} className="text-amber-600" /> Revert to Pending
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(reward, "rejected")}
                                  className="w-full px-4 py-2 text-xs font-semibold flex items-center gap-2 text-slate-700 hover:bg-slate-100 hover:text-rose-600 transition-colors cursor-pointer"
                                >
                                  <FaTimesCircle size={12} className="text-rose-600" /> Modify to Reject
                                </button>
                              </>
                            )}

                            {reward.status === "rejected" && (
                              <>
                                <button
                                  onClick={() => handleUpdateStatus(reward, "pending")}
                                  className="w-full px-4 py-2 text-xs font-semibold flex items-center gap-2 text-slate-700 hover:bg-slate-100 hover:text-amber-600 transition-colors cursor-pointer"
                                >
                                  <FaUndo size={12} className="text-amber-600" /> Revert to Pending
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(reward, "approved")}
                                  className="w-full px-4 py-2 text-xs font-semibold flex items-center gap-2 text-slate-700 hover:bg-slate-100 hover:text-emerald-600 transition-colors cursor-pointer"
                                >
                                  <FaCheckCircle size={12} className="text-emerald-600" /> Force Approve
                                </button>
                              </>
                            )}

                            <div className="border-t border-slate-100 my-1" />
                            <button
                              onClick={() => handleActionClick(reward, "delete")}
                              className="w-full px-4 py-2 text-xs font-semibold flex items-center gap-2 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            >
                              <FaTrashAlt size={12} /> Purge Deletion
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION CONTROL MATRIX */}
        <div className="p-5 bg-slate-50/50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-500">
          <div className="flex items-center gap-2.5">
            <span>Grid Display Viewport:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
              className="bg-white border border-slate-300 rounded-lg py-1 px-2.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0437cc] cursor-pointer"
            >
              <option value={10}>10 records</option>
              <option value={25}>25 records</option>
              <option value={50}>50 records</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
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
                  onClick={() => setCurrentPage(p)}
                  className={`h-8 w-8 inline-flex items-center justify-center rounded-lg text-xs font-bold transition duration-150 active:scale-95 cursor-pointer ${
                    currentPage === p
                      ? "bg-[#0437cc] text-white shadow-xs"
                      : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {p}
                </button>
              )
            )}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white text-sm text-slate-700 transition hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none active:scale-95 cursor-pointer"
            >
              {">"}
            </button>
          </div>
        </div>
      </div>

      {/* POPUP MODAL ARCHITECTURE */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
            
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 tracking-wide">
                {modalType === "delete" && "Confirm Core System Purge"}
                {modalType === "edit" && "Modify Structural Threshold"}
                {modalType === "view" && "Comprehensive Reward Scope"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700 transition cursor-pointer">
                <FaTimes size={16} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm text-slate-700 max-h-[60vh] overflow-y-auto">
              {modalType === "delete" && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
                  <FaTrashAlt className="text-rose-600 shrink-0 mt-0.5" size={16} />
                  <div>
                    <p className="text-slate-900 font-bold">Are you sure you want to delete this log layer?</p>
                    <p className="text-xs text-slate-500 mt-1 font-medium">Purging the milestone tracker for user node <b className="text-slate-800">{selectedReward?.username}</b> cannot be reverted.</p>
                  </div>
                </div>
              )}

              {modalType === "edit" && (
                <div className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Username Alias</label>
                    <input type="text" defaultValue={selectedReward?.username} className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-1 focus:ring-[#0437cc]" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Network Link</label>
                    <input type="text" defaultValue={selectedReward?.phoneNo} className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-1 focus:ring-[#0437cc]" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Reward Parameters Metrics</label>
                    <input type="text" defaultValue={selectedReward?.reward} className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-1 focus:ring-[#0437cc]" />
                  </div>
                </div>
              )}

              {modalType === "view" && selectedReward && (
                <div className="space-y-4 font-sans">
                  {/* Reward / User Details */}
                  <div className="grid grid-cols-1 gap-2.5">
                    {Object.entries(selectedReward)
                      .filter(([key]) => key !== "bankDetails")
                      .map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{key.replace(/([A-Z])/g, ' $1')}</span>
                          <span className="text-sm font-semibold text-slate-900 truncate max-w-xs">{String(value)}</span>
                        </div>
                      ))}
                  </div>

                  {/* Bank Details Section */}
                  <div className="border-t border-slate-200 pt-3">
                    <h4 className="text-xs font-bold text-[#0437cc] uppercase tracking-wider mb-2.5">Bank Account Information</h4>
                    <div className="grid grid-cols-1 gap-2.5">
                      <div className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Account Holder Name</span>
                        <span className="text-sm font-semibold text-slate-900 truncate max-w-xs">{selectedReward.bankDetails?.accountHolderName || "-"}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Bank Name</span>
                        <span className="text-sm font-semibold text-slate-900 truncate max-w-xs">{selectedReward.bankDetails?.bankName || "-"}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Account Number</span>
                        <span className="text-sm font-semibold text-slate-900 truncate max-w-xs">{selectedReward.bankDetails?.accountNumber || "-"}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">IFSC Code</span>
                        <span className="text-sm font-semibold text-slate-900 truncate max-w-xs">{selectedReward.bankDetails?.ifscCode || "-"}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Branch</span>
                        <span className="text-sm font-semibold text-slate-900 truncate max-w-xs">{selectedReward.bankDetails?.branch || "-"}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">UPI ID</span>
                        <span className="text-sm font-semibold text-slate-900 truncate max-w-xs">{selectedReward.bankDetails?.upiId || "-"}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">GPay Number</span>
                        <span className="text-sm font-semibold text-slate-900 truncate max-w-xs">{selectedReward.bankDetails?.gpayNumber || "-"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2.5">
              <button
                className="px-5 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
                onClick={() => setShowModal(false)}
              >
                Abort
              </button>
              {(modalType === "delete" || modalType === "edit") && (
                <button 
                  className={`px-5 py-2 text-xs font-semibold rounded-xl transition text-white shadow-xs cursor-pointer ${
                    modalType === "delete" ? "bg-rose-600 hover:bg-rose-700" : "bg-[#0437cc] hover:bg-blue-800"
                  }`} 
                  onClick={handleModalConfirm}
                >
                  {modalType === "delete" ? "Execute Purge" : "Commit Changes"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TOAST SYSTEM POPUP CARD */}
      {showPopup && (
        <div className="fixed bottom-5 right-5 z-[100] bg-white border border-slate-200 border-l-4 border-l-[#0437cc] text-slate-800 px-5 py-3.5 rounded-xl shadow-xl flex items-center justify-between gap-4 max-w-md">
          <span className="text-xs font-semibold tracking-wide">{popupMessage}</span>
          <button onClick={() => setShowPopup(false)} className="text-slate-400 hover:text-slate-700 transition cursor-pointer">
            <FaTimes size={12} />
          </button>
        </div>
      )}
    </div>
  );
};

export default RankRewards;