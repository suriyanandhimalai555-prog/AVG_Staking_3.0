import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";

/**
 * LevelUnlockConfig.jsx
 */

const API = `${import.meta.env.VITE_APP_BASE_URL}/api/level-unlock`;

const LevelUnlockConfig = () => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeDropdownId, setActiveDropdownId] = useState(null);

  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  const [editForm, setEditForm] = useState({
    level: "",
    directStaking: "",
  });

  const [addForm, setAddForm] = useState({
    level: "",
    directStaking: "",
  });

  const getAuthConfig = () => {
    const token = localStorage.getItem("token");
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  };

  const showPopupMessage = (msg) => {
    setPopupMessage(msg);
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 2500);
  };

  const fetchData = async () => {
    try {
      const res = await axios.get(API, getAuthConfig());

      const formatted = res.data.map((item, index) => ({
        sno: index + 1,
        id: item.id,
        level: item.level,
        directStaking: `$${item.direct_staking}`,
        status: item.status,
        createdAt: item.created_at,
      }));

      setData(formatted);
    } catch (err) {
      console.error(err);
      showPopupMessage("Failed to fetch data");
    }
  };

  useEffect(() => {
    fetchData();

    const closeDropdown = () => setActiveDropdownId(null);
    window.addEventListener("click", closeDropdown);
    return () => window.removeEventListener("click", closeDropdown);
  }, []);

  const toggleStatus = async (item) => {
    try {
      await axios.put(`${API}/${item.id}/toggle`, {}, getAuthConfig());
      fetchData();
      showPopupMessage("Status updated");
    } catch (err) {
      console.error(err);
    }
  };

  const handleView = (item) => {
    setSelectedItem(item);
    setModalType("view");
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setEditForm({
      level: item.level,
      directStaking: item.directStaking.replace("$", ""),
    });
    setModalType("edit");
    setShowModal(true);
  };

  const handleDelete = (item) => {
    setSelectedItem(item);
    setModalType("delete");
    setShowModal(true);
  };

  const openAdd = () => {
    setAddForm({ level: "", directStaking: "" });
    setModalType("add");
    setShowModal(true);
  };

  const confirmModal = async () => {
    try {
      if (modalType === "delete") {
        await axios.delete(`${API}/${selectedItem.id}`, getAuthConfig());
        showPopupMessage("Deleted successfully");
      }

      if (modalType === "edit") {
        await axios.put(
          `${API}/${selectedItem.id}`,
          {
            level: Number(editForm.level),
            direct_staking: editForm.directStaking,
          },
          getAuthConfig()
        );
        showPopupMessage("Updated successfully");
      }

      if (modalType === "add") {
        await axios.post(
          API,
          {
            level: Number(addForm.level),
            direct_staking: addForm.directStaking,
          },
          getAuthConfig()
        );
        showPopupMessage("Added successfully");
      }

      fetchData();
      setShowModal(false);
      setSelectedItem(null);
    } catch (err) {
      console.error(err);
      showPopupMessage("Action failed");
    }
  };

  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return data.filter(
      (r) =>
        String(r.level).includes(q) ||
        r.directStaking.toLowerCase().includes(q)
    );
  }, [searchTerm, data]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const indexOfLastItem = currentPage * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;
  const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 text-slate-800 select-none bg-white/90 p-6 rounded-2xl shadow-md">
      
      {/* Top Header Panel Card */}
      <div className="bg-white border border-slate-200/90 p-6 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🔓</span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Level Unlock Configuration
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
            Manage level unlocking conditions and minimum direct staking targets
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72 lg:w-80">
            <input
              type="text"
              placeholder="Search by level or staking..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0437cc] shadow-xs transition duration-200"
            />
          </div>

          <button 
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-[#0437cc] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-blue-800 active:scale-95 cursor-pointer"
            onClick={openAdd}
          >
            + Add Level Config
          </button>
        </div>
      </div>

      {/* Primary Table Ledger Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50/70 px-6 py-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Deposit Inflow Queue
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                <th className="px-6 py-4 w-16 text-center">Index</th>
                <th className="px-6 py-4">Level</th>
                <th className="px-6 py-4">Direct Staking</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created At</th>
                <th className="px-6 py-4 text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {currentItems.map((item, index) => (
                <tr key={item.id} className="hover:bg-slate-50/85 transition-colors">
                  <td className="px-6 py-4.5 font-mono text-xs text-slate-500 text-center font-medium">
                    {String(indexOfFirstItem + index + 1).padStart(2, '0')}
                  </td>
                  <td className="px-6 py-4.5 font-bold text-slate-900">
                    Level {item.level}
                  </td>
                  <td className="px-6 py-4.5 font-mono font-bold text-emerald-600">
                    {item.directStaking}
                  </td>
                  <td className="px-6 py-4.5">
                    <button
                      onClick={() => toggleStatus(item)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        item.status ? "bg-[#0437cc]" : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          item.status ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-6 py-4.5 font-mono text-xs text-slate-500 font-medium">
                    {item.createdAt || "-"}
                  </td>
                  <td className="px-6 py-4.5 text-right text-slate-600">
                    <div className="relative inline-block text-left" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => setActiveDropdownId(activeDropdownId === item.id ? null : item.id)}
                        className="rounded-lg p-1.5 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer"
                      >
                        <span className="text-lg leading-none block px-1">⋮</span>
                      </button>

                      {activeDropdownId === item.id && (
                        <div className="absolute right-0 mt-2 w-36 origin-top-right rounded-xl border border-slate-200 bg-white p-1 shadow-xl z-20">
                          <button
                            onClick={() => { handleView(item); setActiveDropdownId(null); }}
                            className="flex w-full items-center px-3 py-2 text-xs font-semibold rounded-lg text-slate-700 hover:bg-slate-100 cursor-pointer"
                          >
                            👁️ <span className="ml-2">View</span>
                          </button>
                          <button
                            onClick={() => { handleEdit(item); setActiveDropdownId(null); }}
                            className="flex w-full items-center px-3 py-2 text-xs font-semibold rounded-lg text-slate-700 hover:bg-slate-100 cursor-pointer"
                          >
                            ✏️ <span className="ml-2">Edit</span>
                          </button>
                          <button
                            onClick={() => { handleDelete(item); setActiveDropdownId(null); }}
                            className="flex w-full items-center px-3 py-2 text-xs font-semibold rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
                          >
                            🗑️ <span className="ml-2">Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {currentItems.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-sm text-slate-500 font-medium">
                    No configurations found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Dynamic Pagination & Info Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 bg-slate-50/50 px-6 py-4 text-xs font-medium text-slate-500">
          <div className="flex items-center gap-2.5">
            <span>Rows:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-slate-700 outline-none focus:ring-1 focus:ring-[#0437cc] cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
            </select>
            <span className="ml-2 font-mono">
              {filtered.length === 0
                ? "0-0 of 0"
                : `${indexOfFirstItem + 1}-${Math.min(indexOfLastItem, filtered.length)} of ${filtered.length}`}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-8 px-3 inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none active:scale-95 cursor-pointer"
            >
              Previous
            </button>

            <div className="flex items-center gap-1">
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
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-8 px-3 inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none active:scale-95 cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Styled Configuration Modals */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div 
            className="absolute inset-0"
            onClick={() => { setShowModal(false); setSelectedItem(null); }}
          />
          
          <div className="relative w-full max-w-md transform rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl transition-all">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                {modalType === "add" && "Add Configuration"}
                {modalType === "edit" && "Edit Configuration"}
                {modalType === "delete" && "Confirm Delete"}
                {modalType === "view" && "Details"}
              </h3>
              <button
                className="text-slate-400 hover:text-slate-700 text-xl font-medium transition cursor-pointer"
                onClick={() => { setShowModal(false); setSelectedItem(null); }}
              >
                &times;
              </button>
            </div>

            <div className="mt-4">
              {modalType === "view" && selectedItem && (
                <div className="space-y-3 rounded-xl bg-slate-50 border border-slate-200 p-4 text-sm font-mono">
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500 font-sans font-semibold text-xs uppercase">Level:</span>
                    <span className="text-slate-900 font-bold">Level {selectedItem.level}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500 font-sans font-semibold text-xs uppercase">Direct Staking:</span>
                    <span className="text-emerald-600 font-bold">{selectedItem.directStaking}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500 font-sans font-semibold text-xs uppercase">Status:</span>
                    <span className={selectedItem.status ? "text-[#0437cc] font-bold" : "text-slate-400 font-bold"}>
                      {selectedItem.status ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-500 font-sans font-semibold text-xs uppercase">Created At:</span>
                    <span className="text-slate-700 text-xs font-semibold">{selectedItem.createdAt || "-"}</span>
                  </div>
                </div>
              )}

              {modalType === "add" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Level
                    </label>
                    <input
                      type="number"
                      placeholder="Enter level number"
                      value={addForm.level}
                      onChange={(e) => setAddForm({ ...addForm, level: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:ring-1 focus:ring-[#0437cc]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Direct Staking Requirement ($)
                    </label>
                    <input
                      type="text"
                      placeholder="Enter amount target"
                      value={addForm.directStaking}
                      onChange={(e) => setAddForm({ ...addForm, directStaking: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:ring-1 focus:ring-[#0437cc]"
                    />
                  </div>
                </div>
              )}

              {modalType === "edit" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Level
                    </label>
                    <input
                      type="number"
                      value={editForm.level}
                      onChange={(e) => setEditForm({ ...editForm, level: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:ring-1 focus:ring-[#0437cc]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Direct Staking Requirement ($)
                    </label>
                    <input
                      type="text"
                      value={editForm.directStaking}
                      onChange={(e) => setEditForm({ ...editForm, directStaking: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:ring-1 focus:ring-[#0437cc]"
                    />
                  </div>
                </div>
              )}

              {modalType === "delete" && (
                <p className="text-sm text-slate-600 font-medium">
                  Are you sure you want to permanently delete this requirement metric? This action is immediate.
                </p>
              )}
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
              <button 
                onClick={() => setShowModal(false)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={confirmModal}
                className={`rounded-xl px-5 py-2 text-xs font-bold text-white shadow-xs transition active:scale-95 cursor-pointer ${
                  modalType === "delete" 
                    ? "bg-rose-600 hover:bg-rose-700" 
                    : "bg-[#0437cc] hover:bg-blue-800"
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Application Toast Notifications */}
      {showPopup && (
        <div className="fixed bottom-5 right-5 z-[100] bg-white border border-slate-200 border-l-4 border-l-[#0437cc] text-slate-800 px-5 py-3.5 rounded-xl shadow-xl flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-[#0437cc] animate-pulse" />
          <span className="text-xs font-semibold tracking-wide">{popupMessage}</span>
        </div>
      )}
    </div>
  );
};

export default LevelUnlockConfig;