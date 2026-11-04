import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const API = `${import.meta.env.VITE_APP_BASE_URL}/api/users`;

const SupportTicket = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);
    const [ticketsData, setTicketsData] = useState([]);

    // ================= FETCH =================
    const fetchTickets = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${API}/all-tickets`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTicketsData(res.data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load tickets");
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    // ================= FILTER =================
    const filteredTickets = ticketsData.filter((t) =>
        (t.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.ticket_id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.short_desc || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    // ================= PAGINATION =================
    const totalPages = Math.ceil(filteredTickets.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;

    const currentTickets = filteredTickets.slice(
        startIndex,
        startIndex + rowsPerPage
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, rowsPerPage]);

    // ================= UPDATE STATUS =================
    const updateStatus = async (id, status) => {
        try {
            const token = localStorage.getItem("token");
            await axios.put(`${API}/tickets/${id}/status`, { status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Status updated");
            fetchTickets(); 
        } catch (err) {
            toast.error("Failed to update status");
        }
    };

    const isTicketActive = (status) => {
        if (!status) return false;
        return status.toLowerCase() !== "resolved";
    };

    return (
        <div className="w-full max-w-7xl mx-auto space-y-8 text-slate-800 select-none bg-white/90 p-6 rounded-2xl shadow-md">
            
            {/* Top Header Panel Card */}
            <div className="bg-white border border-slate-200/90 p-6 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2.5">
                        <span className="text-xl">🎫</span>
                        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                            Support Ticket Configuration
                        </h2>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                        Configure user-submitted support tickets, monitor response timelines, and update resolution statuses.
                    </p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    {/* Search Input */}
                    <div className="relative w-full sm:w-72 lg:w-80">
                        <input
                            type="text"
                            placeholder="Search by user, ID or description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-xl py-2.5 pl-4 pr-10 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0437cc] shadow-xs transition duration-200"
                        />
                        <span className="absolute right-3.5 top-3 text-slate-400 text-sm">🔍</span>
                    </div>
                    
                    {/* Primary Action Button */}
                    <button className="w-full sm:w-auto bg-[#0437cc] hover:bg-blue-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer active:scale-95 flex items-center justify-center gap-1.5 shrink-0">
                        <span className="text-sm font-bold">+</span> Add Ticket
                    </button>
                </div>
            </div>

            {/* Primary Table Ledger Card */}
            <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
                <div className="border-b border-slate-200 bg-slate-50/70 px-6 py-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Active Support Queue
                    </h3>
                </div>

                {/* Table Layout */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                                <th className="py-4 px-6 w-16 text-center">S.No</th>
                                <th className="py-4 px-4">User</th>
                                <th className="py-4 px-4">Ticket ID</th>
                                <th className="py-4 px-4">Title / Topic</th>
                                <th className="py-4 px-4">Description</th>
                                <th className="py-4 px-4 text-center">Is Active</th>
                                <th className="py-4 px-4">Created At</th>
                                <th className="py-4 px-4 text-right pr-6">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                            {currentTickets.length > 0 ? (
                                currentTickets.map((t, i) => (
                                    <tr key={t.id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="py-4 px-6 text-xs text-slate-500 font-mono text-center font-medium">
                                            {String(startIndex + i + 1).padStart(2, '0')}
                                        </td>
                                        
                                        <td className="py-4 px-4 text-xs font-bold text-slate-900">
                                            {t.username || "N/A"}
                                        </td>
                                        
                                        <td className="py-4 px-4 text-xs font-mono text-[#0437cc] font-bold">
                                            #{t.ticket_id || "000000"}
                                        </td>
                                        
                                        <td className="py-4 px-4 text-xs text-slate-800 font-semibold max-w-[160px] truncate">
                                            {t.short_desc || "No Title"}
                                        </td>
                                        
                                        <td className="py-4 px-4 text-xs text-slate-500 font-medium max-w-[240px] truncate">
                                            {t.short_desc || "No Description Provided"}
                                        </td>

                                        {/* Status Toggle Switch */}
                                        <td className="py-4 px-4 text-center">
                                            <label className="inline-flex items-center cursor-pointer relative group">
                                                <input 
                                                    type="checkbox" 
                                                    checked={isTicketActive(t.status)}
                                                    onChange={() => updateStatus(t.id, isTicketActive(t.status) ? "resolved" : "open")}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0437cc]"></div>
                                            </label>
                                        </td>

                                        <td className="py-4 px-4 text-xs text-slate-500 font-mono font-medium">
                                            {t.created_at ? new Date(t.created_at).toISOString().replace('T', ' ').substring(0, 19) : "Recent"}
                                        </td>

                                        <td className="py-4 px-4 text-right pr-6">
                                            <div className="flex items-center justify-end gap-2">
                                                <select
                                                    value={t.status || "open"}
                                                    onChange={(e) => updateStatus(t.id, e.target.value)}
                                                    className={`text-[11px] font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer outline-none capitalize ${
                                                        t.status?.toLowerCase() === "resolved" 
                                                            ? "bg-slate-100 border-slate-300 text-slate-600"
                                                            : t.status?.toLowerCase() === "in progress"
                                                            ? "bg-amber-50 border-amber-200 text-amber-700"
                                                            : "bg-blue-50 border-blue-200 text-[#0437cc]"
                                                    }`}
                                                >
                                                    <option value="open" className="bg-white text-slate-800">Open</option>
                                                    <option value="in progress" className="bg-white text-slate-800">In Progress</option>
                                                    <option value="resolved" className="bg-white text-slate-800">Resolved</option>
                                                </select>
                                                
                                                <button className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer">
                                                    ⋮
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="py-12 text-center text-xs text-slate-500 font-medium bg-white">
                                        No support tickets matched your current layout criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                <div className="p-5 bg-slate-50/50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-500">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2.5">
                            <span>Rows:</span>
                            <select
                                value={rowsPerPage}
                                onChange={(e) => setRowsPerPage(Number(e.target.value))}
                                className="bg-white text-slate-700 border border-slate-300 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-[#0437cc] cursor-pointer"
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                            </select>
                        </div>

                        <span className="font-mono text-slate-500">
                            {filteredTickets.length > 0 ? startIndex + 1 : 0} -{" "}
                            {Math.min(startIndex + rowsPerPage, filteredTickets.length)} of{" "}
                            {filteredTickets.length}
                        </span>
                    </div>

                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                            disabled={currentPage === 1}
                            className="h-8 px-3 inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none active:scale-95 cursor-pointer"
                        >
                            Prev
                        </button>

                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`h-8 w-8 inline-flex items-center justify-center rounded-lg text-xs font-bold transition active:scale-95 cursor-pointer ${
                                    currentPage === i + 1
                                        ? "bg-[#0437cc] text-white shadow-xs"
                                        : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                                }`}
                            >
                                {i + 1}
                            </button>
                        ))}

                        <button
                            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="h-8 px-3 inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none active:scale-95 cursor-pointer"
                        >
                            Next
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SupportTicket;