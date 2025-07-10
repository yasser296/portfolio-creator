// frontend/src/components/NavBar.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, User, LogOut, Menu, X, FolderOpen } from 'lucide-react';

const NavBar = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Récupérer l'utilisateur actuel
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isAuthenticated = !!localStorage.getItem('authToken');
  
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/';
  };
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent"
          >
            Portfolio Creator
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              to="/" 
              className="flex items-center px-3 py-2 text-gray-300 hover:text-white transition"
            >
              <Home className="w-4 h-4 mr-1" />
              Accueil
            </Link>
            
            {isAuthenticated && (
              <>
                <Link 
                  to={`/portfolio/${user?.id}`} 
                  className="flex items-center px-3 py-2 text-gray-300 hover:text-white transition"
                >
                  <User className="w-4 h-4 mr-1" />
                  Mon Portfolio
                </Link>
                
                <Link 
                  to="/portfolios" 
                  className="flex items-center px-3 py-2 text-gray-300 hover:text-white transition"
                >
                  <FolderOpen className="w-4 h-4 mr-1" />
                  Tous les Portfolios
                </Link>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center px-3 py-2 text-red-400 hover:text-red-300 transition"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Déconnexion
                </button>
                
                <div className="ml-4 px-3 py-1 bg-gray-800 rounded-full text-sm text-gray-300">
                  {user?.name}
                </div>
              </>
            )}
            
            {!isAuthenticated && (
              <>
                <Link 
                  to="/login" 
                  className="px-4 py-2 text-gray-300 hover:text-white transition"
                >
                  Connexion
                </Link>
                <Link 
                  to="/register" 
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition"
                >
                  Inscription
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-400 hover:text-white"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link 
              to="/" 
              className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded"
              onClick={() => setIsMenuOpen(false)}
            >
              <Home className="w-4 h-4 inline mr-2" />
              Accueil
            </Link>
            
            {isAuthenticated && (
              <>
                <Link 
                  to={`/portfolio/${user?.id}`} 
                  className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="w-4 h-4 inline mr-2" />
                  Mon Portfolio
                </Link>
                
                <Link 
                  to="/portfolios" 
                  className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FolderOpen className="w-4 h-4 inline mr-2" />
                  Tous les Portfolios
                </Link>
                
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-red-400 hover:text-red-300 hover:bg-gray-700 rounded"
                >
                  <LogOut className="w-4 h-4 inline mr-2" />
                  Déconnexion
                </button>
              </>
            )}
            
            {!isAuthenticated && (
              <>
                <Link 
                  to="/login" 
                  className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Connexion
                </Link>
                <Link 
                  to="/register" 
                  className="block px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Inscription
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;