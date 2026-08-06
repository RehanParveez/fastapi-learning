import { useState, useEffect } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { BarChart3, ArrowUpRight, ArrowDownRight, Loader2, AlertTriangle } from "lucide-react";

export default function RecordPage() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadBalance();
  }, []);

  async function loadBalance() {
    try {
      const data = await api.get("/record/me/balance");
      setBalance(data.balance);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const balanceColor = balance > 0 ? "text-green-700" : balance < 0 ? "text-red-600" : "text-stone-600";
  const balanceBg = balance > 0 ? "bg-green-50 border-green-200" : balance < 0 ? "bg-red-50 border-red-200" : "bg-stone-50 border-stone-200";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-800">My Ledger</h1>
        <p className="text-stone-500">Your running balance and transaction history</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertTriangle size={18} /> {error}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl border p-8 text-center ${balanceBg}`}
      >
        <div className="w-16 h-16 rounded-full bg-white/80 flex items-center justify-center mx-auto mb-4 shadow-sm">
          <BarChart3 size={28} className={balanceColor} />
        </div>
        <p className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-1">Current Balance</p>
        {loading ? (
          <div className="flex items-center justify-center gap-2 text-stone-400 py-2"><Loader2 size={20} className="animate-spin" /> Calculating...</div>
        ) : (
          <p className={`text-5xl font-bold ${balanceColor}`}>
            Rs {balance?.toLocaleString() || "0"}
          </p>
        )}
        <p className="text-sm text-stone-500 mt-2 max-w-md mx-auto">
          {balance > 0
            ? "You have a net credit balance. This is what the platform owes you."
            : balance < 0
            ? "You have a net debit balance. This is what you owe to shopkeepers/brokers."
            : "Your ledger is balanced."}
        </p>
      </motion.div>

      <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-3">Transaction History</h3>
        <div className="text-center py-8 text-stone-400">
          <p>Full ledger entries will appear here once the backend endpoint is added.</p>
          <p className="text-xs mt-1 text-stone-300">(Backend needs: GET /record/me/entries)</p>
        </div>
      </div>
    </div>
  );
}