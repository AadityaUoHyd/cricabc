// src/hooks/useRestoreUser.ts
import { useEffect } from 'react';
import { useUser } from '../context/UserContext';

export const useRestoreUser = () => {
  const { setUser } = useUser();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const email = payload.sub;
        if (email) {
          setUser({ email });
        }
      } catch (err) {
        console.error('Error decoding token:', err);
      }
    }
  }, []);
};
