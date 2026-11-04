import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/user/UserSidebar";
import Topbar from "../components/user/UserTopbar";
import toast from "react-hot-toast";
import { 
  FiArrowUpRight, 
  FiSearch, 
  FiPlus, 
  FiX, 
  FiDollarSign, 
  FiCreditCard, 
  FiLayers, 
  FiTrendingUp, 
  FiShield, 
  FiChevronLeft, 
  FiChevronRight,
  FiClock,
  FiCheckCircle,
  FiAlertCircle
} from "react-icons/fi";

const UserWithdraw = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [search, setSearch] = useState("");
  const [data, setData] = useState([]);
  const [wallets, setWallets] = useState({
    roi: 0,
    level: 0,
    direct: 0,
    reward: 0,
    usdtPrice: 0,
  });

  const [bankData, setBankData] = useState(null);

  const [form, setForm] = useState({
    walletType: "",
    currencyType: "",
    amount: "",
  });

  const [errors, setErrors] = useState({});

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

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

  const fetchBankDetails = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_APP_BASE_URL}/api/users/my-bank`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setBankData(res.data || null);
    } catch (err) {
      setBankData(null);
    }
  };

  const fetchData = async () => {
    try {
      const [summaryRes, withdrawRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_APP_BASE_URL}/api/withdrawals/summary`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${import.meta.env.VITE_APP_BASE_URL}/api/withdrawals/my`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setWallets(summaryRes.data);

      const formatted = (withdrawRes.data || []).map((w) => {
        const amount = Number(w.amount || 0);
        const fee = amount * 0.1;
        const approvedUsd = amount - fee;
        const currencyType = String(w.currency_type || "").toUpperCase();

        const rawApproved = w.approved_amount ?? approvedUsd;
        const approvedFormatted =
          currencyType === "AVG"
            ? `${Number(rawApproved / (w.approved_amount ? 1 : 25)).toFixed(2)} AVG`
            : `₹${Number(rawApproved).toFixed(2)}`;

        return {
          id: w.id,
          currency: currencyType,
          transactionId: w.transaction_id || "",
          proof: w.transaction_proof || "",
          request: `$${amount.toFixed(2)}`,
          approved: approvedFormatted,
          status: w.status,
          date: w.created_at,
        };
      });

      setData(formatted);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBankDetails();
    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    return data.filter((item) =>
      Object.values(item)
        .join("")
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [search, data]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / rowsPerPage));

  const paginatedData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages, page]);

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

  const validate = () => {
    const newErrors = {};
    const amount = Number(form.amount);

    if (!form.walletType) newErrors.walletType = "Wallet required";
    if (!form.currencyType) newErrors.currencyType = "Currency required";

    if (!form.amount) newErrors.amount = "Amount required";
    else if (amount < 20) newErrors.amount = "Minimum $20";
    else {
      const balance = wallets[form.walletType] || 0;
      if (amount > balance) newErrors.amount = "Insufficient balance";
    }

    return newErrors;
  };

  const handleOpenWithdraw = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_APP_BASE_URL}/api/users/my-bank`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.data) {
        toast.error("Please add your bank details first");
        navigate("/user-bank");
        return;
      }

      setBankData(res.data);
      setShowModal(true);
    } catch (err) {
      toast.error("Please add your bank details first");
      navigate("/user-bank");
    }
  };

  const handleSubmit = async () => {
    if (!bankData) {
      navigate("/user-bank");
      return;
    }

    const err = validate();
    if (Object.keys(err).length) return setErrors(err);

    setSubmitting(true);

    try {
      await axios.post(
        `${import.meta.env.VITE_APP_BASE_URL}/api/withdrawals`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Withdraw request created successfully 🎉");

      setShowModal(false);
      setForm({ walletType: "", currencyType: "", amount: "" });
      setErrors({});
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Withdrawal failed ❌");
    } finally {
      setSubmitting(false);
    }
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
                Withdrawals
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                Manage your fund payouts, view historical transactions, and create withdrawal requests
              </p>
            </div>

            <button
              onClick={handleOpenWithdraw}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0437cc] hover:bg-[#032da6] text-white px-5 py-3 text-xs sm:text-sm font-bold shadow-sm transition active:scale-95 cursor-pointer self-start sm:self-auto"
            >
              <FiPlus className="text-base" /> Create Withdraw
            </button>
          </div>

          {/* TABLE CONTAINER & SEARCH */}
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
            
            {/* Search Bar */}
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                  <FiArrowUpRight className="text-lg" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Withdrawal History</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Review your payout statuses and proof hashes</p>
                </div>
              </div>

              <div className="relative w-full sm:w-72">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <FiSearch className="text-sm" />
                </span>
                <input
                  type="text"
                  placeholder="Search currency, status..."
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
                    <th className="py-3.5 px-4">Currency</th>
                    <th className="py-3.5 px-4">Proof / Tx ID</th>
                    <th className="py-3.5 px-4">Request</th>
                    <th className="py-3.5 px-4">Approved</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 sm:px-6">Created</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                  {paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-12 text-center text-slate-500 font-medium">
                        No withdrawal data found
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((item, i) => (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-4 px-4 sm:px-6 font-semibold text-slate-500">
                          {(page - 1) * rowsPerPage + i + 1}
                        </td>

                        <td className="py-4 px-4 font-bold text-slate-900">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs">
                            {item.currency}
                          </span>
                        </td>

                        <td className="py-4 px-4 font-mono text-xs text-slate-600">
                          {item.proof !== "-" ? item.proof : ""}
                          {item.proof !== "-" && item.transactionId !== "-" ? " | " : ""}
                          {item.transactionId !== "-" ? item.transactionId : (item.proof === "-" ? "-" : "")}
                        </td>

                        <td className="py-4 px-4 font-black text-slate-900">
                          {item.request}
                        </td>

                        <td className="py-4 px-4 font-bold text-emerald-600">
                          {item.approved}
                        </td>

                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            item.status.toLowerCase() === "success" || item.status.toLowerCase() === "approved"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : item.status.toLowerCase() === "pending"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}>
                            {item.status}
                          </span>
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
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
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

      {/* WITHDRAWAL MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                  <FiArrowUpRight className="text-base" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Create Withdrawal Request
                </h3>
              </div>

              <button
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition cursor-pointer"
                onClick={() => setShowModal(false)}
              >
                <FiX className="text-sm" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              
              {/* Wallet Balances Summary Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-0.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">ROI Wallet</p>
                  <h4 className="text-sm font-black text-slate-900">${wallets.roi}</h4>
                  <p className="text-[10px] text-emerald-600 font-semibold">
                    {(Number(wallets.roi || 0) / 25).toFixed(2)} AVG
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-0.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Level Wallet</p>
                  <h4 className="text-sm font-black text-slate-900">${wallets.level}</h4>
                  <p className="text-[10px] text-emerald-600 font-semibold">
                    {(Number(wallets.level || 0) / 25).toFixed(2)} AVG
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-0.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Direct Wallet</p>
                  <h4 className="text-sm font-black text-slate-900">${wallets.direct}</h4>
                  <p className="text-[10px] text-emerald-600 font-semibold">
                    {(Number(wallets.direct || 0) / 25).toFixed(2)} AVG
                  </p>
                </div>
              </div>

              {/* Form Inputs */}
              <div className="space-y-4">
                
                {/* Wallet Type */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Select Wallet Source
                  </label>
                  <select
                    value={form.walletType}
                    onChange={(e) =>
                      setForm({ ...form, walletType: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-hidden focus:border-[#0437cc] transition"
                  >
                    <option value="">Choose wallet source</option>
                    <option value="roi">ROI Wallet (${wallets.roi})</option>
                    <option value="level">Level Wallet (${wallets.level})</option>
                    <option value="direct">Direct Wallet (${wallets.direct})</option>
                  </select>
                  {errors.walletType && <span className="text-xs font-semibold text-rose-500">{errors.walletType}</span>}
                </div>

                {/* Currency Type */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Payout Currency
                  </label>
                  <select
                    value={form.currencyType}
                    onChange={(e) =>
                      setForm({ ...form, currencyType: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-hidden focus:border-[#0437cc] transition"
                  >
                    <option value="">Choose payout currency</option>
                    <option value="INR">INR (Fiat Bank)</option>
                    <option value="AVG">AVG Coin</option>
                  </select>
                  {errors.currencyType && <span className="text-xs font-semibold text-rose-500">{errors.currencyType}</span>}
                </div>

                {/* Amount */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Withdrawal Amount ($)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                      <FiDollarSign />
                    </span>
                    <input
                      type="number"
                      placeholder="Enter amount in USD"
                      value={form.amount}
                      onChange={(e) =>
                        setForm({ ...form, amount: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-3 text-xs sm:text-sm text-slate-900 font-semibold focus:outline-hidden focus:border-[#0437cc] focus:bg-white transition"
                    />
                  </div>
                  {form.currencyType === "AVG" && form.amount && !isNaN(form.amount) && (
                    <p className="text-[11px] font-bold text-emerald-600 mt-1">
                      Equivalent AVG Coin: {(Number(form.amount) / 25).toFixed(2)} AVG
                    </p>
                  )}
                  {errors.amount && <span className="text-xs font-semibold text-rose-500">{errors.amount}</span>}
                </div>

              </div>

              {/* Notes Box */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2 text-xs text-slate-600">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                  <FiAlertCircle className="text-amber-500" /> Withdrawal Guidelines
                </h4>
                <ul className="list-disc pl-4 space-y-1 text-slate-500">
                  <li>Minimum withdrawal amount is <b>$20</b></li>
                  <li>Ensure your selected wallet balance is sufficient</li>
                  <li>Processing and approval may take up to 24 hours</li>
                </ul>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4 bg-slate-50/50">
              <button
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-xs sm:text-sm font-bold transition cursor-pointer"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>

              <button
                className="px-5 py-2.5 rounded-xl bg-[#0437cc] hover:bg-[#032da6] text-white text-xs sm:text-sm font-bold shadow-sm transition cursor-pointer disabled:opacity-50"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? "Processing..." : "Create Withdraw"}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default UserWithdraw;