// NotFound.js


// frontend/src/components/NotFound.js
import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#16172a] to-[#312342ef] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-transparent bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text mb-4">
          404
        </h1>
        <p className="text-2xl text-white mb-2">Page non trouvée</p>
        <p className="text-gray-400 mb-8">
          Désolé, la page que vous cherchez n'existe pas.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => window.history.back()}
            className="flex items-center px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Retour
          </button>
          <Link
            to="/"
            className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition"
          >
            <Home className="w-5 h-5 mr-2" />
            Accueil
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;