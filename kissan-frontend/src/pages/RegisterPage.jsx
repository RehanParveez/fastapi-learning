import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import {
  Smartphone, Lock, Eye, EyeOff, Mail, Tag, Sprout,
  AlertTriangle, ArrowRight, CheckCircle2
} from "lucide-react";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ phone: "", email: "", password: "", role: "farmer" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await register(form);
      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  const roles = [
    { value: "farmer", label: "Farmer" },
    { value: "shopkeeper", label: "Shopkeeper" },
    { value: "broker", label: "Broker" },
    { value: "factory", label: "Factory" },
    { value: "consumer", label: "Consumer" },
  ];

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 py-6 overflow-hidden">
      {/* Background image — same farm image, cohesive feel */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")'
        }}
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-[#0a1f16]/88" />

      {/* Ambient glow */}
      <motion.div
        className="absolute top-[-15%] right-[-5%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px]"
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[440px] relative z-10"
      >
        <div className="bg-white rounded-2xl shadow-2xl shadow-black/25 p-6 lg:p-8 border border-stone-100/50 relative overflow-hidden">
          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-600 via-green-500 to-emerald-400" />

          <div className="text-center mb-5">
            <div className="w-11 h-11 bg-gradient-to-br from-green-50 to-green-100 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm">
              <Sprout size={22} className="text-green-700" strokeWidth={2} />
            </div>
            <h2 className="text-xl font-bold text-stone-800">Create Account</h2>
            <p className="text-stone-400 text-xs mt-1">Join Kisan, Farm Credit & Market Access</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg mb-4 text-sm flex items-center gap-2"
            >
              <AlertTriangle size={15} className="shrink-0" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Phone Number</label>
              <div className="relative group">
                <Smartphone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-green-600 transition-colors" />
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  placeholder="03xx-xxxxxxx"
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-600 outline-none transition-all text-stone-800 placeholder:text-stone-400 text-sm"
                />
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Email <span className="text-stone-400 font-normal">(optional)</span>
              </label>
              <div className="relative group">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-green-600 transition-colors" />
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-600 outline-none transition-all text-stone-800 placeholder:text-stone-400 text-sm"
                />
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Password</label>
              <div className="relative group">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-green-600 transition-colors" />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="Create a strong password"
                  className="w-full pl-9 pr-10 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-600 outline-none transition-all text-stone-800 placeholder:text-stone-400 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }}>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Select Role</label>
              <div className="relative group">
                <Tag size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-green-600 transition-colors z-10" />
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-600 outline-none transition-all text-stone-800 appearance-none cursor-pointer text-sm"
                >
                  {roles.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#1a472a] hover:bg-[#143620] disabled:opacity-60 text-white py-2.5 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-green-950/20 hover:shadow-green-950/30 hover:-translate-y-0.5 flex items-center justify-center gap-2 group text-sm"
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  <>
                    Create Account <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </motion.div>
          </form>

          <div className="mt-5 pt-4 border-t border-stone-100 text-center">
            <p className="text-sm text-stone-500">
              Already have an account?{" "}
              <Link to="/login" className="text-green-700 font-semibold hover:text-green-800 hover:underline transition-colors">
                Login
              </Link>
            </p>
          </div>
        </div>

        {/* Compact trust line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center justify-center gap-4 mt-4 text-green-100/40 text-xs"
        >
          <span className="flex items-center gap-1"><CheckCircle2 size={12} /> Verified</span>
          <span className="flex items-center gap-1"><CheckCircle2 size={12} /> Transparent</span>
          <span className="flex items-center gap-1"><CheckCircle2 size={12} /> Secure</span>
        </motion.div>
      </motion.div>
    </div>
  );
}