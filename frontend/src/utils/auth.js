// Utilitaires pour l'authentification

// Récupérer le token stocké
export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Récupérer l'utilisateur connecté
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (e) {
      return null;
    }
  }
  return null;
};

// Vérifier si l'utilisateur est connecté
export const isAuthenticated = () => {
  return !!getAuthToken();
};

// Se déconnecter
export const logout = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  // Vider le cache si il existe
  if (window.portfolioCache) {
    window.portfolioCache.clear();
  }
};

// Faire une requête authentifiée
export const authFetch = async (url, options = {}) => {
  const token = getAuthToken();
  
  const headers = {
    ...options.headers
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(url, {
    ...options,
    headers
  });
  
  // Si non autorisé, déconnecter l'utilisateur
  if (response.status === 401 || response.status === 403) {
    logout();
    window.location.href = '/login';
    throw new Error('Session expirée');
  }
  
  return response;
};

// Vérifier si l'utilisateur est propriétaire du portfolio
export const isPortfolioOwner = (portfolioUserId) => {
  const currentUser = getCurrentUser();
  return currentUser && currentUser.id === portfolioUserId;
};