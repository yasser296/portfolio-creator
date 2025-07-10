// Composant pour afficher du contenu conditionnel basé sur l'authentification
import React from 'react';
import { isAuthenticated, isPortfolioOwner } from '../utils/auth';

export const AuthGuard = ({ children, fallback = null, requireAuth = true, portfolioUserId = null }) => {
  const authenticated = isAuthenticated();
  
  // Si l'authentification est requise mais l'utilisateur n'est pas connecté
  if (requireAuth && !authenticated) {
    return fallback;
  }
  
  // Si on vérifie la propriété du portfolio
  if (portfolioUserId && !isPortfolioOwner(portfolioUserId)) {
    return fallback;
  }
  
  return children;
};