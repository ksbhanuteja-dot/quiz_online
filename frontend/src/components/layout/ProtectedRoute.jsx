import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Loader } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader size={40} className="animate-spin text-primary-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role?.toLowerCase())) {
    // If not allowed, redirect to generic dashboard or login
    if (user.role?.toLowerCase() === 'instructor') {
      return <Navigate to="/dashboard" replace />;
    }
    return <Navigate to="/student-dashboard" replace />;
  }

  return children;
}
