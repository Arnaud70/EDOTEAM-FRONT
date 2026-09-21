import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('CLIENT' | 'PRESTATAIRE' | 'ADMIN')[];
}

const isUserProfileComplete = (user: any) => {
  if (!user || user.role === 'ADMIN') {
    return true;
  }

  const hasPhone = !!user.telephone && user.telephone.trim().length > 0;
  const hasLocation = !!user.localisation && user.localisation.trim().length > 0;
  const hasProfessionalTitle = user.role !== 'PRESTATAIRE' || (!!user.titreProfessionnel && user.titreProfessionnel.trim().length > 0);
  const hasDocument = user.role !== 'PRESTATAIRE' || !!user.media?.some((m: any) => m.type === 'DOCUMENT');

  return hasPhone && hasLocation && hasProfessionalTitle && hasDocument;
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#0b1220]">
        <Loader2 className="animate-spin text-elite-emerald" size={48} />
      </div>
    );
  }

  if (!isAuthenticated) {
    sessionStorage.setItem(
      'edoteam-pending-redirect',
      `${location.pathname}${location.search}${location.hash}`,
    );
    const redirectState = location.pathname === '/login' ? undefined : { from: location };
    return <Navigate to="/login" state={redirectState} replace />;
  }

  const requiresProfileCompletion = !!user &&
    location.pathname !== '/complete-profile' &&
    !isUserProfileComplete(user) &&
    (
      location.pathname.startsWith('/dashboard') ||
      location.pathname.startsWith('/messages') ||
      location.pathname.startsWith('/admin') ||
      location.pathname.startsWith('/provider') ||
      location.pathname.startsWith('/bookings') ||
      location.pathname.startsWith('/wallet') ||
      location.pathname.startsWith('/security') ||
      location.pathname.startsWith('/favorites') ||
      location.pathname.startsWith('/settings') ||
      location.pathname.startsWith('/reports')
    );

  if (requiresProfileCompletion) {
    return <Navigate to="/complete-profile" replace />;
  }

  if (allowedRoles && user && !allowedRoles.some(role => role.toUpperCase() === (user.role?.toUpperCase() || ''))) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
