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

  const [entries, setEntries] = useState([]);

  useEffect(() => {
    loadBalance();
    loadEntries();
  }, []);

  async function loadEntries() {
   try {
    const data = await api.get("/record/me/entries");
    setEntries(data);
   } catch (err) {
    console.error(err);
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
        {entries.length === 0 ? (
          <p className="text-center py-8 text-stone-400">
            No transactions yet.
          </p>
        ) : (
          <div className="divide-y divide-stone-100">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="py-3 flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      entry.direction === "credit"
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  />
                  <div>
                    <p className="font-medium text-stone-700 capitalize">
                      {entry.entry_type.replace(/_/g, " ")}
                    </p>
                    <p className="text-xs text-stone-400">
                      {entry.reference_type} #{entry.reference_id} ·{" "}
                      {new Date(entry.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span
                  className={`font-semibold ${
                    entry.direction === "credit"
                      ? "text-green-700"
                      : "text-red-600"
                  }`}
                >
                  {entry.direction === "credit" ? "+" : "–"} Rs{" "}
                  {Number(entry.amount).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}