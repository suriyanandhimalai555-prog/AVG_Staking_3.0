import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import logo from "../assets/logo.png";
import FooterBg from "../assets/footer-bg.jpeg";
import Buttons from "../components/Buttons";
import { EyeIcon, EyeOffIcon, LockIcon, MailIcon } from "./AuthIcons";

const Login = () => {
  const navigate = useNavigate();

  const [data, setData] = useState({
    user_code: "",
    password: "",
    remember: false,
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!data.user_code.trim() || !data.password) {
      return toast.error("All fields are required");
    }

    try {
      setLoading(true);

      const res = await axios.post(
        `${import.meta.env.VITE_APP_BASE_URL}/api/auth/login`,
        {
          user_code: data.user_code.trim(),
          password: data.password,
        }
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role || "");
      localStorage.setItem("user_code", res.data.user_code || data.user_code.trim());

      toast.success("Login successful");

      if (res.data.role === "admin") {
        navigate("/dashboard");
      } else {
        navigate("/user-dashboard");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid credentials");
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

      {/* Responsive Background Watermark */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 w-full text-center pointer-events-none select-none z-0 overflow-hidden px-4">
        <h1 className="text-[14vw] font-black uppercase tracking-widest text-white/10 leading-none whitespace-nowrap">
          AGILAVETRI
        </h1>
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto bg-white/95 backdrop-blur-md text-gray-900 rounded-3xl shadow-2xl p-8 sm:p-10 border border-gray-100">
        
        {/* Header / Logo section */}
        <div className="flex items-center gap-3 mb-6">
          <img src={logo} alt="AVG Staking Logo" className="w-10 h-10 object-contain" />
          <span className="text-xl font-bold tracking-tight text-gray-900 flex items-center gap-1.5">
            AVG Staking
          </span>
        </div>

        <h2 className="text-2xl font-black text-gray-900 mb-1">
          Welcome <span className="text-[#0437cc]">back!</span>
        </h2>
        <p className="text-sm text-gray-500 mb-6">Sign in to manage your staking account.</p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          
          {/* User Code Input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700">User Code</label>
            <div 
              style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb" }}
              className="flex items-center rounded-xl px-3 py-2.5 transition-colors focus-within:border-[#0437cc]"
            >
              <span className="text-gray-400 mr-2.5 flex items-center"><MailIcon /></span>
              <input
                type="text"
                name="user_code"
                placeholder="Enter user code"
                value={data.user_code}
                onChange={handleChange}
                autoComplete="username"
                style={{ backgroundColor: "transparent", color: "#111827", border: "none" }}
                className="w-full text-sm focus:outline-none placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Password Input */}
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
                placeholder="Enter password"
                value={data.password}
                onChange={handleChange}
                autoComplete="current-password"
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

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 text-gray-600 cursor-pointer select-none">
              <input
                type="checkbox"
                name="remember"
                checked={data.remember}
                onChange={handleChange}
                className="rounded border-gray-300 text-[#0437cc] focus:ring-[#0437cc] cursor-pointer"
              />
              Remember me
            </label>

            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-[#0437cc] font-semibold hover:underline cursor-pointer"
            >
              Forgot password?
            </button>
          </div>

          {/* Custom Animated Button */}
          <div className="pt-2">
            <Buttons 
              text={loading ? "Signing in..." : "Sign in"}
              variant="primary"
              className="w-full !mt-2"
              disabled={loading}
            />
          </div>

          {/* Divider */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-4 text-xs text-gray-400 uppercase tracking-widest">or</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          {/* Footer Link */}
          <div className="text-center text-xs text-gray-600">
            Don’t have an account?{" "}
            <button 
              type="button" 
              onClick={() => navigate("/signup")}
              className="text-[#0437cc] font-bold hover:underline cursor-pointer"
            >
              Create one
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default Login;