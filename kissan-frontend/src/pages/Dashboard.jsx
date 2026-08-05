import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, role } = useAuth();
  return (
    <div className="bg-white p-8 rounded shadow">
      <h1 className="text-2xl font-bold text-green-800">Welcome, {user?.phone}</h1>
      <p className="mt-2 text-gray-600 capitalize">Role: {role}</p>
      <p className="mt-4 text-sm text-gray-500">This is your Kisan dashboard.</p>
    </div>
  );
}