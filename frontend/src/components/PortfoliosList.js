// frontend/src/components/PortfoliosList.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Briefcase, Calendar } from 'lucide-react';

const PortfoliosList = () => {
  const [portfolios, setPortfolios] = useState([]);
  const [filteredPortfolios, setFilteredPortfolios] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  
  useEffect(() => {
    fetch(`${API_URL}/api/users`)
      .then(res => res.json())
      .then(data => {
        setPortfolios(data);
        setFilteredPortfolios(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Erreur:', err);
        setLoading(false);
      });
  }, []);
  
  useEffect(() => {
    const filtered = portfolios.filter(portfolio => 
      portfolio.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      portfolio.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      portfolio.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPortfolios(filtered);
  }, [searchTerm, portfolios]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#16172a] to-[#312342ef] pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Découvrez des Portfolios Inspirants
          </h1>
          <p className="text-gray-400 text-lg">
            Explorez les créations de notre communauté
          </p>
        </div>
        
        {/* Barre de recherche */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, titre ou lieu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
        
        {/* Résultats */}
        <div className="mb-4 text-gray-400">
          {filteredPortfolios.length} portfolio{filteredPortfolios.length > 1 ? 's' : ''} trouvé{filteredPortfolios.length > 1 ? 's' : ''}
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-400 mt-4">Chargement...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPortfolios.map(portfolio => (
              <Link
                key={portfolio.id}
                to={`/portfolio/${portfolio.id}`}
                className="bg-gray-800/80 backdrop-blur rounded-xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300 border border-gray-700 hover:border-blue-500"
              >
                {/* Avatar et infos */}
                <div className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
                      {portfolio.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-1">
                        {portfolio.name}
                      </h3>
                      {portfolio.title && (
                        <p className="text-blue-400 flex items-center text-sm mb-2">
                          <Briefcase className="w-3 h-3 mr-1" />
                          {portfolio.title}
                        </p>
                      )}
                      {portfolio.location && (
                        <p className="text-gray-400 text-sm flex items-center mb-2">
                          <MapPin className="w-3 h-3 mr-1" />
                          {portfolio.location}
                        </p>
                      )}
                      {portfolio.experience_years > 0 && (
                        <p className="text-gray-500 text-sm flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {portfolio.experience_years} an{portfolio.experience_years > 1 ? 's' : ''} d'expérience
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {portfolio.description && (
                    <p className="mt-4 text-gray-300 text-sm line-clamp-2">
                      {portfolio.description}
                    </p>
                  )}
                </div>
                
                {/* Footer */}
                <div className="px-6 py-3 bg-gray-900/50 border-t border-gray-700">
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-4 text-sm text-gray-500">
                      {portfolio.github_url && (
                        <span>GitHub ✓</span>
                      )}
                      {portfolio.linkedin_url && (
                        <span>LinkedIn ✓</span>
                      )}
                    </div>
                    <span className="text-blue-400 text-sm font-medium">
                      Voir le portfolio →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        
        {filteredPortfolios.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">Aucun portfolio trouvé</p>
            <p className="text-gray-500 mt-2">Essayez avec d'autres termes de recherche</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfoliosList;