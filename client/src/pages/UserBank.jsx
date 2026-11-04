import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Sidebar from "../components/user/UserSidebar";
import Topbar from "../components/user/UserTopbar";
import { 
  FiCreditCard, 
  FiEdit3, 
  FiPlus, 
  FiCheckCircle, 
  FiAlertTriangle, 
  FiX 
} from "react-icons/fi";

const API = `${import.meta.env.VITE_APP_BASE_URL}/api/users`;

const UserBank = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [bankData, setBankData] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    branch: "",
    upiId: "",
    gpayNumber: "",
  });

  const [loading, setLoading] = useState(false);

  const fetchBank = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(`${API}/my-bank`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setBankData(res.data);

      if (res.data) {
        setFormData({
          accountHolderName: res.data.account_holder_name || "",
          bankName: res.data.bank_name || "",
          accountNumber: res.data.account_number || "",
          ifscCode: res.data.ifsc_code || "",
          branch: res.data.branch || "",
          upiId: res.data.upi_id || "",
          gpayNumber: res.data.gpay_number || "",
        });
      }
    } catch (err) {
      console.log("No bank data");
    }
  };

  useEffect(() => {
    fetchBank();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      await axios.post(`${API}/my-bank`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Bank details saved successfully 🎉");
      setShowModal(false);
      fetchBank();
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setLoading(false);
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
                Bank & Payout Details
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                Add your bank account or UPI details for secure automated withdrawal payouts
              </p>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0437cc] hover:bg-[#032da6] text-white px-5 py-3 text-xs sm:text-sm font-bold shadow-sm transition active:scale-95 cursor-pointer self-start sm:self-auto"
            >
              {bankData ? <FiEdit3 /> : <FiPlus />}
              {bankData ? "Edit Bank Details" : "Add Bank Details"}
            </button>
          </div>

          {/* BANK CARD VIEW */}
          {bankData ? (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0437cc] to-emerald-500" />

              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg font-bold">
                    <FiCreditCard />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 tracking-tight">
                      Bank Information
                    </h3>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                      Verified & Saved
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <FiCheckCircle /> Saved
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Account Holder</p>
                  <h4 className="text-sm font-bold text-slate-900">{bankData.account_holder_name}</h4>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Bank Name</p>
                  <h4 className="text-sm font-bold text-slate-900">{bankData.bank_name}</h4>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Account Number</p>
                  <h4 className="text-sm font-bold text-slate-900">****{bankData.account_number?.slice(-4)}</h4>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">IFSC Code</p>
                  <h4 className="text-sm font-bold text-slate-900">{bankData.ifsc_code}</h4>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Branch Name</p>
                  <h4 className="text-sm font-bold text-slate-900">{bankData.branch}</h4>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">UPI ID</p>
                  <h4 className="text-sm font-bold text-slate-900">{bankData.upi_id || "-"}</h4>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">GPay / PhonePe / Paytm</p>
                  <h4 className="text-sm font-bold text-slate-900">{bankData.gpay_number || "-"}</h4>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 bg-white border border-slate-200 rounded-2xl text-center space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-[#0437cc]/10 text-[#0437cc] flex items-center justify-center text-xl">
                <FiCreditCard />
              </div>
              <h3 className="text-base font-bold text-slate-900">No bank details added yet</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Please add your bank or UPI info to enable secure fund withdrawals.
              </p>
            </div>
          )}

        </div>
      </div>

      {/* BANK EDIT / ADD MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in duration-200">
            
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
              <h3 className="text-base font-bold text-slate-900">
                {bankData ? "Edit Bank Details" : "Add Bank Details"}
              </h3>
              <button
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition cursor-pointer"
                onClick={() => setShowModal(false)}
              >
                <FiX className="text-sm" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Bank Information</h4>
                <Input name="accountHolderName" label="Account Holder Name" value={formData.accountHolderName} onChange={handleChange} />
                <Input name="bankName" label="Bank Name" value={formData.bankName} onChange={handleChange} />
                <Input name="accountNumber" label="Account Number" value={formData.accountNumber} onChange={handleChange} />
                <Input name="ifscCode" label="IFSC Code" value={formData.ifscCode} onChange={handleChange} />
                <Input name="branch" label="Branch Name" value={formData.branch} onChange={handleChange} />
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">UPI & Wallet Information</h4>
                <Input name="upiId" label="UPI ID" value={formData.upiId} onChange={handleChange} />
                
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">
                    GPay / PhonePe / Paytm Number
                  </label>
                  <input
                    name="gpayNumber"
                    value={formData.gpayNumber}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-[#0437cc]"
                  />
                </div>

                <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
                  <FiAlertTriangle className="text-amber-600 text-sm mt-0.5 shrink-0" />
                  <span>Ensure your UPI ID and account credentials are valid to prevent payout delays.</span>
                </div>
              </div>

            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4 bg-slate-50/50">
              <button
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-xs sm:text-sm font-bold transition cursor-pointer"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-5 py-2.5 rounded-xl bg-[#0437cc] hover:bg-[#032da6] text-white text-xs sm:text-sm font-bold shadow-sm transition cursor-pointer disabled:opacity-50"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Bank Details"}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

const Input = ({ label, name, value, onChange }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-semibold text-slate-600">{label}</label>
    <input
      name={name}
      value={value}
      onChange={onChange}
      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-[#0437cc]"
    />
  </div>
);

export default UserBank;