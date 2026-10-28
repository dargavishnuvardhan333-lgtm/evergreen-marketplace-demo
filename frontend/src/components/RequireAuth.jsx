import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useStore } from '../context/StoreContext.jsx';

export default function RequireAuth({ admin = false }) {
  const { user, authLoading } = useStore();
  const location = useLocation();
  if (authLoading) return <div className="page-container"><div className="loading">Checking your session…</div></div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (admin && user.role !== 'admin') return <Navigate to="/" replace />;
  return <Outlet />;
}
