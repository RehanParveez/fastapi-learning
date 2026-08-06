import { useState, useEffect } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {Sprout, ShoppingCart, Banknote, CheckCircle2, AlertTriangle, Loader2, Plus, Minus, X, ArrowRight, Wallet, User, CreditCard, Receipt, TrendingDown
} from "lucide-react";

export default function InputOrdersPage() {
  const { user, role } = useAuth();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [paymentMode, setPaymentMode] = useState("cash");
  const [creditMarkup, setCreditMarkup] = useState(5);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (role === "farmer") loadProducts();
  }, [role]);

  async function loadProducts() {
    try {
      const data = await api.get("/inputs/products");
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function addToCart(product) {
    if (cart.find(c => c.product.id === product.id)) return;
    setCart([...cart, { product, qty: 1 }]);
  }

  function updateQty(productId, qty) {
    if (qty <= 0) {
      setCart(cart.filter(c => c.product.id !== productId));
      return;
    }
    setCart(cart.map(c => c.product.id === productId ? { ...c, qty } : c));
  }

  const subtotal = cart.reduce((sum, c) => sum + c.product.unit_price * c.qty, 0);
  const creditCost = paymentMode === "credit" ? subtotal * (creditMarkup / 100) : 0;
  const total = subtotal + creditCost;

  async function placeOrder() {
    if (cart.length === 0) return;
    setPlacing(true);
    setError("");
    try {
      await api.post("/input-orders", {
        payment_mode: paymentMode,
        credit_markup_percent: paymentMode === "credit" ? creditMarkup / 100 : null,
        items: cart.map(c => ({ product_id: c.product.id, qty: c.qty })),
      });
      setSuccess("Order placed successfully!");
      setCart([]);
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setPlacing(false);
    }
  }

  if (role === "shopkeeper") {
    return <ShopkeeperOrdersView />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-800">Order Inputs</h1>
        <p className="text-stone-500">Browse shopkeeper catalogs and order what you need</p>
      </div>

      {success && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle2 size={18} /> {success}
        </motion.div>
      )}
      {error && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertTriangle size={18} /> {error}
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-stone-800">Available Products</h2>
          {loading ? (
            <div className="text-stone-400 py-8 text-center flex items-center justify-center gap-2"><Loader2 size={20} className="animate-spin" /> Loading...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.map(p => (
                <div key={p.id} className="bg-white rounded-xl border border-stone-200 p-5 hover:shadow-md transition">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-stone-800">{p.name}</h3>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full capitalize">{p.category}</span>
                    </div>
                    <p className="text-lg font-bold text-green-700">Rs {p.unit_price}</p>
                  </div>
                  <p className="text-sm text-stone-500 mt-2">Stock: {p.stock_qty} units</p>
                  <button
                    onClick={() => addToCart(p)}
                    disabled={p.stock_qty <= 0 || cart.find(c => c.product.id === p.id)}
                    className="mt-3 w-full py-2 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed bg-green-700 hover:bg-green-800 text-white"
                  >
                    {cart.find(c => c.product.id === p.id) ? "Added" : "Add to Order"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm sticky top-24">
            <h2 className="text-lg font-semibold text-stone-800 mb-4">Order Summary</h2>
            {cart.length === 0 ? (
              <p className="text-stone-400 text-sm">Your cart is empty. Add products from the catalog.</p>
            ) : (
              <div className="space-y-3 mb-4">
                {cart.map(c => (
                  <div key={c.product.id} className="flex items-center justify-between py-2 border-b border-stone-100">
                    <div>
                      <p className="text-sm font-medium text-stone-800">{c.product.name}</p>
                      <p className="text-xs text-stone-500">Rs {c.product.unit_price} x {c.qty}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQty(c.product.id, c.qty - 1)} className="w-6 h-6 rounded bg-stone-100 hover:bg-stone-200 flex items-center justify-center">-</button>
                      <span className="text-sm font-medium w-6 text-center">{c.qty}</span>
                      <button onClick={() => updateQty(c.product.id, c.qty + 1)} className="w-6 h-6 rounded bg-stone-100 hover:bg-stone-200 flex items-center justify-center">+</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-3 mb-4">
              <label className="block text-sm font-medium text-stone-700">Payment Mode</label>
              <div className="flex gap-2">
                <button onClick={() => setPaymentMode("cash")} className={`flex-1 py-2 rounded-lg text-sm font-medium transition border ${paymentMode === "cash" ? "bg-green-700 text-white border-green-700" : "bg-white text-stone-600 border-stone-300 hover:border-green-500"}`}>Cash</button>
                <button onClick={() => setPaymentMode("credit")} className={`flex-1 py-2 rounded-lg text-sm font-medium transition border ${paymentMode === "credit" ? "bg-green-700 text-white border-green-700" : "bg-white text-stone-600 border-stone-300 hover:border-green-500"}`}>Credit</button>
              </div>
            </div>

            {paymentMode === "credit" && (
              <div className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <label className="block text-sm font-medium text-amber-800 mb-1">Credit Markup</label>
                <div className="flex items-center gap-2">
                  <input type="number" min="0" max="100" value={creditMarkup} onChange={e => setCreditMarkup(Number(e.target.value))} className="w-20 border border-amber-300 rounded px-2 py-1 text-sm" />
                  <span className="text-sm text-amber-700">%</span>
                </div>
                <p className="text-xs text-amber-600 mt-1">Shopkeeper credit surcharge</p>
              </div>
            )}

            <div className="border-t border-stone-200 pt-3 space-y-1">
              <div className="flex justify-between text-sm text-stone-600"><span>Subtotal</span><span>Rs {subtotal.toLocaleString()}</span></div>
              {paymentMode === "credit" && <div className="flex justify-between text-sm text-amber-600"><span>Credit Markup ({creditMarkup}%)</span><span>Rs {creditCost.toLocaleString()}</span></div>}
              <div className="flex justify-between text-lg font-bold text-stone-800 pt-2 border-t border-stone-100"><span>Total</span><span>Rs {total.toLocaleString()}</span></div>
            </div>

            <button onClick={placeOrder} disabled={cart.length === 0 || placing} className="w-full mt-4 bg-green-700 hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition">
              {placing ? "Placing Order..." : "Place Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShopkeeperOrdersView() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [repayModal, setRepayModal] = useState(null);
  const [repayAmount, setRepayAmount] = useState("");
  const [repaying, setRepaying] = useState(false);
  const [filter, setFilter] = useState("all");

  useEffect(() => { loadOrders(); }, []);

  async function loadOrders() {
    setLoading(true);
    try {
      const data = await api.get("/input-orders/mine");
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRepay(orderId) {
    const amount = parseFloat(repayAmount);
    if (!amount || amount <= 0) {
      setError("Enter a valid repayment amount");
      return;
    }
    setRepaying(true);
    setError("");
    setSuccess("");
    try {
      await api.post(`/input-orders/${orderId}/repay`, { amount });
      setSuccess(`Repayment of Rs ${amount.toLocaleString()} recorded`);
      setRepayModal(null);
      setRepayAmount("");
      loadOrders();
    } catch (err) {
      setError(err.message);
    } finally {
      setRepaying(false);
    }
  }

  const filteredOrders = orders.filter(o => {
    if (filter === "credit") return o.payment_mode === "credit";
    if (filter === "cash") return o.payment_mode === "cash";
    return true;
  });

  const creditOrders = orders.filter(o => o.payment_mode === "credit");
  const totalOutstanding = creditOrders.reduce((sum, o) => sum + o.outstanding_balance, 0);
  const totalCreditIssued = creditOrders.reduce((sum, o) => sum + o.total_amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-800">Incoming Orders</h1>
        <p className="text-stone-500">Orders placed by farmers for your products</p>
      </div>

      {success && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle2 size={18} /> {success}
        </motion.div>
      )}
      {error && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertTriangle size={18} /> {error}
        </motion.div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center"><CreditCard size={18} /></div>
            <div>
              <p className="text-2xl font-bold text-stone-800">Rs {totalOutstanding.toLocaleString()}</p>
              <p className="text-xs text-stone-500 uppercase tracking-wider">Total Outstanding</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-green-100 text-green-700 flex items-center justify-center"><Receipt size={18} /></div>
            <div>
              <p className="text-2xl font-bold text-stone-800">Rs {totalCreditIssued.toLocaleString()}</p>
              <p className="text-xs text-stone-500 uppercase tracking-wider">Total Credit Issued</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center"><Wallet size={18} /></div>
            <div>
              <p className="text-2xl font-bold text-stone-800">{creditOrders.filter(o => o.status === "settled").length}</p>
              <p className="text-xs text-stone-500 uppercase tracking-wider">Settled Credits</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        {["all", "credit", "cash"].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-medium transition border capitalize ${filter === f ? "bg-green-700 text-white border-green-700" : "bg-white text-stone-600 border-stone-300 hover:border-green-500"}`}>
            {f === "all" ? "All Orders" : f === "credit" ? "Credit Orders" : "Cash Orders"}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-stone-400 flex items-center justify-center gap-2"><Loader2 size={20} className="animate-spin" /> Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-stone-400"><ShoppingCart size={40} className="mx-auto mb-3 text-stone-300" /><p>No orders found.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-stone-500 uppercase">Order</th>
                  <th className="px-6 py-4 text-xs font-semibold text-stone-500 uppercase">Farmer</th>
                  <th className="px-6 py-4 text-xs font-semibold text-stone-500 uppercase">Payment</th>
                  <th className="px-6 py-4 text-xs font-semibold text-stone-500 uppercase">Total</th>
                  <th className="px-6 py-4 text-xs font-semibold text-stone-500 uppercase">Outstanding</th>
                  <th className="px-6 py-4 text-xs font-semibold text-stone-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-stone-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredOrders.map(o => (
                  <tr key={o.id} className="hover:bg-stone-50 transition">
                    <td className="px-6 py-4 font-medium text-stone-800">#{o.id}</td>
                    <td className="px-6 py-4 text-stone-600 flex items-center gap-1.5"><User size={14} className="text-stone-400" /> #{o.farmer_id}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${o.payment_mode === "credit" ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800"}`}>
                        {o.payment_mode}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-stone-600">Rs {o.total_amount.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      {o.payment_mode === "credit" ? (
                        <span className={`font-semibold ${o.outstanding_balance > 0 ? "text-amber-700" : "text-green-600"}`}>
                          Rs {o.outstanding_balance.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-stone-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-medium capitalize ${o.status === "settled" ? "text-green-600" : "text-amber-600"}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {o.payment_mode === "credit" && o.outstanding_balance > 0 && o.status !== "settled" && (
                        <button onClick={() => { setRepayModal(o); setRepayAmount(""); }}
                          className="bg-green-700 hover:bg-green-800 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1">
                          <TrendingDown size={12} /> Repay
                        </button>
                      )}
                      {o.payment_mode === "credit" && o.outstanding_balance === 0 && (
                        <span className="text-xs text-green-600 font-medium flex items-center gap-1"><CheckCircle2 size={12} /> Paid</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {repayModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-stone-800">Record Repayment</h3>
                <button onClick={() => setRepayModal(null)} className="text-stone-400 hover:text-stone-600"><X size={18} /></button>
              </div>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm"><span className="text-stone-500">Order</span><span className="font-medium">#{repayModal.id}</span></div>
                <div className="flex justify-between text-sm"><span className="text-stone-500">Farmer</span><span className="font-medium">#{repayModal.farmer_id}</span></div>
                <div className="flex justify-between text-sm"><span className="text-stone-500">Total Amount</span><span className="font-medium">Rs {repayModal.total_amount.toLocaleString()}</span></div>
                <div className="flex justify-between text-sm border-t border-stone-100 pt-2"><span className="text-stone-500">Outstanding</span><span className="font-bold text-amber-700">Rs {repayModal.outstanding_balance.toLocaleString()}</span></div>
              </div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Repayment Amount (Rs)</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                max={repayModal.outstanding_balance}
                value={repayAmount}
                onChange={e => setRepayAmount(e.target.value)}
                placeholder={`Max: ${repayModal.outstanding_balance}`}
                className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none mb-4"
              />
              <div className="flex gap-2">
                <button onClick={() => handleRepay(repayModal.id)} disabled={repaying} className="flex-1 bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white py-2.5 rounded-lg font-medium transition">
                  {repaying ? "Recording..." : "Confirm Repayment"}
                </button>
                <button onClick={() => setRepayModal(null)} className="px-4 py-2.5 border border-stone-300 rounded-lg text-sm font-medium text-stone-600 hover:bg-stone-50 transition">
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}