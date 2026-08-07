import { motion, AnimatePresence } from "framer-motion";
import { X, Calculator, CheckCircle2, AlertTriangle, ArrowRight, Banknote, TrendingDown, Wallet } from "lucide-react";

export default function SettlementPreviewModal({ preview, onConfirm, onCancel, loading }) {
  if (!preview) return null;

  const hasInputDeductions = preview.input_credit_deductions && preview.input_credit_deductions.length > 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden"
        >

          <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50">
            <div className="flex items-center gap-2">
              <Calculator size={18} className="text-green-700" />
              <h3 className="font-semibold text-stone-800">Settlement Preview</h3>
            </div>
            <button onClick={onCancel} className="text-stone-400 hover:text-stone-600 transition">
              <X size={18} />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-stone-600">Sale Amount</span>
              <span className="font-semibold text-stone-800">Rs {preview.sale_amount.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-stone-100">
              <div className="flex items-center gap-2 text-sm text-stone-600">
                <Banknote size={14} className="text-amber-600" />
                Broker Commission ({(preview.commission_rate * 100).toFixed(1)}%)
              </div>
              <span className="font-semibold text-red-600">– Rs {preview.commission_amount.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-stone-100">
              <div className="flex items-center gap-2 text-sm text-stone-600">
                <TrendingDown size={14} className="text-blue-600" />
                Advance Repayment
              </div>
              <span className="font-semibold text-red-600">– Rs {preview.advance_repayment.toLocaleString()}</span>
            </div>

            {hasInputDeductions && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Input Credit Deductions</p>
                {preview.input_credit_deductions.map((cred) => (
                  <div key={cred.order_id} className="flex items-center justify-between py-1.5 px-3 bg-amber-50 rounded-lg border border-amber-100">
                    <div className="text-sm text-stone-700">
                      Order #{cred.order_id} <span className="text-stone-400">(Shop #{cred.shopkeeper_id})</span>
                    </div>
                    <span className="text-sm font-semibold text-amber-700">– Rs {cred.deducted.toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between py-1 text-sm">
                  <span className="text-stone-500">Total Input Credit Deducted</span>
                  <span className="font-semibold text-amber-700">– Rs {preview.total_input_credit_deducted.toLocaleString()}</span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between py-3 px-4 bg-green-50 rounded-xl border border-green-200">
              <div className="flex items-center gap-2">
                <Wallet size={18} className="text-green-700" />
                <span className="font-semibold text-stone-800">Net to Farmer</span>
              </div>
              <span className="text-xl font-bold text-green-700">Rs {preview.net_to_farmer.toLocaleString()}</span>
            </div>
        
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <CheckCircle2 size={14} className="text-green-600" />
              Advance will be marked <span className="font-semibold capitalize">{preview.advance_status_after.value}</span>
              {preview.advance_remaining_balance > 0 && (
                <span>(remaining balance: Rs {preview.advance_remaining_balance.toLocaleString()})</span>
              )}
            </div>
          </div>

          <div className="px-6 py-4 border-t border-stone-100 flex gap-3 bg-stone-50">
            <button
              onClick={onCancel}
              className="px-4 py-2.5 border border-stone-300 rounded-lg text-sm font-medium text-stone-600 hover:bg-white transition"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="animate-pulse">Processing...</span>
              ) : (
                <>
                  Confirm Settlement <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}