import React, { useEffect, useMemo, useState } from "react";
import API from "../utils/api";

const formatMoney = (value) => {
  const num = Number(value || 0);
  return `₹${num.toLocaleString("en-IN")}`;
};

const getInitials = (name = "") => {
  const parts = name.trim().split(" ").filter(Boolean);
  if (!parts.length) return "U";
  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

const DetailRow = ({ label, value }) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-2xs">
    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0437cc]">
      {label}
    </p>
    <p className="mt-1 break-words text-sm font-semibold text-slate-900">{value}</p>
  </div>
);

const StatCard = ({ label, value, accent }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
    <div className="flex items-center justify-between gap-6">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
          {label}
        </p>
        <p className="mt-1 text-3xl font-black tracking-tight text-slate-900">{value}</p>
      </div>
      <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${accent} opacity-90 shadow-sm`} />
    </div>
  </div>
);

const StatusBadge = ({ hasImage }) => (
  <span
    className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-[11px] font-bold tracking-wide ${
      hasImage
        ? "border-emerald-200 bg-emerald-50 text-emerald-600"
        : "border-amber-200 bg-amber-50 text-amber-700"
    }`}
  >
    <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${hasImage ? "bg-emerald-500" : "bg-amber-500"}`} />
    {hasImage ? "Verified Asset" : "Pending Action"}
  </span>
);

const ModalShell = ({ title, subtitle, onClose, children, maxWidth = "max-w-6xl" }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
      <button
        type="button"
        aria-label="Close modal"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />
      <div
        className={`relative w-full ${maxWidth} overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl`}
      >
        <div className="relative flex max-h-[90vh] flex-col">
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-5 bg-slate-50">
            <div className="min-w-0">
              <h2 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                {title}
              </h2>
              {subtitle ? (
                <p className="mt-1 text-xs text-slate-500 font-medium">
                  {subtitle}
                </p>
              ) : null}
            </div>

            <button
              onClick={onClose}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-slate-300 bg-white text-xl font-light text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 cursor-pointer"
              aria-label="Close modal"
              type="button"
            >
              ×
            </button>
          </div>

          <div
            className="
              relative overflow-y-auto p-6
              [scrollbar-width:none]
              [-ms-overflow-style:none]
            "
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

const BannerImage = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState("");
  const [uploadingId, setUploadingId] = useState(null);

  const [viewUser, setViewUser] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await API.get("/banner-slides/admin/approved-users");
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Banner users fetch error:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!selectedFile) {
      setUploadPreview("");
      return;
    }

    const url = URL.createObjectURL(selectedFile);
    setUploadPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  useEffect(() => {
    document.body.style.overflow = uploadModalOpen || viewModalOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [uploadModalOpen, viewModalOpen]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        if (uploadModalOpen) closeUploadModal();
        if (viewModalOpen) closeViewModal();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [uploadModalOpen, viewModalOpen]);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 3000);
    return () => clearTimeout(timer);
  }, [message]);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;

    return users.filter((user) => {
      return (
        user.username?.toLowerCase().includes(q) ||
        user.userCode?.toLowerCase().includes(q) ||
        user.phone?.toLowerCase().includes(q) ||
        user.reward?.toLowerCase().includes(q)
      );
    });
  }, [users, search]);

  const openUploadModal = (user) => {
    setSelectedUser(user);
    setSelectedFile(null);
    setUploadPreview("");
    setUploadModalOpen(true);
  };

  const closeUploadModal = () => {
    setUploadModalOpen(false);
    setSelectedUser(null);
    setSelectedFile(null);
    setUploadPreview("");
  };

  const openViewModal = (user) => {
    setViewUser(user);
    setViewModalOpen(true);
  };

  const closeViewModal = () => {
    setViewModalOpen(false);
    setViewUser(null);
  };

  const handleUpload = async () => {
    if (!selectedUser) return;

    if (!selectedFile) {
      setMessage("Please select an image asset.");
      return;
    }

    try {
      setUploadingId(selectedUser.userId);

      const formData = new FormData();
      formData.append("userId", selectedUser.userId);
      formData.append("username", selectedUser.username || "");
      formData.append("phone", selectedUser.phone || "");
      formData.append("userCode", selectedUser.userCode || "");
      formData.append("reward", selectedUser.reward || "");
      formData.append("target_amount", selectedUser.target_amount || 0);
      formData.append("progress", selectedUser.progress || 0);
      formData.append("achievedDate", selectedUser.achieved_date || "");
      formData.append("sort_order", selectedUser.sort_order || 0);
      formData.append("is_active", "true");
      formData.append("image", selectedFile);

      await API.post("/banner-slides/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage("Asset database synchronized successfully.");
      closeUploadModal();
      await fetchUsers();
    } catch (error) {
      console.error("Banner upload error:", error);
      setMessage(error?.response?.data?.message || "Synchronization failed.");
    } finally {
      setUploadingId(null);
    }
  };

  const handleBackdropClose = (e) => {
    if (e.target === e.currentTarget) {
      if (uploadModalOpen) closeUploadModal();
      if (viewModalOpen) closeViewModal();
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 text-slate-800 select-none bg-white/90 p-6 rounded-2xl shadow-md">
      
      {/* Header Block */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <span className="inline-flex rounded-md border border-blue-200 bg-blue-50 px-3 py-1 text-[10px] font-bold tracking-[0.2em] text-[#0437cc]">
              SYSTEM CONSOLE
            </span>
            <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Premium Reward Inventory
            </h1>
            <p className="mt-2 max-w-xl text-xs sm:text-sm leading-relaxed text-slate-500 font-medium">
              Manage, audit, and provision executive asset banners for verified accounts.
            </p>
          </div>

          <div className="flex gap-4">
            <StatCard
              label="Premium Profiles"
              value={users.length}
              accent="from-[#0437cc] to-blue-700"
            />
          </div>
        </div>
      </div>

      {/* Search Engine Layer */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="relative">
          <input
            type="text"
            placeholder="Filter by account signature, premium asset target, or phone identifier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0437cc] focus:ring-1 focus:ring-[#0437cc]"
          />
          <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400 text-lg">
            &reg;
          </div>
        </div>
      </div>

      {/* Notification Stream */}
      {message ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-700 shadow-xs">
          {message}
        </div>
      ) : null}

      {/* Grid System */}
      <div>
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-xs font-bold tracking-widest text-slate-500 shadow-xs">
            SYNCHRONIZING REWARD REGISTRY...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-xs font-bold tracking-widest text-slate-500 shadow-xs">
            NO COMPLIANT RECORDS FOUND
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredUsers.map((user) => {
              const hasImage = Boolean(user.image_url);

              return (
                <div
                  key={user.userId}
                  className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all duration-300 hover:border-[#0437cc]/40 hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-[#0437cc] border border-slate-200">
                          {getInitials(user.username)}
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-bold text-slate-900 group-hover:text-[#0437cc] transition-colors">
                            {user.username || "-"}
                          </h3>
                          <p className="truncate text-[11px] font-mono tracking-wider text-slate-500 font-bold">
                            {user.userCode || "-"}
                          </p>
                        </div>
                      </div>
                      <StatusBadge hasImage={hasImage} />
                    </div>

                    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#0437cc]">
                        Allocated Luxury Tier
                      </p>
                      <p className="mt-1 text-xs font-bold text-slate-800 truncate">
                        {user.reward || "-"}
                      </p>
                    </div>

                    <div className="mt-3 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                        <span className="text-slate-500 text-[11px] font-medium">Phone Target</span>
                        <span className="truncate font-semibold text-slate-800">{user.phone || "-"}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                        <span className="text-slate-500 text-[11px] font-medium">Escrow Target</span>
                        <span className="font-bold text-slate-800">{formatMoney(user.target_amount)}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                        <span className="text-slate-500 text-[11px] font-medium">Cleared Progress</span>
                        <span className="font-bold text-emerald-600">{formatMoney(user.progress)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex gap-2">
                    <button
                      onClick={() => openUploadModal(user)}
                      className="flex-1 rounded-xl bg-[#0437cc] hover:bg-blue-800 px-3 py-2 text-xs font-bold text-white shadow-xs transition active:scale-[0.98] cursor-pointer"
                      type="button"
                    >
                      {hasImage ? "Replace Asset" : "Provision Asset"}
                    </button>

                    {hasImage && (
                      <button
                        onClick={() => openViewModal(user)}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100 active:scale-[0.98] cursor-pointer"
                        type="button"
                      >
                        Audit
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upload Interface Modal */}
      {uploadModalOpen && selectedUser && (
        <div onMouseDown={handleBackdropClose}>
          <ModalShell
            title="Provision Asset Banner"
            subtitle="Securely bind a premium wide-aspect graphic to this audited profile ledger."
            onClose={closeUploadModal}
            maxWidth="max-w-5xl"
          >
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2.5">
                  <DetailRow label="Client Name" value={selectedUser.username || "-"} />
                  <DetailRow label="System Hash" value={selectedUser.userCode || "-"} />
                  <DetailRow label="Target Limit" value={formatMoney(selectedUser.target_amount)} />
                  <DetailRow label="Current Standing" value={formatMoney(selectedUser.progress)} />
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
                    File System Input
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="mt-3 block w-full cursor-pointer rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-600 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-[#0437cc] file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white hover:file:bg-blue-800"
                  />
                </div>

                <button
                  onClick={handleUpload}
                  disabled={uploadingId === selectedUser.userId}
                  className="w-full rounded-xl bg-[#0437cc] hover:bg-blue-800 py-2.5 text-xs font-bold text-white transition disabled:opacity-40 shadow-xs cursor-pointer"
                  type="button"
                >
                  {uploadingId === selectedUser.userId ? "Synchronizing Asset..." : "Commit Asset Changes"}
                </button>
              </div>

              <div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 h-full flex flex-col justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600 mb-3">
                    Active Render Canvas
                  </p>
                  <div className="flex-1 min-h-[220px] rounded-xl border border-slate-200 bg-slate-900 overflow-hidden flex items-center justify-center">
                    {uploadPreview ? (
                      <img src={uploadPreview} alt="Staging area" className="h-full w-full object-cover" />
                    ) : selectedUser.image_url ? (
                      <img src={selectedUser.image_url} alt="Current entry" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-xs text-slate-400 italic">No asset staged for rendering</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </ModalShell>
        </div>
      )}

      {/* Audit/View Modal */}
      {viewModalOpen && viewUser && (
        <div onMouseDown={handleBackdropClose}>
          <ModalShell
            title="Premium Asset Preview"
            subtitle="System telemetry and raw visual verification metrics."
            onClose={closeViewModal}
            maxWidth="max-w-5xl"
          >
            <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
              <div className="rounded-xl border border-slate-200 bg-slate-900 overflow-hidden flex items-center justify-center p-2 min-h-[300px]">
                {viewUser.image_url ? (
                  <img
                    src={viewUser.image_url}
                    alt="Audited live asset"
                    className="max-h-[450px] w-full rounded-lg object-contain bg-slate-950"
                  />
                ) : (
                  <span className="text-xs text-slate-400">Asset pointer resolved to null</span>
                )}
              </div>

              <div className="space-y-4 flex flex-col justify-between">
                <div className="space-y-2.5">
                  <DetailRow label="Profile Owner" value={viewUser.username || "-"} />
                  <DetailRow label="Assigned Tier Reward" value={viewUser.reward || "-"} />
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">
                      Resolved Asset Link
                    </p>
                    <p className="mt-1 break-all font-mono text-[11px] text-[#0437cc] font-semibold select-all">
                      {viewUser.image_url || "-"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={closeViewModal}
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100 cursor-pointer"
                  type="button"
                >
                  Dismiss Telemetry
                </button>
              </div>
            </div>
          </ModalShell>
        </div>
      )}
    </div>
  );
};

export default BannerImage;