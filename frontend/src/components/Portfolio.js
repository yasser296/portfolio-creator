import React, { useState, useEffect } from 'react';
import { ChevronDown, Mail, Phone, MapPin, Github, Linkedin, ExternalLink, Code, Palette, Server, Smartphone } from 'lucide-react';

const Portfolio = () => {
  const [activeSection, setActiveSection] = useState('hero');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [submitStatus, setSubmitStatus] = useState({ loading: false, message: '', type: '' });
  
  // États pour les données dynamiques
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [stats, setStats] = useState({ projects: 0, experience: 1, clients: 0, views: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Configuration API (solution simple et robuste)
  const API_BASE = process.env.REACT_APP_API_URL;

  // Informations personnelles (statiques)
  const personalInfo = {
    name: "Yasser Fakir",
    title: "Etudiant en Développement Web",
    description: "Passionné par la création d'expériences numériques exceptionnelles avec React, Node.js et PostgreSQL",
    email: "yasserfakir3@email.com",
    phone: "+212 6 89 74 62 48",
    location: "Beni Mellal, Maroc",
    github: "https://github.com/yasser296",
    linkedin: "https://linkedin.com/in/yasser-fakir-23a598349"
  };

  // Fonction pour faire des appels API
  const fetchAPI = async (endpoint) => {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Erreur API ${endpoint}:`, error);
      throw error;
    }
  };

  // Charger toutes les données depuis l'API
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Charger toutes les données en parallèle
      const [projectsData, skillsData, statsData] = await Promise.all([
        fetchAPI('/projects'),
        fetchAPI('/skills'), 
        fetchAPI('/stats')
      ]);

      setProjects(projectsData);
      setSkills(skillsData);
      setStats(statsData);
      
      console.log('✅ Données chargées depuis l\'API PostgreSQL');
    } catch (error) {
      console.error('❌ Erreur lors du chargement:', error);
      setError('Impossible de charger les données. Vérifiez que le backend est démarré.');
      
      // Données de fallback en cas d'erreur
      setProjects([]);
      setSkills([]);
      setStats({ projects: 0, experience: 1, clients: 0, views: 0 });
    } finally {
      setLoading(false);
    }
  };

  // Charger les données au montage du composant
  useEffect(() => {
    loadData();
  }, []);

  // Récupérer l'icône correspondant au nom
  const getIconComponent = (iconName) => {
    const icons = {
      'Code': Code,
      'Server': Server,
      'Smartphone': Smartphone,
      'Palette': Palette
    };
    return icons[iconName] || Code;
  };

  // Smooth scroll to section
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  // Update active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'about', 'skills', 'projects', 'contact'];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetHeight = element.offsetHeight;
          
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Gérer les changements du formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Gérer l'envoi du formulaire de contact
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus({ loading: true, message: '', type: '' });

    try {
      const response = await fetch(`${API_BASE}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactForm)
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus({
          loading: false,
          message: `Message envoyé avec succès ! ID: ${data.id}`,
          type: 'success'
        });
        setContactForm({ name: '', email: '', message: '' });
        
        // Recharger les stats pour mettre à jour le compteur de clients
        const newStats = await fetchAPI('/stats');
        setStats(newStats);
      } else {
        setSubmitStatus({
          loading: false,
          message: data.message || 'Erreur lors de l\'envoi du message.',
          type: 'error'
        });
      }
    } catch (error) {
      setSubmitStatus({
        loading: false,
        message: 'Erreur de connexion au serveur. Vérifiez que le backend est démarré.',
        type: 'error'
      });
    }

    // Effacer le message après 5 secondes
    setTimeout(() => {
      setSubmitStatus({ loading: false, message: '', type: '' });
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Message d'erreur global */}
      {error && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 bg-red-500/20 text-red-400 border border-red-500/30 px-6 py-3 rounded-lg">
          {error}
          <button 
            onClick={() => setError(null)}
            className="ml-4 text-red-300 hover:text-white"
          >
            ×
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Portfolio
              </span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {['hero', 'about', 'skills', 'projects', 'contact'].map((section) => (
                  <button
                    key={section}
                    onClick={() => scrollToSection(section)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeSection === section
                        ? 'bg-gray-700 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    {section === 'hero' ? 'Accueil' : section.charAt(0).toUpperCase() + section.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-400 hover:text-white focus:outline-none focus:text-white"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-800">
              {['hero', 'about', 'skills', 'projects', 'contact'].map((section) => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-md w-full text-left"
                >
                  {section === 'hero' ? 'Accueil' : section.charAt(0).toUpperCase() + section.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="hero" className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20"></div>
        <div className="relative z-10 text-center px-4">
          <div className="mb-8">
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-4xl font-bold">
              {personalInfo.name.split(' ').map(n => n[0]).join('')}
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            {personalInfo.name}
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
            {personalInfo.description}
          </p>
          <div className="flex justify-center space-x-4 mb-12">
            <a href={personalInfo.github} target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors">
              <Github className="w-6 h-6" />
            </a>
            <a href={personalInfo.linkedin} target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors">
              <Linkedin className="w-6 h-6" />
            </a>
            <a href={`mailto:${personalInfo.email}`} className="p-3 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors">
              <Mail className="w-6 h-6" />
            </a>
          </div>
          <button
            onClick={() => scrollToSection('about')}
            className="animate-bounce text-gray-400 hover:text-white transition-colors"
          >
            <ChevronDown className="w-8 h-8" />
          </button>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            À Propos
          </h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-semibold mb-6 text-blue-400">Mon Histoire</h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Etudiant a l'INPT depuis {stats.experience} ans, je crée des applications 
                web et mobile innovantes qui allient performance et design exceptionnel.
              </p>
              <p className="text-gray-300 mb-6 leading-relaxed">
                
              </p>
              <div className="flex space-x-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400">{loading ? '...' : stats.projects}+</div>
                  <div className="text-gray-400">Projets</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400">{stats.experience}+</div>
                  <div className="text-gray-400">Années</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-pink-400">{loading ? '...' : stats.clients}+</div>
                  <div className="text-gray-400">Contacts</div>
                </div>
                {stats.views > 0 && (
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400">{stats.views}+</div>
                    <div className="text-gray-400">Vues</div>
                  </div>
                )}
              </div>
            </div>
            <div className="relative">
              <div className="w-full h-96 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center">
                <div className="text-8xl opacity-20">👨‍💻</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="py-20 px-4 bg-gray-800/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Compétences
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {loading ? (
              // Skeleton loading
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="bg-gray-800 rounded-xl p-6 animate-pulse">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-gray-700 rounded mr-3"></div>
                    <div className="h-6 bg-gray-700 rounded w-20"></div>
                  </div>
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="h-4 bg-gray-700 rounded w-16"></div>
                    ))}
                  </div>
                </div>
              ))
            ) : skills.length > 0 ? (
              skills.map((skill) => {
                const IconComponent = getIconComponent(skill.icon_name);
                return (
                  <div key={skill.id} className="bg-gray-800 rounded-xl p-6 hover:bg-gray-700 transition-colors">
                    <div className="flex items-center mb-4">
                      <IconComponent className="w-8 h-8 text-blue-400 mr-3" />
                      <h3 className="text-xl font-semibold">{skill.category}</h3>
                    </div>
                    <ul className="space-y-2">
                      {skill.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="text-gray-300 text-sm">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-400 text-lg">Aucune compétence à afficher.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Projets
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              // Skeleton loading pour les projets
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="bg-gray-800 rounded-xl overflow-hidden animate-pulse">
                  <div className="w-full h-48 bg-gray-700"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-700 rounded mb-3"></div>
                    <div className="h-4 bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 bg-gray-700 rounded mb-4 w-3/4"></div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-6 bg-gray-700 rounded-full w-16"></div>
                      ))}
                    </div>
                    <div className="flex space-x-4">
                      <div className="h-4 bg-gray-700 rounded w-12"></div>
                      <div className="h-4 bg-gray-700 rounded w-12"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : projects.length > 0 ? (
              projects.map((project) => (
                <div key={project.id} className="bg-gray-800 rounded-xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300">
                <img
                  src={
                    project.image_url.startsWith('/')
                      ? `${process.env.PUBLIC_URL}${project.image_url}`
                      : project.image_url
                  }
                  alt={project.title}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.target.src =
                      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=250&fit=crop';
                  }}
                />

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-semibold">{project.title}</h3>
                      {project.featured && (
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
                          ⭐ Featured
                        </span>
                      )}
                    </div>
                    <p className="text-gray-300 mb-4 text-sm">{project.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {Array.isArray(project.technologies) && project.technologies.map((tech, techIndex) => (
                        <span key={techIndex} className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                          {tech}
                        </span>
                      ))}
                    </div>
                    <div className="flex space-x-4 items-center">
                      <a 
                        href={project.github_url} 
                        className="flex items-center text-gray-400 hover:text-white transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Github className="w-4 h-4 mr-1" />
                        Code
                      </a>
                      <a 
                        href={project.demo_url} 
                        className="flex items-center text-gray-400 hover:text-white transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Demo
                      </a>
                      {project.view_count > 0 && (
                        <span className="text-gray-500 text-xs">
                          👁️ {project.view_count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-400 text-lg">Aucun projet à afficher pour le moment.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 bg-gray-800/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Contact
          </h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-semibold mb-6 text-blue-400">Restons en Contact</h3>
              <p className="text-gray-300 mb-8">
                Intéressé par une collaboration ? N'hésitez pas à me contacter pour discuter de vos projets.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-blue-400 mr-3" />
                  <a href={`mailto:${personalInfo.email}`} className="text-gray-300 hover:text-white transition-colors">
                    {personalInfo.email}
                  </a>
                </div>
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-blue-400 mr-3" />
                  <a href={`tel:${personalInfo.phone}`} className="text-gray-300 hover:text-white transition-colors">
                    {personalInfo.phone}
                  </a>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-blue-400 mr-3" />
                  <span className="text-gray-300">{personalInfo.location}</span>
                </div>
              </div>
              <div className="flex space-x-4 mt-6">
                <a href={personalInfo.github} target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors">
                  <Github className="w-5 h-5" />
                </a>
                <a href={personalInfo.linkedin} target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>
            <div>
              <form onSubmit={handleContactSubmit} className="space-y-6">
                {submitStatus.message && (
                  <div className={`p-4 rounded-lg ${
                    submitStatus.type === 'success' 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {submitStatus.message}
                  </div>
                )}
                <div>
                  <input
                    type="text"
                    name="name"
                    value={contactForm.name}
                    onChange={handleInputChange}
                    placeholder="Votre nom"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-400 text-white"
                    required
                  />
                </div>
                <div>
                  <input
                    type="email"
                    name="email"
                    value={contactForm.email}
                    onChange={handleInputChange}
                    placeholder="Votre email"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-400 text-white"
                    required
                  />
                </div>
                <div>
                  <textarea
                    name="message"
                    value={contactForm.message}
                    onChange={handleInputChange}
                    placeholder="Votre message"
                    rows={5}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-400 text-white resize-none"
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={submitStatus.loading}
                  className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 ${
                    submitStatus.loading
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
                  } text-white`}
                >
                  {submitStatus.loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Envoi en cours...
                    </div>
                  ) : (
                    'Envoyer le Message'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-800">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-400">
            © 2025 {personalInfo.name}. Tous droits réservés.
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Créé avec React, Node.js et PostgreSQL
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Portfolio;