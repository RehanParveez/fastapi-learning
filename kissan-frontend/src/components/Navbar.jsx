import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const navLinks = [];

  if (role === "farmer") {
    navLinks.push(
      { to: "/", label: "Dashboard" },
      { to: "/input-orders", label: "Order Inputs" },
      { to: "/advances", label: "My Advances" },
      { to: "/contracts", label: "Contracts" },
      { to: "/my-listings", label: "My Listings" },
      { to: "/ledger", label: "My Ledger" },
    );
  }

  if (role === "shopkeeper") {
    navLinks.push(
      { to: "/", label: "Dashboard" },
      { to: "/input-catalog", label: "My Catalog" },
      { to: "/input-orders", label: "Orders" },
    );
  }

  if (role === "broker") {
    navLinks.push(
      { to: "/", label: "Dashboard" },
      { to: "/advances/manage", label: "Manage Advances" },
      { to: "/listings", label: "Buy Listings" },
      { to: "/my-listings", label: "Create Listings" },
    );
  }

  if (role === "factory") {
    navLinks.push(
      { to: "/", label: "Dashboard" },
      { to: "/contracts/manage", label: "My Demands" },
      { to: "/listings", label: "Buy Listings" },
    );
  }

  if (role === "consumer") {
    navLinks.push(
      { to: "/", label: "Dashboard" },
      { to: "/listings", label: "Shop Produce" },
      { to: "/consumer-orders", label: "My Orders" },
    );
  }

  if (role === "admin") {
    navLinks.push(
      { to: "/", label: "Dashboard" },
      { to: "/admin/verification", label: "Verify Documents" },
    );
  }

  return (
    <nav className="bg-green-700 text-white shadow">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-bold text-lg tracking-wide">KisanLink</Link>
        
        <div className="flex gap-4 text-sm">
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to} className="hover:text-green-200 transition">
              {link.label}
            </Link>
          ))}
          
          <div className="border-l border-green-500 pl-4 flex items-center gap-3">
            <span className="text-green-200 capitalize">{role}</span>
            <button onClick={handleLogout} className="bg-green-800 hover:bg-green-900 px-3 py-1 rounded text-xs">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}