
import { useState, useEffect } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {ClipboardList, CheckCircle2, XCircle, Truck, Sprout, AlertTriangle, ChevronDown, ChevronUp, Plus, Loader2, ArrowRight, Star
} from "lucide-react";

export default function ContractsPage({ manage = false }) {
  const { role } = useAuth();
  const [demands, setDemands] = useState([]);
  const [myAllocations, setMyAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [expandedDemand, setExpandedDemand] = useState(null);
  const [showDemandForm, setShowDemandForm] = useState(false);
  const [applyQty, setApplyQty] = useState({});
  const [deliveryForm, setDeliveryForm] = useState({});

  const [demandForm, setDemandForm] = useState({
    crop_type: "", quantity_needed: "", price_offered: "",
    quality_specs: "", delivery_window_start: "", delivery_window_end: ""
  });

  const isFactory = manage && role === "factory";
  const isFarmer = !manage && role === "farmer";

  useEffect(() => {
    if (isFactory) loadMyDemands();
    else loadDemands();
    if (isFarmer) loadMyAllocations();
  }, [manage]);

  async function loadDemands() {
    setLoading(true);
    try {
      const data = await api.get("/contracts/demands?status_filter=open");
      setDemands(data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  async function loadMyDemands() {
    setLoading(true);
    try {
      const data = await api.get("/contracts/demands/mine");
      setDemands(data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  async function loadMyAllocations() {
    try {
      const data = await api.get("/contracts/allocations/mine");
      setMyAllocations(data);
    } catch (err) { console.error(err); }
  }

  async function handlePostDemand(e) {
    e.preventDefault();
    setError(""); setSuccess("");
    try {
      await api.post("/contracts/demands", {crop_type: demandForm.crop_type, quantity_needed: parseFloat(demandForm.quantity_needed),
        price_offered: parseFloat(demandForm.price_offered), quality_specs: demandForm.quality_specs || null,
        delivery_window_start: demandForm.delivery_window_start || null, delivery_window_end: demandForm.delivery_window_end || null,
      });
      setSuccess("Demand posted successfully");
      setShowDemandForm(false);
      setDemandForm({ crop_type: "", quantity_needed: "", price_offered: "", quality_specs: "", delivery_window_start: "", delivery_window_end: "" });
      loadMyDemands();
    } catch (err) { setError(err.message); }
  }

  async function handleApply(demandId) {
    setError(""); setSuccess("");
    const qty = parseFloat(applyQty[demandId]);
    if (!qty || qty <= 0) { setError("Enter a valid quantity"); return; }
    try {
      await api.post(`/contracts/demands/${demandId}/apply`, { requested_qty: qty });
      setSuccess("Application submitted");
      setApplyQty({ ...applyQty, [demandId]: "" });
      loadDemands();
      loadMyAllocations();
    } catch (err) { setError(err.message); }
  }

  async function handleDecision(allocationId, approve, allocatedQty = null) {
    setError(""); setSuccess("");
    try {
      await api.patch(`/contracts/allocations/${allocationId}/decision`, {
        approve,
        allocated_qty: allocatedQty,
      });
      setSuccess(approve ? "Allocation approved" : "Allocation rejected");
      loadMyDemands();
    } catch (err) { setError(err.message); }
  }

  async function handleDelivery(allocationId) {
    setError(""); setSuccess("");
    const form = deliveryForm[allocationId] || {};
    if (!form.delivered_qty || form.delivered_qty <= 0) { setError("Enter delivered quantity"); return; }
    try {
      await api.post(`/contracts/allocations/${allocationId}/delivery`, {
        delivered_qty: parseFloat(form.delivered_qty),
        quality_grade: form.quality_grade || "A",
      });
      setSuccess("Delivery recorded and payment calculated");
      setDeliveryForm({ ...deliveryForm, [allocationId]: {} });
      loadMyDemands();
    } catch (err) { setError(err.message); }
  }

  const statusBadge = (status) => {
    const map = {open: "bg-green-100 text-green-700", fulfilled: "bg-blue-100 text-blue-700", cancelled: "bg-red-100 text-red-700", requested: "bg-amber-100 text-amber-700",
      approved: "bg-green-100 text-green-700", rejected: "bg-red-100 text-red-700", delivered: "bg-blue-100 text-blue-700",
    };
    return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${map[status] || "bg-stone-100"}`}>{status}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">
            {isFactory ? "My Contract Demands" : "Contract Farming"}
          </h1>
          <p className="text-stone-500">
            {isFactory ? "Post demands and manage farmer allocations" : "Apply to factory crop contracts"}
          </p>
        </div>
        {isFactory && (
          <button onClick={() => setShowDemandForm(!showDemandForm)}
            className="bg-green-700 hover:bg-green-800 text-white px-5 py-2.5 rounded-lg font-medium transition flex items-center gap-2">
            {showDemandForm ? <XCircle size={16} /> : <Plus size={16} />} {showDemandForm ? "Cancel" : "Post Demand"}
          </button>
        )}
      </div>

      {success && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2"><CheckCircle2 size={18} /> {success}</motion.div>}
      {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2"><AlertTriangle size={18} /> {error}</motion.div>}

      <AnimatePresence>
        {showDemandForm && isFactory && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-stone-800 mb-4">New Contract Demand</h3>
              <form onSubmit={handlePostDemand} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><label className="block text-sm font-medium text-stone-700 mb-1">Crop Type</label><input required value={demandForm.crop_type} onChange={e => setDemandForm({...demandForm, crop_type: e.target.value})} className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none" /></div>
                <div><label className="block text-sm font-medium text-stone-700 mb-1">Quantity Needed</label><input required type="number" min="0" step="0.1" value={demandForm.quantity_needed} onChange={e => setDemandForm({...demandForm, quantity_needed: e.target.value})} className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none" /></div>
                <div><label className="block text-sm font-medium text-stone-700 mb-1">Price Offered (Rs)</label><input required type="number" min="0" step="0.01" value={demandForm.price_offered} onChange={e => setDemandForm({...demandForm, price_offered: e.target.value})} className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none" /></div>
                <div className="md:col-span-3"><label className="block text-sm font-medium text-stone-700 mb-1">Quality Specs</label><input value={demandForm.quality_specs} onChange={e => setDemandForm({...demandForm, quality_specs: e.target.value})} placeholder="e.g. moisture < 14%, foreign matter < 2%" className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none" /></div>
                <div><label className="block text-sm font-medium text-stone-700 mb-1">Window Start</label><input type="date" value={demandForm.delivery_window_start} onChange={e => setDemandForm({...demandForm, delivery_window_start: e.target.value})} className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none" /></div>
                <div><label className="block text-sm font-medium text-stone-700 mb-1">Window End</label><input type="date" value={demandForm.delivery_window_end} onChange={e => setDemandForm({...demandForm, delivery_window_end: e.target.value})} className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none" /></div>
                <div className="md:col-span-3 flex justify-end"><button type="submit" className="bg-green-700 hover:bg-green-800 text-white px-6 py-2.5 rounded-lg font-medium transition flex items-center gap-2"><ArrowRight size={16} /> Post Demand</button></div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isFarmer && myAllocations.length > 0 && (
        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-3">My Applications</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {myAllocations.map(alloc => (
              <div key={alloc.id} className="border border-stone-100 rounded-lg p-3 bg-stone-50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-stone-500">Demand #{alloc.demand_id}</span>
                  {statusBadge(alloc.status)}
                </div>
                <p className="text-sm font-medium text-stone-800">Requested: {alloc.requested_qty} units</p>
                {alloc.allocated_qty && <p className="text-sm text-stone-600">Allocated: {alloc.allocated_qty} units</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-stone-400 flex items-center justify-center gap-2"><Loader2 size={20} className="animate-spin" /> Loading...</div>
        ) : demands.length === 0 ? (
          <div className="p-12 text-center text-stone-400"><ClipboardList size={40} className="mx-auto mb-3 text-stone-300" /><p>No contract demands found.</p></div>
        ) : (
          <div className="divide-y divide-stone-100">
            {demands.map(d => (
              <div key={d.id} className="p-5 hover:bg-stone-50 transition">
                <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandedDemand(expandedDemand === d.id ? null : d.id)}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-green-100 text-green-700 flex items-center justify-center"><Sprout size={18} /></div>
                    <div>
                      <p className="font-semibold text-stone-800">{d.crop_type} <span className="text-stone-400 font-normal">· Demand #{d.id}</span></p>
                      <p className="text-sm text-stone-500">{d.quantity_needed} units @ Rs {d.price_offered}/unit · Allocated: {d.quantity_allocated || 0}/{d.quantity_needed}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {statusBadge(d.status)}
                    {expandedDemand === d.id ? <ChevronUp size={18} className="text-stone-400" /> : <ChevronDown size={18} className="text-stone-400" />}
                  </div>
                </div>

                <AnimatePresence>
                  {expandedDemand === d.id && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <div className="mt-4 pt-4 border-t border-stone-100">
                        {d.quality_specs && <p className="text-sm text-stone-600 mb-2"><span className="font-medium">Quality:</span> {d.quality_specs}</p>}
                        {d.delivery_window_start && <p className="text-sm text-stone-600 mb-2"><span className="font-medium">Window:</span> {new Date(d.delivery_window_start).toLocaleDateString()} → {d.delivery_window_end ? new Date(d.delivery_window_end).toLocaleDateString() : "Open"}</p>}

                        {isFarmer && d.status === "open" && (
                          <div className="flex items-center gap-2 mt-3">
                            <input type="number" min="0" step="0.1" placeholder="Qty to supply" value={applyQty[d.id] || ""} onChange={e => setApplyQty({ ...applyQty, [d.id]: e.target.value })}
                              className="border border-stone-300 rounded-lg px-3 py-2 text-sm w-40 focus:ring-2 focus:ring-green-500 outline-none" />
                            <button onClick={() => handleApply(d.id)} className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5"><ArrowRight size={14} /> Apply</button>
                          </div>
                        )}

                        {isFactory && (
                          <div className="mt-3">
                            <p className="text-sm font-semibold text-stone-700 mb-2">Applications</p>
                            <AllocationsList demandId={d.id} onDecision={handleDecision} onDelivery={handleDelivery} deliveryForm={deliveryForm} setDeliveryForm={setDeliveryForm} />
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

function AllocationsList({ demandId, onDecision, onDelivery, deliveryForm, setDeliveryForm }) {
  const [allocs, setAllocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approveQty, setApproveQty] = useState({});

  useEffect(() => { loadAllocs(); }, [demandId]);

  async function loadAllocs() {
    try { const data = await api.get(`/contracts/demands/${demandId}/allocations`); setAllocs(data); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  if (loading) return <p className="text-sm text-stone-400">Loading applications...</p>;
  if (allocs.length === 0) return <p className="text-sm text-stone-400">No applications yet.</p>;

  return (
    <div className="space-y-2">
      {allocs.map(alloc => (
        <div key={alloc.id} className="border border-stone-100 rounded-lg p-3 bg-stone-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-stone-800">Farmer #{alloc.farmer_id}</p>
              <p className="text-xs text-stone-500">Requested: {alloc.requested_qty} units</p>
              {alloc.allocated_qty && <p className="text-xs text-stone-500">Allocated: {alloc.allocated_qty} units</p>}
            </div>
            <div className="flex items-center gap-2">
              {alloc.status === "requested" && (
                <>
                  <input type="number" min="0" step="0.1" placeholder="Qty" value={approveQty[alloc.id] || ""} onChange={e => setApproveQty({ ...approveQty, [alloc.id]: e.target.value })}
                    className="border border-stone-300 rounded px-2 py-1 text-xs w-20 focus:ring-2 focus:ring-green-500 outline-none" />
                  <button onClick={() => onDecision(alloc.id, true, approveQty[alloc.id] ? parseFloat(approveQty[alloc.id]) : null)} className="bg-green-700 hover:bg-green-800 text-white px-3 py-1.5 rounded text-xs font-medium transition flex items-center gap-1"><CheckCircle2 size={12} /> Approve</button>
                  <button onClick={() => onDecision(alloc.id, false)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-xs font-medium transition flex items-center gap-1"><XCircle size={12} /> Reject</button>
                </>
              )}
              {alloc.status === "approved" && (
                <div className="flex items-center gap-2">
                  <input type="number" min="0" step="0.1" placeholder="Delivered qty" value={deliveryForm[alloc.id]?.delivered_qty || ""} onChange={e => setDeliveryForm({ ...deliveryForm, [alloc.id]: { ...deliveryForm[alloc.id], delivered_qty: e.target.value } })}
                    className="border border-stone-300 rounded px-2 py-1 text-xs w-24 focus:ring-2 focus:ring-green-500 outline-none" />
                  <select value={deliveryForm[alloc.id]?.quality_grade || "A"} onChange={e => setDeliveryForm({ ...deliveryForm, [alloc.id]: { ...deliveryForm[alloc.id], quality_grade: e.target.value } })}
                    className="border border-stone-300 rounded px-2 py-1 text-xs focus:ring-2 focus:ring-green-500 outline-none">
                    <option value="A">Grade A</option><option value="B">Grade B</option><option value="C">Grade C</option>
                  </select>
                  <button onClick={() => onDelivery(alloc.id)} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs font-medium transition flex items-center gap-1"><Truck size={12} /> Record Delivery</button>
                </div>
              )}
              {alloc.status === "delivered" && <span className="text-xs font-semibold text-blue-600 flex items-center gap-1"><CheckCircle2 size={12} /> Delivered</span>}
              {alloc.status === "rejected" && <span className="text-xs font-semibold text-red-600 flex items-center gap-1"><XCircle size={12} /> Rejected</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}