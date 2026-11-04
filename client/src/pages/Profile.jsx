// src/pages/Profile.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const API_BASE = `${import.meta.env.VITE_APP_BASE_URL}/api/users`;

const Profile = () => {
  const [profileData, setProfileData] = useState({
    username: "",
    email: "",
    phone: "",
    referralCode: "",
    walletAddress: "",
  });
  const [editData, setEditData] = useState({ ...profileData });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [popup, setPopup] = useState({ show: false, message: "", type: "" });
  const popupTimeoutRef = useRef(null);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);

  const [showBankModal, setShowBankModal] = useState(false);
  const [bankData, setBankData] = useState({
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    branch: "",
  });

  const showPopup = (message, type = "success") => {
    if (popupTimeoutRef.current) clearTimeout(popupTimeoutRef.current);
    setPopup({ show: true, message, type });
    popupTimeoutRef.current = setTimeout(
      () => setPopup({ show: false, message: "", type: "" }),
      3000
    );
  };

  useEffect(() => {
    return () => {
      if (popupTimeoutRef.current) clearTimeout(popupTimeoutRef.current);
    };
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data || {};
      const formatted = {
        username: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        referralCode: data.referral_code || data.referralCode || "",
        walletAddress: data.wallet_address || "-",
      };
      setProfileData(formatted);
      setEditData(formatted);
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      showPopup(err.response?.data?.message || "Failed to fetch profile", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleEdit = () => {
    setEditData(profileData);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editData.username?.trim() || !editData.email?.trim()) {
      return showPopup("Name and email are required", "error");
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${API_BASE}/me`,
        {
          name: editData.username,
          email: editData.email,
          phone: editData.phone,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data?.user) {
        const u = res.data.user;
        const formatted = {
          username: u.name || "",
          email: u.email || "",
          phone: u.phone || "",
          referralCode: u.referral_code || "",
          walletAddress: u.wallet_address || "-",
        };
        setProfileData(formatted);
      } else {
        await fetchProfile();
      }

      setIsEditing(false);
      showPopup("Profile updated successfully", "success");
    } catch (err) {
      console.error("Profile update failed:", err);
      showPopup(err.response?.data?.message || "Update failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData(profileData);
  };

  const handleSavePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return showPopup("Passwords do not match", "error");
    }
    if (passwordData.newPassword.length < 6) {
      return showPopup("Minimum 6 characters required", "error");
    }

    setChangingPassword(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${API_BASE}/change-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      showPopup(res.data?.message || "Password updated", "success");
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      console.error("Change password error:", err);
      showPopup(err.response?.data?.message || "Error changing password", "error");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSaveBank = async () => {
    if (!bankData.accountHolderName || !bankData.accountNumber) {
      return showPopup("Fill required fields", "error");
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_BASE}/bank`,
        {
          accountHolderName: bankData.accountHolderName,
          bankName: bankData.bankName,
          accountNumber: bankData.accountNumber,
          ifscCode: bankData.ifscCode,
          branch: bankData.branch,
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      showPopup("Bank details submitted", "success");
      setShowBankModal(false);
      setBankData({
        accountHolderName: "",
        bankName: "",
        accountNumber: "",
        ifscCode: "",
        branch: "",
      });
    } catch (err) {
      console.error(err);
      showPopup("Failed to save bank details", "error");
    }
  };

  const referralLink = `https://avgstake.com/auth/registration?referral_code=${profileData.referralCode || ""}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      showPopup("Copied to clipboard", "success");
    } catch (err) {
      console.error("Copy failed:", err);
      showPopup("Copy failed", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-transparent text-slate-500 font-bold">
        <div className="animate-pulse tracking-wide">Loading profile…</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 text-slate-800 select-none bg-white/90 p-6 rounded-2xl shadow-md">
      
      {/* Dynamic Floating Notification */}
      {popup.show && (
        <div className={`fixed top-6 right-6 z-[120] px-5 py-3.5 rounded-xl shadow-xl border text-xs font-bold tracking-wide transition-all transform duration-300 animate-bounce ${
          popup.type === "error" 
            ? "bg-rose-50 border-rose-200 text-rose-700" 
            : "bg-emerald-50 border-emerald-200 text-emerald-700"
        }`}>
          {popup.message}
        </div>
      )}

      {/* Main Container Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        
        {/* Header Block */}
        <div className="p-6 sm:p-8 bg-slate-50/70 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">👤</span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">{profileData.username || "—"}</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">{profileData.email || "—"}</p>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {!isEditing ? (
              <button 
                className="w-full sm:w-auto px-5 py-2.5 bg-[#0437cc] hover:bg-blue-800 active:scale-95 text-white font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
                onClick={handleEdit}
              >
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2.5 w-full sm:w-auto">
                <button 
                  className="flex-1 sm:flex-none px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                  onClick={handleSave} 
                  disabled={saving}
                >
                  {saving ? "Saving…" : "Save"}
                </button>
                <button 
                  className="flex-1 sm:flex-none px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl transition-all border border-slate-300 cursor-pointer active:scale-95"
                  onClick={handleCancel} 
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-8 bg-white">
          
          {/* Section 1: Personal Details */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0437cc] mb-4">Personal Details</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Username", key: "username", editable: true },
                { label: "Email", key: "email", editable: true },
                { label: "Phone", key: "phone", editable: true },
                { label: "Referral Code", key: "referralCode", editable: false }
              ].map((field) => (
                <div key={field.key} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-center shadow-2xs">
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">{field.label}</span>
                  {isEditing && field.editable ? (
                    <input
                      type="text"
                      className="w-full bg-white border border-slate-300 focus:border-[#0437cc] focus:ring-1 focus:ring-[#0437cc] rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none transition"
                      value={editData[field.key] ?? ""}
                      onChange={(e) => setEditData({ ...editData, [field.key]: e.target.value })}
                    />
                  ) : (
                    <span className={`text-sm font-bold ${field.key === 'username' ? 'text-slate-900' : field.key === 'referralCode' ? 'text-[#0437cc] font-mono' : 'text-slate-700'}`}>
                      {profileData[field.key] || "—"}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Wallet Row inside Personal Details */}
            <div className="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-2xs">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Wallet Address</span>
              {isEditing ? (
                <input 
                  type="text" 
                  className="w-full bg-white border border-slate-300 focus:border-[#0437cc] focus:ring-1 focus:ring-[#0437cc] rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none transition"
                  value={editData.walletAddress ?? ""} 
                  onChange={(e) => setEditData({ ...editData, walletAddress: e.target.value })} 
                />
              ) : (
                <span className="text-sm font-mono text-emerald-600 font-semibold break-all">{profileData.walletAddress || "—"}</span>
              )}
            </div>
          </div>

          {/* Section 2: Security */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0437cc] mb-4">Security Settings</h3>
            <div className="space-y-3">
              
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 flex justify-between items-center shadow-2xs">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Account Password</h4>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">Update your secure login credentials</p>
                </div>
                <button 
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl transition border border-slate-300 cursor-pointer active:scale-95"
                  onClick={() => setShowPasswordModal(true)}
                >
                  Edit
                </button>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 flex justify-between items-center shadow-2xs">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Bank Details</h4>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">Manage fiat payout routes and settlement options</p>
                </div>
                <button 
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl transition border border-slate-300 cursor-pointer active:scale-95"
                  onClick={() => setShowBankModal(true)}
                >
                  Configure
                </button>
              </div>

            </div>
          </div>

          {/* Section 3: Referral & Earn */}
          <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0437cc] mb-3">Referral & Earn</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                readOnly 
                value={referralLink} 
                className="flex-1 bg-white border border-slate-300 text-slate-600 text-xs rounded-xl px-4 py-2.5 focus:outline-none font-mono tracking-tight select-all shadow-2xs"
              />
              <button 
                onClick={handleCopy}
                className="px-5 py-2.5 bg-[#0437cc] hover:bg-blue-800 active:scale-95 text-white font-bold text-xs rounded-xl transition whitespace-nowrap shadow-xs cursor-pointer"
              >
                Share Now
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl transform transition-all">
            <h3 className="text-base font-bold text-slate-900 mb-4">Change Password</h3>
            
            <div className="space-y-3.5">
              <input 
                type="password" 
                placeholder="Current Password" 
                className="w-full bg-white border border-slate-300 focus:border-[#0437cc] rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none transition"
                value={passwordData.currentPassword} 
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} 
              />
              <input 
                type="password" 
                placeholder="New Password" 
                className="w-full bg-white border border-slate-300 focus:border-[#0437cc] rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none transition"
                value={passwordData.newPassword} 
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} 
              />
              <input 
                type="password" 
                placeholder="Confirm New Password" 
                className="w-full bg-white border border-slate-300 focus:border-[#0437cc] rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none transition"
                value={passwordData.confirmPassword} 
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} 
              />
            </div>

            <div className="mt-6 flex justify-end gap-2.5">
              <button 
                onClick={() => { setShowPasswordModal(false); setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" }); }} 
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition cursor-pointer"
                disabled={changingPassword}
              >
                Cancel
              </button>
              <button 
                onClick={handleSavePassword} 
                className="px-5 py-2 bg-[#0437cc] hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer active:scale-95"
                disabled={changingPassword}
              >
                {changingPassword ? "Saving…" : "Save Password"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bank Details Modal */}
      {showBankModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl transform transition-all">
            <h3 className="text-base font-bold text-slate-900 mb-4">Bank Details Configuration</h3>
            
            <div className="space-y-3.5">
              <div>
                <label className="text-xs text-slate-500 font-bold mb-1 block pl-1">Account Holder Name *</label>
                <input 
                  placeholder="John Doe" 
                  className="w-full bg-white border border-slate-300 focus:border-[#0437cc] rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none transition"
                  value={bankData.accountHolderName} 
                  onChange={(e) => setBankData({ ...bankData, accountHolderName: e.target.value })} 
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 font-bold mb-1 block pl-1">Bank Name</label>
                <input 
                  placeholder="Federal International Bank" 
                  className="w-full bg-white border border-slate-300 focus:border-[#0437cc] rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none transition"
                  value={bankData.bankName} 
                  onChange={(e) => setBankData({ ...bankData, bankName: e.target.value })} 
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 font-bold mb-1 block pl-1">Account Number *</label>
                <input 
                  placeholder="000000000000" 
                  className="w-full bg-white border border-slate-300 focus:border-[#0437cc] rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none transition"
                  value={bankData.accountNumber} 
                  onChange={(e) => setBankData({ ...bankData, accountNumber: e.target.value })} 
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 font-bold mb-1 block pl-1">IFSC Code</label>
                  <input 
                    placeholder="ABCD0123456" 
                    className="w-full bg-white border border-slate-300 focus:border-[#0437cc] rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none transition"
                    value={bankData.ifscCode} 
                    onChange={(e) => setBankData({ ...bankData, ifscCode: e.target.value })} 
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 font-bold mb-1 block pl-1">Branch</label>
                  <input 
                    placeholder="Main Square" 
                    className="w-full bg-white border border-slate-300 focus:border-[#0437cc] rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none transition"
                    value={bankData.branch} 
                    onChange={(e) => setBankData({ ...bankData, branch: e.target.value })} 
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2.5">
              <button 
                onClick={() => { setShowBankModal(false); setBankData({ accountHolderName: "", bankName: "", accountNumber: "", ifscCode: "", branch: "" }); }} 
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveBank} 
                className="px-5 py-2 bg-[#0437cc] hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer active:scale-95"
              >
                Save Details
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Profile;