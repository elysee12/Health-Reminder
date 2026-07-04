import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isCheckingAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isCheckingAuth) {
      if (!user) {
        navigate('/');
      } else if (allowedRoles && allowedRoles.length > 0) {
        const userRole = user.role;
        if (!allowedRoles.includes(userRole)) {
          // Redirect to appropriate dashboard based on role
          if (userRole === 'admin') {
            navigate('/admin');
          } else if (userRole === 'provider') {
            navigate('/provider');
          } else if (userRole === 'patient') {
            navigate('/patient');
          }
        }
      }
    }
  }, [user, isCheckingAuth, navigate, allowedRoles]);

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user.role;
    if (!allowedRoles.includes(userRole)) {
      return null;
    }
  }

  return <>{children}</>;
}
