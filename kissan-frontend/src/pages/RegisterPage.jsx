import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import {
  Smartphone, Lock, Eye, EyeOff, Mail, Tag, Sprout,
  AlertTriangle, ArrowRight, CheckCircle2, User, Users
} from "lucide-react";

export default function RegisterPage() {
  const { register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    phone: "", email: "", password: "", role: "farmer",
    username: "", gender: ""
  });
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
      await register({
        phone: form.phone,
        email: form.email || null,
        password: form.password,
        role: form.role,
        username: form.username || null,
        gender: form.gender || null,
      });
      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  const roles = [
    { value: "farmer", label: t.farmer },
    { value: "shopkeeper", label: t.shopkeeper },
    { value: "broker", label: t.broker },
    { value: "factory", label: t.factory },
    { value: "consumer", label: t.consumer },
  ];

  return (
    <div className="min-h-screen relative flex items-center justify-center p-3 overflow-hidden">
      
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")'
        }}
      />
      <div className="absolute inset-0 bg-[#0a1f16]/88" />

      <motion.div
        className="absolute top-[-15%] right-[-5%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px]"
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-6 lg:gap-12 items-center relative z-10">

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="hidden lg:block space-y-5"
        >
          <div>
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-700 rounded-xl flex items-center justify-center shadow-lg shadow-green-950/50 mb-3">
              <Sprout size={20} className="text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight leading-tight">
              {t.registerTitle}<br />
              <span className="text-green-400">Kisan</span>
            </h1>
            <p className="text-green-100/50 mt-2 text-sm max-w-sm leading-relaxed">
              {t.registerSubtitle}
            </p>
          </div>

          <div className="space-y-3">
            {[
              { icon: CheckCircle2, text: t.verifiedText || "Verified identities" },
              { icon: CheckCircle2, text: t.financedText || "Transparent advances" },
              { icon: CheckCircle2, text: t.settledText || "Automatic settlement" },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.3 }}
                className="flex items-center gap-3"
              >
                <div className="w-7 h-7 rounded-lg bg-green-800/40 border border-green-700/30 flex items-center justify-center">
                  <f.icon size={14} className="text-green-400" />
                </div>
                <p className="text-green-100/60 text-sm">{f.text}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex justify-center"
        >
          <div className="w-full max-w-[400px] bg-white rounded-xl shadow-2xl shadow-black/25 p-5 border border-stone-100/50 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-600 via-green-500 to-emerald-400" />

            <div className="text-center mb-3">
              <div className="w-9 h-9 bg-gradient-to-br from-green-50 to-green-100 rounded-lg flex items-center justify-center mx-auto mb-2 shadow-sm">
                <Sprout size={18} className="text-green-700" strokeWidth={2} />
              </div>
              <h2 className="text-lg font-bold text-stone-800">{t.registerTitle}</h2>
              <p className="text-stone-400 text-[11px] mt-0.5">{t.registerSubtitle}</p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 text-red-700 px-2.5 py-1.5 rounded-lg mb-3 text-xs flex items-center gap-1.5"
              >
                <AlertTriangle size={13} className="shrink-0" />
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-2">
            
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-0.5">{t.phone}</label>
                <div className="relative group">
                  <Smartphone size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-green-600 transition-colors" />
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    placeholder="03xx-xxxxxxx"
                    className="w-full pl-8 pr-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-600 outline-none transition-all text-stone-800 placeholder:text-stone-400 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-0.5">{t.username}</label>
                  <div className="relative group">
                    <User size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-green-600 transition-colors" />
                    <input
                      name="username"
                      value={form.username}
                      onChange={handleChange}
                      placeholder="sidhu"
                      className="w-full pl-8 pr-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-600 outline-none transition-all text-stone-800 placeholder:text-stone-400 text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-0.5">{t.gender}</label>
                  <div className="relative group">
                    <Users size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-green-600 transition-colors z-10" />
                    <select
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      className="w-full pl-8 pr-2 py-1.5 bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-600 outline-none transition-all text-stone-800 appearance-none cursor-pointer text-xs"
                    >
                      <option value="">{t.selectRole}</option>
                      <option value="male">{t.male}</option>
                      <option value="female">{t.female}</option>
                      <option value="other">{t.other}</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-0.5">{t.emailOptional}</label>
                <div className="relative group">
                  <Mail size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-green-600 transition-colors" />
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@gmail.com"
                    className="w-full pl-8 pr-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-600 outline-none transition-all text-stone-800 placeholder:text-stone-400 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-0.5">{t.password}</label>
                <div className="relative group">
                  <Lock size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-green-600 transition-colors" />
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                    className="w-full pl-8 pr-9 py-1.5 bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-600 outline-none transition-all text-stone-800 placeholder:text-stone-400 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-0.5">{t.selectRole}</label>
                <div className="relative group">
                  <Tag size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-green-600 transition-colors z-10" />
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="w-full pl-8 pr-2 py-1.5 bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-600 outline-none transition-all text-stone-800 appearance-none cursor-pointer text-xs"
                  >
                    {roles.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#1a472a] hover:bg-[#143620] disabled:opacity-60 text-white py-2 rounded-lg font-semibold transition-all duration-300 shadow-lg shadow-green-950/20 hover:shadow-green-950/30 hover:-translate-y-0.5 flex items-center justify-center gap-2 group text-xs mt-1"
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  <>
                    {t.createAccount} <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-3 pt-3 border-t border-stone-100 text-center">
              <p className="text-xs text-stone-500">
                {t.alreadyHaveAccount}{" "}
                <Link to="/login" className="text-green-700 font-semibold hover:text-green-800 hover:underline transition-colors">
                  {t.login}
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}