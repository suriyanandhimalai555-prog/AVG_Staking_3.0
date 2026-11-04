import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FiUsers,
  FiUserCheck,
  FiUserX,
  FiTrendingUp,
  FiArrowDownLeft,
  FiArrowUpRight,
  FiPieChart,
  FiLayers,
  FiLifeBuoy,
  FiClock,
  FiCheckCircle,
  FiSettings,
} from "react-icons/fi";
import toast from "react-hot-toast";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [divisor, setDivisor] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      const token = localStorage.getItem("token");
      try {
        const [dashboardRes, divRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_APP_BASE_URL}/api/users/admin/dashboard`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${import.meta.env.VITE_APP_BASE_URL}/api/users/staking-divisor`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setData(dashboardRes.data);
        setDivisor(divRes.data.divisor);
      } catch (error) {
        toast.error("Failed to load dashboard statistics");
      }
    };

    fetchDashboard();
  }, []);

  const updateDivisor = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        `${import.meta.env.VITE_APP_BASE_URL}/api/users/staking-divisor`,
        { divisor },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Divisor updated successfully");
    } catch (error) {
      toast.error("Failed to update divisor");
    }
  };

  if (!data) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center text-slate-500 font-medium">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#0437cc] border-t-transparent" />
          <span className="animate-pulse tracking-wide text-sm font-semibold text-slate-600">
            Loading Dashboard Summary...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 text-slate-800 bg-white/90 p-6 rounded-2xl shadow-md">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Dashboard
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Real-time system overview, staking stats, and performance metrics
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 shadow-xs self-start sm:self-auto">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Live Network Active
        </div>
      </div>

      {/* USERS METRICS */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="h-2 w-6 bg-[#0437cc] rounded-full" />
          <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
            User Statistics
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            title="Total Users"
            value={data.users.total}
            icon={<FiUsers />}
            badge="All Time"
            accent="blue"
          />
          <StatCard
            title="Active Users"
            value={data.users.active}
            icon={<FiUserCheck />}
            badge="Verified"
            accent="green"
          />
          <StatCard
            title="Inactive Users"
            value={data.users.inactive}
            icon={<FiUserX />}
            badge="Pending"
            accent="orange"
          />
        </div>
      </div>

      {/* STAKING METRIC & SETTINGS */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-6 bg-[#f77704] rounded-full" />
            <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
              Staking Balance
            </h2>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-r from-[#eef2fc] via-white to-white p-6 shadow-xs flex flex-col justify-between h-[160px]">
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total AVG Staking Balance (All Users)
                </p>
                <h3 className="text-3xl sm:text-4xl font-black mt-2 text-[#0437cc] tracking-tight">
                  {Number(data.deposits.total_staking || 0).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                  <span className="text-lg font-bold text-[#f77704] ml-2">AVG</span>
                </h3>
              </div>
              <div className="h-12 w-12 rounded-xl bg-[#0437cc] text-white flex items-center justify-center text-xl shadow-md">
                <FiPieChart />
              </div>
            </div>
            <p className="text-[11px] text-slate-500 font-medium relative z-10">
              Aggregated staking ledger balance across active user network.
            </p>
          </div>
        </div>

        {/* STAKING DIVISOR CONFIG */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-6 bg-[#3b52d4] rounded-full" />
            <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
              Staking Configuration
            </h2>
          </div>
          <div className="border border-slate-200 bg-white rounded-2xl p-5 shadow-xs flex flex-col justify-between h-[160px]">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-slate-700 font-semibold text-xs">
                <FiSettings className="text-[#0437cc] text-base" />
                <span>Staking Divisor Rate</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-[#eef2fc] text-[#3b52d4] text-[10px] font-bold">
                Current: {divisor || "0.0"}
              </span>
            </div>
            <div className="flex gap-2 mt-3">
              <input
                type="number"
                step="0.001"
                value={divisor}
                onChange={(e) => setDivisor(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0437cc] focus:bg-white transition duration-200"
                placeholder="0.00"
              />
              <button
                onClick={updateDivisor}
                className="bg-[#0437cc] hover:bg-[#3b52d4] text-white text-xs font-bold px-4 py-2 rounded-xl transition duration-200 shadow-xs active:scale-95 cursor-pointer"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TRANSACTIONS SECTION */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="h-2 w-6 bg-emerald-500 rounded-full" />
          <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
            Transactions Summary
          </h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SectionBlock title="Deposits Breakdown" icon={<FiArrowDownLeft className="text-emerald-600 text-lg" />}>
            <MiniStat title="Total Deposits Count" value={data.deposits.total_count} />
            <MiniStat title="Total Deposit Amount" value={`$${data.deposits.total_amount}`} highlight="emerald" />
            <MiniStat title="Today Deposits Count" value={data.deposits.today_count} />
            <MiniStat title="Today Deposit Amount" value={`$${data.deposits.today_amount}`} highlight="emerald" />
          </SectionBlock>

          <SectionBlock title="Withdrawals Breakdown" icon={<FiArrowUpRight className="text-rose-600 text-lg" />}>
            <MiniStat title="Total Withdrawals Count" value={data.withdrawals.total_count} />
            <MiniStat title="Total Withdraw Amount" value={`$${data.withdrawals.total_amount}`} highlight="rose" />
            <MiniStat title="Pending Requests" value={data.withdrawals.pending} isWarning={data.withdrawals.pending > 0} />
            <MiniStat title="Platform Withdraw Fee" value="$0.00" />
          </SectionBlock>
        </div>
      </div>

      {/* INCOME METRICS */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="h-2 w-6 bg-purple-500 rounded-full" />
          <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
            Income Distribution
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            title="ROI Income"
            value={`$${data.income.roi}`}
            icon={<FiTrendingUp />}
            badge="Yield"
            accent="green"
          />
          <StatCard
            title="Level Income"
            value={`$${data.income.level}`}
            icon={<FiLayers />}
            badge="Multi-tier"
            accent="purple"
          />
          <StatCard
            title="Direct Income"
            value={`$${data.income.direct}`}
            icon={<FiArrowUpRight />}
            badge="Referral"
            accent="blue"
          />
        </div>
      </div>

      {/* SUPPORT TICKETS SECTION */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="h-2 w-6 bg-cyan-500 rounded-full" />
          <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
            Support Ticket Status
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Open Tickets"
            value={data.tickets.open}
            icon={<FiLifeBuoy />}
            badge="Needs Action"
            accent="blue"
          />
          <StatCard
            title="In Progress"
            value={data.tickets.progress}
            icon={<FiClock />}
            badge="Under Review"
            accent="orange"
          />
          <StatCard
            title="Closed Tickets"
            value={data.tickets.closed}
            icon={<FiCheckCircle />}
            badge="Resolved"
            accent="green"
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

/* UI HELPER COMPONENTS */

const StatCard = ({ title, value, icon, badge, accent }) => {
  const accentStyles = {
    blue: "border-l-4 border-l-[#0437cc]",
    green: "border-l-4 border-l-emerald-500",
    orange: "border-l-4 border-l-[#f77704]",
    purple: "border-l-4 border-l-purple-500",
  };

  const iconStyles = {
    blue: "bg-[#eef2fc] text-[#0437cc]",
    green: "bg-emerald-50 text-emerald-600",
    orange: "bg-orange-50 text-[#f77704]",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <div
      className={`bg-white border border-slate-200/90 rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5 shadow-xs hover:shadow-md ${
        accentStyles[accent] || accentStyles.blue
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
          {badge}
        </span>
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-lg ${iconStyles[accent]}`}>
          {icon}
        </div>
      </div>
      <div className="mt-3">
        <p className="text-xs font-semibold text-slate-500">{title}</p>
        <h3 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">{value}</h3>
      </div>
    </div>
  );
};

const SectionBlock = ({ title, children, icon }) => {
  return (
    <div className="border border-slate-200 bg-white rounded-2xl p-5 space-y-4 shadow-xs">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <div className="p-1.5 rounded-lg bg-slate-100">{icon}</div>
        <h3 className="font-bold text-sm text-slate-800 tracking-wide">{title}</h3>
      </div>
      <div className="grid grid-cols-2 gap-3.5">{children}</div>
    </div>
  );
};

const MiniStat = ({ title, value, highlight, isWarning }) => {
  const getHighlightClass = () => {
    if (isWarning) return "text-amber-600";
    if (highlight === "emerald") return "text-emerald-600 font-black";
    if (highlight === "rose") return "text-rose-600 font-black";
    return "text-slate-900";
  };

  return (
    <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3.5 space-y-1">
      <p className="text-[11px] font-semibold text-slate-500 tracking-wide">{title}</p>
      <h4 className={`text-base font-bold tracking-tight ${getHighlightClass()}`}>
        {value}
      </h4>
    </div>
  );
};