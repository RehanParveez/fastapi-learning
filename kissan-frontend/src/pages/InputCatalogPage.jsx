import { useState, useEffect } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function InputCatalogPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", category: "seed", unit_price: "", stock_qty: "" });
  const [error, setError] = useState("");

  const categories = [
    { value: "seed", label: "🌱 Seed" },
    { value: "fertilizer", label: "🧪 Fertilizer" },
    { value: "pesticide", label: "🐛 Pesticide" },
    { value: "equipment", label: "🛠️ Equipment" },
    { value: "other", label: "📦 Other" },
  ];

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
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
      loadProducts();
    } catch (err) {
      setError(err.message);
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

      {/* Add Product Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-stone-800 mb-4">New Product</h3>
          {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Product Name</label>
              <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Category</label>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none">
                {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
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
      )}

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">Product</th>
              <th className="px-6 py-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">Unit Price</th>
              <th className="px-6 py-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {loading ? (
              <tr><td colSpan="5" className="px-6 py-8 text-center text-stone-400">Loading...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan="5" className="px-6 py-8 text-center text-stone-400">No products yet. Add your first product above.</td></tr>
            ) : (
              products.map(p => (
                <tr key={p.id} className="hover:bg-stone-50 transition">
                  <td className="px-6 py-4 font-medium text-stone-800">{p.name}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 capitalize">
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
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}