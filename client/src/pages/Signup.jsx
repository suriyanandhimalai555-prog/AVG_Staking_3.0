import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import logo from "../assets/logo.png";
import FooterBg from "../assets/footer-bg.jpeg";
import Buttons from "../components/Buttons";
import {
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MailIcon,
  PhoneIcon,
  UserIcon,
} from "./AuthIcons";

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [data, setData] = useState({
    name: "",
    lastname: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    referralCode: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successDetails, setSuccessDetails] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const referralCode =
      params.get("ref") ||
      params.get("user_code") ||
      params.get("referral_code") ||
      "";

    if (referralCode) {
      setData((prev) => ({
        ...prev,
        referralCode,
      }));
    }
  }, [location.search]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: data.name.trim(),
      lastname: data.lastname.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      password: data.password,
      referralCode: data.referralCode.trim(),
    };

    if (
      !payload.name ||
      !payload.lastname ||
      !payload.email ||
      !payload.phone ||
      !payload.password ||
      !data.confirmPassword ||
      !payload.referralCode
    ) {
      return toast.error("All fields are required");
    }

    if (payload.password !== data.confirmPassword) {
      return toast.error("Passwords do not match");
    }

    try {
      setLoading(true);

      const res = await axios.post(
        `${import.meta.env.VITE_APP_BASE_URL}/api/auth/signup`,
        payload
      );

      toast.success(res.data.message || "Account created successfully!");

      const referralLink = `${window.location.origin}/auth/register?referral_code=${res.data.user_code}`;

      setSuccessDetails({
        user_code: res.data.user_code,
        referralLink,
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  return (
    <div className="relative min-w-full min-h-screen text-white flex items-center justify-center px-4 sm:px-8 py-16 overflow-hidden">
      
      {/* Background Image & Gradient Fade */}
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

      <div className="relative z-10 w-full max-w-2xl mx-auto bg-white/95 backdrop-blur-md text-gray-900 rounded-3xl shadow-2xl p-8 sm:p-10 border border-gray-100">
        
        {/* Header / Logo section */}
        <div className="flex items-center gap-3 mb-6">
          <img src={logo} alt="AVG Staking Logo" className="w-10 h-10 object-contain" />
          <span className="text-xl font-bold tracking-tight text-gray-900 flex items-center gap-1.5">
            AVG Staking
          </span>
        </div>

        {successDetails ? (
          <div className="success-screen space-y-5">
            <h2 className="text-2xl font-black text-gray-900">
              Account <span className="text-[#0437cc]">Created!</span>
            </h2>
            <p className="text-sm text-gray-600">
              Save your credentials below:
            </p>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Your User Code</label>
              <div 
                style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb" }}
                className="flex items-center justify-between rounded-xl px-4 py-3"
              >
                <span className="text-gray-900 font-bold tracking-wide">
                  {successDetails.user_code}
                </span>
                <Buttons
                  text="Copy"
                  variant="primary"
                  onClick={() => copyToClipboard(successDetails.user_code, "User Code")}
                  className="!h-[32px] !px-4 !text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Your Referral Link</label>
              <div 
                style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb" }}
                className="flex items-center justify-between rounded-xl px-4 py-3 gap-3"
              >
                <span className="text-xs text-gray-600 truncate">
                  {successDetails.referralLink}
                </span>
                <Buttons
                  text="Copy"
                  variant="primary"
                  onClick={() => copyToClipboard(successDetails.referralLink, "Referral Link")}
                  className="!h-[32px] !px-4 !text-xs flex-shrink-0"
                />
              </div>
            </div>

            <div className="pt-2">
              <Buttons
                text="Proceed to Login"
                variant="primary"
                onClick={() => navigate("/login")}
                className="w-full !mt-2"
              />
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-black text-gray-900 mb-1">
              Create your <span className="text-[#0437cc]">account</span>
            </h2>
            <p className="text-sm text-gray-500 mb-6">Register to get started with your staking plan.</p>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">First Name</label>
                  <div 
                    style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb" }}
                    className="flex items-center rounded-xl px-3 py-2.5 transition-colors focus-within:border-[#0437cc]"
                  >
                    <span className="text-gray-400 mr-2.5 flex items-center"><UserIcon /></span>
                    <input
                      type="text"
                      name="name"
                      placeholder="First name"
                      value={data.name}
                      onChange={handleChange}
                      autoComplete="given-name"
                      style={{ backgroundColor: "transparent", color: "#111827", border: "none" }}
                      className="w-full text-sm focus:outline-none placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Last Name</label>
                  <div 
                    style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb" }}
                    className="flex items-center rounded-xl px-3 py-2.5 transition-colors focus-within:border-[#0437cc]"
                  >
                    <span className="text-gray-400 mr-2.5 flex items-center"><UserIcon /></span>
                    <input
                      type="text"
                      name="lastname"
                      placeholder="Last name"
                      value={data.lastname}
                      onChange={handleChange}
                      autoComplete="family-name"
                      style={{ backgroundColor: "transparent", color: "#111827", border: "none" }}
                      className="w-full text-sm focus:outline-none placeholder:text-gray-400"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      autoComplete="email"
                      style={{ backgroundColor: "transparent", color: "#111827", border: "none" }}
                      className="w-full text-sm focus:outline-none placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Phone Number</label>
                  <div 
                    style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb" }}
                    className="flex items-center rounded-xl px-3 py-2.5 transition-colors focus-within:border-[#0437cc]"
                  >
                    <span className="text-gray-400 mr-2.5 flex items-center"><PhoneIcon /></span>
                    <input
                      type="text"
                      name="phone"
                      placeholder="Mobile number"
                      value={data.phone}
                      onChange={handleChange}
                      autoComplete="tel"
                      style={{ backgroundColor: "transparent", color: "#111827", border: "none" }}
                      className="w-full text-sm focus:outline-none placeholder:text-gray-400"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Password</label>
                  <div 
                    style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb" }}
                    className="flex items-center rounded-xl px-3 py-2.5 transition-colors relative focus-within:border-[#0437cc]"
                  >
                    <span className="text-gray-400 mr-2.5 flex items-center"><LockIcon /></span>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Create password"
                      value={data.password}
                      onChange={handleChange}
                      autoComplete="new-password"
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
                  <label className="text-xs font-semibold text-gray-700">Confirm Password</label>
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
                      autoComplete="new-password"
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
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">Referral Code</label>
                <div 
                  style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb" }}
                  className="flex items-center rounded-xl px-3 py-2.5 transition-colors focus-within:border-[#0437cc]"
                >
                  <span className="text-gray-400 mr-2.5 flex items-center"><MailIcon /></span>
                  <input
                    type="text"
                    name="referralCode"
                    placeholder="Referral code"
                    value={data.referralCode}
                    onChange={handleChange}
                    style={{ backgroundColor: "transparent", color: "#111827", border: "none" }}
                    className="w-full text-sm focus:outline-none placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Buttons 
                  text={loading ? "Creating account..." : "Create Account"}
                  variant="primary"
                  className="w-full !mt-2"
                  disabled={loading}
                />
              </div>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink mx-4 text-xs text-gray-400 uppercase tracking-widest">or</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              <div className="text-center text-xs text-gray-600">
                Already have an account?{" "}
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

      </div>
    </div>
  );
};

export default Signup;