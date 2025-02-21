import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export function useAuth() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (
      localStorage.getItem('token') === null &&
      location.pathname !== '/login'
    ) {
      navigate('/login');
    }

    if (
      localStorage.getItem('token') !== null &&
      location.pathname === '/login'
    ) {
      navigate('/');
    }

    setLoading(false);
  }, [navigate, location]);

  return { loading };
}
