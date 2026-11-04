import React, { useState, useEffect } from 'react';
import { FiEdit2, FiPlus, FiDollarSign, FiPercent, FiUsers, FiArrowUpCircle } from "react-icons/fi";
import axios from "axios";

const API = `${import.meta.env.VITE_APP_BASE_URL}/api/plans`;

const PlansManagement = () => {
    const [plansData, setPlansData] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('');
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [popupMessage, setPopupMessage] = useState('');
    const [showPopup, setShowPopup] = useState(false);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        name: '',
        roi: '',
        directReferral: '',
        ceilingLimit: '',
        investmentRange: '',
        status: 'active'
    });

    const showPopupMessage = (message) => {
        setPopupMessage(message);
        setShowPopup(true);
        setTimeout(() => setShowPopup(false), 3000);
    };

    const fetchPlans = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const res = await axios.get(API, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPlansData(res.data);
        } catch (err) {
            console.error(err);
            showPopupMessage("Failed to fetch investment plans");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const togglePlanStatus = async (planId) => {
        try {
            const token = localStorage.getItem("token");
            const plan = plansData.find(p => p.id === planId);
            const newStatus = plan.status === 'active' ? 'inactive' : 'active';

            await axios.put(
                `${API}/${planId}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setPlansData(prev => prev.map(p =>
                p.id === planId ? { ...p, status: newStatus } : p
            ));

            showPopupMessage(`Plan "${plan.name}" changed to ${newStatus}`);
        } catch (err) {
            console.error(err);
            showPopupMessage("Status verification failed");
        }
    };

    const handleEdit = (plan) => {
        setSelectedPlan(plan);
        setFormData({
            name: plan.name,
            roi: plan.roi,
            directReferral: plan.direct_referral,
            ceilingLimit: plan.ceiling_limit,
            investmentRange: plan.investment_range,
            status: plan.status
        });
        setModalType('edit');
        setShowModal(true);
    };

    const handleCreate = () => {
        setFormData({
            name: '',
            roi: '',
            directReferral: '',
            ceilingLimit: '',
            investmentRange: '',
            status: 'active'
        });
        setModalType('create');
        setShowModal(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        try {
            const token = localStorage.getItem("token");
            const payload = {
                name: formData.name,
                roi: formData.roi,
                directReferral: formData.directReferral,
                ceilingLimit: formData.ceilingLimit,
                investmentRange: formData.investmentRange,
                status: formData.status
            };

            if (modalType === 'create') {
                await axios.post(API, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                showPopupMessage('New asset plan compiled successfully');
            } else if (modalType === 'edit' && selectedPlan) {
                await axios.put(`${API}/${selectedPlan.id}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                showPopupMessage(`Plan details updated successfully`);
            }

            setShowModal(false);
            setSelectedPlan(null);
            fetchPlans();
        } catch (err) {
            console.error(err);
            showPopupMessage("Failed to save operational changes");
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto space-y-8 text-slate-800 select-none bg-white/90 p-6 rounded-2xl shadow-md">
            
            {/* Header Profile Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">Plans Management</h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">Configure staking tiers, yield ratios, direct metrics, and transaction caps</p>
                </div>
                <button 
                    onClick={handleCreate}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl bg-[#0437cc] hover:bg-[#3b52d4] text-white shadow-xs active:scale-95 transition duration-150 cursor-pointer"
                >
                    <FiPlus className="text-sm" /> Create New Plan
                </button>
            </div>

            {/* Main Investment Tiers Grid System */}
            {loading ? (
                <div className="py-24 text-center text-slate-400 bg-white border border-slate-200 rounded-2xl">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-4 border-[#0437cc] border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm font-medium tracking-wide">Loading asset parameters...</span>
                    </div>
                </div>
            ) : plansData.length === 0 ? (
                <div className="py-24 text-center text-slate-400 bg-white border border-slate-200 rounded-2xl">
                    No active matrix subscription packages configured.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                    {plansData.map((plan) => (
                        <div 
                            key={plan.id} 
                            className={`relative group bg-white border rounded-2xl p-6 shadow-xs hover:shadow-md flex flex-col justify-between transition-all duration-300 hover:-translate-y-0.5 ${
                                plan.status === 'active' 
                                ? 'border-slate-200 hover:border-[#0437cc]/40' 
                                : 'border-slate-200/60 opacity-60 hover:opacity-80'
                            }`}
                        >
                            <div>
                                {/* Card Header Info */}
                                <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 tracking-wide group-hover:text-[#0437cc] transition">
                                            {plan.name}
                                        </h3>
                                        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-0.5 block">
                                            Package Module
                                        </span>
                                    </div>
                                    <button 
                                        onClick={() => handleEdit(plan)}
                                        className="p-2 text-slate-400 hover:text-slate-800 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition duration-150 cursor-pointer"
                                    >
                                        <FiEdit2 className="text-xs" />
                                    </button>
                                </div>

                                {/* Details Attributes Grid Layout */}
                                <div className="py-5 space-y-4">
                                    {/* ROI Row Data */}
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <FiPercent className="text-xs text-[#0437cc]" />
                                            <span>Return on Inv. (ROI)</span>
                                        </div>
                                        <span className="font-bold text-emerald-600 tracking-wide bg-emerald-50 px-2.5 py-0.5 rounded-md text-xs border border-emerald-200">
                                            {plan.roi}
                                        </span>
                                    </div>

                                    {/* Referral Metric Row Data */}
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <FiUsers className="text-xs text-[#3b52d4]" />
                                            <span>Direct Referral</span>
                                        </div>
                                        <span className="font-semibold text-slate-800">{plan.direct_referral}</span>
                                    </div>

                                    {/* Ceiling Limit Row Data */}
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <FiArrowUpCircle className="text-xs text-amber-500" />
                                            <span>Ceiling Cap Limit</span>
                                        </div>
                                        <span className="font-mono text-xs font-bold text-slate-700">{plan.ceiling_limit}</span>
                                    </div>

                                    {/* Investment Value Interval Range */}
                                    <div className="flex flex-col gap-1.5 pt-1.5">
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <FiDollarSign className="text-xs text-emerald-600" />
                                            <span>Allowed Investment Range</span>
                                        </div>
                                        <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#0437cc] text-center tracking-wide">
                                            {plan.investment_range}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Operating Status Action Controls Row */}
                            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                                <span className={`font-bold tracking-wider uppercase text-[10px] ${plan.status === 'active' ? 'text-[#0437cc]' : 'text-slate-400'}`}>
                                    {plan.status} System Node
                                </span>
                                
                                <button
                                    onClick={() => togglePlanStatus(plan.id)}
                                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 outline-none focus:outline-none cursor-pointer ${
                                        plan.status === 'active' ? 'bg-[#0437cc]' : 'bg-slate-300 border border-slate-300'
                                    }`}
                                >
                                    <span 
                                        className={`absolute top-[3px] left-[3px] bg-white w-4 h-4 rounded-full shadow-xs transition-transform duration-200 ${
                                            plan.status === 'active' ? 'translate-x-5' : 'translate-x-0'
                                        }`}
                                    />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* DYNAMIC CARD CONTROL/EDIT SPECIFICATION MODAL CONTAINER */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
                    <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
                        
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
                            <h3 className="text-sm font-bold text-slate-900 tracking-wide">
                                {modalType === 'create' ? 'Assemble Asset Plan Structure' : 'Modify Core Package Parameters'}
                            </h3>
                            <button 
                                onClick={() => setShowModal(false)} 
                                className="text-slate-400 hover:text-slate-700 transition text-base focus:outline-none cursor-pointer"
                            >
                                ×
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Plan Metric Name</label>
                                <input 
                                    name="name" 
                                    value={formData.name} 
                                    onChange={handleInputChange} 
                                    placeholder="e.g., Titanium Executive Tier"
                                    className="bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0437cc] focus:bg-white transition"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Yield Ratio (ROI)</label>
                                    <input 
                                        name="roi" 
                                        value={formData.roi} 
                                        onChange={handleInputChange}
                                        placeholder="e.g., 2.5% Daily"
                                        className="bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0437cc] focus:bg-white transition"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Direct Referral %</label>
                                    <input 
                                        name="directReferral" 
                                        value={formData.directReferral} 
                                        onChange={handleInputChange}
                                        placeholder="e.g., 10%"
                                        className="bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0437cc] focus:bg-white transition"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Ceiling Value Threshold Cap</label>
                                <input 
                                    name="ceilingLimit" 
                                    value={formData.ceilingLimit} 
                                    onChange={handleInputChange}
                                    placeholder="e.g., $5,000 Max"
                                    className="bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0437cc] focus:bg-white transition"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Staking Investment Range Interval</label>
                                <input 
                                    name="investmentRange" 
                                    value={formData.investmentRange} 
                                    onChange={handleInputChange}
                                    placeholder="e.g., $100 - $2000"
                                    className="bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0437cc] focus:bg-white transition"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Initial System Status State</label>
                                <select 
                                    name="status" 
                                    value={formData.status} 
                                    onChange={handleInputChange}
                                    className="bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0437cc] focus:bg-white transition cursor-pointer"
                                >
                                    <option value="active">Active System Node</option>
                                    <option value="inactive">Inactive System Node</option>
                                </select>
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
                            <button 
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 transition active:scale-95 cursor-pointer"
                            >
                                Cancel Actions
                            </button>
                            <button 
                                onClick={handleSubmit}
                                className="px-5 py-2 text-xs font-bold rounded-xl bg-[#0437cc] hover:bg-[#3b52d4] text-white shadow-xs transition active:scale-95 cursor-pointer"
                            >
                                {modalType === 'create' ? 'Compile Package Node' : 'Commit Configuration Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* TOAST POPUP DISPLAY LOGIC */}
            {showPopup && (
                <div className="fixed bottom-6 right-6 z-[200] flex items-center gap-3 bg-slate-900 text-white border border-slate-800 shadow-xl px-5 py-3.5 rounded-2xl animate-fade-in-up">
                    <div className="w-5 h-5 rounded-full bg-[#0437cc] text-white flex items-center justify-center text-xs font-bold">
                        i
                    </div>
                    <span className="text-xs font-semibold tracking-wide text-slate-100">
                        {popupMessage}
                    </span>
                </div>
            )}
        </div>
    );
};

export default PlansManagement;