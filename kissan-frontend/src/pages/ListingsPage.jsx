import { useState, useEffect } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {Wheat, ShoppingCart, Package, CheckCircle2, AlertTriangle, Loader2, Plus, Minus, X, Star
} from "lucide-react";

export default function ListingsPage() {
  const { role } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [retailOnly, setRetailOnly] = useState(false);
  const [buyModal, setBuyModal] = useState(null); 
  const [qty, setQty] = useState(1);
  const [consumerCart, setConsumerCart] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => { loadListings(); }, [retailOnly]);

  async function loadListings() {
    setLoading(true);
    try {
      const data = await api.get(`/listings?retail_only=${retailOnly}`);
      setListings(data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  async function handleBulkPurchase(listingId, quantity) {
    setError(""); setSuccess("");
    try {
      const result = await api.post(`/listings/${listingId}/purchase`, { qty: parseFloat(quantity) });
      setSuccess(`Purchase successful! Paid Rs ${result.amount_paid.toLocaleString()}`);
      setBuyModal(null);
      loadListings();
    } catch (err) { setError(err.message); }
  }

  function addToConsumerCart(listing, qty) {
    const existing = consumerCart.find(c => c.listing.id === listing.id);
    if (existing) {
      setConsumerCart(consumerCart.map(c => c.listing.id === listing.id ? { ...c, qty: c.qty + qty } : c));
    } else {
      setConsumerCart([...consumerCart, { listing, qty }]);
    }
    setBuyModal(null);
  }

  async function placeConsumerOrder() {
    if (consumerCart.length === 0) return;
    setError(""); setSuccess("");
    try {
      await api.post("/listings/orders", {
        items: consumerCart.map(c => ({ listing_id: c.listing.id, qty: c.qty })),
      });
      setSuccess("Order placed! Cash on delivery.");
      setConsumerCart([]);
      setShowCheckout(false);
      loadListings();
    } catch (err) { setError(err.message); }
  }

  const isConsumer = role === "consumer";
  const isBrokerOrFactory = role === "broker" || role === "factory";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Crop Marketplace</h1>
          <p className="text-stone-500">Browse and purchase crop listings</p>
        </div>
        <div className="flex items-center gap-3">
          {isConsumer && (
            <button onClick={() => setShowCheckout(!showCheckout)} className="relative bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2">
              <ShoppingCart size={16} /> Cart ({consumerCart.length})
            </button>
          )}
          <button onClick={() => setRetailOnly(!retailOnly)} className={`px-4 py-2 rounded-lg text-sm font-medium transition border ${retailOnly ? "bg-green-700 text-white border-green-700" : "bg-white text-stone-600 border-stone-300 hover:border-green-500"}`}>
            {retailOnly ? "Showing Retail Only" : "Show All Listings"}
          </button>
        </div>
      </div>

      {success && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2"><CheckCircle2 size={18} /> {success}</motion.div>}
      {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2"><AlertTriangle size={18} /> {error}</motion.div>}

      <AnimatePresence>
        {showCheckout && isConsumer && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-stone-800">Your Cart</h3>
                <button onClick={() => setShowCheckout(false)} className="text-stone-400 hover:text-stone-600"><X size={18} /></button>
              </div>
              {consumerCart.length === 0 ? (
                <p className="text-sm text-stone-400">Cart is empty.</p>
              ) : (
                <div className="space-y-2 mb-3">
                  {consumerCart.map((c, i) => (
                    <div key={i} className="flex items-center justify-between text-sm border-b border-stone-100 pb-2">
                      <div><p className="font-medium text-stone-800">{c.listing.crop_type}</p><p className="text-stone-500">{c.qty} × Rs {c.listing.price}</p></div>
                      <p className="font-semibold">Rs {(c.qty * c.listing.price).toLocaleString()}</p>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold text-stone-800 pt-1">
                    <span>Total</span>
                    <span>Rs {consumerCart.reduce((s, c) => s + c.qty * c.listing.price, 0).toLocaleString()}</span>
                  </div>
                </div>
              )}
              <button onClick={placeConsumerOrder} disabled={consumerCart.length === 0} className="w-full bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white py-2.5 rounded-lg font-medium transition">
                Place COD Order
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="text-center py-12 text-stone-400 flex items-center justify-center gap-2"><Loader2 size={20} className="animate-spin" /> Loading listings...</div>
      ) : listings.length === 0 ? (
        <div className="text-center py-12 text-stone-400"><Wheat size={40} className="mx-auto mb-3 text-stone-300" /><p>No active listings found.</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {listings.map(listing => (
            <motion.div key={listing.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl border border-stone-200 p-5 hover:shadow-md transition flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-stone-800 text-lg">{listing.crop_type}</h3>
                  <p className="text-xs text-stone-500">Listed by Farmer #{listing.farmer_id}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${listing.quality_grade === "A" ? "bg-green-100 text-green-700" : listing.quality_grade === "B" ? "bg-amber-100 text-amber-700" : "bg-orange-100 text-orange-700"}`}>
                  Grade {listing.quality_grade}
                </span>
              </div>

              <div className="space-y-1 text-sm text-stone-600 mb-4 flex-1">
                <p><span className="text-stone-400">Available:</span> {listing.quantity} units</p>
                <p><span className="text-stone-400">Price:</span> <span className="font-semibold text-green-700">Rs {listing.price}/unit</span></p>
                {listing.retail_available && <p className="text-green-600 text-xs font-medium">✓ Retail available ({listing.retail_unit_size} units/bag)</p>}
              </div>

              <div className="flex gap-2 mt-auto">
                {isBrokerOrFactory && (
                  <button onClick={() => { setBuyModal({ listing, mode: "bulk" }); setQty(Math.min(1, listing.quantity)); }}
                    className="flex-1 bg-green-700 hover:bg-green-800 text-white py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-1.5">
                    <Package size={14} /> Buy Bulk
                  </button>
                )}
                {isConsumer && listing.retail_available && (
                  <button onClick={() => { setBuyModal({ listing, mode: "retail" }); setQty(listing.retail_unit_size || 1); }}
                    className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-1.5">
                    <ShoppingCart size={14} /> Add to Cart
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {buyModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-stone-800">{buyModal.mode === "bulk" ? "Bulk Purchase" : "Add to Cart"}</h3>
                <button onClick={() => setBuyModal(null)} className="text-stone-400 hover:text-stone-600"><X size={18} /></button>
              </div>
              <p className="text-sm text-stone-600 mb-4">{buyModal.listing.crop_type} @ Rs {buyModal.listing.price}/unit</p>
              <div className="flex items-center justify-center gap-3 mb-4">
                <button onClick={() => setQty(Math.max(buyModal.mode === "retail" ? buyModal.listing.retail_unit_size || 1 : 0.1, qty - (buyModal.mode === "retail" ? buyModal.listing.retail_unit_size || 1 : 1)))}
                  className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center"><Minus size={14} /></button>
                <span className="text-lg font-semibold w-16 text-center">{qty}</span>
                <button onClick={() => setQty(qty + (buyModal.mode === "retail" ? buyModal.listing.retail_unit_size || 1 : 1))}
                  className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center"><Plus size={14} /></button>
              </div>
              <p className="text-center text-sm text-stone-500 mb-4">Total: <span className="font-bold text-stone-800">Rs {(qty * buyModal.listing.price).toLocaleString()}</span></p>
              <button onClick={() => {
                if (buyModal.mode === "bulk") handleBulkPurchase(buyModal.listing.id, qty);
                else addToConsumerCart(buyModal.listing, qty);
              }} className="w-full bg-green-700 hover:bg-green-800 text-white py-2.5 rounded-lg font-medium transition">
                {buyModal.mode === "bulk" ? "Confirm Purchase" : "Add to Cart"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}