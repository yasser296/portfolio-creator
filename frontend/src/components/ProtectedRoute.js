// frontend/src/components/ProtectedRoute.js
import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { isAuthenticated, getCurrentUser } from '../utils/auth';

const ProtectedRoute = ({ children, requireOwnership = false }) => {
  const { id } = useParams();
  const currentUser = getCurrentUser();
  
  // Vérifier si l'utilisateur est connecté
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  
  // Si on doit vérifier la propriété du portfolio
  if (requireOwnership && id) {
    const portfolioId = parseInt(id);
    if (currentUser.id !== portfolioId) {
      // L'utilisateur n'est pas propriétaire, rediriger vers son propre portfolio
      return <Navigate to={`/portfolio/${currentUser.id}`} replace />;
    }
  }
  
  return children;
};

export default ProtectedRoute;