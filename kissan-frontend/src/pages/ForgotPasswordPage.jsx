import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "../context/LanguageContext";
import {
  Smartphone, ArrowLeft, AlertTriangle, CheckCircle2,
  Sprout, Mail
} from "lucide-react";

export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8003/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Failed to send reset link");
      }
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
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
              {t.resetPassword}<br />
              <span className="text-green-400">Kisan</span>
            </h1>
            <p className="text-green-100/50 mt-3 text-base max-w-sm leading-relaxed">
              {t.resetSubtitle}
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: Mail, text: "Secure token-based reset" },
              { icon: CheckCircle2, text: "Link expires in 1 hour" },
              { icon: AlertTriangle, text: "Keep your phone secure" },
            ].map((f, i) => (
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

            <div className="mb-6">
              <Link to="/login" className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-green-700 transition-colors mb-4">
                <ArrowLeft size={16} /> {t.backToLogin}
              </Link>
              <h2 className="text-xl font-bold text-stone-800">{t.resetPassword}</h2>
              <p className="text-stone-400 text-sm mt-1">{t.resetSubtitle}</p>
            </div>

            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded-lg text-sm flex items-center gap-2"
                  >
                    <AlertTriangle size={15} className="shrink-0" />
                    {error}
                  </motion.div>
                )}

                <div>
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
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#1a472a] hover:bg-[#143620] disabled:opacity-60 text-white py-2.5 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-green-950/20 hover:shadow-green-950/30 hover:-translate-y-0.5 flex items-center justify-center gap-2 text-sm"
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    />
                  ) : (
                    t.sendResetLink
                  )}
                </button>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6"
              >
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 size={24} className="text-green-700" />
                </div>
                <h3 className="font-semibold text-stone-800">Reset link sent!</h3>
                <p className="text-sm text-stone-500 mt-1">
                  Check your SMS for the reset link. It expires in 1 hour.
                </p>
                <Link to="/login" className="inline-block mt-4 text-green-700 font-medium hover:underline">
                  {t.backToLogin}
                </Link>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}