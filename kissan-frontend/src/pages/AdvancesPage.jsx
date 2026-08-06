import { useState, useEffect } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import {Banknote, CheckCircle2, Clock, AlertTriangle, TrendingUp, ChevronDown, ChevronUp, Sprout, DollarSign, Percent, Calendar,
  ArrowRight, Loader2, X
} from "lucide-react";

export default function AdvancesPage({ manage = false }) {
  const { user, role } = useAuth();
  const { t } = useLanguage();
  const [advances, setAdvances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [showOfferForm, setShowOfferForm] = useState(false);

  const [offerForm, setOfferForm] = useState({farmer_id: "", advance_type: "unconditional_credit", advance_amount: "",
    interest_rate: "", crop_type: "", expected_qty: "", commission_rate: "", pricing_mode: "fixed", due_date: "",
  });

  const [settleForm, setSettleForm] = useState({ sale_amount: "" });
  const [repayForm, setRepayForm] = useState({ amount: "" });

  useEffect(() => {
    loadAdvances();
  }, [manage]);

  async function loadAdvances() {
    setLoading(true);
    try {
      const data = await api.get("/advances");
      setAdvances(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAccept(advanceId) {
    setError(""); setSuccess("");
    try {
      await api.post(`/advances/${advanceId}/accept`);
      setSuccess("Advance accepted successfully");
      loadAdvances();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDisburse(advanceId) {
    setError(""); setSuccess("");
    try {
      await api.post(`/advances/${advanceId}/disburse`);
      setSuccess("Advance disbursed");
      loadAdvances();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleOfferSubmit(e) {
    e.preventDefault();
    setError(""); setSuccess("");
    const payload = { ...offerForm };
    if (payload.advance_type === "unconditional_credit") {
      delete payload.crop_type;
      delete payload.expected_qty;
      delete payload.commission_rate;
      delete payload.pricing_mode;
    } else {
      delete payload.interest_rate;
    }
    if (!payload.due_date) delete payload.due_date;
    try {
      await api.post("/advances/offer", payload);
      setSuccess("Advance offered successfully");
      setShowOfferForm(false);
      setOfferForm({
        farmer_id: "", advance_type: "unconditional_credit", advance_amount: "",
        interest_rate: "", crop_type: "", expected_qty: "", commission_rate: "",
        pricing_mode: "fixed", due_date: "",
      });
      loadAdvances();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSettle(advanceId) {
    setError(""); setSuccess("");
    try {
      await api.post(`/advances/${advanceId}/settle`, { sale_amount: parseFloat(settleForm.sale_amount) });
      setSuccess("Settlement recorded");
      setSettleForm({ sale_amount: "" });
      loadAdvances();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRepay(advanceId) {
    setError(""); setSuccess("");
    try {
      await api.post(`/advances/${advanceId}/repay`, { amount: parseFloat(repayForm.amount) });
      setSuccess("Repayment recorded");
      setRepayForm({ amount: "" });
      loadAdvances();
    } catch (err) {
      setError(err.message);
    }
  }

  const statusColors = {offered: "bg-stone-100 text-stone-600", accepted: "bg-blue-100 text-blue-700", disbursed: "bg-amber-100 text-amber-700",
    repaying: "bg-orange-100 text-orange-700", settled: "bg-green-100 text-green-700", extended: "bg-purple-100 text-purple-700",
  };

  const isBroker = manage && role === "broker";
  const isFarmer = !manage && role === "farmer";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">
            {isBroker ? "Manage Advances" : "My Advances"}
          </h1>
          <p className="text-stone-500">
            {isBroker ? "Offer and settle crop advances" : "Track your crop advances and repayments"}
          </p>
        </div>
        {isBroker && (
          <button
            onClick={() => setShowOfferForm(!showOfferForm)}
            className="bg-green-700 hover:bg-green-800 text-white px-5 py-2.5 rounded-lg font-medium transition flex items-center gap-2"
          >
            {showOfferForm ? <X size={16} /> : <Banknote size={16} />}
            {showOfferForm ? "Cancel" : "Offer Advance"}
          </button>
        )}
      </div>

      {success && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle2 size={18} /> {success}
        </motion.div>
      )}
      {error && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertTriangle size={18} /> {error}
        </motion.div>
      )}

      <AnimatePresence>
        {showOfferForm && isBroker && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
                <Sprout size={18} className="text-green-600" /> New Advance Offer
              </h3>
              <form onSubmit={handleOfferSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Farmer ID</label>
                  <input required type="number" value={offerForm.farmer_id} onChange={e => setOfferForm({...offerForm, farmer_id: e.target.value})}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Advance Type</label>
                  <select value={offerForm.advance_type} onChange={e => setOfferForm({...offerForm, advance_type: e.target.value})}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none">
                    <option value="unconditional_credit">Unconditional Credit</option>
                    <option value="crop_consignment">Crop Consignment</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Amount (Rs)</label>
                  <input required type="number" min="0" step="0.01" value={offerForm.advance_amount} onChange={e => setOfferForm({...offerForm, advance_amount: e.target.value})}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none" />
                </div>

                {offerForm.advance_type === "unconditional_credit" ? (
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Interest Rate</label>
                    <input required type="number" min="0" step="0.01" value={offerForm.interest_rate} onChange={e => setOfferForm({...offerForm, interest_rate: e.target.value})}
                      className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none" />
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Crop Type</label>
                      <input required value={offerForm.crop_type} onChange={e => setOfferForm({...offerForm, crop_type: e.target.value})}
                        className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Expected Qty</label>
                      <input required type="number" min="0" step="0.1" value={offerForm.expected_qty} onChange={e => setOfferForm({...offerForm, expected_qty: e.target.value})}
                        className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Commission Rate</label>
                      <input required type="number" min="0" step="0.01" value={offerForm.commission_rate} onChange={e => setOfferForm({...offerForm, commission_rate: e.target.value})}
                        className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Pricing Mode</label>
                      <select value={offerForm.pricing_mode} onChange={e => setOfferForm({...offerForm, pricing_mode: e.target.value})}
                        className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none">
                        <option value="fixed">Fixed</option>
                        <option value="market_minus_commission">Market - Commission</option>
                      </select>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Due Date</label>
                  <input type="date" value={offerForm.due_date} onChange={e => setOfferForm({...offerForm, due_date: e.target.value})}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none" />
                </div>
                <div className="md:col-span-3 flex justify-end">
                  <button type="submit" className="bg-green-700 hover:bg-green-800 text-white px-6 py-2.5 rounded-lg font-medium transition flex items-center gap-2">
                    <ArrowRight size={16} /> Send Offer
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-stone-400 flex items-center justify-center gap-2">
            <Loader2 size={20} className="animate-spin" /> Loading advances...
          </div>
        ) : advances.length === 0 ? (
          <div className="p-12 text-center text-stone-400">
            <Banknote size={40} className="mx-auto mb-3 text-stone-300" />
            <p>No advances found.</p>
            {isBroker && <p className="text-sm mt-1">Use the button above to offer your first advance.</p>}
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {advances.map(adv => (
              <div key={adv.id} className="p-5 hover:bg-stone-50 transition">
                <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandedId(expandedId === adv.id ? null : adv.id)}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      adv.status === "settled" ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-600"
                    }`}>
                      <Banknote size={18} />
                    </div>
                    <div>
                      <p className="font-semibold text-stone-800">Advance #{adv.id}</p>
                      <p className="text-sm text-stone-500">
                        {adv.advance_type === "crop_consignment" ? "Crop Consignment" : "Unconditional Credit"} · Rs {adv.advance_amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[adv.status] || "bg-stone-100"}`}>
                      {adv.status}
                    </span>
                    {expandedId === adv.id ? <ChevronUp size={18} className="text-stone-400" /> : <ChevronDown size={18} className="text-stone-400" />}
                  </div>
                </div>

                <AnimatePresence>
                  {expandedId === adv.id && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <div className="mt-4 pt-4 border-t border-stone-100 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div><span className="text-stone-400">Outstanding:</span> <span className="font-semibold text-stone-800">Rs {adv.outstanding_balance?.toLocaleString()}</span></div>
                        {adv.interest_rate !== null && <div><span className="text-stone-400">Interest:</span> <span className="font-semibold">{adv.interest_rate}%</span></div>}
                        {adv.crop_type && <div><span className="text-stone-400">Crop:</span> <span className="font-semibold">{adv.crop_type}</span></div>}
                        {adv.expected_qty && <div><span className="text-stone-400">Expected Qty:</span> <span className="font-semibold">{adv.expected_qty}</span></div>}
                        {adv.commission_rate !== null && <div><span className="text-stone-400">Commission:</span> <span className="font-semibold">{adv.commission_rate}%</span></div>}
                        {adv.pricing_mode && <div><span className="text-stone-400">Pricing:</span> <span className="font-semibold capitalize">{adv.pricing_mode.replace("_", " ")}</span></div>}
                        {adv.due_date && <div><span className="text-stone-400">Due:</span> <span className="font-semibold">{new Date(adv.due_date).toLocaleDateString()}</span></div>}
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {isFarmer && adv.status === "offered" && (
                          <button onClick={() => handleAccept(adv.id)} className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5">
                            <CheckCircle2 size={14} /> Accept
                          </button>
                        )}
                        {isBroker && adv.status === "accepted" && (
                          <button onClick={() => handleDisburse(adv.id)} className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5">
                            <DollarSign size={14} /> Disburse
                          </button>
                        )}
                        {isBroker && adv.status === "disbursed" && adv.advance_type === "crop_consignment" && (
                          <div className="flex items-center gap-2">
                            <input type="number" min="0" step="0.01" placeholder="Sale amount" value={settleForm.sale_amount} onChange={e => setSettleForm({ sale_amount: e.target.value })}
                              className="border border-stone-300 rounded-lg px-3 py-2 text-sm w-32 focus:ring-2 focus:ring-green-500 outline-none" />
                            <button onClick={() => handleSettle(adv.id)} className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                              Settle
                            </button>
                          </div>
                        )}
                        {isBroker && adv.status === "disbursed" && adv.advance_type === "unconditional_credit" && (
                          <div className="flex items-center gap-2">
                            <input type="number" min="0" step="0.01" placeholder="Repay amount" value={repayForm.amount} onChange={e => setRepayForm({ amount: e.target.value })}
                              className="border border-stone-300 rounded-lg px-3 py-2 text-sm w-32 focus:ring-2 focus:ring-green-500 outline-none" />
                            <button onClick={() => handleRepay(adv.id)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                              Record Repayment
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}