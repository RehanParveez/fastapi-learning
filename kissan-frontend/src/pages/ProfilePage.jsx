import { useState, useEffect } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { User, MapPin, Ruler, Building2, CheckCircle2, AlertTriangle, Loader2, Save } from "lucide-react";

export default function ProfilePage() {
  const { user, role } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({});

  useEffect(() => {
    api.get("/profiles/me")
      .then((data) => {
        setProfile(data);
        setForm({
          business_name: data.business_name || "",
          location: data.location || "",
          land_size_acres: data.land_size_acres || "",
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const endpoint = role === "farmer" ? "/profiles/farmer" : `/profiles/${role}`;
    const payload =
      role === "farmer"
        ? { land_size_acres: parseFloat(form.land_size_acres) || null, location: form.location || null }
        : { business_name: form.business_name, location: form.location || null };

    try {
      await api.patch(endpoint, payload);
      setSuccess("Profile updated successfully");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-8 text-center text-stone-400 flex justify-center gap-2"><Loader2 size={18} className="animate-spin" /> Loading profile...</div>;

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-800">My Profile</h1>
        <p className="text-stone-500">View and update your account details</p>
      </div>

      {success && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2"><CheckCircle2 size={18} /> {success}</motion.div>}
      {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2"><AlertTriangle size={18} /> {error}</motion.div>}

      <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-stone-100">
          <div className="w-12 h-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
            <User size={22} />
          </div>
          <div>
            <p className="font-semibold text-stone-800">{user?.phone}</p>
            <p className="text-xs text-stone-500 capitalize">{role}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {role !== "farmer" && (
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1 flex items-center gap-1.5">
                <Building2 size={14} /> Business Name
              </label>
              <input value={form.business_name} onChange={(e) => setForm({ ...form, business_name: e.target.value })} required className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none" />
            </div>
          )}
          {role === "farmer" && (
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1 flex items-center gap-1.5">
                <Ruler size={14} /> Land Size (acres)
              </label>
              <input type="number" step="0.1" value={form.land_size_acres} onChange={(e) => setForm({ ...form, land_size_acres: e.target.value })} className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none" />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1 flex items-center gap-1.5">
              <MapPin size={14} /> Location
            </label>
            <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Village / City" className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none" />
          </div>
          <button disabled={saving} className="w-full bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white py-2.5 rounded-lg font-medium transition flex items-center justify-center gap-2">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}