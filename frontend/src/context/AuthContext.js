// frontend/src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children, onNavigate }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem('authToken'));

  // Configurer le token dans localStorage
  const setupAuthHeader = (token) => {
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  };

  // Vérifier le token au chargement
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
          } else {
            // Token invalide
            logout();
          }
        } catch (error) {
          console.error('Erreur vérification auth:', error);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        setToken(data.token);
        setUser(data.user);
        setupAuthHeader(data.token);
        
        // Utiliser le callback de navigation
        if (onNavigate) {
          onNavigate(`/portfolio/${data.user.id}`);
        }
        
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Erreur login:', error);
      return { success: false, message: 'Erreur de connexion au serveur' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (response.ok) {
        setToken(data.token);
        setUser(data.user);
        setupAuthHeader(data.token);
        
        // Utiliser le callback de navigation
        if (onNavigate) {
          onNavigate(`/portfolio/${data.user.id}`);
        }
        
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Erreur inscription:', error);
      return { success: false, message: 'Erreur de connexion au serveur' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setupAuthHeader(null);
    
    // Vider le cache des portfolios
    if (window.portfolioCache) {
      window.portfolioCache.clear();
    }
    
    // Utiliser le callback de navigation
    if (onNavigate) {
      onNavigate('/login');
    }
  };

  // Fonction pour faire des appels API authentifiés
  const authFetch = async (url, options = {}) => {
    if (!token) {
      throw new Error('Pas de token d\'authentification');
    }

    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    };

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (response.status === 401 || response.status === 403) {
      // Token expiré ou invalide
      logout();
      throw new Error('Session expirée');
    }

    return response;
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      authFetch,
      isAuthenticated: !!user,
      token
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook pour utiliser le contexte d'authentification
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;