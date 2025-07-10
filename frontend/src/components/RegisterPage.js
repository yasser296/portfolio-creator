// frontend/src/components/RegisterPage.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, Briefcase, FileText } from 'lucide-react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    title: '',
    description: '',
    experience_years: 1,
    location: '',
    phone: '',
    github_url: '',
    linkedin_url: '',
    personal_website: '',
    avatar_url: '',
    hero_background: ''
    });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Effacer l'erreur du champ modifié
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const { confirmPassword, ...dataToSend } = formData;
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });

      const data = await response.json();

      if (response.ok) {
        // Stocker le token et les infos utilisateur
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Rediriger vers le portfolio
        navigate(`/portfolio/${data.user.id}`);
      } else {
        setErrors({ general: data.message || 'Erreur lors de l\'inscription' });
      }
    } catch (error) {
      console.error('Erreur:', error);
      setErrors({ general: 'Erreur de connexion au serveur' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#16172a] to-[#312342ef] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Logo/Titre */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
            Portfolio Creator
          </h1>
          <p className="text-gray-400">Créez votre compte et votre portfolio</p>
        </div>

        {/* Formulaire */}
        <div className="bg-[#181e33]/90 backdrop-blur-sm rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
                {errors.general}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              {/* Nom */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nom complet *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-3 py-3 bg-gray-800 border ${
                      errors.name ? 'border-red-500' : 'border-gray-700'
                    } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
                    placeholder="Jean Dupont"
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-sm text-red-400">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-3 py-3 bg-gray-800 border ${
                      errors.email ? 'border-red-500' : 'border-gray-700'
                    } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
                    placeholder="vous@exemple.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                )}
              </div>

              {/* Mot de passe */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Mot de passe *
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
                    className={`w-full pl-10 pr-10 py-3 bg-gray-800 border ${
                      errors.password ? 'border-red-500' : 'border-gray-700'
                    } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
                    placeholder="••••••••"
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
                {errors.password && (
                  <p className="mt-1 text-sm text-red-400">{errors.password}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">Minimum 6 caractères</p>
              </div>

              {/* Confirmer mot de passe */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirmer le mot de passe *
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
                    className={`w-full pl-10 pr-10 py-3 bg-gray-800 border ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-700'
                    } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
                    placeholder="••••••••"
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
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Titre professionnel */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Titre professionnel (optionnel)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Briefcase className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Développeur Full Stack"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description (optionnel)
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none">
                  <FileText className="h-5 w-5 text-gray-500" />
                </div>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full pl-10 pr-3 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                  placeholder="Parlez un peu de vous..."
                />
              </div>
            </div>

            {/* Années d'expérience */}
            <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Années d'expérience</label>
            <input
                type="number"
                name="experience_years"
                min={0}
                value={formData.experience_years}
                onChange={handleChange}
                className="w-full pl-3 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                placeholder="Années d'expérience"
            />
            </div>

            {/* Lieu */}
            <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Lieu</label>
            <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full pl-3 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                placeholder="Votre ville"
            />
            </div>

            {/* Téléphone */}
            <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Téléphone</label>
            <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full pl-3 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                placeholder="+212 6..."
            />
            </div>

            {/* GitHub URL */}
            <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">GitHub URL</label>
            <input
                type="url"
                name="github_url"
                value={formData.github_url}
                onChange={handleChange}
                className="w-full pl-3 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                placeholder="https://github.com/votreprofil"
            />
            </div>

            {/* LinkedIn URL */}
            <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">LinkedIn URL</label>
            <input
                type="url"
                name="linkedin_url"
                value={formData.linkedin_url}
                onChange={handleChange}
                className="w-full pl-3 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                placeholder="https://linkedin.com/in/votreprofil"
            />
            </div>

            {/* Site personnel */}
            <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Site personnel</label>
            <input
                type="url"
                name="personal_website"
                value={formData.personal_website}
                onChange={handleChange}
                className="w-full pl-3 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                placeholder="https://monportfolio.com"
            />
            </div>

            {/* Avatar URL */}
            <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Avatar (URL)</label>
            <input
                type="url"
                name="avatar_url"
                value={formData.avatar_url}
                onChange={handleChange}
                className="w-full pl-3 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                placeholder="https://image.com/avatar.jpg"
            />
            </div>

            {/* Image de fond */}
            <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Image de fond (URL)</label>
            <input
                type="url"
                name="hero_background"
                value={formData.hero_background}
                onChange={handleChange}
                className="w-full pl-3 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                placeholder="https://image.com/background.jpg"
            />
            </div>

            {/* Couleur du thème */}
            {/* <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Couleur du thème</label>
            <input
                type="color"
                name="theme_color"
                value={formData.theme_color}
                onChange={handleChange}
                className="w-full h-12 bg-gray-800 border border-gray-700 rounded-lg"
            />
            </div> */}


            {/* Bouton d'inscription */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 ${
                loading 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:from-blue-600 hover:to-purple-700 hover:shadow-xl'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Création du compte...
                </div>
              ) : (
                'Créer mon compte'
              )}
            </button>
          </form>

          {/* Lien connexion */}
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Déjà un compte ?{' '}
              <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">
                Se connecter
              </Link>
            </p>
          </div>

          {/* Retour à l'accueil */}
          <div className="mt-4 text-center">
            <Link to="/" className="text-gray-500 hover:text-gray-300 text-sm">
              ← Retour à l'accueil
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            En créant un compte, vous acceptez nos conditions d'utilisation
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;