// frontend/src/components/ResetPasswordPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(null);

  // Vérifier si le token est valide
  useEffect(() => {
    if (!token) {
      setError('Token manquant. Lien invalide.');
      setTokenValid(false);
      return;
    }

    // Optionnel : Vérifier le token côté serveur
    const checkToken = async () => {
      try {
        const response = await fetch('/api/auth/verify-reset-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });
        
        if (response.ok) {
          setTokenValid(true);
        } else {
          setTokenValid(false);
          setError('Token invalide ou expiré.');
        }
      } catch (err) {
        setTokenValid(false);
        setError('Erreur de connexion au serveur.');
      }
    };
    
    checkToken();
  }, [token]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const validatePassword = () => {
    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePassword()) {
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        // Rediriger vers la page de connexion après 3 secondes
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(data.message || 'Erreur lors de la réinitialisation');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  // Si le token n'est pas valide
  if (tokenValid === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#16172a] to-[#312342ef] flex items-center justify-center px-4">
        <div className="bg-[#181e33]/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Lien invalide</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    );
  }

  // Si réussi
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#16172a] to-[#312342ef] flex items-center justify-center px-4">
        <div className="bg-[#181e33]/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Mot de passe réinitialisé !</h2>
          <p className="text-gray-400 mb-6">
            Votre mot de passe a été modifié avec succès. 
            Vous allez être redirigé vers la page de connexion...
          </p>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div className="bg-green-400 h-2 rounded-full animate-pulse" style={{ width: '100%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#16172a] to-[#312342ef] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Titre */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
            Réinitialisation
          </h1>
          <p className="text-gray-400">Créez votre nouveau mot de passe</p>
        </div>

        {/* Formulaire */}
        <div className="bg-[#181e33]/90 backdrop-blur-sm rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Nouveau mot de passe */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-10 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-500 hover:text-gray-300" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-500 hover:text-gray-300" />
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">Minimum 6 caractères</p>
            </div>

            {/* Confirmer le mot de passe */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-10 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-500 hover:text-gray-300" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-500 hover:text-gray-300" />
                  )}
                </button>
              </div>
            </div>

            {/* Bouton de soumission */}
            <button
              type="submit"
              disabled={loading || tokenValid === null}
              className={`w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 ${
                loading || tokenValid === null
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:from-blue-600 hover:to-purple-700 hover:shadow-xl'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Modification...
                </div>
              ) : (
                'Réinitialiser le mot de passe'
              )}
            </button>
          </form>

          {/* Retour */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/login')}
              className="text-gray-500 hover:text-gray-300 text-sm"
            >
              ← Retour à la connexion
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;