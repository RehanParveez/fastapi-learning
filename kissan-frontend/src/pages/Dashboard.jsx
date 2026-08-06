import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { Link } from "react-router-dom";
import {
  Sprout, Package, Banknote, ClipboardList, Wheat,
  BarChart3, ShoppingCart, TrendingUp, ArrowUpRight
} from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 }
};

function StatCard({ title, value, subtitle, icon: Icon, color }) {
  return (
    <motion.div
      variants={item}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 hover:shadow-md hover:border-green-200 transition-all duration-300 group"
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-bold text-stone-800 mt-2 group-hover:text-green-700 transition-colors">{value}</p>
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

  const greetings = {
    farmer: `${t.farmer} ${t.dashboard}`,
    shopkeeper: `${t.shopkeeper} ${t.dashboard}`,
    broker: `${t.broker} ${t.dashboard}`,
    factory: `${t.factory} ${t.dashboard}`,
    consumer: `${t.consumer} ${t.dashboard}`,
    admin: `Admin ${t.dashboard}`,
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={item}>
        <h1 className="text-3xl font-bold text-stone-800">{greetings[role] || t.dashboard}</h1>
        <p className="text-stone-500 mt-1">{t.phone}: {user?.phone}</p>
      </motion.div>

      {/* Stats Grid */}
      {role === "farmer" && (
        <motion.div variants={container} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard title={t.activeAdvances} value="0" subtitle={t.inProgress} icon={Banknote} color="bg-green-100 text-green-700" />
          <StatCard title={t.orderInputs} value="0" subtitle={t.pendingOrders} icon={Package} color="bg-blue-100 text-blue-700" />
          <StatCard title={t.balance} value="Rs 0" subtitle={t.fromLedger} icon={BarChart3} color="bg-amber-100 text-amber-700" />
          <StatCard title={t.listings} value="0" subtitle={t.activeCrops} icon={Wheat} color="bg-emerald-100 text-emerald-700" />
        </motion.div>
      )}

      {role === "shopkeeper" && (
        <motion.div variants={container} className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <StatCard title={t.products} value="0" subtitle={t.inCatalog} icon={Package} color="bg-green-100 text-green-700" />
          <StatCard title={t.pendingOrders} value="0" subtitle={t.toFulfill} icon={ShoppingCart} color="bg-blue-100 text-blue-700" />
          <StatCard title={t.creditOrders} value="0" subtitle={t.outstanding} icon={Banknote} color="bg-amber-100 text-amber-700" />
        </motion.div>
      )}

      {role === "broker" && (
        <motion.div variants={container} className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <StatCard title={t.advances} value="0" subtitle={t.offerAdvanceDesc.slice(0, 30)} icon={Banknote} color="bg-green-100 text-green-700" />
          <StatCard title="Pending" value="0" subtitle={t.settledText?.slice(0, 30) || "Awaiting"} icon={TrendingUp} color="bg-amber-100 text-amber-700" />
          <StatCard title={t.commission} value="Rs 0" subtitle={t.thisSeason} icon={BarChart3} color="bg-emerald-100 text-emerald-700" />
        </motion.div>
      )}

      {role === "factory" && (
        <motion.div variants={container} className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <StatCard title={t.openDemands} value="0" subtitle={t.acceptingApps} icon={ClipboardList} color="bg-green-100 text-green-700" />
          <StatCard title={t.pendingDelivery} value="0" subtitle={t.approvedAllocs} icon={Package} color="bg-blue-100 text-blue-700" />
          <StatCard title={t.totalProcured} value="0 kg" subtitle={t.procuredSeason} icon={Wheat} color="bg-amber-100 text-amber-700" />
        </motion.div>
      )}

      {/* Quick Actions */}
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
        </motion.div>
      </motion.div>
    </motion.div>
  );
}