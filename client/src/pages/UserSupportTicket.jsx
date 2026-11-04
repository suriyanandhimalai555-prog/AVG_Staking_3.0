import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Sidebar from "../components/user/UserSidebar";
import Topbar from "../components/user/UserTopbar";
import { 
  FiLifeBuoy, 
  FiPlus, 
  FiSearch, 
  FiX, 
  FiChevronLeft, 
  FiChevronRight, 
  FiCheckCircle, 
  FiClock 
} from "react-icons/fi";

const API = `${import.meta.env.VITE_APP_BASE_URL}/api/users`;

const UserSupportTicket = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    shortDesc: "",
    description: "",
  });

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // ================= FETCH =================
  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(`${API}/my-tickets`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setData(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");

      await axios.post(`${API}/tickets`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Support ticket created successfully 🎉");

      setShowModal(false);
      setFormData({ shortDesc: "", description: "" });
      fetchTickets();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create ticket");
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
                Support Tickets
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                Submit queries and track resolution statuses with our support team
              </p>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0437cc] hover:bg-[#032da6] text-white px-5 py-3 text-xs sm:text-sm font-bold shadow-sm transition active:scale-95 cursor-pointer self-start sm:self-auto"
            >
              <FiPlus className="text-base" /> Create Ticket
            </button>
          </div>

          {/* TABLE CONTAINER & SEARCH */}
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
            
            {/* Search Bar */}
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 text-[#0437cc]">
                  <FiLifeBuoy className="text-lg" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Ticket History</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Review your past assistance inquiries</p>
                </div>
              </div>

              <div className="relative w-full sm:w-72">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <FiSearch className="text-sm" />
                </span>
                <input
                  type="text"
                  placeholder="Search tickets..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
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
                    <th className="py-3.5 px-4">Ticket ID</th>
                    <th className="py-3.5 px-4">Short Description</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 sm:px-6">Created At</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-slate-500 font-medium">
                        Loading tickets...
                      </td>
                    </tr>
                  ) : data.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-slate-500 font-medium">
                        No support tickets found
                      </td>
                    </tr>
                  ) : (
                    data.map((item, i) => (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-4 px-4 sm:px-6 font-semibold text-slate-500">
                          {i + 1}
                        </td>

                        <td className="py-4 px-4 font-bold text-slate-900">
                          #{item.ticket_id}
                        </td>

                        <td className="py-4 px-4 font-semibold text-slate-700">
                          {item.short_desc}
                        </td>

                        <td className="py-4 px-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                            {item.status || "Pending"}
                          </span>
                        </td>

                        <td className="py-4 px-4 sm:px-6 text-slate-500 font-medium text-xs">
                          {new Date(item.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* FOOTER */}
            <div className="p-4 sm:p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="text-xs font-semibold text-slate-500">
                Total Tickets: {data.length}
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* CREATE TICKET MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
              <div>
                <h3 className="text-base font-bold text-slate-900">Create Support Ticket</h3>
                <p className="text-[11px] text-slate-500 font-medium">Describe your issue clearly</p>
              </div>
              <button
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition cursor-pointer"
                onClick={() => setShowModal(false)}
              >
                <FiX className="text-sm" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Short Description
                </label>
                <input
                  name="shortDesc"
                  value={formData.shortDesc}
                  onChange={handleChange}
                  placeholder="Enter short title..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-hidden focus:border-[#0437cc] transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Explain your issue in detail..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-hidden focus:border-[#0437cc] transition resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Attachment (Optional)
                </label>
                <div className="border border-dashed border-slate-300 rounded-xl p-4 text-center bg-slate-50">
                  <input type="file" disabled className="text-xs text-slate-400 w-full" />
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
                className="px-5 py-2.5 rounded-xl bg-[#0437cc] hover:bg-[#032da6] text-white text-xs sm:text-sm font-bold shadow-sm transition cursor-pointer"
                onClick={handleSubmit}
              >
                Submit Ticket
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default UserSupportTicket;