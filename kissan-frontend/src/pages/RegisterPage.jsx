import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ phone: "", email: "", password: "", role: "farmer" });
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await register(form);
      navigate("/login");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-16 bg-white p-8 rounded shadow">
      <h1 className="text-2xl font-bold mb-6 text-center">Register on Kisan</h1>
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Phone</label>
          <input name="phone" value={form.phone} onChange={handleChange} required
            className="w-full mt-1 border rounded px-3 py-2" placeholder="03xx..." />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email (optional)</label>
          <input name="email" type="email" value={form.email} onChange={handleChange}
            className="w-full mt-1 border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input name="password" type="password" value={form.password} onChange={handleChange} required
            className="w-full mt-1 border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Role</label>
          <select name="role" value={form.role} onChange={handleChange}
            className="w-full mt-1 border rounded px-3 py-2">
            <option value="farmer">Farmer</option>
            <option value="shopkeeper">Shopkeeper</option>
            <option value="broker">Broker</option>
            <option value="factory">Factory</option>
            <option value="consumer">Consumer</option>
          </select>
        </div>
        <button type="submit" className="w-full bg-green-700 text-white py-2 rounded hover:bg-green-800">
          Create Account
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-600">
        Already have an account? <Link to="/login" className="text-green-700 underline">Login</Link>
      </p>
    </div>
  );
}