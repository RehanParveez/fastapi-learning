import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import {Smartphone, Lock, Eye, EyeOff, Sprout, ShieldCheck, Landmark, CheckCircle2, AlertTriangle, ArrowRight
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function LoginPage() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await login(phone, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  const features = [
    { icon: ShieldCheck, text: "Verified identities before platform access" },
    { icon: Landmark, text: "Transparent advances with disclosed terms" },
    { icon: CheckCircle2, text: "Automatic settlement at harvest" },
  ];

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 lg:p-8 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")'
        }}
      />
      <div className="absolute inset-0 bg-[#0a1f16]/88" />

      <motion.div
        className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-green-500/10 rounded-full blur-[120px]"
        animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.25, 0.1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-20%] right-[-10%] w-[700px] h-[700px] bg-emerald-500/10 rounded-full blur-[140px]"
        animate={{ scale: [1.15, 1, 1.15], opacity: [0.08, 0.2, 0.08] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 lg:gap-16 items-center relative z-10">

        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:block space-y-8"
        >
          <div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-700 rounded-xl flex items-center justify-center shadow-lg shadow-green-950/50 mb-5">
              <Sprout size={24} className="text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-4xl font-bold text-white tracking-tight leading-tight">
              Farm Credit &<br />
              <span className="text-green-400">Market Access</span>
            </h1>
            <p className="text-green-100/50 mt-3 text-base max-w-sm leading-relaxed">
              Digitizing the arthi relationship with the transparency a bank statement gives you.
            </p>
          </div>

          <div className="space-y-4">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.12, duration: 0.4 }}
                className="flex items-center gap-3.5"
              >
                <div className="w-9 h-9 rounded-lg bg-green-800/40 border border-green-700/30 flex items-center justify-center">
                  <f.icon size={16} className="text-green-400" />
                </div>
                <p className="text-green-100/65 text-sm font-medium">{f.text}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center"
        >
          <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-2xl shadow-black/25 p-6 lg:p-8 border border-stone-100/50 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-600 via-green-500 to-emerald-400" />

            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-stone-800">Welcome back</h2>
              <p className="text-stone-400 text-sm mt-1">{t.welcomeBack}</p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded-lg mb-5 text-sm flex items-center gap-2"
              >
                <AlertTriangle size={15} className="shrink-0" />
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <label className="block text-sm font-semibold text-stone-700 mb-1.5">{t.phone}</label>
                <div className="relative group">
                  <Smartphone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-green-600 transition-colors" />
                  <input
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    required
                    placeholder="03xx-xxxxxxx"
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-600 outline-none transition-all text-stone-800 placeholder:text-stone-400 text-sm"
                  />
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
                <label className="block text-sm font-semibold text-stone-700 mb-1.5">{t.password}</label>
                <div className="relative group">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-green-600 transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-11 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-600 outline-none transition-all text-stone-800 placeholder:text-stone-400 text-sm"
                  />
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs text-stone-500">
                      <input type="checkbox" className="rounded border-stone-300 text-green-600 focus:ring-green-500" />
                    Remember me
                    </label>
                    <Link to="/forgot-password" className="text-xs text-green-700 hover:text-green-800 font-medium hover:underline">
                      {t.forgotPassword}
                    </Link>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }}>
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
                      Login <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>
              </motion.div>
            </form>

            <div className="mt-6 pt-5 border-t border-stone-100 text-center">
              <p className="text-sm text-stone-500">
                {t.noAccount}{" "}
                <Link to="/register" className="text-green-700 font-semibold hover:text-green-800 hover:underline transition-colors">
                  {t.createAccount}
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}