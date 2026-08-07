import { useState, useEffect } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Check, X, Loader2, Sprout, FlaskConical, Bug, Wrench, Package } from "lucide-react";

export default function InputCatalogPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", category: "seed", unit_price: "", stock_qty: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", unit_price: "", stock_qty: "" });
  const [savingId, setSavingId] = useState(null);

  const categories = [
    { value: "seed", label: "Seed", icon: Sprout, color: "text-emerald-600" },
    { value: "fertilizer", label: "Fertilizer", icon: FlaskConical, color: "text-blue-600" },
    { value: "pesticide", label: "Pesticide", icon: Bug, color: "text-red-600" },
    { value: "equipment", label: "Equipment", icon: Wrench, color: "text-stone-600" },
    { value: "other", label: "Other", icon: Package, color: "text-amber-600" },
  ];

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    setLoading(true);
    try {
      const data = await api.get(`/inputs/products?shopkeeper_id=${user.id}`);
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/inputs/products", {
        name: form.name,
        category: form.category,
        unit_price: parseFloat(form.unit_price),
        stock_qty: parseFloat(form.stock_qty),
      });
      setForm({ name: "", category: "seed", unit_price: "", stock_qty: "" });
      setShowForm(false);
      setSuccess("Product added successfully");
      setTimeout(() => setSuccess(""), 3000);
      loadProducts();
    } catch (err) {
      setError(err.message);
    }
  }

  function startEdit(product) {
    setEditingId(product.id);
    setEditForm({
      name: product.name,
      unit_price: product.unit_price.toString(),
      stock_qty: product.stock_qty.toString(),
    });
    setError("");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({ name: "", unit_price: "", stock_qty: "" });
  }

  async function saveEdit(productId) {
    setSavingId(productId);
    setError("");
    try {
      await api.patch(`/inputs/products/${productId}`, {
        name: editForm.name || undefined,
        unit_price: editForm.unit_price ? parseFloat(editForm.unit_price) : undefined,
        stock_qty: editForm.stock_qty ? parseFloat(editForm.stock_qty) : undefined,
      });
      setSuccess("Product updated");
      setTimeout(() => setSuccess(""), 3000);
      setEditingId(null);
      loadProducts();
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">My Catalog</h1>
          <p className="text-stone-500">Manage your agricultural input products</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-700 hover:bg-green-800 text-white px-5 py-2.5 rounded-lg font-medium transition flex items-center gap-2"
        >
          {showForm ? "✕ Cancel" : "➕ Add Product"}
        </button>
      </div>

      {success && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <Check size={18} /> {success}
        </motion.div>
      )}
      {error && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <X size={18} /> {error}
        </motion.div>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-stone-800 mb-4">New Product</h3>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Product Name</label>
                  <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={e => setForm({...form, category: e.target.value})}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
                  >
                    {categories.map(c => {
                      const Icon = c.icon;
                      return (
                        <option key={c.value} value={c.value} className="flex items-center gap-2">
                          {c.label}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Unit Price (Rs)</label>
                  <input required type="number" min="0" step="0.01" value={form.unit_price}
                    onChange={e => setForm({...form, unit_price: e.target.value})}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Stock Qty</label>
                  <input required type="number" min="0" step="0.1" value={form.stock_qty}
                    onChange={e => setForm({...form, stock_qty: e.target.value})}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none" />
                </div>
                <div className="md:col-span-4">
                  <button type="submit" className="bg-green-700 hover:bg-green-800 text-white px-6 py-2.5 rounded-lg font-medium transition">
                    Save Product
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">Product</th>
              <th className="px-6 py-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">Unit Price</th>
              <th className="px-6 py-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-stone-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {loading ? (
              <tr><td colSpan="6" className="px-6 py-8 text-center text-stone-400">
                <span className="inline-flex items-center gap-2"><Loader2 size={18} className="animate-spin" /> Loading...</span>
              </td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan="6" className="px-6 py-8 text-center text-stone-400">
                <Package size={32} className="mx-auto mb-2 text-stone-300" />
                <p>No products yet. Add your first product above.</p>
              </td></tr>
            ) : (
              products.map(p => (
                <tr key={p.id} className="hover:bg-stone-50 transition">
                  {editingId === p.id ? (
                    <>
                      <td className="px-6 py-4">
                        <input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})}
                          className="w-full border border-stone-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-700 capitalize">
                          {(() => {
                            const cfg = categories.find(c => c.value === p.category);
                            const Icon = cfg?.icon || Package;
                            return <Icon size={12} className={cfg?.color || "text-stone-500"} />;
                          })()}
                          {p.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <input type="number" min="0" step="0.01" value={editForm.unit_price}
                          onChange={e => setEditForm({...editForm, unit_price: e.target.value})}
                          className="w-28 border border-stone-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                      </td>
                      <td className="px-6 py-4">
                        <input type="number" min="0" step="0.1" value={editForm.stock_qty}
                          onChange={e => setEditForm({...editForm, stock_qty: e.target.value})}
                          className="w-28 border border-stone-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                      </td>
                      <td className="px-6 py-4">
                        {parseFloat(editForm.stock_qty) > 0 ? (
                          <span className="text-green-600 text-sm font-medium">● In Stock</span>
                        ) : (
                          <span className="text-red-500 text-sm font-medium">● Out of Stock</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => saveEdit(p.id)} disabled={savingId === p.id}
                            className="bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1">
                            {savingId === p.id ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                            Save
                          </button>
                          <button onClick={cancelEdit}
                            className="border border-stone-300 hover:bg-stone-100 text-stone-600 px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1">
                            <X size={12} /> Cancel
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4 font-medium text-stone-800">{p.name}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-700 capitalize">
                          {(() => {
                            const cfg = categories.find(c => c.value === p.category);
                            const Icon = cfg?.icon || Package;
                            return <Icon size={12} className={cfg?.color || "text-stone-500"} />;
                          })()}
                          {p.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-stone-600">Rs {p.unit_price.toLocaleString()}</td>
                      <td className="px-6 py-4 text-stone-600">{p.stock_qty} units</td>
                      <td className="px-6 py-4">
                        {p.stock_qty > 0 ? (
                          <span className="text-green-600 text-sm font-medium">● In Stock</span>
                        ) : (
                          <span className="text-red-500 text-sm font-medium">● Out of Stock</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => startEdit(p)}
                          className="text-stone-400 hover:text-green-700 transition p-1.5 rounded-lg hover:bg-green-50"
                          title="Edit product">
                          <Pencil size={16} />
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}