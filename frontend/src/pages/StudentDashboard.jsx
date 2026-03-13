import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function StudentDashboard() {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-8">
        <h1 className="text-2xl font-bold mb-4">Student Dashboard</h1>
        <p className="text-slate-600 mb-8">Welcome, {user?.name || 'Student'}!</p>
        <button 
          onClick={logout}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
