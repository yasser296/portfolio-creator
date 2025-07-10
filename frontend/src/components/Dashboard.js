// frontend/src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, FolderOpen, Eye } from 'lucide-react';
// import { TrendingUp, Eye } from 'lucide-react';

const Dashboard = () => {
  const [portfolios, setPortfolios] = useState([]);
  const [stats, setStats] = useState({
    totalPortfolios: 0,
    totalViews: 0,
    totalProjects: 0
  });
  
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  
  useEffect(() => {
    // Charger la liste des portfolios
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        setPortfolios(data);
        setStats({
          totalPortfolios: data.length,
          totalViews: data.reduce((acc, p) => acc + (p.view_count || 0), 0),
          totalProjects: 0 // À implémenter si nécessaire
        });
      })
      .catch(err => console.error('Erreur:', err));
  }, []);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#16172a] to-[#312342ef] pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Bienvenue, {user?.name} !
          </h1>
          <p className="text-gray-400">
            Gérez votre portfolio et découvrez d'autres créateurs
          </p>
        </div>
        
        {/* Statistiques */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Portfolios actifs</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.totalPortfolios}</p>
              </div>
              <FolderOpen className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Vues totales</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.totalViews}</p>
              </div>
              <Eye className="w-8 h-8 text-purple-400" />
            </div>
          </div>
          
          {/* <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Croissance</p>
                <p className="text-3xl font-bold text-white mt-1">+12%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </div>  */}
         </div>
        
        {/* Actions rapides */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Link 
            to={`/portfolio/${user?.id}`}
            className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white hover:from-blue-600 hover:to-purple-700 transition shadow-lg"
          >
            <div className="flex items-center">
              <User className="w-12 h-12 mr-4" />
              <div>
                <h3 className="text-xl font-semibold">Mon Portfolio</h3>
                <p className="text-blue-100">Voir et modifier votre portfolio</p>
              </div>
            </div>
          </Link>
          
          <Link 
            to="/portfolios"
            className="bg-gray-800 rounded-xl p-6 text-white hover:bg-gray-700 transition shadow-lg"
          >
            <div className="flex items-center">
              <FolderOpen className="w-12 h-12 mr-4 text-purple-400" />
              <div>
                <h3 className="text-xl font-semibold">Explorer</h3>
                <p className="text-gray-400">Découvrir d'autres portfolios</p>
              </div>
            </div>
          </Link>
        </div>
        
        {/* Portfolios récents */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Portfolios récents</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {portfolios.slice(0, 6).map(portfolio => (
              <Link
                key={portfolio.id}
                to={`/portfolio/${portfolio.id}`}
                className="bg-gray-800 rounded-xl p-6 hover:bg-gray-700 transition"
              >
                <div className="flex items-center mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {portfolio.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-3">
                    <h3 className="font-semibold text-white">{portfolio.name}</h3>
                    <p className="text-sm text-gray-400">{portfolio.title}</p>
                  </div>
                </div>
                {portfolio.location && (
                  <p className="text-sm text-gray-500">📍 {portfolio.location}</p>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;