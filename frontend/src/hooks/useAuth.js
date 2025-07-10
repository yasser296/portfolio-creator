// Hook personnalisé pour l'authentification
import { useState, useEffect } from 'react';
import { getCurrentUser, isAuthenticated } from '../utils/auth';

export const useAuth = () => {
  const [user, setUser] = useState(getCurrentUser());
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  
  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated()) {
        try {
          // Vérifier que le token est toujours valide
          const response = await fetch(`${API_URL}/api/auth/me`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));
          } else {
            // Token invalide
            setUser(null);
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
          }
        } catch (error) {
          console.error('Erreur vérification auth:', error);
        }
      }
      setLoading(false);
    };
    
    checkAuth();
  }, []);
  
  return { user, loading, isAuthenticated: !!user };
};