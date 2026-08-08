import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sprout, ShieldCheck, Banknote, Truck, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a1f16] text-white overflow-hidden relative">
      <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center" />
      
      <nav className="relative z-10 max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-700 rounded-lg flex items-center justify-center">
            <Sprout size={18} className="text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">KisanLink</span>
        </div>
        <div className="flex gap-3">
          <Link to="/login" className="px-4 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white transition">Login</Link>
          <Link to="/register" className="px-4 py-2 rounded-lg text-sm font-medium bg-green-600 hover:bg-green-700 text-white transition">Get Started</Link>
        </div>
      </nav>

      <section className="relative z-10 max-w-6xl mx-auto px-6 py-20 lg:py-32 grid lg:grid-cols-2 gap-12 items-center">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
            Farm Credit &<br />
            <span className="text-green-400">Market Access</span>
          </h1>
          <p className="mt-6 text-lg text-green-100/60 max-w-md leading-relaxed">
            Digitizing the arthi relationship with the transparency a bank statement gives you. Get advances, buy inputs, sell crops — all in one place.
          </p>
          <div className="mt-8 flex gap-4">
            <Link to="/register" className="px-6 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold transition flex items-center gap-2">
              Join as Farmer <ArrowRight size={16} />
            </Link>
            <Link to="/login" className="px-6 py-3 rounded-xl border border-green-700/50 hover:border-green-500 text-white font-medium transition">
              Already a member?
            </Link>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="grid grid-cols-2 gap-4">
          {[
            { icon: Banknote, title: "Crop Advances", desc: "Transparent terms, automatic settlement" },
            { icon: ShieldCheck, title: "Verified Trust", desc: "Identity checks before any deal" },
            { icon: Truck, title: "Contract Farming", desc: "Secure buyers before harvest" },
            { icon: Sprout, title: "Input Marketplace", desc: "Seed, fertilizer on cash or credit" },
          ].map((f, i) => (
            <div key={i} className="bg-green-900/30 border border-green-800/40 rounded-2xl p-5 backdrop-blur-sm">
              <f.icon size={24} className="text-green-400 mb-3" />
              <h3 className="font-semibold text-sm">{f.title}</h3>
              <p className="text-xs text-green-100/50 mt-1">{f.desc}</p>
            </div>
          ))}
        </motion.div>
      </section>
    </div>
  );
}