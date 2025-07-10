// frontend/src/components/HomePage.js
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Code2, Sparkles, Rocket, Globe } from 'lucide-react';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#16172a] to-[#312342ef]">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full text-blue-400 text-sm mb-6">
            <Sparkles className="w-4 h-4 mr-2" />
            Créez votre présence en ligne
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Votre 
            <span className="block text-transparent bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text">
              Portfolio
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
            Une plateforme moderne pour créer et partager votre portfolio. 
            Montrez vos projets, compétences et expériences de manière élégante.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition shadow-lg transform hover:scale-105"
            >
              Créer mon portfolio
              <Rocket className="ml-2 w-5 h-5" />
            </Link>
            
            <Link
              to="/portfolios"
              className="inline-flex items-center px-8 py-4 bg-gray-800 text-white font-semibold rounded-xl hover:bg-gray-700 transition border border-gray-700"
            >
              Explorer les portfolios
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            Tout ce dont vous avez besoin
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-800/50 backdrop-blur p-8 rounded-2xl border border-gray-700 hover:border-blue-500 transition">
              <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6">
                <Code2 className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Interface Intuitive
              </h3>
              <p className="text-gray-400">
                Créez et gérez votre portfolio sans écrire une ligne de code. 
                Interface moderne et facile à utiliser.
              </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur p-8 rounded-2xl border border-gray-700 hover:border-purple-500 transition">
              <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-7 h-7 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Sécurisé & Privé
              </h3>
              <p className="text-gray-400">
                Vos données sont protégées. Vous seul pouvez modifier votre portfolio 
                grâce à notre système d'authentification.
              </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur p-8 rounded-2xl border border-gray-700 hover:border-green-500 transition">
              <div className="w-14 h-14 bg-green-500/20 rounded-xl flex items-center justify-center mb-6">
                <Globe className="w-7 h-7 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Partageable
              </h3>
              <p className="text-gray-400">
                Un lien unique pour partager votre portfolio avec recruteurs, 
                clients et votre réseau professionnel.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {/* <section className="py-20 px-6 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-transparent bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text mb-2">
                100+
              </div>
              <p className="text-gray-400">Portfolios créés</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text mb-2">
                500+
              </div>
              <p className="text-gray-400">Projets partagés</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-transparent bg-gradient-to-r from-pink-400 to-red-500 bg-clip-text mb-2">
                1000+
              </div>
              <p className="text-gray-400">Visiteurs mensuels</p>
            </div>
          </div>
        </div>
      </section> */}

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur rounded-3xl p-12 border border-gray-700">
            <h3 className="text-3xl font-bold text-white mb-4">
              Prêt à créer votre portfolio ?
            </h3>
            <p className="text-gray-300 mb-8 text-lg">
              Rejoignez notre communauté et donnez vie à vos projets.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition"
              >
                Commencer gratuitement
              </Link>
              <Link
                to="/login"
                className="px-8 py-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition"
              >
                J'ai déjà un compte
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-500">
          <p>© 2025 Portfolio Creator.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;