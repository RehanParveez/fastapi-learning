import { useState, useEffect } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {Wheat, Plus, X, CheckCircle2, AlertTriangle, Loader2, ArrowRight, Tag
} from "lucide-react";

export default function MyListingsPage() {
  const { user, role } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({farmer_id: "", crop_type: "", quantity: "", quality_grade: "A", price: "", retail_available: false, retail_unit_size: ""
  });

  useEffect(() => { loadListings(); }, []);

  async function loadListings() {
    setLoading(true);
    try {
      const data = await api.get("/listings/mine");
      setListings(data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setSuccess("");
    const payload = {crop_type: form.crop_type, quantity: parseFloat(form.quantity), quality_grade: form.quality_grade,
      price: parseFloat(form.price), retail_available: form.retail_available,
      retail_unit_size: form.retail_available ? parseFloat(form.retail_unit_size) : null,
    };
    if (role === "broker") payload.farmer_id = parseInt(form.farmer_id) || null;

    try {
      await api.post("/listings", payload);
      setSuccess("Listing created successfully");
      setShowForm(false);
      setForm({ farmer_id: "", crop_type: "", quantity: "", quality_grade: "A", price: "", retail_available: false, retail_unit_size: "" });
      loadListings();
    } catch (err) { setError(err.message); }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">My Listings</h1>
          <p className="text-stone-500">Create and manage your crop listings</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-green-700 hover:bg-green-800 text-white px-5 py-2.5 rounded-lg font-medium transition flex items-center gap-2">
          {showForm ? <X size={16} /> : <Plus size={16} />} {showForm ? "Cancel" : "New Listing"}
        </button>
      </div>

      {success && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2"><CheckCircle2 size={18} /> {success}</motion.div>}
      {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2"><AlertTriangle size={18} /> {error}</motion.div>}

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2"><Tag size={18} className="text-green-600" /> New Crop Listing</h3>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {role === "broker" && (
                  <div><label className="block text-sm font-medium text-stone-700 mb-1">Farmer ID</label><input required type="number" value={form.farmer_id} onChange={e => setForm({...form, farmer_id: e.target.value})} className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none" /></div>
                )}
                <div><label className="block text-sm font-medium text-stone-700 mb-1">Crop Type</label><input required value={form.crop_type} onChange={e => setForm({...form, crop_type: e.target.value})} className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none" /></div>
                <div><label className="block text-sm font-medium text-stone-700 mb-1">Quantity (units)</label><input required type="number" min="0" step="0.1" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none" /></div>
                <div><label className="block text-sm font-medium text-stone-700 mb-1">Quality Grade</label>
                  <select value={form.quality_grade} onChange={e => setForm({...form, quality_grade: e.target.value})} className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none">
                    <option value="A">Grade A</option><option value="B">Grade B</option><option value="C">Grade C</option>
                  </select>
                </div>
                <div><label className="block text-sm font-medium text-stone-700 mb-1">Price per unit (Rs)</label><input required type="number" min="0" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none" /></div>
                <div className="md:col-span-3 flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm text-stone-700 cursor-pointer">
                    <input type="checkbox" checked={form.retail_available} onChange={e => setForm({...form, retail_available: e.target.checked})} className="rounded border-stone-300 text-green-600 focus:ring-green-500" />
                    Available for retail (consumers)
                  </label>
                  {form.retail_available && (
                    <div className="flex-1 max-w-xs"><input type="number" min="0" step="0.1" placeholder="Retail unit size (e.g. 5 kg)" value={form.retail_unit_size} onChange={e => setForm({...form, retail_unit_size: e.target.value})} className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none" /></div>
                  )}
                </div>
                <div className="md:col-span-3 flex justify-end"><button type="submit" className="bg-green-700 hover:bg-green-800 text-white px-6 py-2.5 rounded-lg font-medium transition flex items-center gap-2"><ArrowRight size={16} /> Create Listing</button></div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-stone-400 flex items-center justify-center gap-2"><Loader2 size={20} className="animate-spin" /> Loading...</div>
        ) : listings.length === 0 ? (
          <div className="p-12 text-center text-stone-400"><Wheat size={40} className="mx-auto mb-3 text-stone-300" /><p>No listings yet. Create your first one above.</p></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 p-5">
            {listings.map(l => (
              <div key={l.id} className="border border-stone-100 rounded-xl p-4 bg-stone-50 hover:bg-white hover:shadow-sm transition">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-stone-800">{l.crop_type}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${l.status === "active" ? "bg-green-100 text-green-700" : l.status === "sold_out" ? "bg-blue-100 text-blue-700" : "bg-stone-100 text-stone-600"}`}>{l.status}</span>
                </div>
                <div className="text-sm text-stone-600 space-y-1">
                  <p>Qty: {l.quantity} units</p>
                  <p>Price: Rs {l.price}/unit</p>
                  <p>Grade: {l.quality_grade}</p>
                  {l.retail_available && <p className="text-green-600 text-xs">Retail: {l.retail_unit_size} units/bag</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}