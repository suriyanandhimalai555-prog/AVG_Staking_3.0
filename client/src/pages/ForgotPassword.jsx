import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import logo from "../assets/logo.png";
import FooterBg from "../assets/footer-bg.jpeg";
import Buttons from "../components/Buttons";
import { EyeIcon, EyeOffIcon, LockIcon, MailIcon, UserIcon } from "./AuthIcons";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [data, setData] = useState({
    email: "",
    user_code: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [resetId, setResetId] = useState(() => {
    return sessionStorage.getItem("forgotResetId") || "";
  });

  const [resetToken, setResetToken] = useState(() => {
    return sessionStorage.getItem("forgotResetToken") || "";
  });

  useEffect(() => {
    if (resetToken) setStep(3);
    else if (resetId) setStep(2);
  }, [resetId, resetToken]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();

    if (!data.email.trim() || !data.user_code.trim()) {
      return toast.error("Email and user code are required");
    }

    try {
      setLoading(true);

      const res = await axios.post(
        `${import.meta.env.VITE_APP_BASE_URL}/api/auth/forgot-password/request`,
        {
          email: data.email.trim(),
          user_code: data.user_code.trim(),
        }
      );

      const id = res.data?.resetId;
      if (!id) {
        throw new Error("Reset id not returned");
      }

      sessionStorage.setItem("forgotResetId", id);
      sessionStorage.removeItem("forgotResetToken");

      setResetId(id);
      setResetToken("");
      setStep(2);

      toast.success("OTP sent to your email");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (!data.otp.trim()) {
      return toast.error("OTP is required");
    }

    try {
      setLoading(true);

      const res = await axios.post(
        `${import.meta.env.VITE_APP_BASE_URL}/api/auth/forgot-password/verify-otp`,
        {
          resetId,
          otp: data.otp.trim(),
        }
      );

      const token = res.data?.resetToken;
      if (!token) {
        throw new Error("Reset token not returned");
      }

      sessionStorage.setItem("forgotResetToken", token);
      setResetToken(token);
      setStep(3);

      toast.success("OTP verified");
    } catch (err) {
      toast.error(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!data.newPassword || !data.confirmPassword) {
      return toast.error("All password fields are required");
    }

    if (data.newPassword !== data.confirmPassword) {
      return toast.error("Passwords do not match");
    }

    try {
      setLoading(true);

      await axios.post(
        `${import.meta.env.VITE_APP_BASE_URL}/api/auth/forgot-password/reset`,
        {
          resetToken,
          newPassword: data.newPassword,
        }
      );

      sessionStorage.removeItem("forgotResetId");
      sessionStorage.removeItem("forgotResetToken");

      toast.success("Password updated successfully");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Password reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-w-full min-h-screen text-white flex items-center justify-center px-4 sm:px-8 py-16 overflow-hidden">
      
      {/* Background Image & Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={FooterBg} 
          alt="Background View" 
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-[#0437cc]/85 to-[#021f7a]" />
      </div>

      {/* Massive Background Watermark */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 w-full text-center pointer-events-none select-none z-0 overflow-hidden px-4">
        <h1 className="text-[14vw] font-black uppercase tracking-widest text-white/10 leading-none whitespace-nowrap">
          AGILAVETRI
        </h1>
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto bg-white/95 backdrop-blur-md text-gray-900 rounded-3xl shadow-2xl p-8 sm:p-10 border border-gray-100">
        
        {/* Header / Logo Section */}
        <div className="flex items-center gap-3 mb-6">
          <img src={logo} alt="AVG Staking Logo" className="w-10 h-10 object-contain" />
          <span className="text-xl font-bold tracking-tight text-gray-900 flex items-center gap-1.5">
            AVG Staking 
          </span>
        </div>

        {/* STEP 1: Request OTP */}
        {step === 1 && (
          <>
            <h2 className="text-2xl font-black text-gray-900 mb-1">
              Forgot <span className="text-[#0437cc]">Password</span>
            </h2>
            <p className="text-sm text-gray-500 mb-6">Enter your email and user code to receive an OTP.</p>

            <form className="space-y-4" onSubmit={handleRequestOtp}>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">Email</label>
                <div 
                  style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb" }}
                  className="flex items-center rounded-xl px-3 py-2.5 transition-colors focus-within:border-[#0437cc]"
                >
                  <span className="text-gray-400 mr-2.5 flex items-center"><MailIcon /></span>
                  <input
                    type="email"
                    name="email"
                    placeholder="you@domain.com"
                    value={data.email}
                    onChange={handleChange}
                    style={{ backgroundColor: "transparent", color: "#111827", border: "none" }}
                    className="w-full text-sm focus:outline-none placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">User Code</label>
                <div 
                  style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb" }}
                  className="flex items-center rounded-xl px-3 py-2.5 transition-colors focus-within:border-[#0437cc]"
                >
                  <span className="text-gray-400 mr-2.5 flex items-center"><UserIcon /></span>
                  <input
                    type="text"
                    name="user_code"
                    placeholder="Enter user code"
                    value={data.user_code}
                    onChange={handleChange}
                    style={{ backgroundColor: "transparent", color: "#111827", border: "none" }}
                    className="w-full text-sm focus:outline-none placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Buttons 
                  text={loading ? "Sending OTP..." : "Send OTP"}
                  variant="primary"
                  className="w-full !mt-2"
                  disabled={loading}
                />
              </div>

              <div className="text-center text-xs text-gray-600 pt-2">
                Back to{" "}
                <button 
                  type="button" 
                  onClick={() => navigate("/login")}
                  className="text-[#0437cc] font-bold hover:underline cursor-pointer"
                >
                  Login
                </button>
              </div>
            </form>
          </>
        )}

        {/* STEP 2: Verify OTP */}
        {step === 2 && (
          <>
            <h2 className="text-2xl font-black text-gray-900 mb-1">
              Verify <span className="text-[#0437cc]">OTP</span>
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Enter the OTP sent to <b className="text-gray-800">{data.email}</b>
            </p>

            <form className="space-y-4" onSubmit={handleVerifyOtp}>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">OTP Code</label>
                <div 
                  style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb" }}
                  className="flex items-center rounded-xl px-3 py-2.5 transition-colors focus-within:border-[#0437cc]"
                >
                  <span className="text-gray-400 mr-2.5 flex items-center"><MailIcon /></span>
                  <input
                    type="text"
                    inputMode="numeric"
                    name="otp"
                    placeholder="Enter 6-digit OTP"
                    value={data.otp}
                    onChange={handleChange}
                    style={{ backgroundColor: "transparent", color: "#111827", border: "none" }}
                    className="w-full text-sm focus:outline-none placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Buttons 
                  text={loading ? "Verifying..." : "Verify OTP"}
                  variant="primary"
                  className="w-full !mt-2"
                  disabled={loading}
                />
              </div>

              <div className="text-center text-xs text-gray-600 pt-2">
                Wrong account?{" "}
                <button 
                  type="button"
                  onClick={() => {
                    sessionStorage.removeItem("forgotResetId");
                    sessionStorage.removeItem("forgotResetToken");
                    setResetId("");
                    setResetToken("");
                    setStep(1);
                  }}
                  className="text-[#0437cc] font-bold hover:underline cursor-pointer"
                >
                  Start again
                </button>
              </div>
            </form>
          </>
        )}

        {/* STEP 3: Reset Password */}
        {step === 3 && (
          <>
            <h2 className="text-2xl font-black text-gray-900 mb-1">
              Set <span className="text-[#0437cc]">New Password</span>
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Create a new password for account <b className="text-gray-800">{data.user_code}</b>.
            </p>

            <form className="space-y-4" onSubmit={handleResetPassword}>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">New Password</label>
                <div 
                  style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb" }}
                  className="flex items-center rounded-xl px-3 py-2.5 transition-colors relative focus-within:border-[#0437cc]"
                >
                  <span className="text-gray-400 mr-2.5 flex items-center"><LockIcon /></span>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="newPassword"
                    placeholder="New password"
                    value={data.newPassword}
                    onChange={handleChange}
                    style={{ backgroundColor: "transparent", color: "#111827", border: "none" }}
                    className="w-full text-sm focus:outline-none pr-8 placeholder:text-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">Confirm New Password</label>
                <div 
                  style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb" }}
                  className="flex items-center rounded-xl px-3 py-2.5 transition-colors relative focus-within:border-[#0437cc]"
                >
                  <span className="text-gray-400 mr-2.5 flex items-center"><LockIcon /></span>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm password"
                    value={data.confirmPassword}
                    onChange={handleChange}
                    style={{ backgroundColor: "transparent", color: "#111827", border: "none" }}
                    className="w-full text-sm focus:outline-none pr-8 placeholder:text-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute right-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <Buttons 
                  text={loading ? "Updating..." : "Update Password"}
                  variant="primary"
                  className="w-full !mt-2"
                  disabled={loading}
                />
              </div>
            </form>
          </>
        )}

      </div>
    </div>
  );
};

export default ForgotPassword;