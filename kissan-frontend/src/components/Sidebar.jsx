import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import {Home, Sprout, Banknote, ClipboardList, Wheat, BarChart3, Package, ShoppingCart, ShoppingBag, CheckCircle2, LogOut, Sprout as SproutIcon
} from "lucide-react";

export default function Sidebar({ onNavigate }) {
  const { user, role, logout } = useAuth();
  const { t, lang } = useLanguage(); 
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = {
    farmer: [
      { to: "/dashboard", icon: Home, label: t.dashboard },
      { to: "/input-orders", icon: Sprout, label: t.orderInputs },
      { to: "/advances", icon: Banknote, label: t.myAdvances },
      { to: "/contracts", icon: ClipboardList, label: t.contracts },
      { to: "/my-listings", icon: Wheat, label: t.myListings },
      { to: "/ledger", icon: BarChart3, label: t.ledger },
    ],
    shopkeeper: [
      { to: "/dashboard", icon: Home, label: t.dashboard },
      { to: "/input-catalog", icon: Package, label: t.myCatalog },
      { to: "/input-orders", icon: ShoppingCart, label: t.orders },
    ],
    broker: [
      { to: "/dashboard", icon: Home, label: t.dashboard },
      { to: "/advances/manage", icon: Banknote, label: t.advances },
      { to: "/listings", icon: Wheat, label: t.buyListings },
      { to: "/my-listings", icon: ClipboardList, label: t.createListing },
    ],
    factory: [
      { to: "/dashboard", icon: Home, label: t.dashboard },
      { to: "/contracts/manage", icon: ClipboardList, label: t.myDemands },
      { to: "/listings", icon: Wheat, label: t.buyListings },
    ],
    consumer: [
      { to: "/dashboard", icon: Home, label: t.dashboard },
      { to: "/listings", icon: ShoppingBag, label: t.shopProduce },
      { to: "/consumer-orders", icon: Package, label: t.myOrders },
    ],
    admin: [
      { to: "/dashboard", icon: Home, label: t.dashboard },
      { to: "/admin/verification", icon: CheckCircle2, label: t.verifyDocs },
    ],
  };

  const items = navItems[role] || [];

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <aside className="w-72 bg-[#0a1f16] text-white flex flex-col h-screen fixed left-0 top-0 border-r border-green-900/40 z-20">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-700 rounded-xl flex items-center justify-center shadow-lg shadow-green-900/50">
            <SproutIcon size={22} className="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Kisan</h1>
            <p className="text-green-400/70 text-[10px] uppercase tracking-[0.2em] font-medium">
              {t.tagline}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {items.map((item) => {
          const isActive = location.pathname === item.to;
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                isActive
                  ? "bg-green-700/40 text-white shadow-lg shadow-green-900/20 border border-green-600/30"
                  : "text-green-100/60 hover:bg-green-800/30 hover:text-white hover:translate-x-1"
              }`}
            >
              <Icon 
                size={18} 
                strokeWidth={isActive ? 2.5 : 2} 
                className={`transition-colors ${isActive ? "text-green-400" : "text-green-100/40 group-hover:text-green-300"}`} 
              />
              <span className={lang === "ur" ? "text-right w-full" : ""}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 mx-3 mb-4 bg-green-900/20 rounded-2xl border border-green-800/30"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center text-sm font-bold shadow-md">
            {user?.phone?.charAt(0) || "U"}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium truncate text-white/90">{user?.phone}</p>
            <p className="text-xs text-green-400/60 capitalize font-medium">{role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-green-100/70 hover:text-white hover:bg-red-900/30 rounded-xl transition-all border border-transparent hover:border-red-800/30"
        >
          <LogOut size={16} />
          {t.signOut}
        </button>
      </motion.div>
    </aside>
  );
}