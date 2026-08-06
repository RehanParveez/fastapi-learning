
import { useState, useEffect } from "react";
import { api } from "../api/client";
import { motion } from "framer-motion";
import {CheckCircle2, XCircle, FileText, AlertTriangle, Loader2, Clock, User
} from "lucide-react";

export default function AdminDocsPage() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filter, setFilter] = useState("pending");

  useEffect(() => { loadDocs(); }, [filter]);

  async function loadDocs() {
    setLoading(true);
    try {
      const url = filter === "all" ? "/verification/documents" : `/verification/documents?status_filter=${filter}`;
      const data = await api.get(url);
      setDocs(data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  async function handleReview(docId, status) {
    setError(""); setSuccess("");
    try {
      await api.patch(`/verification/documents/${docId}`, { status });
      setSuccess(`Document ${status}`);
      loadDocs();
    } catch (err) { setError(err.message); }
  }

  const docTypeLabels = {
    cnic: "CNIC",
    land_record: "Land Record",
    business_reg: "Business Registration",
  };

  const statusBadge = (status) => {
    const map = {
      pending: { bg: "bg-amber-100", text: "text-amber-700", icon: <Clock size={14} /> },
      approved: { bg: "bg-green-100", text: "text-green-700", icon: <CheckCircle2 size={14} /> },
      rejected: { bg: "bg-red-100", text: "text-red-700", icon: <XCircle size={14} /> },
    };
    const s = map[status] || map.pending;
    return <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${s.bg} ${s.text}`}>{s.icon} {status}</span>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-800">Verify Documents</h1>
        <p className="text-stone-500">Review and approve user verification submissions</p>
      </div>

      {success && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2"><CheckCircle2 size={18} /> {success}</motion.div>}
      {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2"><AlertTriangle size={18} /> {error}</motion.div>}

      <div className="flex gap-2">
        {["pending", "approved", "rejected", "all"].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-medium transition border capitalize ${filter === f ? "bg-green-700 text-white border-green-700" : "bg-white text-stone-600 border-stone-300 hover:border-green-500"}`}>
            {f}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-stone-400 flex items-center justify-center gap-2"><Loader2 size={20} className="animate-spin" /> Loading...</div>
        ) : docs.length === 0 ? (
          <div className="p-12 text-center text-stone-400"><FileText size={40} className="mx-auto mb-3 text-stone-300" /><p>No documents found.</p></div>
        ) : (
          <div className="divide-y divide-stone-100">
            {docs.map(doc => (
              <div key={doc.id} className="p-5 hover:bg-stone-50 transition">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-stone-100 text-stone-600 flex items-center justify-center"><FileText size={18} /></div>
                    <div>
                      <p className="font-semibold text-stone-800">{docTypeLabels[doc.doc_type] || doc.doc_type}</p>
                      <p className="text-sm text-stone-500">User #{doc.user_id} · Submitted {new Date(doc.created_at).toLocaleDateString()}</p>
                      {doc.file_path && <p className="text-xs text-stone-400 mt-0.5">{doc.file_path}</p>}
                    </div>
                  </div>
                  <div>{statusBadge(doc.status)}</div>
                </div>

                {doc.status === "pending" && (
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => handleReview(doc.id, "approved")} className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5">
                      <CheckCircle2 size={14} /> Approve
                    </button>
                    <button onClick={() => handleReview(doc.id, "rejected")} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5">
                      <XCircle size={14} /> Reject
                    </button>
                  </div>
                )}

                {doc.reviewed_by && (
                  <p className="text-xs text-stone-400 mt-2">Reviewed by Admin #{doc.reviewed_by} on {new Date(doc.reviewed_at).toLocaleDateString()}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}