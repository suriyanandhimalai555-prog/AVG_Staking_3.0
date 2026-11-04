import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { 
  FaSearch, FaGift, FaCalendarAlt, FaRupeeSign, FaUserCircle, 
  FaExchangeAlt, FaHourglassHalf, FaCheckCircle, FaBan, FaSave, FaFolderMinus 
} from "react-icons/fa";

const RewardClaims = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); 
  const [savingKey, setSavingKey] = useState("");
  const [monthSavingId, setMonthSavingId] = useState("");
  const [closingId, setClosingId] = useState("");
  const [form, setForm] = useState({});
  const [monthForm, setMonthForm] = useState({});

  const token = localStorage.getItem("token");

  const api = useMemo(() => {
    return axios.create({
      baseURL:
        import.meta.env.VITE_API_URL ||
        `${import.meta.env.VITE_APP_BASE_URL}/api`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }, [token]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/ranks/claims/admin");
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const keyOf = (row) => `${row.user_id}-${row.reward}-${row.target_amount}`;

  const handleChange = (key, field, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] || {}),
        [field]: value,
      },
    }));
  };

  const handleMonthChange = (monthId, field, value) => {
    setMonthForm((prev) => ({
      ...prev,
      [monthId]: {
        ...(prev[monthId] || {}),
        [field]: value,
      },
    }));
  };

  const handleSave = async (row) => {
    if (row.claim_status === "closed") return;

    const key = keyOf(row);
    const current = form[key] || {};

    try {
      setSavingKey(key);

      await api.post("/ranks/claims", {
        userId: row.user_id,
        reward: row.reward,
        target_amount: row.target_amount,
        monthly_amount: current.monthly_amount ?? row.monthly_amount,
        months_count: current.months_count ?? row.months_count ?? 12,
        start_date:
          current.start_date ??
          row.start_date ??
          new Date().toISOString().slice(0, 10),
      });

      fetchData();
    } catch (err) {
      alert(err?.response?.data?.message || "Error saving");
    } finally {
      setSavingKey("");
    }
  };

  const handleCloseClaim = async (row) => {
    if (!row.claim_id || row.claim_status === "closed") return;

    try {
      setClosingId(row.claim_id);

      await api.post("/ranks/claims/close", {
        claimId: row.claim_id,
      });

      fetchData();
    } catch (err) {
      alert(err?.response?.data?.message || "Error closing claim");
    } finally {
      setClosingId("");
    }
  };

  const handleMonthSave = async (monthId) => {
    const current = monthForm[monthId] || {};

    try {
      setMonthSavingId(monthId);

      await api.post("/ranks/claims/month-status", {
        monthId,
        transaction_id: current.transaction_id || "",
        status: current.status || "completed",
      });

      fetchData();
    } catch (err) {
      alert(err?.response?.data?.message || "Error updating month");
    } finally {
      setMonthSavingId("");
    }
  };

  const filteredRows = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return rows;

    return rows.filter((row) => {
      const firstName = String(row.name || "").toLowerCase();
      const lastName = String(row.lastname || "").toLowerCase();
      const rewardName = String(row.reward || "").toLowerCase();
      const userCode = String(
        row.referral_code || row.user_code || row.userid || row.user_id || ""
      ).toLowerCase();

      return (
        firstName.includes(query) ||
        lastName.includes(query) ||
        rewardName.includes(query) ||
        userCode.includes(query)
      );
    });
  }, [rows, searchTerm]);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 text-slate-800 select-none bg-white/90 p-6 rounded-2xl shadow-md">
      
      {/* PREMIUM ACTIONS CONTROL HEADER */}
      <div className="bg-white border border-slate-200/90 p-6 rounded-2xl shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2.5">
            <FaGift className="text-amber-500" size={22} />
            Reward Claims Ledger
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">Audit recurring monthly payout installments, operational schedules, and network transactions</p>
        </div>

        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
            <FaSearch size={14} />
          </span>
          <input
            type="text"
            placeholder="Search claims, name tags, IDs..."
            className="w-full bg-white border border-slate-300 rounded-xl py-2.5 pl-9 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0437cc] shadow-xs transition duration-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* CORE CONTROL FEED */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="w-8 h-8 border-4 border-[#0437cc] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-slate-500 font-medium tracking-wider">Syncing processing ledgers...</span>
        </div>
      ) : filteredRows.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl text-center py-16 text-slate-500 font-medium text-sm shadow-xs">
          {rows.length === 0 ? "No active claim profiles available inside database matrix." : "No matching claim records found for current parameters."}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredRows.map((row) => {
            const key = keyOf(row);
            const local = form[key] || {};
            const isClosed = row.claim_status === "closed";

            return (
              <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden" key={key}>
                
                {/* MATRIC CONTROL SUB-HEADER */}
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 p-2.5 bg-white rounded-xl border border-slate-200 text-[#0437cc] shadow-2xs">
                      <FaUserCircle size={18} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 tracking-wide">{row.reward}</h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 font-medium">
                        <span className="text-slate-900 font-semibold">{row.name} {row.lastname}</span>
                        <span className="text-slate-300">•</span>
                        <span className="font-mono bg-white px-2 py-0.5 rounded text-slate-600 border border-slate-200 font-bold">
                          {row.referral_code || row.user_code || row.userid || row.user_id}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5">
                    <div className="flex items-center gap-1 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 text-sm font-bold text-emerald-600 shadow-2xs">
                      <FaRupeeSign size={12} />
                      {row.target_amount}
                    </div>

                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border tracking-wider uppercase ${
                      isClosed 
                        ? "bg-slate-100 text-slate-500 border-slate-200" 
                        : "bg-emerald-50 text-emerald-600 border-emerald-200"
                    }`}>
                      {isClosed ? "Closed Account" : "Active Ledger"}
                    </span>

                    {!isClosed && row.claim_id > 0 && (
                      <button
                        onClick={() => handleCloseClaim(row)}
                        disabled={closingId === row.claim_id}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-rose-300 hover:border-rose-500 text-rose-600 hover:text-rose-700 text-xs font-bold rounded-xl transition-all disabled:opacity-40 cursor-pointer active:scale-95"
                      >
                        <FaFolderMinus size={12} />
                        {closingId === row.claim_id ? "Closing..." : "Close Process"}
                      </button>
                    )}
                  </div>
                </div>

                {/* LOGS PARAMETERS REWRITE CONTROLS */}
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end bg-white">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Monthly Amount</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none text-xs font-bold">₹</span>
                      <input
                        type="number"
                        className="w-full pl-7 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0437cc] disabled:opacity-40 transition"
                        value={local.monthly_amount ?? row.monthly_amount ?? ""}
                        onChange={(e) => handleChange(key, "monthly_amount", e.target.value)}
                        disabled={isClosed}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Timeline Commencement</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0437cc] disabled:opacity-40 transition"
                      value={local.start_date ?? row.start_date ?? ""}
                      onChange={(e) => handleChange(key, "start_date", e.target.value)}
                      disabled={isClosed}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Installment Matrix (Months)</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0437cc] disabled:opacity-40 transition"
                      value={local.months_count ?? row.months_count ?? 12}
                      onChange={(e) => handleChange(key, "months_count", e.target.value)}
                      disabled={isClosed}
                    />
                  </div>

                  <button
                    onClick={() => handleSave(row)}
                    disabled={savingKey === key || isClosed}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0437cc] hover:bg-blue-800 text-white text-xs font-bold rounded-xl transition shadow-xs disabled:opacity-30 disabled:pointer-events-none cursor-pointer active:scale-95"
                  >
                    <FaSave size={12} />
                    {isClosed ? "Closed Layer" : savingKey === key ? "Saving..." : "Save Parameters"}
                  </button>
                </div>

                {/* DETAILED MONTH BREAKDOWN SCHEDULE */}
                {row.claim_months && row.claim_months.length > 0 && (
                  <div className="border-t border-slate-200 bg-slate-50/50 overflow-x-auto">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                      <thead>
                        <tr className="bg-slate-100 text-slate-600 uppercase text-[11px] tracking-wider font-bold border-b border-slate-200">
                          <th className="py-3 px-6 w-20 text-center">Cycle</th>
                          <th className="py-3 px-6">Expected Due Window</th>
                          <th className="py-3 px-6">Installment</th>
                          <th className="py-3 px-6 w-72">Network Transaction Identification (Txn)</th>
                          <th className="py-3 px-6 w-44">Internal Status</th>
                          <th className="py-3 px-6 text-center w-24">Commit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {row.claim_months.map((m) => {
                          const monthLocal = monthForm[m.id] || {};
                          const monthStatus = m.status || "pending";
                          const disableMonthInput = isClosed && monthStatus === "stopped";

                          return (
                            <tr key={m.id} className="hover:bg-slate-100/60 transition-colors">
                              <td className="py-3.5 px-6 font-mono text-slate-500 font-bold text-center">#{m.month_no}</td>
                              
                              <td className="py-3.5 px-6 text-slate-700 font-medium">
                                <span className="inline-flex items-center gap-1.5">
                                  <FaCalendarAlt className="text-slate-400" size={11} />
                                  {m.due_date ? new Date(m.due_date).toLocaleDateString("en-IN") : "-"}
                                </span>
                              </td>

                              <td className="py-3.5 px-6 font-bold text-slate-900">₹{m.amount}</td>

                              <td className="py-3.5 px-6">
                                <input
                                  type="text"
                                  className="w-full max-w-xs px-3 py-1 bg-white border border-slate-300 rounded-lg text-xs font-mono text-[#0437cc] font-semibold focus:outline-none focus:ring-1 focus:ring-[#0437cc] disabled:opacity-40 transition"
                                  value={monthLocal.transaction_id ?? m.transaction_id ?? ""}
                                  onChange={(e) => handleMonthChange(m.id, "transaction_id", e.target.value)}
                                  disabled={disableMonthInput}
                                  placeholder="No transaction ID logged"
                                />
                              </td>

                              <td className="py-3.5 px-6">
                                <select
                                  className="w-full max-w-[145px] bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0437cc] disabled:opacity-40 cursor-pointer font-semibold"
                                  value={monthLocal.status ?? monthStatus}
                                  onChange={(e) => handleMonthChange(m.id, "status", e.target.value)}
                                  disabled={disableMonthInput}
                                >
                                  <option value="pending">⏳ Pending</option>
                                  <option value="completed">✅ Completed</option>
                                  {monthStatus === "stopped" && (
                                    <option value="stopped">⛔ Halted Stopped</option>
                                  )}
                                </select>
                              </td>

                              <td className="py-3.5 px-6 text-center">
                                <button
                                  onClick={() => handleMonthSave(m.id)}
                                  disabled={monthSavingId === m.id || disableMonthInput}
                                  className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-[11px] font-bold rounded-lg transition disabled:opacity-30 cursor-pointer active:scale-95"
                                >
                                  {monthSavingId === m.id ? "Saving..." : "Update"}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RewardClaims;