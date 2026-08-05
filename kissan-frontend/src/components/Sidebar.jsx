import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Home, Sprout, Banknote, ClipboardList, Wheat, BarChart3,
  Package, ShoppingCart, Users, Factory, ShoppingBag,
  CheckCircle2, LogOut, Bell
} from "lucide-react";

export default function Sidebar() {
  const { user, role, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = {
    farmer: [
      { to: "/dashboard", icon: Home, label: "Dashboard" },
      { to: "/input-orders", icon: Sprout, label: "Order Inputs" },
      { to: "/advances", icon: Banknote, label: "My Advances" },
      { to: "/contracts", icon: ClipboardList, label: "Contracts" },
      { to: "/my-listings", icon: Wheat, label: "My Listings" },
      { to: "/ledger", icon: BarChart3, label: "Ledger" },
    ],
    shopkeeper: [
      { to: "/dashboard", icon: Home, label: "Dashboard" },
      { to: "/input-catalog", icon: Package, label: "My Catalog" },
      { to: "/input-orders", icon: ShoppingCart, label: "Orders" },
    ],
    broker: [
      { to: "/dashboard", icon: Home, label: "Dashboard" },
      { to: "/advances/manage", icon: Banknote, label: "Advances" },
      { to: "/listings", icon: Wheat, label: "Buy Listings" },
      { to: "/my-listings", icon: ClipboardList, label: "Create Listing" },
    ],
    factory: [
      { to: "/dashboard", icon: Home, label: "Dashboard" },
      { to: "/contracts/manage", icon: Factory, label: "My Demands" },
      { to: "/listings", icon: Wheat, label: "Buy Listings" },
    ],
    consumer: [
      { to: "/dashboard", icon: Home, label: "Dashboard" },
      { to: "/listings", icon: ShoppingBag, label: "Shop Produce" },
      { to: "/consumer-orders", icon: Package, label: "My Orders" },
    ],
    admin: [
      { to: "/dashboard", icon: Home, label: "Dashboard" },
      { to: "/admin/verification", icon: CheckCircle2, label: "Verify Documents" },
    ],
  };

  const items = navItems[role] || [];

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <aside className="w-72 bg-[#0a1f16] text-white flex flex-col h-screen fixed left-0 top-0 border-r border-green-900/50">
      <div className="p-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-700 rounded-xl flex items-center justify-center shadow-lg shadow-green-900/50">
            <Sprout size={22} className="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">KisanLink</h1>
            <p className="text-green-400/70 text-[10px] uppercase tracking-[0.2em] font-medium">Farm Credit & Market</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {items.map((item, idx) => {
          const isActive = location.pathname === item.to;
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`group flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                isActive
                  ? "bg-green-700/40 text-white shadow-lg shadow-green-900/20 border border-green-600/30"
                  : "text-green-100/60 hover:bg-green-800/30 hover:text-white hover:translate-x-1"
              }`}
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className={`transition-colors ${isActive ? "text-green-400" : "text-green-100/40 group-hover:text-green-300"}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mx-4 mb-6 bg-green-900/20 rounded-2xl border border-green-800/30">
        <div className="flex items-center gap-3 mb-4">
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
          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-green-100/70 hover:text-white hover:bg-red-900/30 rounded-xl transition-all duration-300 border border-transparent hover:border-red-800/30"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
}