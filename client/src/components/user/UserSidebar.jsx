import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Logo from "../../assets/logo.png";
import {
  FaTachometerAlt,
  FaLayerGroup,
  FaWallet,
  FaChevronDown,
  FaChevronRight,
  FaUser,
  FaNetworkWired,
  FaMoneyBillWave,
  FaTrophy,
} from "react-icons/fa";
import { FiX, FiChevronRight as FiChevronRightIcon } from "react-icons/fi";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const sections = {
    transactions: ["/user-deposit", "/user-withdraw", "/user-transaction"],
    earnings: ["/user-roi", "/user-direct", "/user-level"],
    network: ["/referrals", "/network"],
    rewards: ["/user-rewards", "/user-monthly-claims", "/direct-reward"],
    account: ["/user-profile", "/user-support", "/user-bank"],
  };

  useEffect(() => {
    const activeSection = Object.entries(sections).find(([, paths]) =>
      paths.some((p) => location.pathname.startsWith(p))
    );

    if (activeSection) {
      setOpenMenu(activeSection[0]);
    } else {
      setOpenMenu(null);
    }
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const toggleMenu = (menu) => {
    setOpenMenu((prev) => (prev === menu ? null : menu));
  };

  const go = (path) => {
    navigate(path);
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  const isActive = (path) => location.pathname === path;
  const isSubActive = (paths) => paths.some((p) => location.pathname.startsWith(p));

  const menuItemClass = (active) => [
    "relative group flex w-full items-center gap-3 px-6 py-3.5 text-left text-sm font-semibold transition-all duration-200 cursor-pointer",
    active
      ? "bg-[#eef2fc] text-[#02185c] font-bold rounded-l-full rounded-r-[0px] shadow-sm ml-3 w-[calc(100%-12px)]"
      : "text-white/80 hover:text-white hover:bg-white/10 rounded-xl mx-3 w-[calc(100%-24px)]",
  ].join(" ");

  const submenuClass = (active) => [
    "flex w-full items-center rounded-lg px-4 py-2 text-xs font-medium transition-all duration-200 cursor-pointer",
    active
      ? "bg-white/20 text-white font-bold"
      : "text-white/70 hover:bg-white/10 hover:text-white",
  ].join(" ");

  return (
    <>
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none !important;
        }
        .no-scrollbar {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
      `}</style>

      {/* Mobile Backdrop Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs transition-opacity md:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar Navigation */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[260px] flex-col bg-[#02185c] text-white transition-transform duration-300 ease-out md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex h-full flex-col py-6">
          {/* Header Brand Logo */}
          <div className="flex items-center justify-between px-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 shadow-inner">
                <img src={Logo} alt="logo" className="h-6 w-6 object-contain" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-xl font-black tracking-tight text-white">AVG</h2>
                  <span className="rounded bg-[#f77704] px-1.5 py-0.2 text-[9px] font-black uppercase text-white tracking-wider">
                    3.0
                  </span>
                </div>
                <p className="text-[11px] text-white/60 font-medium">User Portal</p>
              </div>
            </div>

            <button
              className="md:hidden flex items-center justify-center h-8 w-8 rounded-full bg-white/10 text-white transition hover:bg-white/20"
              onClick={() => setIsOpen(false)}
              type="button"
              aria-label="Close sidebar"
            >
              <FiX className="text-base" />
            </button>
          </div>

          {/* Mobile Logout Button */}
          <div className="px-6 pb-4 md:hidden border-b border-white/10 mb-2">
            <button
              className="w-full py-2 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 font-bold text-xs rounded-xl transition cursor-pointer"
              onClick={handleLogout}
              type="button"
            >
              Logout
            </button>
          </div>

          {/* Navigation Menu Links */}
          <div className="flex-1 overflow-y-auto space-y-1.5 no-scrollbar pr-0 select-none">
            <p className="mb-2 px-6 text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
              Main
            </p>

            <button
              className={menuItemClass(isActive("/user-dashboard"))}
              onClick={() => go("/user-dashboard")}
              type="button"
            >
              <FaTachometerAlt className="text-lg" />
              <span>Dashboard</span>
            </button>

            <p className="mb-2 mt-5 px-6 text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
              Plan
            </p>

            <button
              className={menuItemClass(isActive("/all-plans"))}
              onClick={() => go("/all-plans")}
              type="button"
            >
              <FaLayerGroup className="text-lg" />
              <span>All Plans</span>
            </button>

            <button
              className={menuItemClass(isActive("/portfolio"))}
              onClick={() => go("/portfolio")}
              type="button"
            >
              <FaWallet className="text-lg" />
              <span>Portfolio</span>
            </button>

            <p className="mb-2 mt-5 px-6 text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
              History
            </p>

            {/* Transactions Dropdown */}
            <div>
              <button
                className={menuItemClass(isSubActive(sections.transactions) || openMenu === "transactions")}
                onClick={() => toggleMenu("transactions")}
                type="button"
              >
                <FaMoneyBillWave className="text-lg" />
                <span className="flex-1">Transactions</span>
                <span className="text-xs transition-transform duration-300 mr-2">
                  {openMenu === "transactions" ? <FaChevronDown /> : <FaChevronRight />}
                </span>
              </button>
              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  openMenu === "transactions"
                    ? "grid-rows-[1fr] opacity-100 mt-1"
                    : "grid-rows-[0fr] opacity-0 pointer-events-none"
                }`}
              >
                <div className="overflow-hidden pl-12 pr-4 space-y-1 my-1">
                  <button className={submenuClass(isActive("/user-deposit"))} onClick={() => go("/user-deposit")} type="button">Deposit</button>
                  <button className={submenuClass(isActive("/user-withdraw"))} onClick={() => go("/user-withdraw")} type="button">Withdraw</button>
                  <button className={submenuClass(isActive("/user-transaction"))} onClick={() => go("/user-transaction")} type="button">All Transactions</button>
                </div>
              </div>
            </div>

            {/* Earnings Dropdown */}
            <div>
              <button
                className={menuItemClass(isSubActive(sections.earnings) || openMenu === "earnings")}
                onClick={() => toggleMenu("earnings")}
                type="button"
              >
                <FaLayerGroup className="text-lg" />
                <span className="flex-1">Earnings</span>
                <span className="text-xs transition-transform duration-300 mr-2">
                  {openMenu === "earnings" ? <FaChevronDown /> : <FaChevronRight />}
                </span>
              </button>
              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  openMenu === "earnings"
                    ? "grid-rows-[1fr] opacity-100 mt-1"
                    : "grid-rows-[0fr] opacity-0 pointer-events-none"
                }`}
              >
                <div className="overflow-hidden pl-12 pr-4 space-y-1 my-1">
                  <button className={submenuClass(isActive("/user-roi"))} onClick={() => go("/user-roi")} type="button">ROI Income</button>
                  <button className={submenuClass(isActive("/user-direct"))} onClick={() => go("/user-direct")} type="button">Direct Income</button>
                  <button className={submenuClass(isActive("/user-level"))} onClick={() => go("/user-level")} type="button">Level Income</button>
                </div>
              </div>
            </div>

            <p className="mb-2 mt-5 px-6 text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
              Network
            </p>

            {/* Network Dropdown */}
            <div>
              <button
                className={menuItemClass(isSubActive(sections.network) || openMenu === "network")}
                onClick={() => toggleMenu("network")}
                type="button"
              >
                <FaNetworkWired className="text-lg" />
                <span className="flex-1">Network</span>
                <span className="text-xs transition-transform duration-300 mr-2">
                  {openMenu === "network" ? <FaChevronDown /> : <FaChevronRight />}
                </span>
              </button>
              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  openMenu === "network"
                    ? "grid-rows-[1fr] opacity-100 mt-1"
                    : "grid-rows-[0fr] opacity-0 pointer-events-none"
                }`}
              >
                <div className="overflow-hidden pl-12 pr-4 space-y-1 my-1">
                  <button className={submenuClass(isActive("/referrals"))} onClick={() => go("/referrals")} type="button">My Referrals</button>
                  <button className={submenuClass(isActive("/network"))} onClick={() => go("/network")} type="button">My Network</button>
                </div>
              </div>
            </div>

            <p className="mb-2 mt-5 px-6 text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
              Reward
            </p>

            {/* Reward Dropdown */}
            <div>
              <button
                className={menuItemClass(isSubActive(sections.rewards) || openMenu === "rewards")}
                onClick={() => toggleMenu("rewards")}
                type="button"
              >
                <FaTrophy className="text-lg" />
                <span className="flex-1">Rewards</span>
                <span className="text-xs transition-transform duration-300 mr-2">
                  {openMenu === "rewards" ? <FaChevronDown /> : <FiChevronRightIcon />}
                </span>
              </button>
              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  openMenu === "rewards"
                    ? "grid-rows-[1fr] opacity-100 mt-1"
                    : "grid-rows-[0fr] opacity-0 pointer-events-none"
                }`}
              >
                <div className="overflow-hidden pl-12 pr-4 space-y-1 my-1">
                  <button className={submenuClass(isActive("/user-rewards"))} onClick={() => go("/user-rewards")} type="button">Rewards</button>
                  <button className={submenuClass(isActive("/user-monthly-claims"))} onClick={() => go("/user-monthly-claims")} type="button">Monthly Claims</button>
                  <button className={submenuClass(isActive("/direct-reward"))} onClick={() => go("/direct-reward")} type="button">Direct Referral Reward</button>
                </div>
              </div>
            </div>

            <p className="mb-2 mt-5 px-6 text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
              Account
            </p>

            {/* Account Dropdown */}
            <div>
              <button
                className={menuItemClass(isSubActive(sections.account) || openMenu === "account")}
                onClick={() => toggleMenu("account")}
                type="button"
              >
                <FaUser className="text-lg" />
                <span className="flex-1">Account</span>
                <span className="text-xs transition-transform duration-300 mr-2">
                  {openMenu === "account" ? <FaChevronDown /> : <FaChevronRight />}
                </span>
              </button>
              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  openMenu === "account"
                    ? "grid-rows-[1fr] opacity-100 mt-1"
                    : "grid-rows-[0fr] opacity-0 pointer-events-none"
                }`}
              >
                <div className="overflow-hidden pl-12 pr-4 space-y-1 my-1">
                  <button className={submenuClass(isActive("/user-profile"))} onClick={() => go("/user-profile")} type="button">My Profile</button>
                  <button className={submenuClass(isActive("/user-support"))} onClick={() => go("/user-support")} type="button">Support Ticket</button>
                  <button className={submenuClass(isActive("/user-bank"))} onClick={() => go("/user-bank")} type="button">Bank</button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;