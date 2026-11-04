import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import Sidebar from "../components/user/UserSidebar";
import Topbar from "../components/user/UserTopbar";
import { useNavigate } from "react-router-dom";
import { 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiShield, 
  FiCopy, 
  FiShare2, 
  FiLogOut, 
  FiEdit3, 
  FiCreditCard, 
  FiLock, 
  FiCheckCircle, 
  FiX 
} from "react-icons/fi";

const API = `${import.meta.env.VITE_APP_BASE_URL}/api/users`;

const UserProfile = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState(null);

  const [wallet, setWallet] = useState({
    roi: 0,
    level: 0,
    direct: 0,
  });

  const [showEdit, setShowEdit] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    lastname: "",
    email: "",
    phone: "",
    wallet_address: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const token = localStorage.getItem("token");

  const referralCode = useMemo(() => {
    return profile?.user_code || localStorage.getItem("user_code") || "";
  }, [profile]);

  const referralLink = useMemo(() => {
    if (!referralCode) return "";
    return `${window.location.origin}/auth/register?referral_code=${encodeURIComponent(
      referralCode
    )}`;
  }, [referralCode]);

  const fetchProfile = async () => {
    try {
      const [profileRes, walletRes] = await Promise.all([
        axios.get(`${API}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${import.meta.env.VITE_APP_BASE_URL}/api/withdrawals/summary`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setProfile(profileRes.data);

      setFormData({
        name: profileRes.data.name || "",
        lastname: profileRes.data.lastname || "",
        email: profileRes.data.email || "",
        phone: profileRes.data.phone || "",
        wallet_address: profileRes.data.wallet_address || "",
      });

      setWallet({
        roi: walletRes.data.roi || 0,
        level: walletRes.data.level || 0,
        direct: walletRes.data.directReferral || 0,
      });
    } catch (err) {
      console.error("Profile fetch error:", err);
      toast.error(err.response?.data?.message || "Failed to load profile");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async () => {
    try {
      await axios.put(`${API}/me`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setShowEdit(false);
      await fetchProfile();
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error("Passwords do not match");
    }

    try {
      await axios.put(
        `${API}/change-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setShowPassword(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      toast.success("Password updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Password change failed");
    }
  };

  const handleLogout = () => {
    const loading = toast.loading("Logging out...");

    setTimeout(() => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("user_code");
      localStorage.removeItem("role");

      toast.success("Logged out successfully", { id: loading });
      navigate("/");
    }, 800);
  };

  const copyReferralLink = async () => {
    if (!referralLink) {
      return toast.error("Referral link not available");
    }

    try {
      await navigator.clipboard.writeText(referralLink);
      toast.success("Referral link copied");
    } catch {
      toast.error("Could not copy link");
    }
  };

  if (!profile) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#f8fafc] text-slate-500 font-medium">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#0437cc] border-t-transparent" />
          <span className="animate-pulse tracking-wide text-sm font-semibold text-slate-600">
            Loading Profile...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-slate-100 rounded-lg min-h-screen">
      {/* <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} /> */}

      <div className="flex-1 flex flex-col min-w-0">
        {/* <Topbar isOpen={isOpen} setIsOpen={setIsOpen} /> */}

        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6 bg-slate-100">
          
          {/* PROFILE HERO HEADER */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <div className="h-20 w-20 rounded-2xl bg-[#0437cc]/10 text-[#0437cc] flex items-center justify-center text-3xl font-black shadow-inner">
                {profile.name?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {profile.name} {profile.lastname}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                  {profile.email}
                </p>
                <div className="mt-2 flex items-center justify-center sm:justify-start gap-2">
                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 tracking-wider uppercase">
                    <FiCheckCircle /> Active Account
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-[#f77704]/10 border border-[#f77704]/20 px-2.5 py-0.5 text-[10px] font-bold text-[#f77704] tracking-wider uppercase">
                    Code: {profile.user_code}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                className="inline-flex items-center gap-2 rounded-xl bg-[#0437cc] hover:bg-[#032da6] text-white px-4 py-2.5 text-xs sm:text-sm font-bold shadow-sm transition active:scale-95 cursor-pointer"
                onClick={() => setShowEdit(true)}
              >
                <FiEdit3 /> Edit Profile
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-rose-600 px-4 py-2.5 text-xs sm:text-sm font-bold shadow-xs transition active:scale-95 cursor-pointer"
                onClick={handleLogout}
              >
                <FiLogOut /> Logout
              </button>
            </div>
          </div>

          {/* PERSONAL DETAILS CARD */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">
              Personal Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <Row label="First Name" value={profile.name} />
              <Row label="Last Name" value={profile.lastname || "-"} />
              <Row label="Email Address" value={profile.email} />
              <Row label="Phone Number" value={profile.phone || "-"} />
              <Row label="User Referral Code" value={profile.user_code || "-"} />
              <Row label="Wallet Address" value={profile.wallet_address || "-"} />
            </div>
          </div>

          {/* WALLET BALANCES CARD */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">
              Wallet Balances
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Wallet title="Staking Wallet" value="$0.00" />
              <Wallet title="ROI Wallet" value={`$${Number(wallet.roi).toFixed(2)}`} />
              <Wallet title="Level Wallet" value={`$${Number(wallet.level).toFixed(2)}`} />
              <Wallet title="Direct Referral Wallet" value={`$${Number(wallet.direct).toFixed(2)}`} />
            </div>
          </div>

          {/* SECURITY & BANK SHORTCUTS */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Security & Payout Details</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Keep your account secure by updating credentials and configuring payout bank info.
              </p>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-auto">
              <button
                onClick={() => setShowPassword(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2.5 text-xs font-bold shadow-xs transition cursor-pointer"
              >
                <FiLock /> Change Password
              </button>
              <button
                onClick={() => navigate("/user-bank")}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 text-xs font-bold shadow-xs transition cursor-pointer"
              >
                <FiCreditCard /> Bank Details
              </button>
            </div>
          </div>

          {/* REFERRAL & EARN CARD */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">
              Referral & Earn Program
            </h3>

            <p className="text-xs text-slate-500 font-medium">
              Invite friends and grow your downline network. Your unique referral link is below:
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono text-xs text-slate-700 break-all">
              {referralLink || "Referral link not available yet"}
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                className="inline-flex items-center gap-2 rounded-xl bg-[#0437cc] hover:bg-[#032da6] text-white px-4 py-2.5 text-xs font-bold shadow-xs transition cursor-pointer"
                onClick={copyReferralLink}
              >
                <FiCopy /> Copy Link
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2.5 text-xs font-bold shadow-xs transition cursor-pointer"
                onClick={() => {
                  if (!referralLink) return toast.error("Referral link not available");
                  window.open(
                    `https://wa.me/?text=${encodeURIComponent(referralLink)}`,
                    "_blank"
                  );
                }}
              >
                <FiShare2 /> Share on WhatsApp
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
              <h3 className="text-base font-bold text-slate-900">Edit Profile</h3>
              <button
                onClick={() => setShowEdit(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition cursor-pointer"
              >
                <FiX className="text-sm" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Personal Info</h4>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">First Name</label>
                  <input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-[#0437cc]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Last Name</label>
                  <input
                    value={formData.lastname}
                    onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-[#0437cc]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Email Address</label>
                  <input
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-[#0437cc]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Phone Number</label>
                  <input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-[#0437cc]"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Wallet Connection</h4>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Wallet Address</label>
                  <input
                    value={formData.wallet_address}
                    onChange={(e) => setFormData({ ...formData, wallet_address: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-[#0437cc]"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4 bg-slate-50/50">
              <button
                onClick={() => setShowEdit(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateProfile}
                className="px-5 py-2.5 rounded-xl bg-[#0437cc] hover:bg-[#032da6] text-white text-xs font-bold shadow-sm transition cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHANGE PASSWORD MODAL */}
      {showPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
              <h3 className="text-base font-bold text-slate-900">Change Password</h3>
              <button
                onClick={() => setShowPassword(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition cursor-pointer"
              >
                <FiX className="text-sm" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Current Password</label>
                <input
                  type="password"
                  placeholder="Enter current password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, currentPassword: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-[#0437cc]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">New Password</label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-[#0437cc]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Confirm Password</label>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-[#0437cc]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4 bg-slate-50/50">
              <button
                onClick={() => setShowPassword(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleChangePassword}
                className="px-5 py-2.5 rounded-xl bg-[#0437cc] hover:bg-[#032da6] text-white text-xs font-bold shadow-sm transition cursor-pointer"
              >
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Row = ({ label, value }) => (
  <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
    <span className="text-xs font-semibold text-slate-500">{label}</span>
    <strong className="text-xs font-bold text-slate-900">{value}</strong>
  </div>
);

const Wallet = ({ title, value }) => (
  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-1">
    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{title}</p>
    <h3 className="text-lg font-black text-slate-900 tracking-tight">{value}</h3>
  </div>
);

export default UserProfile;