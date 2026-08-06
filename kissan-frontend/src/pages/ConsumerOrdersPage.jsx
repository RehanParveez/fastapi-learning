import { useState, useEffect } from "react";
import { api } from "../api/client";
import { motion } from "framer-motion";
import { Package, CheckCircle2, Clock, AlertTriangle, Loader2, MapPin } from "lucide-react";

export default function ConsumerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => { loadOrders(); }, []);

  async function loadOrders() {
    setLoading(true);
    try {
      const data = await api.get("/listings/orders/mine");
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const statusIcons = {
    placed: <Clock size={16} className="text-amber-600" />,
    delivered: <CheckCircle2 size={16} className="text-green-600" />,
    cancelled: <AlertTriangle size={16} className="text-red-600" />,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-800">My Orders</h1>
        <p className="text-stone-500">Track your farm-fresh produce orders</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertTriangle size={18} /> {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-stone-400 flex items-center justify-center gap-2">
            <Loader2 size={20} className="animate-spin" /> Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-stone-400">
            <Package size={40} className="mx-auto mb-3 text-stone-300" />
            <p>No orders yet.</p>
            <p className="text-sm mt-1">Browse listings and place your first order.</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {orders.map(order => (
              <motion.div key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-5 hover:bg-stone-50 transition">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 text-green-700 flex items-center justify-center">
                      <Package size={18} />
                    </div>
                    <div>
                      <p className="font-semibold text-stone-800">Order #{order.id}</p>
                      <p className="text-xs text-stone-500">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize bg-stone-100 text-stone-600">
                    {statusIcons[order.status] || <Clock size={16} className="text-stone-400" />}
                    {order.status}
                  </div>
                </div>

                <div className="space-y-2 mb-3">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-sm border-b border-stone-50 pb-1">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        <span className="text-stone-700">Listing #{item.listing_id}</span>
                        <span className="text-stone-400">× {item.qty}</span>
                      </div>
                      <span className="font-medium text-stone-800">Rs {item.subtotal.toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                  <div className="flex items-center gap-1.5 text-sm text-stone-500">
                    <MapPin size={14} className="text-green-600" /> Cash on Delivery
                  </div>
                  <p className="text-lg font-bold text-stone-800">Rs {order.total_amount.toLocaleString()}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}