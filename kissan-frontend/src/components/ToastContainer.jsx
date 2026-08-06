import { motion, AnimatePresence } from "framer-motion";
import { X, Banknote, AlertTriangle, CheckCircle2, ClipboardList, Clock, Truck, ShoppingCart, FileText } from "lucide-react";

const ICON_MAP = {
  advance_disbursed: Banknote,
  advance_overdue: AlertTriangle,
  advance_repaid: CheckCircle2,
  contract_allocated: ClipboardList,
  contract_demand_unmet: Clock,
  delivery_recorded: Truck,
  payment_settled: CheckCircle2,
  credit_offer_received: FileText,
  input_order_placed: ShoppingCart,
};

export default function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3 w-80 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = ICON_MAP[toast.event] || FileText;
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              className={`pointer-events-auto rounded-xl border p-4 shadow-lg backdrop-blur-sm ${toast.meta.color}`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">
                  <Icon size={18} strokeWidth={2.2} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{toast.meta.title}</p>
                  {toast.data && (
                    <p className="text-xs mt-0.5 opacity-80 truncate">
                      {JSON.stringify(toast.data).slice(0, 80)}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => onRemove(toast.id)}
                  className="shrink-0 opacity-60 hover:opacity-100 transition"
                >
                  <X size={14} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}