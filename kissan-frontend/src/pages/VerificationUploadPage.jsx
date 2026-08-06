import { useState, useEffect } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import {FileText, Upload, CheckCircle2, Clock, XCircle, AlertTriangle, Loader2, ShieldCheck, User, Building2, MapPin, X
} from "lucide-react";

const DOC_TYPES = [
  { value: "cnic", label: "CNIC (Identity Card)", icon: User, desc: "National identity card front & back" },
  { value: "land_record", label: "Land Record", icon: MapPin, desc: "Land ownership document or lease agreement" },
  { value: "business_reg", label: "Business Registration", icon: Building2, desc: "Shop/business registration certificate" },
];

const STATUS_CONFIG = {
  pending: { color: "bg-amber-100 text-amber-700", icon: Clock, label: "Pending Review" },
  approved: { color: "bg-green-100 text-green-700", icon: CheckCircle2, label: "Approved" },
  rejected: { color: "bg-red-100 text-red-700", icon: XCircle, label: "Rejected" },
};

export default function VerificationUploadPage() {
  const { user, role } = useAuth();
  const { t } = useLanguage();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedType, setSelectedType] = useState("cnic");
  const [fileName, setFileName] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, []);

  async function loadDocuments() {
    setLoading(true);
    try {
      const all = await api.get("/verification/documents").catch(() => []);
      const mine = Array.isArray(all) ? all.filter(d => d.user_id === user?.id) : [];
      setDocuments(mine);
    } catch (err) {
      console.error(err);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!fileName.trim()) {
      setError("Please enter a file path or name");
      return;
    }
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      await api.post("/verification/documents", {
        doc_type: selectedType,
        file_path: fileName.trim(),
      });
      setSuccess("Document submitted for review");
      setFileName("");
      setShowForm(false);
      loadDocuments();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const hasPending = documents.some(d => d.status === "pending");
  const hasApproved = documents.some(d => d.status === "approved");
  const allTypesSubmitted = DOC_TYPES.every(dt => documents.some(d => d.doc_type === dt.value));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Verification Documents</h1>
          <p className="text-stone-500">Submit identity documents for platform verification</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          disabled={allTypesSubmitted && !hasRejected}
          className="bg-green-700 hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-lg font-medium transition flex items-center gap-2"
        >
          {showForm ? <X size={16} /> : <Upload size={16} />}
          {showForm ? "Cancel" : "Submit Document"}
        </button>
      </div>

      {hasApproved && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <ShieldCheck size={18} /> Your account is verified. You have full platform access.
        </motion.div>
      )}
      {hasPending && !hasApproved && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <Clock size={18} /> Documents under review. Some features may be limited until approved.
        </motion.div>
      )}

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

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
                <Upload size={18} className="text-green-600" /> New Document Submission
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Document Type</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {DOC_TYPES.map(dt => {
                      const Icon = dt.icon;
                      const alreadySubmitted = documents.some(d => d.doc_type === dt.value && d.status !== "rejected");
                      return (
                        <button
                          key={dt.value}
                          type="button"
                          onClick={() => !alreadySubmitted && setSelectedType(dt.value)}
                          disabled={alreadySubmitted}
                          className={`relative p-4 rounded-xl border text-left transition ${
                            selectedType === dt.value
                              ? "border-green-500 bg-green-50 ring-1 ring-green-500"
                              : alreadySubmitted
                              ? "border-stone-200 bg-stone-50 opacity-60 cursor-not-allowed"
                              : "border-stone-200 hover:border-green-300 bg-white"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Icon size={16} className={selectedType === dt.value ? "text-green-700" : "text-stone-500"} />
                            <span className={`text-sm font-semibold ${selectedType === dt.value ? "text-green-800" : "text-stone-700"}`}>{dt.label}</span>
                          </div>
                          <p className="text-xs text-stone-500">{dt.desc}</p>
                          {alreadySubmitted && (
                            <span className="absolute top-2 right-2 text-[10px] font-bold text-green-600 bg-green-100 px-1.5 py-0.5 rounded">SUBMITTED</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">File Path / Name</label>
                  <div className="relative">
                    <FileText size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      value={fileName}
                      onChange={e => setFileName(e.target.value)}
                      placeholder="e.g. uploads/cnic_front.jpg"
                      className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm"
                    />
                  </div>
                  <p className="text-xs text-stone-400 mt-1">Enter the path where the document is stored. In production this would be an auto-upload to cloud storage.</p>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg font-medium transition flex items-center gap-2"
                  >
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                    {submitting ? "Submitting..." : "Submit for Review"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
          <h3 className="font-semibold text-stone-800">My Submissions</h3>
          <span className="text-xs text-stone-500">{documents.length} document(s)</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-stone-400 flex items-center justify-center gap-2">
            <Loader2 size={20} className="animate-spin" /> Loading...
          </div>
        ) : documents.length === 0 ? (
          <div className="p-12 text-center text-stone-400">
            <ShieldCheck size={40} className="mx-auto mb-3 text-stone-300" />
            <p>No documents submitted yet.</p>
            <p className="text-sm mt-1">Submit your CNIC to get started with verification.</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {documents.map(doc => {
              const cfg = STATUS_CONFIG[doc.status] || STATUS_CONFIG.pending;
              const StatusIcon = cfg.icon;
              const DocIcon = DOC_TYPES.find(d => d.value === doc.doc_type)?.icon || FileText;
              return (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-5 hover:bg-stone-50 transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-stone-100 text-stone-600 flex items-center justify-center">
                        <DocIcon size={18} />
                      </div>
                      <div>
                        <p className="font-semibold text-stone-800">
                          {DOC_TYPES.find(d => d.value === doc.doc_type)?.label || doc.doc_type}
                        </p>
                        <p className="text-sm text-stone-500">{doc.file_path}</p>
                        <p className="text-xs text-stone-400 mt-0.5">
                          Submitted {new Date(doc.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.color}`}>
                      <StatusIcon size={14} /> {cfg.label}
                    </span>
                  </div>
                  {doc.reviewed_by && (
                    <p className="text-xs text-stone-400 mt-2 pl-14">
                      Reviewed by Admin #{doc.reviewed_by} on {new Date(doc.reviewed_at).toLocaleDateString()}
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm">
        <h3 className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-3">Required Documents</h3>
        <div className="space-y-2">
          {DOC_TYPES.map(dt => {
            const doc = documents.find(d => d.doc_type === dt.value);
            const Icon = dt.icon;
            return (
              <div key={dt.value} className="flex items-center justify-between py-2 border-b border-stone-50 last:border-0">
                <div className="flex items-center gap-3">
                  <Icon size={16} className="text-stone-400" />
                  <span className="text-sm text-stone-700">{dt.label}</span>
                </div>
                {doc ? (
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_CONFIG[doc.status].color}`}>
                    {doc.status}
                  </span>
                ) : (
                  <span className="text-xs font-medium text-stone-400">Not submitted</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}