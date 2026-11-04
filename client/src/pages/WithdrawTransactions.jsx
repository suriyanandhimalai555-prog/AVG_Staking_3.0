import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { FaEllipsisV, FaDownload, FaTimes, FaTrashAlt, FaEye, FaEdit, FaCheck, FaBan } from "react-icons/fa";
import axios from "axios";
import * as XLSX from "xlsx";

const WithdrawTransactions = () => {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(10);
  const [menu, setMenu] = useState(null);

  const [viewData, setViewData] = useState(null);
  const [editData, setEditData] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const dropdownRef = useRef(null);
  const token = localStorage.getItem("token");
  const EXCHANGE_RATE = 95;

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

    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${day}/${month}/${year}, ${String(hours).padStart(2, "0")}:${minutes}:${seconds} ${ampm}`;
  };

  const normalizeStatus = (status) => String(status || "PENDING").toUpperCase();

  const fetchData = useCallback(async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_APP_BASE_URL}/api/withdrawals/all`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const formatted = (res.data || []).map((d) => {
        const amount = Number(d.amount || 0);
        const fee = amount * 0.1;
        const approvedUsd = Number(d.approved_amount ?? amount - fee);
        const approvedInr = Number(
          d.approved_amount ? d.approved_amount : approvedUsd * EXCHANGE_RATE
        );

        return {
          id: d.id,
          user: `${d.name || ""} ${d.lastname || ""} (${d.user_code || "-"})`.trim(),
          wallet: d.wallet_type || "-",
          amount,
          amountDisplay: `$${amount.toFixed(2)}`,
          fee: fee.toFixed(2),
          approvedUsd: approvedUsd.toFixed(2),
          approvedInr: approvedInr.toFixed(2),
          transactionId: d.transaction_id || "",
          currency: d.currency_type || "USD",
          proof: d.proof || d.transaction_proof || d.tx_proof || "",
          status: normalizeStatus(d.status),
          created: formatDateTime(d.created_at),
          bank: {
            accountHolderName: d.account_holder_name || "-",
            bankName: d.bank_name || "-",
            accountNumber: d.account_number || "-",
            ifscCode: d.ifsc_code || "-",
            branch: d.branch || "-",
            upiId: d.upi_id || "-",
            gpayNumber: d.gpay_number || "-",
          },
        };
      });
      setData(formatted);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return data.filter((d) => {
      const matchesSearch =
        d.user.toLowerCase().includes(q) ||
        d.wallet.toLowerCase().includes(q) ||
        d.amountDisplay.toLowerCase().includes(q) ||
        d.transactionId.toLowerCase().includes(q) ||
        d.proof.toLowerCase().includes(q) ||
        d.status.toLowerCase().includes(q);

      const matchesStatus = statusFilter === "ALL" || d.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, data, statusFilter]);

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
  }, [search, rows, statusFilter]);

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

  const confirmDelete = async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_APP_BASE_URL}/api/withdrawals/${deleteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeleteId(null);
      fetchData();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const saveEdit = async () => {
    try {
      await axios.put(
        `${import.meta.env.VITE_APP_BASE_URL}/api/withdrawals/${editData.id}/status`,
        {
          status: editData.status,
          transactionId: editData.transactionId || null,
          approvedAmount: Number(editData.approvedInr || 0),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditData(null);
      fetchData();
    } catch (err) {
      console.error("Save edit error:", err);
    }
  };

  const approve = async (d) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_APP_BASE_URL}/api/withdrawals/${d.id}/status`,
        {
          status: "APPROVED",
          transactionId: d.transactionId || null,
          approvedAmount: Number(d.approvedInr || 0),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMenu(null);
      fetchData();
    } catch (err) {
      console.error("Approve error:", err);
    }
  };

  const reject = async (id) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_APP_BASE_URL}/api/withdrawals/${id}/status`,
        { status: "REJECTED" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMenu(null);
      fetchData();
    } catch (err) {
      console.error("Reject error:", err);
    }
  };

  const exportByStatus = (status) => {
    const rowsToExport = data.filter((item) => item.status === normalizeStatus(status));
    if (!rowsToExport.length) {
      alert(`No ${status.toLowerCase()} withdrawals found to export.`);
      return;
    }

    const exportData = rowsToExport.map((item) => {
      const amount = Number(item.amount || 0);
      const fee = -(amount * 0.1);
      const dollar = amount + fee;
      const userText = item.user || "-";
      const codeMatch = userText.match(/\((.*?)\)/);
      return {
        USER: userText.replace(/\s*\(.*?\)\s*$/, "").trim() || "-",
        CODE: codeMatch ? codeMatch[1] : "-",
        "WALLET SYSTEM": item.wallet || "-",
        "Account Number": item.bank?.accountNumber || "-",
        "IFSC Code": item.bank?.ifscCode || "-",
        "GPay / PhonePe": item.bank?.gpayNumber || "-",
        "Request Amount": amount,
        "Fee (10%)": fee,
        Dollar: dollar,
      };
    });

    const totalDollar = exportData.reduce((sum, row) => sum + Number(row.Dollar || 0), 0);
    exportData.push({ 
      USER: "TOTAL", 
      CODE: "", 
      "WALLET SYSTEM": "",
      "Account Number": "", 
      "IFSC Code": "", 
      "GPay / PhonePe": "", 
      "Request Amount": "", 
      "Fee (10%)": "", 
      Dollar: totalDollar 
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    
    worksheet["!cols"] = [
      { wch: 26 },
      { wch: 14 },
      { wch: 16 },
      { wch: 22 },
      { wch: 16 },
      { wch: 18 },
      { wch: 16 },
      { wch: 14 },
      { wch: 14 }
    ];
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `${status.toUpperCase()} Withdrawals`);
    XLSX.writeFile(workbook, `withdrawals_${status.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 text-slate-800 select-none bg-white/90 p-6 rounded-2xl shadow-md">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">Transactions</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">Withdraw Request Management Portal</p>
        </div>
        <div className="relative w-full sm:w-72 lg:w-96">
          <input
            type="text"
            placeholder="Search credentials, txn id, status..."
            className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0437cc] focus:bg-white shadow-xs transition duration-200"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Control Actions & Filtering */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Status Action:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-700 text-xs rounded-xl px-3.5 py-2 focus:outline-none focus:ring-1 focus:ring-[#0437cc] cursor-pointer font-semibold"
          >
            <option value="ALL">All States</option>
            <option value="PENDING">Pending Only</option>
            <option value="APPROVED">Approved Only</option>
            <option value="REJECTED">Rejected Only</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button onClick={() => exportByStatus("PENDING")} className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95">
            <FaDownload /> Pending Sheet
          </button>
          <button onClick={() => exportByStatus("APPROVED")} className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95">
            <FaDownload /> Approved Sheet
          </button>
          <button onClick={() => exportByStatus("REJECTED")} className="inline-flex items-center gap-2 px-4 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95">
            <FaDownload /> Rejected Sheet
          </button>
        </div>
      </div>

      {/* Main Datatable container */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50/70">
          <h3 className="font-bold text-base text-slate-900">Withdraw Ledger Requests</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/70 text-slate-600 uppercase text-xs tracking-wider font-bold border-b border-slate-200">
                <th className="py-4 px-5 w-16 text-center">S.No</th>
                <th className="py-4 px-5">User Profile</th>
                <th className="py-4 px-5">Wallet System</th>
                <th className="py-4 px-5">Requested Value</th>
                <th className="py-4 px-5">Transaction Audit / Proof</th>
                <th className="py-4 px-5">Status Badge</th>
                <th className="py-4 px-5">Timestamp</th>
                <th className="py-4 px-5 text-center">Execution Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {paginated.length > 0 ? (
                paginated.map((d, i) => (
                  <tr key={d.id} onClick={() => {
                    setViewData(d);
                    setMenu(null);
                  }} className="hover:bg-slate-50/80 transition-colors cursor-pointer">
                    <td className="py-4 px-5 text-center text-slate-500 font-medium">{(page - 1) * rows + i + 1}</td>
                    <td className="py-4 px-5 font-bold text-slate-900">{d.user}</td>
                    <td className="py-4 px-5"><span className="bg-slate-100 px-2.5 py-1 rounded-md text-xs border border-slate-200 text-slate-600 font-semibold">{d.wallet}</span></td>
                    <td className="py-4 px-5 font-bold text-emerald-600">{d.amountDisplay}</td>
                    <td className="py-4 px-5 text-xs text-slate-500 max-w-xs truncate font-mono">
                      {[d.proof !== "-" ? d.proof : null, d.transactionId !== "-" ? d.transactionId : null].filter(Boolean).join(" | ") || "-"}
                    </td>
                    <td className="py-4 px-5">
                      <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${
                        d.status === "APPROVED" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                        d.status === "REJECTED" ? "bg-rose-50 text-rose-600 border-rose-200" :
                        "bg-amber-50 text-amber-600 border-amber-200 animate-pulse"
                      }`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-xs text-slate-500 font-medium">{d.created}</td>
                    <td className="py-4 px-5 text-center relative" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => setMenu(menu === d.id ? null : d.id)} className="p-2 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                        <FaEllipsisV />
                      </button>

                      {menu === d.id && (
                        <div ref={dropdownRef} className="absolute right-12 top-2 w-44 bg-white border border-slate-200 rounded-xl shadow-xl z-30 py-1 text-left overflow-hidden divide-y divide-slate-100">
                          <button onClick={() => { setViewData(d); setMenu(null); }} className="w-full px-4 py-2.5 text-xs font-medium flex items-center gap-2 hover:bg-slate-50 text-slate-700 transition cursor-pointer"><FaEye className="text-[#0437cc]" /> View Profile</button>
                          <button onClick={() => { setEditData(d); setMenu(null); }} className="w-full px-4 py-2.5 text-xs font-medium flex items-center gap-2 hover:bg-slate-50 text-slate-700 transition cursor-pointer"><FaEdit className="text-[#3b52d4]" /> Quick Edit</button>
                          <button onClick={() => approve(d)} className="w-full px-4 py-2.5 text-xs font-semibold flex items-center gap-2 hover:bg-emerald-50 text-emerald-600 transition cursor-pointer"><FaCheck /> Approve</button>
                          <button onClick={() => reject(d.id)} className="w-full px-4 py-2.5 text-xs font-semibold flex items-center gap-2 hover:bg-amber-50 text-amber-600 transition cursor-pointer"><FaBan /> Reject</button>
                          <button onClick={() => { setDeleteId(d.id); setMenu(null); }} className="w-full px-4 py-2.5 text-xs font-semibold flex items-center gap-2 hover:bg-rose-50 text-rose-600 transition cursor-pointer"><FaTrashAlt /> Delete Record</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-slate-500 font-medium">No withdrawal parameters located inside current query parameters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Controlled Pagination parameters */}
        <div className="p-5 bg-slate-50/50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-500">
          <div className="flex items-center gap-2.5">
            <span>Rows per page</span>
            <select value={rows} onChange={(e) => setRows(Number(e.target.value))} className="bg-white border border-slate-300 rounded-lg py-1 px-2.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0437cc] transition cursor-pointer">
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white text-sm text-slate-700 transition hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none active:scale-95 cursor-pointer">{"<"}</button>
            {getPagination().map((p, i) => p === "..." ? (
              <span key={i} className="px-2 text-slate-400 text-sm tracking-wider">...</span>
            ) : (
              <button key={i} onClick={() => setPage(p)} className={`h-8 w-8 inline-flex items-center justify-center rounded-lg text-xs font-bold transition duration-150 active:scale-95 cursor-pointer ${page === p ? "bg-[#0437cc] text-white shadow-xs" : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"}`}>{p}</button>
            ))}
            <button disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white text-sm text-slate-700 transition hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none active:scale-95 cursor-pointer">{">"}</button>
          </div>
        </div>
      </div>

      {/* Primary Edit Dialog Box Overlay */}
      {editData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border border-slate-200 w-full max-w-3xl rounded-2xl shadow-xl overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h2 className="text-base font-bold text-slate-900 tracking-wide">Modify System Parameters</h2>
              <button onClick={() => setEditData(null)} className="text-slate-400 hover:text-slate-700 transition text-sm cursor-pointer">✕</button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div><span className="text-slate-400 block text-[11px] uppercase tracking-wider font-bold mb-0.5">Profile Attachment</span><strong className="text-slate-900">{editData.user}</strong></div>
                <div><span className="text-slate-400 block text-[11px] uppercase tracking-wider font-bold mb-0.5">Gateway System</span><strong className="text-slate-900">{editData.wallet}</strong></div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase text-slate-600 tracking-widest mb-3 border-b border-slate-200 pb-1.5">User Remittance Parameters</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  <div><span className="text-slate-400 font-bold block mb-0.5">Holder Title</span><span className="font-semibold text-slate-800">{editData.bank?.accountHolderName}</span></div>
                  <div><span className="text-slate-400 font-bold block mb-0.5">Institution Code</span><span className="font-semibold text-slate-800">{editData.bank?.bankName}</span></div>
                  <div><span className="text-slate-400 font-bold block mb-0.5">Remittance Line</span><span className="font-semibold text-slate-800">{editData.bank?.accountNumber}</span></div>
                  <div><span className="text-slate-400 font-bold block mb-0.5">Routing Key (IFSC)</span><span className="font-semibold text-slate-800">{editData.bank?.ifscCode}</span></div>
                  <div><span className="text-slate-400 font-bold block mb-0.5">Branch Network</span><span className="font-semibold text-slate-800">{editData.bank?.branch}</span></div>
                  <div><span className="text-slate-400 font-bold block mb-0.5">UPI Identifier</span><span className="font-semibold text-slate-800">{editData.bank?.upiId}</span></div>
                  <div className="sm:col-span-2"><span className="text-slate-400 font-bold block mb-0.5">Alternative Payment Interface</span><span className="font-semibold text-slate-800">{editData.bank?.gpayNumber}</span></div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase text-slate-600 tracking-widest mb-3 border-b border-slate-200 pb-1.5">Ledger Invoicing Specifications</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-end">
                  <div><span className="text-slate-500 block text-xs mb-1 font-semibold">Currency Specification</span><span className="font-semibold text-slate-800 bg-slate-50 px-3 py-2 rounded-xl border border-slate-300 block text-center">{editData.currency}</span></div>
                  <div><span className="text-slate-500 block text-xs mb-1 font-semibold">Base Valuation</span><span className="font-semibold text-slate-800 bg-slate-50 px-3 py-2 rounded-xl border border-slate-300 block text-center">${Number(editData.amount).toFixed(2)}</span></div>
                  <div><span className="text-slate-500 block text-xs mb-1 font-semibold">Brokerage Surcharge (10%)</span><span className="font-semibold text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-slate-300 block text-center">${Number(editData.fee).toFixed(2)}</span></div>

                  <div className="sm:col-span-2 md:col-span-1">
                    <label className="text-slate-600 block text-xs mb-1 font-bold">Disbursed Ledger Value (INR ₹)</label>
                    <input type="number" name="approvedInr" value={editData.approvedInr || ""} onChange={handleEditChange} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-[#0437cc] focus:bg-white text-slate-800 text-xs" step="0.01" />
                  </div>
                  <div className="sm:col-span-2 md:col-span-1">
                    <label className="text-slate-600 block text-xs mb-1 font-bold">System Transaction Hash ID</label>
                    <input type="text" name="transactionId" value={editData.transactionId || ""} onChange={handleEditChange} placeholder="Enter receipt hash ID" className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-[#0437cc] focus:bg-white text-slate-800 text-xs" />
                  </div>
                  <div>
                    <label className="text-slate-600 block text-xs mb-1 font-bold">Ledger State Assertion</label>
                    <select name="status" value={editData.status || ""} onChange={handleEditChange} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#0437cc] focus:bg-white text-slate-800 font-semibold cursor-pointer">
                      <option value="PENDING">PENDING</option>
                      <option value="APPROVED">APPROVED</option>
                      <option value="REJECTED">REJECTED</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setEditData(null)} className="px-4 py-2.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold transition-colors cursor-pointer active:scale-95">Abort Changes</button>
              <button onClick={saveEdit} className="px-5 py-2.5 bg-[#0437cc] hover:bg-[#3b52d4] text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer active:scale-95">Commit Records</button>
            </div>
          </div>
        </div>
      )}

      {/* Info Inspection View Modal */}
      {viewData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl shadow-xl overflow-hidden text-sm">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base tracking-wide">Metadata View Inspection</h3>
              <button onClick={() => setViewData(null)} className="text-slate-400 hover:text-slate-700 transition cursor-pointer">✕</button>
            </div>
            <div className="p-6 space-y-3 text-slate-700 text-xs">
              <p className="flex justify-between py-2 border-b border-slate-100"><strong className="text-slate-500">Profile Owner:</strong> <span className="font-bold text-slate-900">{viewData.user}</span></p>
              <p className="flex justify-between py-2 border-b border-slate-100"><strong className="text-slate-500">Channel Class:</strong> <span className="font-bold text-slate-900">{viewData.wallet}</span></p>
              <p className="flex justify-between py-2 border-b border-slate-100"><strong className="text-slate-500">Assigned Value:</strong> <span className="text-emerald-600 font-bold">{viewData.amountDisplay}</span></p>
              <p className="flex justify-between py-2 border-b border-slate-100"><strong className="text-slate-500">Audit Trace ID:</strong> <span className="font-mono text-slate-700 break-all max-w-[200px] text-right">{viewData.transactionId || "-"}</span></p>
              <p className="flex justify-between py-2 border-b border-slate-100"><strong className="text-slate-500">Cryptographic Proof:</strong> <span className="font-mono text-slate-700 truncate max-w-[200px]">{viewData.proof || "-"}</span></p>
              <p className="flex justify-between py-2 border-b border-slate-100"><strong className="text-slate-500">Ledger Alignment:</strong> <span className="font-bold text-amber-600 uppercase">{viewData.status}</span></p>
              <p className="flex justify-between py-2"><strong className="text-slate-500">System Initialization:</strong> <span className="font-mono text-slate-600">{viewData.created}</span></p>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button onClick={() => setViewData(null)} className="px-5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer">Dismiss</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Destructive Confirmation Drawer */}
      {deleteId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl shadow-xl p-6 text-center text-sm space-y-5">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 border border-rose-200 rounded-full flex items-center justify-center mx-auto text-xl font-bold">⚠️</div>
            <div className="space-y-1.5">
              <h3 className="font-bold text-base text-slate-900">Purge Request Profile?</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">This acts as an absolute truncation protocol. This record cannot be synchronized after removal.</p>
            </div>
            <div className="flex gap-3 justify-center pt-2">
              <button onClick={() => setDeleteId(null)} className="w-28 py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl font-semibold transition-all text-xs cursor-pointer active:scale-95">Cancel</button>
              <button onClick={confirmDelete} className="w-28 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold transition-all text-xs shadow-xs cursor-pointer active:scale-95">Confirm Purge</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WithdrawTransactions;