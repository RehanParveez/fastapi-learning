import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import {
  Sprout, Package, Banknote, ClipboardList, Wheat,
  BarChart3, ShoppingCart, TrendingUp, ArrowUpRight
} from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

function StatCard({ title, value, subtitle, icon: Icon, color, delay }) {
  return (
    <motion.div
      variants={item}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 hover:shadow-lg hover:border-green-200 transition-all duration-300 group cursor-default"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-bold text-stone-800 mt-2 group-hover:text-green-700 transition-colors">{value}</p>
          <p className="text-sm text-stone-400 mt-1">{subtitle}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300`}>
          <Icon size={22} strokeWidth={2} />
        </div>
      </div>
    </motion.div>
  );
}

function QuickAction({ to, label, desc, icon: Icon, delay }) {
  return (
    <motion.div variants={item}>
      <Link
        to={to}
        className="block bg-white rounded-2xl p-6 border border-stone-100 hover:border-green-300 hover:shadow-lg transition-all duration-300 group h-full"
      >
        <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center mb-4 group-hover:bg-green-100 transition-colors">
          <Icon size={20} className="text-green-700" />
        </div>
        <h3 className="font-semibold text-stone-800 group-hover:text-green-700 transition-colors flex items-center gap-2">
          {label}
          <ArrowUpRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
        </h3>
        <p className="text-sm text-stone-500 mt-1 leading-relaxed">{desc}</p>
      </Link>
    </motion.div>
  );
}

export default function Dashboard() {
  const { user, role } = useAuth();

  const greetings = {
    farmer: "Farmer Dashboard",
    shopkeeper: "Shopkeeper Dashboard",
    broker: "Broker Dashboard",
    factory: "Factory Dashboard",
    consumer: "Consumer Dashboard",
    admin: "Admin Dashboard",
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      <motion.div variants={item}>
        <h1 className="text-3xl font-bold text-stone-800">{greetings[role] || "Dashboard"}</h1>
        <p className="text-stone-500 mt-1">Phone: {user?.phone}</p>
      </motion.div>

      {/* Stats */}
      {role === "farmer" && (
        <motion.div variants={container} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard title="Active Advances" value="0" subtitle="In progress" icon={Banknote} color="bg-green-100 text-green-700" />
          <StatCard title="Input Orders" value="0" subtitle="Pending" icon={Package} color="bg-blue-100 text-blue-700" />
          <StatCard title="Balance" value="Rs 0" subtitle="From ledger" icon={BarChart3} color="bg-amber-100 text-amber-700" />
          <StatCard title="Listings" value="0" subtitle="Active crops" icon={Wheat} color="bg-emerald-100 text-emerald-700" />
        </motion.div>
      )}

      {role === "shopkeeper" && (
        <motion.div variants={container} className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <StatCard title="Products" value="0" subtitle="In catalog" icon={Package} color="bg-green-100 text-green-700" />
          <StatCard title="Pending Orders" value="0" subtitle="To fulfill" icon={ShoppingCart} color="bg-blue-100 text-blue-700" />
          <StatCard title="Credit Orders" value="0" subtitle="Outstanding" icon={Banknote} color="bg-amber-100 text-amber-700" />
        </motion.div>
      )}

      {role === "broker" && (
        <motion.div variants={container} className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <StatCard title="Active Advances" value="0" subtitle="Offered/disbursed" icon={Banknote} color="bg-green-100 text-green-700" />
          <StatCard title="Pending" value="0" subtitle="Awaiting settlement" icon={TrendingUp} color="bg-amber-100 text-amber-700" />
          <StatCard title="Commission" value="Rs 0" subtitle="This season" icon={BarChart3} color="bg-emerald-100 text-emerald-700" />
        </motion.div>
      )}

      {role === "factory" && (
        <motion.div variants={container} className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <StatCard title="Open Demands" value="0" subtitle="Accepting applications" icon={ClipboardList} color="bg-green-100 text-green-700" />
          <StatCard title="Pending Delivery" value="0" subtitle="Approved allocations" icon={Package} color="bg-blue-100 text-blue-700" />
          <StatCard title="Total Procured" value="0 kg" subtitle="This season" icon={Wheat} color="bg-amber-100 text-amber-700" />
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div variants={item}>
        <h2 className="text-lg font-semibold text-stone-800 mb-4">Quick Actions</h2>
        <motion.div variants={container} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {role === "farmer" && (
            <>
              <QuickAction to="/input-orders" label="Order Inputs" desc="Buy seed, fertilizer, pesticide on cash or credit" icon={Sprout} />
              <QuickAction to="/advances" label="View Advances" desc="Accept or track crop advances from brokers" icon={Banknote} />
              <QuickAction to="/contracts" label="Apply for Contracts" desc="Secure buyers before harvest" icon={ClipboardList} />
            </>
          )}
          {role === "shopkeeper" && (
            <>
              <QuickAction to="/input-catalog" label="Manage Catalog" desc="Add or update your product listings" icon={Package} />
              <QuickAction to="/input-orders" label="View Orders" desc="Check pending farmer orders" icon={ShoppingCart} />
            </>
          )}
          {role === "broker" && (
            <>
              <QuickAction to="/advances/manage" label="Offer Advance" desc="Create a new crop advance for a farmer" icon={Banknote} />
              <QuickAction to="/listings" label="Browse Listings" desc="Buy crops directly from farmers" icon={Wheat} />
            </>
          )}
          {role === "factory" && (
            <>
              <QuickAction to="/contracts/manage" label="Post Demand" desc="Create a contract for crop supply" icon={ClipboardList} />
              <QuickAction to="/listings" label="Buy from Market" desc="Purchase available crop listings" icon={Wheat} />
            </>
          )}
          {role === "consumer" && (
            <QuickAction to="/listings" label="Shop Produce" desc="Buy fresh crops directly from farms" icon={ShoppingCart} />
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}