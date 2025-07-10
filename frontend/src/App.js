
// App.js
// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/NavBar';
import Dashboard from './components/Dashboard';
import PortfoliosList from './components/PortfoliosList';
import PortfolioPage from './components/PortfolioPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import ResetPasswordPage from './components/ResetPasswordPage';
import HomePage from './components/HomePage';
import NotFound from './components/NotFound';

// Fonction pour vérifier l'authentification
const isAuthenticated = () => {
  return !!localStorage.getItem('authToken');
};

// Composant pour protéger les routes
const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      {/* Barre de navigation toujours visible */}
      <NavBar />
      
      {/* Routes */}
      <Routes>
        {/* Route d'accueil - Affiche Dashboard si connecté, HomePage sinon */}
        <Route 
          path="/" 
          element={
            isAuthenticated() 
              ? <Dashboard />
              : <HomePage />
          } 
        />
        
        {/* Routes publiques */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        
        {/* Liste des portfolios - accessible à tous */}
        <Route path="/portfolios" element={<PortfoliosList />} />
        
        {/* Portfolio individuel - public mais éditable seulement par le propriétaire */}
        <Route path="/portfolio/:id" element={<PortfolioPage />} />
        
        {/* Dashboard - protégé */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Route 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
