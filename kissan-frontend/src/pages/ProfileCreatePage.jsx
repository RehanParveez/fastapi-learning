import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import { useNavigate } from "react-router-dom";

export default function ProfileCreatePage() {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [existing, setExisting] = useState(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({ business_name: "", location: "", land_size_acres: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/profiles/me")
      .then((data) => {
        setExisting(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    let endpoint = "";
    let payload = {};

    if (role === "farmer") {
      endpoint = "/profiles/farmer";
      payload = { land_size_acres: parseFloat(form.land_size_acres) || null, location: form.location || null };
    } else {
      endpoint = `/profiles/${role}`;
      payload = { business_name: form.business_name, location: form.location || null };
    }

    try {
      await api.post(endpoint, payload);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <div className="p-8 text-center">Checking profile...</div>;
  if (existing) {
    return (
      <div className="max-w-md mx-auto mt-12 bg-white p-6 rounded shadow text-center">
        <h2 className="text-xl font-bold text-green-700">Profile already exists</h2>
        <p className="mt-2 text-gray-600">You can continue using the platform.</p>
        <button onClick={() => navigate("/")} className="mt-4 bg-green-700 text-white px-4 py-2 rounded">
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-12 bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Create your {role} profile</h2>
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {role !== "farmer" && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Business Name</label>
            <input required value={form.business_name} onChange={(e) => setForm({...form, business_name: e.target.value})}
              className="w-full mt-1 border rounded px-3 py-2" />
          </div>
        )}
        {role === "farmer" && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Land Size (acres)</label>
            <input type="number" value={form.land_size_acres} onChange={(e) => setForm({...form, land_size_acres: e.target.value})}
              className="w-full mt-1 border rounded px-3 py-2" />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700">Location</label>
          <input value={form.location} onChange={(e) => setForm({...form, location: e.target.value})}
            className="w-full mt-1 border rounded px-3 py-2" placeholder="Village / City" />
        </div>
        <button type="submit" className="w-full bg-green-700 text-white py-2 rounded hover:bg-green-800">
          Save Profile
        </button>
      </form>
    </div>
  );
}