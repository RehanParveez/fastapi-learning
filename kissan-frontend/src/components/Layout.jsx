import { Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { Menu, X } from "lucide-react";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import ToastContainer from "./ToastContainer";
import { useWebSocket } from "../hooks/useWebSocket";

export default function Layout() {
  const { lang, toggleLang } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const token = localStorage.getItem("kisan_token");
  const { toasts, removeToast } = useWebSocket(token);

  return (
    <div className="min-h-screen bg-[#fafaf9] flex">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-screen z-40 lg:hidden"
            >
              <Sidebar onNavigate={() => setMobileOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className={`flex-1 flex flex-col min-h-screen lg:ml-72`}>
        <header className="bg-white border-b border-stone-200 px-4 lg:px-8 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-stone-100 text-stone-600"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleLang}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-stone-200 hover:border-green-500 hover:bg-green-50 transition-all"
              >
                <span className={lang === "en" ? "text-green-700" : "text-stone-400"}>EN</span>
                <span className="text-stone-300">/</span>
                <span className={lang === "ur" ? "text-green-700" : "text-stone-400"}>UR</span>
              </button>
              <span className="text-sm text-stone-500">🇵🇰</span>
            </div>
          </div>
        </header>

        <motion.main
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex-1 p-4 lg:p-8"
        >
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </motion.main>

        <Footer />
      </div>
    </div>
  );
}