import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import {Sprout, Package, Banknote, ClipboardList, Wheat, BarChart3, ShoppingCart, TrendingUp, ArrowUpRight, Loader2, AlertTriangle, CheckCircle2, User
} from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 }
};

function StatCard({ title, value, subtitle, icon: Icon, color, loading, error }) {
  return (
    <motion.div
      variants={item}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 hover:shadow-md hover:border-green-200 transition-all duration-300 group"
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-bold text-stone-800 mt-2 group-hover:text-green-700 transition-colors">
            {loading ? (
              <span className="inline-flex items-center gap-2 text-stone-300">
                <Loader2 size={20} className="animate-spin" />
              </span>
            ) : error ? (
              <span className="text-red-400 text-lg">—</span>
            ) : (
              value
            )}
          </p>
          <p className="text-xs text-stone-400 mt-1">{subtitle}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center shrink-0 ml-3`}>
          <Icon size={22} strokeWidth={2} />
        </div>
      </div>
    </motion.div>
  );
}

function QuickAction({ to, label, desc, icon: Icon }) {
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
  const { t } = useLanguage();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStats();
  }, [role]);

  async function fetchStats() {
    setLoading(true);
    setError("");
    try {
      const newStats = {};

      if (role === "farmer") {
        const [advances, orders, balanceRes, listings] = await Promise.all([
          api.get("/advances").catch(() => []),
          api.get("/input-orders/mine").catch(() => []),
          api.get("/record/me/balance").catch(() => ({ balance: 0 })),
          api.get("/listings/mine").catch(() => []),
        ]);
        newStats.activeAdvances = advances.filter(a => ["offered", "accepted", "disbursed", "repaying"].includes(a.status)).length;
        newStats.pendingOrders = orders.filter(o => o.status === "placed").length;
        newStats.balance = balanceRes.balance;
        newStats.activeListings = listings.filter(l => l.status === "active").length;
      }

      if (role === "shopkeeper") {
        const [products, orders] = await Promise.all([
          api.get(`/inputs/products?shopkeeper_id=${user.id}`).catch(() => []),
          api.get("/input-orders/mine").catch(() => []),
        ]);
        newStats.products = products.length;
        newStats.pendingOrders = orders.filter(o => o.status === "placed").length;
        newStats.creditOrders = orders.filter(o => o.payment_mode === "credit" && o.status === "placed").length;
        newStats.creditOutstanding = orders
          .filter(o => o.payment_mode === "credit" && o.status === "placed")
          .reduce((sum, o) => sum + o.outstanding_balance, 0);
      }

      if (role === "broker") {
        const advances = await api.get("/advances").catch(() => []);
        newStats.totalAdvances = advances.length;
        newStats.pendingOffers = advances.filter(a => a.status === "offered").length;
        newStats.activeDisbursed = advances.filter(a => ["disbursed", "repaying"].includes(a.status)).length;
        newStats.settledCount = advances.filter(a => a.status === "settled").length;
      }

      if (role === "factory") {
        const demands = await api.get("/contracts/demands/mine").catch(() => []);
        let pendingDelivery = 0;
        let totalProcured = 0;
        for (const d of demands) {
          const allocs = await api.get(`/contracts/demands/${d.id}/allocations`).catch(() => []);
          pendingDelivery += allocs.filter(a => a.status === "approved").length;
          const delivered = allocs.filter(a => a.status === "delivered");
          totalProcured += delivered.reduce((s, a) => s + (a.allocated_qty || 0), 0);
        }
        newStats.openDemands = demands.filter(d => d.status === "open").length;
        newStats.pendingDelivery = pendingDelivery;
        newStats.totalProcured = totalProcured;
      }

      if (role === "consumer") {
        const orders = await api.get("/listings/orders/mine").catch(() => []);
        newStats.activeOrders = orders.filter(o => o.status === "placed").length;
        newStats.totalOrders = orders.length;
      }

      if (role === "admin") {
        const docs = await api.get("/verification/documents?status_filter=pending").catch(() => []);
        newStats.pendingVerifications = docs.length;
      }

      setStats(newStats);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const greetings = {farmer: `${t.farmer} ${t.dashboard}`, shopkeeper: `${t.shopkeeper} ${t.dashboard}`, broker: `${t.broker} ${t.dashboard}`,
    factory: `${t.factory} ${t.dashboard}`, consumer: `${t.consumer} ${t.dashboard}`, admin: `Admin ${t.dashboard}`,
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      <motion.div variants={item}>
        <h1 className="text-3xl font-bold text-stone-800">{greetings[role] || t.dashboard}</h1>
        <p className="text-stone-500 mt-1">{t.phone}: {user?.phone}</p>
      </motion.div>

      {error && (
        <motion.div variants={item} className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertTriangle size={18} /> Failed to load stats: {error}
        </motion.div>
      )}

      {role === "farmer" && (
        <motion.div variants={container} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard title={t.activeAdvances} value={stats.activeAdvances ?? 0} subtitle={t.inProgress} icon={Banknote} color="bg-green-100 text-green-700" loading={loading} />
          <StatCard title={t.orderInputs} value={stats.pendingOrders ?? 0} subtitle={t.pendingOrders} icon={Package} color="bg-blue-100 text-blue-700" loading={loading} />
          <StatCard title={t.balance} value={`Rs ${(stats.balance ?? 0).toLocaleString()}`} subtitle={t.fromLedger} icon={BarChart3} color="bg-amber-100 text-amber-700" loading={loading} />
          <StatCard title={t.listings} value={stats.activeListings ?? 0} subtitle={t.activeCrops} icon={Wheat} color="bg-emerald-100 text-emerald-700" loading={loading} />
        </motion.div>
      )}

      {role === "shopkeeper" && (
        <motion.div variants={container} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard title={t.products} value={stats.products ?? 0} subtitle={t.inCatalog} icon={Package} color="bg-green-100 text-green-700" loading={loading} />
          <StatCard title={t.pendingOrders} value={stats.pendingOrders ?? 0} subtitle={t.toFulfill} icon={ShoppingCart} color="bg-blue-100 text-blue-700" loading={loading} />
          <StatCard title={t.creditOrders} value={stats.creditOrders ?? 0} subtitle={t.outstanding} icon={Banknote} color="bg-amber-100 text-amber-700" loading={loading} />
          <StatCard title="Credit Outstanding" value={`Rs ${(stats.creditOutstanding ?? 0).toLocaleString()}`} subtitle="Total due" icon={TrendingUp} color="bg-red-100 text-red-700" loading={loading} />
        </motion.div>
      )}

      {role === "broker" && (
        <motion.div variants={container} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard title={t.advances} value={stats.totalAdvances ?? 0} subtitle="Total offered" icon={Banknote} color="bg-green-100 text-green-700" loading={loading} />
          <StatCard title="Pending Offers" value={stats.pendingOffers ?? 0} subtitle="Awaiting farmer response" icon={ClipboardList} color="bg-amber-100 text-amber-700" loading={loading} />
          <StatCard title="Active / Repaying" value={stats.activeDisbursed ?? 0} subtitle="Currently outstanding" icon={TrendingUp} color="bg-orange-100 text-orange-700" loading={loading} />
          <StatCard title="Settled" value={stats.settledCount ?? 0} subtitle="This season" icon={CheckCircle2} color="bg-emerald-100 text-emerald-700" loading={loading} />
        </motion.div>
      )}

      {role === "factory" && (
        <motion.div variants={container} className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <StatCard title={t.openDemands} value={stats.openDemands ?? 0} subtitle={t.acceptingApps} icon={ClipboardList} color="bg-green-100 text-green-700" loading={loading} />
          <StatCard title={t.pendingDelivery} value={stats.pendingDelivery ?? 0} subtitle={t.approvedAllocs} icon={Package} color="bg-blue-100 text-blue-700" loading={loading} />
          <StatCard title={t.totalProcured} value={`${(stats.totalProcured ?? 0).toLocaleString()} units`} subtitle={t.procuredSeason} icon={Wheat} color="bg-amber-100 text-amber-700" loading={loading} />
        </motion.div>
      )}

      {role === "consumer" && (
        <motion.div variants={container} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <StatCard title="Active Orders" value={stats.activeOrders ?? 0} subtitle="Awaiting delivery" icon={ShoppingCart} color="bg-green-100 text-green-700" loading={loading} />
          <StatCard title="Total Orders" value={stats.totalOrders ?? 0} subtitle="All time" icon={Package} color="bg-blue-100 text-blue-700" loading={loading} />
        </motion.div>
      )}

      {role === "admin" && (
        <motion.div variants={container} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <StatCard title="Pending Verifications" value={stats.pendingVerifications ?? 0} subtitle="Documents to review" icon={ClipboardList} color="bg-amber-100 text-amber-700" loading={loading} />
          <StatCard title="Total Users" value="—" subtitle="Coming soon" icon={User} color="bg-stone-100 text-stone-600" loading={loading} />
        </motion.div>
      )}

      <motion.div variants={item} className="pt-2">
        <h2 className="text-lg font-semibold text-stone-800 mb-5">{t.quickActions}</h2>
        <motion.div variants={container} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {role === "farmer" && (
            <>
              <QuickAction to="/input-orders" label={t.orderInputs} desc={t.orderInputsDesc} icon={Sprout} />
              <QuickAction to="/advances" label={t.myAdvances} desc={t.viewAdvancesDesc} icon={Banknote} />
              <QuickAction to="/contracts" label={t.contracts} desc={t.applyContractsDesc} icon={ClipboardList} />
            </>
          )}
          {role === "shopkeeper" && (
            <>
              <QuickAction to="/input-catalog" label={t.myCatalog} desc={t.manageCatalogDesc} icon={Package} />
              <QuickAction to="/input-orders" label={t.orders} desc={t.viewOrdersDesc} icon={ShoppingCart} />
            </>
          )}
          {role === "broker" && (
            <>
              <QuickAction to="/advances/manage" label={t.advances} desc={t.offerAdvanceDesc} icon={Banknote} />
              <QuickAction to="/listings" label={t.buyListings} desc={t.browseListingsDesc} icon={Wheat} />
            </>
          )}
          {role === "factory" && (
            <>
              <QuickAction to="/contracts/manage" label={t.myDemands} desc={t.postDemandDesc} icon={ClipboardList} />
              <QuickAction to="/listings" label={t.buyListings} desc={t.buyMarketDesc} icon={Wheat} />
            </>
          )}
          {role === "consumer" && (
            <QuickAction to="/listings" label={t.shopProduce} desc={t.shopProduceDesc} icon={ShoppingCart} />
          )}
          {role === "admin" && (
            <QuickAction to="/admin/verification" label={t.verifyDocs} desc="Review pending identity documents" icon={ClipboardList} />
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}