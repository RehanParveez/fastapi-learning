import { useState, useEffect } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function InputOrdersPage() {
  const { user, role } = useAuth();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]); 
  const [paymentMode, setPaymentMode] = useState("cash");
  const [creditMarkup, setCreditMarkup] = useState(15); 
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadProducts();
  }, []);

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
      setTimeout(() => setSuccess(""), 3000);
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
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
          ✅ {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Catalog */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-stone-800">Available Products</h2>
          {loading ? (
            <div className="text-stone-400 py-8 text-center">Loading products...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.map(p => (
                <div key={p.id} className="bg-white rounded-xl border border-stone-200 p-5 hover:shadow-md transition">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-stone-800">{p.name}</h3>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full capitalize">
                        {p.category}
                      </span>
                    </div>
                    <p className="text-lg font-bold text-green-700">Rs {p.unit_price}</p>
                  </div>
                  <p className="text-sm text-stone-500 mt-2">Stock: {p.stock_qty} units</p>
                  <button
                    onClick={() => addToCart(p)}
                    disabled={p.stock_qty <= 0 || cart.find(c => c.product.id === p.id)}
                    className="mt-3 w-full py-2 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed bg-green-700 hover:bg-green-800 text-white"
                  >
                    {cart.find(c => c.product.id === p.id) ? "✓ Added" : "Add to Order"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Summary */}
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
                      <p className="text-xs text-stone-500">Rs {c.product.unit_price} × {c.qty}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQty(c.product.id, c.qty - 1)} className="w-6 h-6 rounded bg-stone-100 hover:bg-stone-200 flex items-center justify-center">−</button>
                      <span className="text-sm font-medium w-6 text-center">{c.qty}</span>
                      <button onClick={() => updateQty(c.product.id, c.qty + 1)} className="w-6 h-6 rounded bg-stone-100 hover:bg-stone-200 flex items-center justify-center">+</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Payment Mode */}
            <div className="space-y-3 mb-4">
              <label className="block text-sm font-medium text-stone-700">Payment Mode</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setPaymentMode("cash")}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition border ${
                    paymentMode === "cash" ? "bg-green-700 text-white border-green-700" : "bg-white text-stone-600 border-stone-300 hover:border-green-500"
                  }`}
                >
                  💵 Cash
                </button>
                <button
                  onClick={() => setPaymentMode("credit")}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition border ${
                    paymentMode === "credit" ? "bg-green-700 text-white border-green-700" : "bg-white text-stone-600 border-stone-300 hover:border-green-500"
                  }`}
                >
                  💳 Credit
                </button>
              </div>
            </div>

            {/* Credit Markup (only if credit) */}
            {paymentMode === "credit" && (
              <div className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <label className="block text-sm font-medium text-amber-800 mb-1">Credit Markup</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={creditMarkup}
                    onChange={e => setCreditMarkup(Number(e.target.value))}
                    className="w-20 border border-amber-300 rounded px-2 py-1 text-sm"
                  />
                  <span className="text-sm text-amber-700">%</span>
                </div>
                <p className="text-xs text-amber-600 mt-1">Shopkeeper's credit surcharge</p>
              </div>
            )}

            {/* Totals */}
            <div className="border-t border-stone-200 pt-3 space-y-1">
              <div className="flex justify-between text-sm text-stone-600">
                <span>Subtotal</span>
                <span>Rs {subtotal.toLocaleString()}</span>
              </div>
              {paymentMode === "credit" && (
                <div className="flex justify-between text-sm text-amber-600">
                  <span>Credit Markup ({creditMarkup}%)</span>
                  <span>Rs {creditCost.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-stone-800 pt-2 border-t border-stone-100">
                <span>Total</span>
                <span>Rs {total.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={placeOrder}
              disabled={cart.length === 0 || placing}
              className="w-full mt-4 bg-green-700 hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition"
            >
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

  useEffect(() => {
    api.get("/input-orders/mine").then(data => {
      setOrders(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-800">Incoming Orders</h1>
        <p className="text-stone-500">Orders placed by farmers for your products</p>
      </div>
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-stone-500 uppercase">Order ID</th>
              <th className="px-6 py-4 text-xs font-semibold text-stone-500 uppercase">Farmer</th>
              <th className="px-6 py-4 text-xs font-semibold text-stone-500 uppercase">Payment</th>
              <th className="px-6 py-4 text-xs font-semibold text-stone-500 uppercase">Amount</th>
              <th className="px-6 py-4 text-xs font-semibold text-stone-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {loading ? (
              <tr><td colSpan="5" className="px-6 py-8 text-center text-stone-400">Loading...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan="5" className="px-6 py-8 text-center text-stone-400">No orders yet.</td></tr>
            ) : (
              orders.map(o => (
                <tr key={o.id} className="hover:bg-stone-50">
                  <td className="px-6 py-4 font-medium text-stone-800">#{o.id}</td>
                  <td className="px-6 py-4 text-stone-600">Farmer #{o.farmer_id}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                      o.payment_mode === "credit" ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800"
                    }`}>
                      {o.payment_mode}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-stone-600">Rs {o.total_amount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-medium capitalize ${
                      o.status === "settled" ? "text-green-600" : "text-amber-600"
                    }`}>
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}