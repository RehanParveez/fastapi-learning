import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "../context/LanguageContext";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import ToastContainer from "./ToastContainer";
import { useWebSocket } from "../hooks/useWebSocket";

export default function Layout() {
  const { lang, toggleLang } = useLanguage();
  const token = localStorage.getItem("kisan_token");
  const { connected, toasts, removeToast } = useWebSocket(token);

  return (
    <div className="min-h-screen bg-[#fafaf9] flex">
      <Sidebar />
      
      <div className="flex-1 ml-72 flex flex-col min-h-screen">
       
        <header className="bg-white border-b border-stone-200 px-8 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div />
            <div className="flex items-center gap-3">
              <div
                className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-red-400"} shadow-sm`}
                title={connected ? "Live notifications connected" : "Notifications disconnected"}
              />

              <button
                onClick={toggleLang}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-stone-200 hover:border-green-500 hover:bg-green-50 transition-all"
              >
                <span className={lang === "en" ? "text-green-700" : "text-stone-400"}>EN</span>
                <span className="text-stone-300">/</span>
                <span className={lang === "ur" ? "text-green-700" : "text-stone-400"}>UR</span>
              </button>

              <span className="text-sm text-stone-500">🇵🇰</span>
              <button className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition-colors">
                🔔
              </button>
            </div>
          </div>
        </header>
        
        <motion.main 
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex-1 p-8"
        >
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </motion.main>

        <Footer />
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}