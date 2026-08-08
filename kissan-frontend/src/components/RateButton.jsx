import { Link } from "react-router-dom";
import { Star } from "lucide-react";

export default function RateButton({ userId, label = "Rate" }) {
  if (!userId) return null;
  return (
    <Link
      to={`/ratings/${userId}`}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition"
    >
      <Star size={12} /> {label}
    </Link>
  );
}