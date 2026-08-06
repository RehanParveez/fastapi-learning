import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { Star, Send, AlertTriangle, CheckCircle2, Loader2, User } from "lucide-react";

export default function RatingsPage() {
  const { userId } = useParams();
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ratee_id: userId, reference_type: "crop_advance", reference_id: "", score: 5, comment: ""});

  useEffect(() => {
    loadRatings();
  }, [userId]);

  async function loadRatings() {
    setLoading(true);
    try {
      const data = await api.get(`/ratings/user/${userId}`);
      setSummary(data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setSuccess("");
    try {
      await api.post("/ratings", {
        ...form,
        ratee_id: parseInt(form.ratee_id),
        reference_id: parseInt(form.reference_id),
        score: parseInt(form.score),
      });
      setSuccess("Rating submitted successfully");
      setShowForm(false);
      setForm({ ratee_id: userId, reference_type: "crop_advance", reference_id: "", score: 5, comment: "" });
      loadRatings();
    } catch (err) { setError(err.message); }
  }

  const isSelf = user?.id === parseInt(userId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center text-white font-bold text-lg shadow-md">
            <User size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-stone-800">User Ratings</h1>
            <p className="text-stone-500">User #{userId}</p>
          </div>
        </div>
        {!isSelf && (
          <button onClick={() => setShowForm(!showForm)} className="bg-green-700 hover:bg-green-800 text-white px-5 py-2.5 rounded-lg font-medium transition flex items-center gap-2">
            <Star size={16} /> {showForm ? "Cancel" : "Rate User"}
          </button>
        )}
      </div>

      {success && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2"><CheckCircle2 size={18} /> {success}</motion.div>}
      {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2"><AlertTriangle size={18} /> {error}</motion.div>}

      {showForm && !isSelf && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm overflow-hidden">
          <h3 className="text-lg font-semibold text-stone-800 mb-4">Submit Rating</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium text-stone-700 mb-1">Reference Type</label>
              <select value={form.reference_type} onChange={e => setForm({...form, reference_type: e.target.value})} className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none">
                <option value="crop_advance">Crop Advance</option>
                <option value="contract_allocation">Contract Allocation</option>
                <option value="consumer_order">Consumer Order</option>
              </select>
            </div>
            <div><label className="block text-sm font-medium text-stone-700 mb-1">Reference ID</label>
              <input required type="number" value={form.reference_id} onChange={e => setForm({...form, reference_id: e.target.value})} className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none" />
            </div>
            <div><label className="block text-sm font-medium text-stone-700 mb-1">Score (1–5)</label>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(n => (
                  <button key={n} type="button" onClick={() => setForm({...form, score: n})} className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${form.score >= n ? "bg-amber-100 text-amber-600" : "bg-stone-100 text-stone-400"}`}>
                    <Star size={16} fill={form.score >= n ? "currentColor" : "none"} />
                  </button>
                ))}
              </div>
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-stone-700 mb-1">Comment</label>
              <textarea value={form.comment} onChange={e => setForm({...form, comment: e.target.value})} rows={3} className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none" placeholder="Share your experience..." />
            </div>
            <div className="md:col-span-3 flex justify-end">
              <button type="submit" className="bg-green-700 hover:bg-green-800 text-white px-6 py-2.5 rounded-lg font-medium transition flex items-center gap-2"><Send size={16} /> Submit Rating</button>
            </div>
          </form>
        </motion.div>
      )}

      {loading ? (
        <div className="text-center py-12 text-stone-400 flex items-center justify-center gap-2"><Loader2 size={20} className="animate-spin" /> Loading...</div>
      ) : summary ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white rounded-xl border border-stone-200 p-5 text-center shadow-sm">
              <p className="text-3xl font-bold text-stone-800">{summary.average_score ? summary.average_score.toFixed(1) : "—"}</p>
              <p className="text-xs text-stone-500 uppercase tracking-wider mt-1">Average Score</p>
            </div>
            <div className="bg-white rounded-xl border border-stone-200 p-5 text-center shadow-sm">
              <p className="text-3xl font-bold text-stone-800">{summary.total_ratings}</p>
              <p className="text-xs text-stone-500 uppercase tracking-wider mt-1">Total Ratings</p>
            </div>
            <div className="bg-white rounded-xl border border-stone-200 p-5 text-center shadow-sm">
              <p className="text-3xl font-bold text-stone-800">{summary.user_id}</p>
              <p className="text-xs text-stone-500 uppercase tracking-wider mt-1">User ID</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-stone-100"><h3 className="font-semibold text-stone-800">All Ratings</h3></div>
            {summary.ratings.length === 0 ? (
              <div className="p-8 text-center text-stone-400"><Star size={32} className="mx-auto mb-2 text-stone-300" /><p>No ratings yet.</p></div>
            ) : (
              <div className="divide-y divide-stone-100">
                {summary.ratings.map(r => (
                  <div key={r.id} className="p-4 hover:bg-stone-50 transition">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-stone-500">Rater #{r.rater_id}</span>
                        <span className="text-xs text-stone-400">· {r.reference_type.replace("_", " ")} #{r.reference_id}</span>
                      </div>
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(n => <Star key={n} size={12} className={r.score >= n ? "text-amber-400 fill-amber-400" : "text-stone-300"} />)}
                      </div>
                    </div>
                    {r.comment && <p className="text-sm text-stone-600">{r.comment}</p>}
                    <p className="text-xs text-stone-400 mt-1">{new Date(r.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}