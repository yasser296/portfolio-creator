import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';


import {
  ChevronDown, Mail, Phone, MapPin, Github, Linkedin, ExternalLink, Code, Palette, Server, Smartphone
} from 'lucide-react';

const Portfolio = ({ user}) => {
  // Formulaire contact (local)
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [activeSection, setActiveSection] = useState('hero');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [submitStatus, setSubmitStatus] = useState({ loading: false, message: '', type: '' });
  
  // Avant ton return du composant
const [showSkillForm, setShowSkillForm] = useState(false);
const [showProjectForm, setShowProjectForm] = useState(false);
const [skillForm, setSkillForm] = useState({ category: "", items: "", icon_name: "", id: null });
const [projectForm, setProjectForm] = useState({ title: "", description: "", technologies: "", image_url: "", github_url: "", demo_url: "", id: null });
const [formError, setFormError] = useState("");
const [selectedSkillId, setSelectedSkillId] = useState(null);
const [selectedProjectId, setSelectedProjectId] = useState(null);

// Pour désélectionner en cliquant sur le fond
const clearSelections = () => {
  setSelectedSkillId(null);
  setSelectedProjectId(null);
};  

  const loadData = async () => {
    try {
      if (!user?.id) return;
      const projRes = await fetch(`/api/users/${user.id}/projects`);
      setProjects(await projRes.json());
      const skillsRes = await fetch(`/api/users/${user.id}/skills`);
      setSkills(await skillsRes.json());
    } catch (err) {
      setFormError("Erreur lors du chargement des données");
      console.error("Erreur loadData:", err);
    }
  };

  useEffect(() => {
  if (user?.id) loadData();
}, [user]);

 


   // Configuration API (solution simple et robuste)
  const API_BASE = process.env.REACT_APP_API_URL;

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


  // Pour les stats
   // --- DYNAMIQUE ---
  const [stats, setStats] = useState({
    projects: 0,
    experience: 1,
    clients: 0,
    views: 0,
  });

  // Mettre à jour dynamiquement quand user/projects changent
  useEffect(() => {
    setStats({
      projects: projects?.length || 0,
      experience: user?.experience_years || 1,
      clients: user?.clients || 0,
      views: user?.view_count || 0,
    });
  }, [user, projects]);

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


  // Icone pour chaque catégorie
  const getIconComponent = (iconName) => {
    const icons = {
      'Code': Code,
      'Server': Server,
      'Smartphone': Smartphone,
      'Palette': Palette
    };
    return icons[iconName] || Code;
  };

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
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0">
              <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent hover:underline focus:outline-none">
                Portfolio
                </Link>
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
        <section
            id="hero"
            className="
                min-h-screen
                flex flex-col items-center justify-center
                relative
                overflow-hidden
                pt-24
                pb-12
            "
            >
            {/* Avatar compact */}
            <div className="mb-6 z-10">
                <div className="w-28 h-28 mx-auto bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-3xl font-bold shadow-md border-2 border-[#22234a]">
                {user?.name ? user.name.split(" ").map((n) => n[0]).join("") : "JD"}
                </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow">
                {user?.name || "John Doe"}
            </h1>

            <div className="text-base md:text-lg text-blue-200 font-semibold mb-1 uppercase tracking-wider">
                {user?.title || "Développeur Full Stack"}
            </div>

            <p className="text-base md:text-lg text-slate-300 mb-6 max-w-xl text-center leading-relaxed">
                {user?.description || "Passionné par la création d'expériences numériques exceptionnelles avec React, Node.js et PostgreSQL"}
            </p>

            <div className="flex justify-center space-x-4 mb-6">
                <a href={user?.github_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-[#24264a] rounded-full hover:bg-blue-500/70 transition" title="GitHub">
                <Github className="w-5 h-5" />
                </a>
                <a href={user?.linkedin_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-[#24264a] rounded-full hover:bg-blue-400/70 transition" title="LinkedIn">
                <Linkedin className="w-5 h-5" />
                </a>
                <a href={`mailto:${user?.email}`} className="p-2 bg-[#24264a] rounded-full hover:bg-purple-500/70 transition" title="Email">
                <Mail className="w-5 h-5" />
                </a>
            </div>

            <button
                onClick={() =>
                document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })
                }
                className="animate-bounce text-slate-400 hover:text-white transition-colors"
            >
                <ChevronDown className="w-7 h-7" />
            </button>
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
                {user?.description}
              </p>
              <div className="flex space-x-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400">{stats.projects}+</div>
                  <div className="text-gray-400">Projets</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400">{stats.experience}+</div>
                  <div className="text-gray-400">Années</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-pink-400">{stats.clients}+</div>
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
              <div className="w-48 h-48 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-6xl font-bold shadow-xl border-8 border-[#22234a] overflow-hidden mb-8">
                {user?.avatar_url
                  ? (
                    <img
                      src={user.avatar_url}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                      onError={e => { e.target.src = "https://ui-avatars.com/api/?name=?" }} // fallback simple
                    />
                  )
                  : (
                    <div className="w-full h-96 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center">
                      <div className="text-8xl opacity-20">👨‍💻</div>
                    </div>
                  )
                }
              </div>

              {/* <div className="w-full h-96 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center">
                <div className="text-8xl opacity-20">👨‍💻</div>
              </div> */}
            </div>
          </div>
        </div>
      </section>

           

      {/* Skills Section */}
      <section id="skills" className="py-20 px-4 bg-gray-800/50" onClick={clearSelections}>
  <div className="flex gap-4 justify-end mb-6">
    <button
      onClick={e => { e.stopPropagation(); setShowSkillForm(true); setSkillForm({ category: "", items: "", icon_name: "", id: null }); setFormError(""); }}
      className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow"
    >
      + Ajouter une compétence
    </button>
    <button
      disabled={!selectedSkillId}
      onClick={e => {
        e.stopPropagation();
        const skill = skills.find(sk => sk.id === selectedSkillId);
        if (skill) {
          setSkillForm({
            ...skill,
            items: Array.isArray(skill.items) ? skill.items.join(", ") : skill.items || "",
            id: skill.id
          });
          setShowSkillForm(true);
          setFormError("");
        }
      }}
      className={`px-4 py-2 rounded font-semibold shadow
        ${selectedSkillId ? "bg-yellow-500 hover:bg-yellow-600 text-white" : "bg-gray-700 text-gray-400 cursor-not-allowed"}`}
    >
      Modifier la compétence
    </button>
  </div>

  {showSkillForm && (
    <form
      className="bg-gray-900 p-6 rounded-xl mb-6 shadow-lg max-w-xl mx-auto flex flex-col gap-3"
      onClick={e => e.stopPropagation()}
      onSubmit={async (e) => {
        e.preventDefault();
        setFormError("");
        if (!skillForm.category || !skillForm.items) {
          setFormError("Catégorie et liste des compétences sont obligatoires.");
          return;
        }
        try {
          const method = skillForm.id ? "PUT" : "POST";
          const url = skillForm.id ? `/api/skills/${skillForm.id}` : "/api/skills";
          const resp = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...skillForm,
              user_id: user.id,
              items: skillForm.items.split(",").map(s => s.trim()),
            }),
          });
          if (!resp.ok) {
            const err = await resp.json();
            throw new Error(err.message || "Erreur inconnue");
          }
          setShowSkillForm(false);
          setSkillForm({ category: "", items: "", icon_name: "", id: null });
          await loadData();
        } catch (err) {
          setFormError("Erreur lors de l'enregistrement : " + err.message);
        }
      }}
    >
      <h3 className="font-bold text-lg mb-2 text-purple-300">{skillForm.id ? "Modifier la compétence" : "Nouvelle compétence"}</h3>
      {formError && <div className="text-red-400 mb-2">{formError}</div>}
      <input
        type="text"
        className="px-3 py-2 rounded bg-gray-800 text-white mb-2"
        placeholder="Catégorie (ex: Backend, Frontend, DevOps)"
        value={skillForm.category}
        onChange={e => setSkillForm(f => ({ ...f, category: e.target.value }))}
        required
      />
      <input
        type="text"
        className="px-3 py-2 rounded bg-gray-800 text-white mb-2"
        placeholder="Compétences (séparées par virgule)"
        value={skillForm.items}
        onChange={e => setSkillForm(f => ({ ...f, items: e.target.value }))}
        required
      />
      <input
        type="text"
        className="px-3 py-2 rounded bg-gray-800 text-white mb-2"
        placeholder="Nom de l’icône (optionnel, ex: Code, Server...)"
        value={skillForm.icon_name}
        onChange={e => setSkillForm(f => ({ ...f, icon_name: e.target.value }))}
      />
      <div className="flex gap-4 mt-2">
        <button type="submit" className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-white font-semibold">
          {skillForm.id ? "Mettre à jour" : "Ajouter"}
        </button>
        <button type="button" className="bg-gray-700 hover:bg-gray-800 px-4 py-2 rounded text-white"
          onClick={() => { setShowSkillForm(false); setSkillForm({ category: "", items: "", icon_name: "", id: null }); }}>
          Annuler
        </button>
      </div>
    </form>
  )}

  <div className="max-w-6xl mx-auto">
    <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
      Compétences
    </h2>
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
      {skills && skills.length > 0 ? (
        skills.map(skill => {
          const IconComponent = getIconComponent(skill.icon_name);
          const items = Array.isArray(skill.items) ? skill.items : [];
          return (
            <div
              key={skill.id}
              onClick={e => { e.stopPropagation(); setSelectedSkillId(skill.id); }}
              tabIndex={0}
              className={`bg-gray-800 rounded-xl p-6 hover:bg-gray-700 transition-colors border-2 cursor-pointer
                ${selectedSkillId === skill.id ? "border-yellow-400" : "border-transparent"}`}
            >
              <div className="flex items-center mb-4">
                <IconComponent className="w-8 h-8 text-blue-400 mr-3" />
                <h3 className="text-xl font-semibold">{skill.category}</h3>
              </div>
              <ul className="space-y-2">
                {items.map((item, itemIndex) => (
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
      <section id="projects" className="py-20 px-4" onClick={clearSelections}>
        <div className="flex gap-4 justify-end mb-6">
            <button
            onClick={e => { 
                e.stopPropagation(); 
                setShowProjectForm(true); 
                setProjectForm({ title: "", description: "", technologies: "", image_url: "", github_url: "", demo_url: "", id: null });
                setFormError("");
            }}
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow"
            >
            + Ajouter un projet
            </button>
            <button
            disabled={!selectedProjectId}
            onClick={e => {
                e.stopPropagation();
                const proj = projects.find(p => p.id === selectedProjectId);
                if (proj) {
                setProjectForm({
                    ...proj,
                    technologies: Array.isArray(proj.technologies) ? proj.technologies.join(", ") : proj.technologies || "",
                    id: proj.id
                });
                setShowProjectForm(true);
                setFormError("");
                }
            }}
            className={`px-4 py-2 rounded font-semibold shadow
                ${selectedProjectId ? "bg-yellow-500 hover:bg-yellow-600 text-white" : "bg-gray-700 text-gray-400 cursor-not-allowed"}`}
            >
            Modifier le projet
            </button>
        </div>

        {/* Formulaire projet (ajout ou édition) */}
        {showProjectForm && (
            <form
            className="bg-gray-900 p-6 rounded-xl mb-6 shadow-lg max-w-xl mx-auto flex flex-col gap-3"
            onClick={e => e.stopPropagation()}
            onSubmit={async (e) => {
                e.preventDefault();
                setFormError("");
                // Validation simple
                if (!projectForm.title || !projectForm.description) {
                setFormError("Titre et description sont obligatoires.");
                return;
                }
                try {
                const method = projectForm.id ? "PUT" : "POST";
                const url = projectForm.id ? `/api/projects/${projectForm.id}` : "/api/projects";
                const resp = await fetch(url, {
                    method,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                    ...projectForm,
                    user_id: user.id,
                    technologies: projectForm.technologies
                        ? projectForm.technologies.split(",").map((s) => s.trim())
                        : [],
                    }),
                });
                if (!resp.ok) {
                    const err = await resp.json();
                    throw new Error(err.message || "Erreur inconnue");
                }
                setShowProjectForm(false);
                setProjectForm({ title: "", description: "", technologies: "", image_url: "", github_url: "", demo_url: "", id: null });
                await loadData(); // Recharge la liste
                } catch (err) {
                setFormError("Erreur lors de l'enregistrement : " + err.message);
                }
            }}
            >
            <h3 className="font-bold text-lg mb-2 text-blue-300">
                {projectForm.id ? "Modifier le projet" : "Nouveau projet"}
            </h3>
            {formError && <div className="text-red-400 mb-2">{formError}</div>}
            <input
                type="text"
                className="px-3 py-2 rounded bg-gray-800 text-white mb-2"
                placeholder="Titre"
                value={projectForm.title}
                onChange={e => setProjectForm(f => ({ ...f, title: e.target.value }))}
                required
            />
            <textarea
                className="px-3 py-2 rounded bg-gray-800 text-white mb-2"
                placeholder="Description"
                value={projectForm.description}
                onChange={e => setProjectForm(f => ({ ...f, description: e.target.value }))}
                required
            />
            <input
                type="text"
                className="px-3 py-2 rounded bg-gray-800 text-white mb-2"
                placeholder="Technologies (séparées par virgule)"
                value={projectForm.technologies}
                onChange={e => setProjectForm(f => ({ ...f, technologies: e.target.value }))}
            />
            <input
                type="url"
                className="px-3 py-2 rounded bg-gray-800 text-white mb-2"
                placeholder="Image (URL facultative)"
                value={projectForm.image_url}
                onChange={e => setProjectForm(f => ({ ...f, image_url: e.target.value }))}
            />
            <input
                type="url"
                className="px-3 py-2 rounded bg-gray-800 text-white mb-2"
                placeholder="Lien GitHub (facultatif)"
                value={projectForm.github_url}
                onChange={e => setProjectForm(f => ({ ...f, github_url: e.target.value }))}
            />
            <input
                type="url"
                className="px-3 py-2 rounded bg-gray-800 text-white mb-2"
                placeholder="Lien Démo (facultatif)"
                value={projectForm.demo_url}
                onChange={e => setProjectForm(f => ({ ...f, demo_url: e.target.value }))}
            />
            <div className="flex gap-4 mt-2">
                <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white font-semibold"
                >
                {projectForm.id ? "Mettre à jour" : "Ajouter"}
                </button>
                <button
                type="button"
                className="bg-gray-700 hover:bg-gray-800 px-4 py-2 rounded text-white"
                onClick={() => { setShowProjectForm(false); setProjectForm({ title: "", description: "", technologies: "", image_url: "", github_url: "", demo_url: "", id: null }); }}
                >
                Annuler
                </button>
            </div>
            </form>
        )}

        <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Projets
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects && projects.length > 0 ? (
                projects.map(project => (
                <div
                    key={project.id}
                    onClick={e => { e.stopPropagation(); setSelectedProjectId(project.id); }}
                    tabIndex={0}
                    className={`bg-gray-800 rounded-xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300 border-2 cursor-pointer
                    ${selectedProjectId === project.id ? "border-yellow-400" : "border-transparent"}`}
                >
                    <img
                    src={
                        project.image_url?.startsWith('/')
                        ? `${process.env.PUBLIC_URL}${project.image_url}`
                        : project.image_url
                    }
                    alt={project.title}
                    className="w-full h-48 object-cover"
                    onError={e => { e.target.src = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=250&fit=crop'; }}
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
                        {project.github_url && (
                        <a
                            href={project.github_url}
                            className="flex items-center text-gray-400 hover:text-white transition-colors"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Github className="w-4 h-4 mr-1" />
                            Code
                        </a>
                        )}
                        {project.demo_url && (
                        <a
                            href={project.demo_url}
                            className="flex items-center text-gray-400 hover:text-white transition-colors"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            Demo
                        </a>
                        )}
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
                {user?.email && (
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-blue-400 mr-3" />
                    <a href={`mailto:${user.email}`} className="text-gray-300 hover:text-white transition-colors">
                      {user.email}
                    </a>
                  </div>
                )}
                {user?.phone && (
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-blue-400 mr-3" />
                    <a href={`tel:${user.phone}`} className="text-gray-300 hover:text-white transition-colors">
                      {user.phone}
                    </a>
                  </div>
                )}
                {user?.location && (
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 text-blue-400 mr-3" />
                    <span className="text-gray-300">{user.location}</span>
                  </div>
                )}
              </div>
              <div className="flex space-x-4 mt-6">
                {user?.github_url && (
                  <a href={user.github_url} target="_blank" rel="noopener noreferrer"
                    className="p-3 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors">
                    <Github className="w-5 h-5" />
                  </a>
                )}
                {user?.linkedin_url && (
                  <a href={user.linkedin_url} target="_blank" rel="noopener noreferrer"
                    className="p-3 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors">
                    <Linkedin className="w-5 h-5" />
                  </a>
                )}
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
            © 2025 {user?.name}. Tous droits réservés.
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
