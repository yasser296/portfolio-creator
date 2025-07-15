import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Pencil } from 'lucide-react';  
import CreatableSelect from 'react-select/creatable';

import { isPortfolioOwner, authFetch } from '../utils/auth';
import { AuthGuard } from '../components/AuthGuard';
import ImageUpload from './ImageUpload';

import {
  ChevronDown, Mail, Phone, MapPin, Github, Linkedin, ExternalLink, Code, Palette, Server, Smartphone
} from 'lucide-react';

const ProjectCard = React.memo(({ project, isSelected, onSelect, onDelete }) => {
  return (
    <div
      onClick={(e) => { e.stopPropagation(); onSelect(project.id); }}
      tabIndex={0}
      className={`group bg-gray-800 rounded-xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300 border-2 cursor-pointer relative
        ${isSelected ? "border-yellow-400" : "border-transparent"}`}
    >
      <button
        type="button"
        className="absolute top-2 right-2 bg-blue-700 hover:bg-blue-800 text-white w-6 h-6 rounded-full flex items-center justify-center z-20 shadow opacity-0 group-hover:opacity-100 transition"
        title="Supprimer ce projet"
        onClick={(e) => { e.stopPropagation(); onDelete(project.id); }}
        tabIndex={-1}
      >
        ×
      </button>

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
  );
});

// 🚀 COMPOSANT SKILL OPTIMISÉ
const SkillCard = React.memo(({ skill, isSelected, onSelect, onDelete }) => {
  const IconComponent = useMemo(() => {
    const icons = {
      'Code': Code,
      'Server': Server,
      'Smartphone': Smartphone,
      'Palette': Palette
    };
    return icons[skill.icon_name] || Code;
  }, [skill.icon_name]);

  const items = useMemo(() => 
    Array.isArray(skill.items) ? skill.items : [], 
    [skill.items]
  );

  return (
    <div
      onClick={(e) => { e.stopPropagation(); onSelect(skill.id); }}
      tabIndex={0}
      className={`relative bg-gray-800 rounded-xl p-6 hover:bg-gray-700 transition-colors border-2 cursor-pointer group
        ${isSelected ? "border-yellow-400" : "border-transparent"}`}
    >
      <button
        type="button"
        className="absolute top-2 right-2 bg-purple-700 hover:bg-purple-800 text-white w-6 h-6 rounded-full flex items-center justify-center z-20 shadow opacity-0 group-hover:opacity-100 transition"
        title="Supprimer cette compétence"
        onClick={(e) => { e.stopPropagation(); onDelete(skill.id); }}
        tabIndex={-1}
      >
        ×
      </button>

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
});

// 🚀 COMPOSANT EXPERIENCE OPTIMISÉ
const ExperienceCard = React.memo(({ experience, isSelected, onSelect, onDelete, formatDate, formatDuration }) => {
  return (
    <div
      onClick={(e) => { e.stopPropagation(); onSelect(experience.id); }}
      tabIndex={0}
      className={`relative bg-gray-800 rounded-xl p-6 hover:bg-gray-700 transition-all duration-300 border-2 cursor-pointer group
        ${isSelected ? "border-yellow-400" : "border-transparent"}`}
    >
      <button
        type="button"
        className="absolute top-2 right-2 bg-green-700 hover:bg-green-800 text-white w-6 h-6 rounded-full flex items-center justify-center z-20 shadow opacity-0 group-hover:opacity-100 transition"
        title="Supprimer cette expérience"
        onClick={(e) => { e.stopPropagation(); onDelete(experience.id); }}
        tabIndex={-1}
      >
        ×
      </button>

      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">🏢</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-100">{experience.entreprise}</h3>
          </div>
          <h4 className="text-lg font-medium text-green-400 mb-3">{experience.poste}</h4>
          
          <div className="flex items-center gap-2 text-gray-400 mb-3">
            <span className="text-sm">📅</span>
            <span className="text-sm">
              {formatDate(experience.date_debut)} - {experience.date_fin ? formatDate(experience.date_fin) : 'Présent'}
            </span>
            <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
              {formatDuration(experience.date_debut, experience.date_fin)}
            </span>
          </div>
          
          {experience.description && (
            <p className="text-gray-300 leading-relaxed">{experience.description}</p>
          )}
        </div>
      </div>
    </div>
  );
});

const Portfolio = ({ user, projects, skills, experiences, updateUser, updateProjects, updateSkills, updateExperiences, loadData}) => {
  // Formulaire contact (local)
  const [activeSection, setActiveSection] = useState('hero');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [submitStatus, setSubmitStatus] = useState({ loading: false, message: '', type: '' });
  
  // Avant ton return du composant
  // Pour la section projets
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null); // projet en édition ou null
  const [projectForm, setProjectForm] = useState({
    title: "",
    description: "",
    technologies: "",
    image_url: "",
    github_url: "",
    demo_url: "",
  });

  // Pour la section compétences
  const [showSkillForm, setShowSkillForm] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null); // compétence en édition ou null
  const [skillForm, setSkillForm] = useState({
    category: "",
    items: "",
    icon_name: "",
  });

const [formError, setFormError] = useState("");
const [uploadingImage, setUploadingImage] = useState(false);
const [selectedSkillId, setSelectedSkillId] = useState(null);
const [selectedProjectId, setSelectedProjectId] = useState(null);

const [editingField, setEditingField] = useState(null); // nom du champ édité
const [editValue, setEditValue] = useState('');
const [savingEdit, setSavingEdit] = useState(false);

const [saveStatus, setSaveStatus] = useState(null);

// const [deletingId, setDeletingId] = useState(null); // Pour la confirmation

const [modalOpen, setModalOpen] = useState(false);
const [modalType, setModalType] = useState(""); // "project" ou "skill"
const [modalTargetId, setModalTargetId] = useState(null);

const [referenceSkills, setReferenceSkills] = useState([]);
const [availableCategories, setAvailableCategories] = useState([]);
// const [availableSkills] = useState([]);

const [selectedTechCategory, setSelectedTechCategory] = useState("");
// const [skillsReference, setSkillsReference] = useState([]);
const [manualCategory, setManualCategory] = useState("");
// const [manualSkill, setManualSkill] = useState("");
const [isManualCategory, setIsManualCategory] = useState(false); // pour forcer le rendu

const [showExperienceForm, setShowExperienceForm] = useState(false);
const [editingExperience, setEditingExperience] = useState(null);
const [experienceForm, setExperienceForm] = useState({
  entreprise: "",
  poste: "",
  date_debut: "",    // Changé de dateDebut
  date_fin: "",      // Changé de dateFin
  description: "",
});
const [selectedExperienceId, setSelectedExperienceId] = useState(null);

const handleProjectSelect = useCallback((projectId) => {
    setSelectedProjectId(projectId);
  }, []);

  const handleProjectDelete = useCallback((projectId) => {
    openDeleteModal("project", projectId);
  }, []);

  const handleSkillSelect = useCallback((skillId) => {
    setSelectedSkillId(skillId);
  }, []);

  const handleSkillDelete = useCallback((skillId) => {
    openDeleteModal("skill", skillId);
  }, []);

  const handleExperienceSelect = useCallback((experienceId) => {
    setSelectedExperienceId(experienceId);
  }, []);

  const handleExperienceDelete = useCallback((experienceId) => {
    openDeleteModal("experience", experienceId);
  }, []);

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    // "2025-03-01" → "2025-03"
    return dateString.substring(0, 7);
  };

  // 🚀 FONCTIONS DE FORMATAGE OPTIMISÉES
  const formatDate = useCallback((date) => {
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' });
    }, []);

  const formatDuration = useCallback((date_debut, date_fin) => {
    const debut = new Date(date_debut);
    const fin = date_fin ? new Date(date_fin) : new Date();
    
    const moisDebut = debut.getFullYear() * 12 + debut.getMonth();
    const moisFin = fin.getFullYear() * 12 + fin.getMonth();
    const totalMois = moisFin - moisDebut + 1;
    
    const annees = Math.floor(totalMois / 12);
    const mois = totalMois % 12;
    
    let duree = '';
    if (annees > 0) duree += `${annees} an${annees > 1 ? 's' : ''}`;
    if (mois > 0) duree += `${duree ? ' ' : ''}${mois} mois`;
    
    return duree || '1 mois';
  }, []);

// ==================== GESTION CRUD EXPÉRIENCES ====================
async function handleExperienceSubmit(e) {
  e.preventDefault();
  setFormError("");
  
  if (!experienceForm.entreprise || !experienceForm.poste || !experienceForm.date_debut) {
    setFormError("Entreprise, poste et date de début obligatoires.");
    return;
  }
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  
  try {
    const url = editingExperience ? `${API_URL}/api/experiences/${editingExperience.id}` : "/api/experiences";
    const method = editingExperience ? "PUT" : "POST";
    const resp = await authFetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...experienceForm,
        user_id: user.id,
      }),
    });
    
    if (!resp.ok) throw new Error((await resp.json()).message || "Erreur inconnue");
    
    const result = await resp.json();
    
    // 🚀 MISE À JOUR OPTIMISTE
    if (editingExperience) {
      const updatedExperiences = experiences.map(e => e.id === editingExperience.id ? result.experience : e);
      if (updateExperiences) updateExperiences(updatedExperiences);
    } else {
      const updatedExperiences = [...experiences, result.experience];
      if (updateExperiences) updateExperiences(updatedExperiences);
    }
    
    setShowExperienceForm(false);
    setEditingExperience(null);
    setSelectedExperienceId(null);
    setExperienceForm({ entreprise: "", poste: "", date_debut: "", date_fin: "", description: "" });
  } catch (err) {
    setFormError("Erreur : " + err.message);
  }
}
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

useEffect(() => {
  authFetch(`${API_URL}/api/skills_reference`)
    .then(res => res.json())
    .then(data => {
      setReferenceSkills(Array.isArray(data) ? data : []);
      setAvailableCategories([...new Set(data.map(s => s.category))]);
    });
}, []);


function openDeleteModal(type, id) {
  setModalType(type);
  setModalTargetId(id);
  setModalOpen(true);
}

function closeDeleteModal() {
  setModalOpen(false);
  setModalType("");
  setModalTargetId(null);
}

// Handler global pour la suppression selon le type :
async function confirmDelete() {
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  try {
    if (modalType === "project") {
      const resp = await authFetch(`${API_URL}/api/projects/${modalTargetId}`, { method: "DELETE" });
      if (!resp.ok) throw new Error((await resp.json()).message || "Erreur inconnue");
      
      // 🚀 MISE À JOUR OPTIMISTE - suppression immédiate du projet
      const updatedProjects = projects.filter(p => p.id !== modalTargetId);
      if (updateProjects) updateProjects(updatedProjects);
      
      setSelectedProjectId(null);
    } else if (modalType === "skill") {
      const resp = await authFetch(`${API_URL}/api/skills/${modalTargetId}`, { method: "DELETE" });
      if (!resp.ok) throw new Error((await resp.json()).message || "Erreur inconnue");
      
      // 🚀 MISE À JOUR OPTIMISTE - suppression immédiate de la compétence
      const updatedSkills = skills.filter(s => s.id !== modalTargetId);
      if (updateSkills) updateSkills(updatedSkills);
      
      setSelectedSkillId(null);
    } else if (modalType === "experience") {
      const resp = await authFetch(`${API_URL}/api/experiences/${modalTargetId}`, { method: "DELETE" });
      if (!resp.ok) throw new Error((await resp.json()).message || "Erreur inconnue");
      
      // 🚀 MISE À JOUR OPTIMISTE - suppression immédiate de l'expérience
      const updatedExperiences = experiences.filter(e => e.id !== modalTargetId);
      if (updateExperiences) updateExperiences(updatedExperiences);
      
      setSelectedExperienceId(null);
    }
    closeDeleteModal();
  } catch (err) {
    alert("Erreur suppression : " + err.message);
    closeDeleteModal();
    
    // 🚀 EN CAS D'ERREUR, recharger les données pour restaurer l'état correct
    if (loadData) await loadData(true);
  }
}




function cancelEdit() {
  setEditingField(null);
  setEditValue("");
}

const startEdit = (field, value) => {
  setEditingField(field);
  setEditValue(value || '');
};

const saveEdit = async () => {
  if (!editingField || !updateUser) return;
  setSavingEdit(true);
  setSaveStatus('saving');
  
  try {
    const result = await updateUser({ [editingField]: editValue });
    
    if (result.success) {
      setEditingField(null);
      setEditValue("");
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 2000);
    } else {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3000);
    }
  } catch (err) {
    console.error("Erreur sauvegarde:", err);
    setSaveStatus('error');
    setTimeout(() => setSaveStatus(null), 3000);
  } finally {
    setSavingEdit(false);
  }
};



const handleEditKeyDown = (e) => {
  if (e.key === "Enter") saveEdit();
  if (e.key === "Escape") setEditingField(null);
};

// Pour désélectionner en cliquant sur le fond
const clearSelections = () => {
  setSelectedSkillId(null);
  setSelectedProjectId(null);
  setSelectedExperienceId(null);
}; 

  //   // Fonction loadData améliorée pour les projets et compétences
  // const loadProjectsAndSkills = async () => {
  //   try {
  //     if (!user?.id) return;
      
  //     // Charger les projets
  //     const projRes = await fetch(`/api/users/${user.id}/projects`);
  //     if (projRes.ok) {
  //       const projectsData = await projRes.json();
  //       setProjects(projectsData);
  //       if (updateProjects) updateProjects(projectsData);
  //     }
      
  //     // Charger les compétences
  //     const skillsRes = await fetch(`/api/users/${user.id}/skills`);
  //     if (skillsRes.ok) {
  //       const skillsData = await skillsRes.json();
  //       setSkills(skillsData);
  //       if (updateSkills) updateSkills(skillsData);
  //     }
  //   } catch (err) {
  //     setFormError("Erreur lors du chargement des données");
  //     console.error("Erreur loadData:", err);
  //   }
  // };



  





  // const handleProjectSubmit = async (e) => {
  //   e.preventDefault();
  //   setFormError("");
    
  //   if (!projectForm.title || !projectForm.description) {
  //     setFormError("Titre et description sont obligatoires.");
  //     return;
  //   }
    
  //   await saveProject(projectForm);
  // };

  // const handleSkillSubmit = async (e) => {
  //   e.preventDefault();
  //   setFormError("");
    
  //   if (!skillForm.category || !skillForm.items) {
  //     setFormError("Catégorie et liste des compétences sont obligatoires.");
  //     return;
  //   }
    
  //   await saveSkill(skillForm);
  // };

  


   // Configuration API (solution simple et robuste)
  const API_BASE = process.env.REACT_APP_API_URL;

   // Fonction pour faire des appels API
  const fetchAPI = async (endpoint) => {
    try {
      const response = await authFetch(`${API_BASE}${endpoint}`);
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
      const sections = ['hero', 'about', 'skills','experiences', 'projects', 'contact'];
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
  // const getIconComponent = (iconName) => {
  //   const icons = {
  //     'Code': Code,
  //     'Server': Server,
  //     'Smartphone': Smartphone,
  //     'Palette': Palette
  //   };
  //   return icons[iconName] || Code;
  // };



// Pour valider l'ajout/la modification d'un projet
// Remplacez la fonction handleProjectSubmit dans Portfolio.js par cette version avec debug :

async function handleProjectSubmit(e) {
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  e.preventDefault();
  setFormError("");
  
  if (!projectForm.title || !projectForm.description) {
    setFormError("Titre et description obligatoires.");
    return;
  }

  try {
    // Préparer les données
    const projectData = {
      ...projectForm,
      user_id: user.id,
      technologies: projectForm.technologies
        ? projectForm.technologies.split(",").map(s => s.trim()).filter(t => t.length > 0)
        : []
    };

    // Nettoyer les champs vides
    Object.keys(projectData).forEach(key => {
      if (projectData[key] === "" || projectData[key] === null) {
        delete projectData[key];
      }
    });

    console.log("🚀 Données envoyées:", projectData);

    const url = editingProject 
      ? `${API_URL}/api/projects/${editingProject.id}` 
      : `${API_URL}/api/projects`;
    const method = editingProject ? "PUT" : "POST";

    console.log(`📡 ${method} ${url}`);

    const resp = await authFetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(projectData),
    });

    console.log("📨 Réponse status:", resp.status);

    if (!resp.ok) {
      const errorData = await resp.json();
      console.error("❌ Erreur serveur:", errorData);
      throw new Error(errorData.message || `Erreur ${resp.status}`);
    }
    
    const result = await resp.json();
    console.log("✅ Succès:", result);
    
    // 🚀 MISE À JOUR OPTIMISTE avec vérification
    if (result && result.project) {
      if (editingProject) {
        const updatedProjects = projects.map(p => 
          p.id === editingProject.id ? result.project : p
        );
        if (updateProjects) updateProjects(updatedProjects);
      } else {
        const updatedProjects = [...projects, result.project];
        if (updateProjects) updateProjects(updatedProjects);
      }
    } else {
      // Si pas de projet dans la réponse, recharger les données
      console.warn("⚠️ Pas de projet dans la réponse, rechargement des données...");
      if (loadData) {
        await loadData(true);
      }
    }
    
    // Fermer le formulaire
    setShowProjectForm(false);
    setEditingProject(null);
    setSelectedProjectId(null);
    setProjectForm({ 
      title: "", 
      description: "", 
      technologies: "", 
      image_url: "", 
      github_url: "", 
      demo_url: "" 
    });
    setUploadingImage(false);

    console.log("🎉 Projet sauvegardé avec succès!");

  } catch (err) {
    console.error("💥 Erreur dans handleProjectSubmit:", err);
    setFormError(`Erreur : ${err.message}`);
  }
}



async function handleSkillSubmit(e) {
  e.preventDefault();
  setFormError("");

  const finalCategory = isManualCategory ? manualCategory : skillForm.category;

  if (!finalCategory.trim() || !skillForm.items.trim()) {
    setFormError("Catégorie et compétences obligatoires.");
    return;
  }

  try {
    // Trouve si la catégorie existe déjà dans les compétences actuelles
    const existingSkill = skills.find(skill => skill.category.toLowerCase() === finalCategory.toLowerCase());

    const newItems = skillForm.items.split(",").map(s => s.trim());
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    let url, method, body;

    if (existingSkill && !skillForm.id) {
      // Cas où la catégorie existe déjà, fusionner avec compétences existantes
      const mergedItems = [...new Set([...existingSkill.items, ...newItems])];

      url = `${API_URL}/api/skills/${existingSkill.id}`;
      method = "PUT";
      body = {
        ...existingSkill,
        items: mergedItems,
        user_id: user.id,
      };
    } else {
      // Cas d'une modification ou ajout d'une nouvelle catégorie
      url = skillForm.id ? `/api/skills/${skillForm.id}` : "/api/skills";
      method = skillForm.id ? "PUT" : "POST";
      body = {
        ...skillForm,
        category: finalCategory,
        user_id: user.id,
        items: newItems,
      };
    }

    const resp = await authFetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!resp.ok) throw new Error((await resp.json()).message || "Erreur inconnue");

    const result = await resp.json();

    // Mise à jour optimiste
    if (existingSkill && !skillForm.id) {
      const updatedSkills = skills.map(s => s.id === existingSkill.id ? result.skill : s);
      updateSkills(updatedSkills);
    } else if (skillForm.id) {
      const updatedSkills = skills.map(s => s.id === skillForm.id ? result.skill : s);
      updateSkills(updatedSkills);
    } else {
      updateSkills([...skills, result.skill]);
    }

    setShowSkillForm(false);
    setEditingSkill(null);
    setSelectedSkillId(null);
    setSkillForm({ category: "", items: "", icon_name: "" });
    setManualCategory("");
    setIsManualCategory(false);

  } catch (err) {
    setFormError("Erreur : " + err.message);
  }
}




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
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    e.preventDefault();
    setSubmitStatus({ loading: true, message: '', type: '' });

    try {
      const response = await authFetch(`${API_URL}/api/contact`, {
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
        const newStats = await fetchAPI(`${API_URL}/stats`);
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

  const SaveStatusIndicator = () => {
  if (!saveStatus) return null;
  
  let bgColor = '';
  let message = '';
  
  switch (saveStatus) {
    case 'saving':
      bgColor = 'bg-blue-600';
      message = '⏳ Sauvegarde...';
      break;
    case 'success':
      bgColor = 'bg-green-600';
      message = '✅ Sauvegardé !';
      break;
    case 'error':
      bgColor = 'bg-red-600';
      message = '❌ Erreur';
      break;
  }
  
  return (
    <div className={`fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50 text-white ${bgColor}`}>
      {message}
    </div>
  );
};



// Filtrer les compétences selon la catégorie sélectionnée
const filteredSkillOptions = referenceSkills
  .filter(s => s.category === skillForm.category)
  .map(s => ({
    value: s.skill_name,
    label: s.skill_name
  }));

  // Génère les options à partir des compétences de référence
const techOptions = referenceSkills
  .filter(s => !selectedTechCategory || s.category === selectedTechCategory)
  .map(s => ({
    value: s.skill_name,
    label: s.skill_name
  }));





  return (


    <div className="min-h-screen bg-gray-900 text-white">
      <SaveStatusIndicator />
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
                {['hero', 'about', 'skills', 'experiences', 'projects', 'contact'].map((section) => (
                  <button
                    key={section}
                    onClick={() => scrollToSection(section)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeSection === section
                        ? 'bg-gray-700 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    {section === 'hero' ? 'Accueil' : 
                    section === 'experiences' ? 'Expériences' : 
                    section.charAt(0).toUpperCase() + section.slice(1)}
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
              {['hero', 'about', 'skills', 'experiences','projects', 'contact'].map((section) => (
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

            {/* Nom */}

            <div className="font-bold text-4xl md:text-5xl mb-2">
              <AuthGuard portfolioUserId={user.id} fallback={<span>{user.name}</span>}>
                {editingField === "name" ? (
                  <input
                    className="px-2 py-1 rounded bg-gray-800 text-white"
                    value={editValue}
                    autoFocus
                    onChange={e => setEditValue(e.target.value)}
                    onBlur={saveEdit}
                    onKeyDown={handleEditKeyDown}
                    disabled={savingEdit}
                  />
                ) : (
                  <span
                    className="cursor-pointer hover:underline"
                    title="Modifier le nom"
                    onClick={() => startEdit("name", user.name)}
                  >
                    {user.name}
                  </span>
                )}
              </AuthGuard>
            </div>

            {/* Titre */}


            <div className="text-blue-400 mb-2">
              <AuthGuard portfolioUserId={user.id} fallback={<span>{user.name}</span>}>
                {editingField === "title" ? (
                  <input
                    className="px-2 py-1 rounded bg-gray-800 text-white"
                    value={editValue}
                    autoFocus
                    onChange={e => setEditValue(e.target.value)}
                    onBlur={saveEdit}
                    onKeyDown={handleEditKeyDown}
                    disabled={savingEdit}
                  />
                ) : (
                  <span
                    className="cursor-pointer hover:underline"
                    title="Modifier le titre"
                    onClick={() => startEdit("title", user.title)}
                  >
                    {user.title}
                  </span>
                )}
              </AuthGuard>
            </div>


            {/* <p className="text-base md:text-lg text-slate-300 mb-6 max-w-xl text-center leading-relaxed">
                {user?.description || "Passionné par la création d'expériences numériques exceptionnelles avec React, Node.js et PostgreSQL"}
            </p> */}

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
              <h3 className="text-2xl font-semibold mb-6 text-blue-400">Mon parcours</h3>

                {/* Description */}

              <div className="text-gray-300 mb-4">
                <AuthGuard portfolioUserId={user.id} fallback={<span>{user.name}</span>}>
                  {editingField === "description" ? (
                    <textarea
                      className="px-2 py-1 rounded bg-gray-800 text-white w-full"
                      value={editValue}
                      autoFocus
                      onChange={e => setEditValue(e.target.value)}
                      onBlur={saveEdit}
                      onKeyDown={handleEditKeyDown}
                      disabled={savingEdit}
                      rows={3}
                    />
                  ) : (
                    <span
                      className="cursor-pointer hover:underline"
                      title="Modifier la description"
                      onClick={() => startEdit("description", user.description)}
                    >
                      {user.description}
                    </span>
                  )}
                </AuthGuard>
              </div>



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

            <AuthGuard portfolioUserId={user.id}>
              <div className="mb-6 z-10">
                <ImageUpload
                  type="avatar"
                  currentImage={user.avatar_url}
                  onImageUploaded={async (imageUrl) => {
                    // Mettre à jour l'avatar
                    const result = await updateUser({ avatar_url: imageUrl });
                    if (result.success) {
                      // L'avatar sera mis à jour automatiquement
                    }
                  }}
                  className="w-32 h-32 mx-auto "
                />
              </div>
            </AuthGuard>

            {/* Version publique (non propriétaire) */}
            {!isPortfolioOwner(user.id) && (
              <div className="mb-6 z-10">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.name}
                    className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-gray-700"
                  />
                ) : (
                  <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-3xl font-bold shadow-md">
                    {user.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                )}
              </div>
            )}

{/* 
            // Version publique (lecture seule) */}
            {/* {!isPortfolioOwner(user.id) && (
              <div className="mb-6 z-10">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.name}
                    className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-gray-700"
                  />
                ) : (
                  <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-3xl font-bold">
                    {user.name?.split(" ").map((n) => n[0]).join("") || "?"}
                  </div>
                )}
              </div>
            )} */}
          </div>
        </div>
      </section>

           

      {/* Skills Section */}
      <section id="skills" className="py-20 px-4 bg-gray-800/50" onClick={clearSelections}>
        <AuthGuard portfolioUserId={user.id}>
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
        </AuthGuard>

        {showSkillForm && (
          <form
            className="bg-gray-900 p-6 rounded-xl mb-6 shadow-lg max-w-xl mx-auto flex flex-col gap-3"
            onSubmit={handleSkillSubmit}
          >
            <h3 className="font-bold text-lg mb-2 text-purple-300">
              {skillForm.id ? "Modifier la compétence" : "Nouvelle compétence"}
            </h3>
            {formError && <div className="text-red-400 mb-2">{formError}</div>}

            {/* Catégorie */}
            <label className="text-sm font-semibold text-purple-300">Catégorie</label>
            <select
              className="px-3 py-2 rounded bg-gray-800 text-white mb-2"
              value={isManualCategory ? "custom" : skillForm.category}
              onChange={e => {
                const val = e.target.value;
                if (val === "custom") {
                  setIsManualCategory(true);
                  setManualCategory(""); // reset
                  setSkillForm(f => ({ ...f, category: "", items: "" })); // réinitialise la catégorie stockée
                } else {
                  setIsManualCategory(false);
                  setManualCategory("");
                  setSkillForm(f => ({ ...f, category: val, items: "" }));
                }
              }}
              required
            >
              <option value="">Choisir une catégorie</option>
              {availableCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
              <option value="custom">Autre (saisir manuellement)</option>
            </select>


            {isManualCategory && (
              <input
                type="text"
                className="px-3 py-2 rounded bg-gray-800 text-white mb-2"
                placeholder="Nom de la catégorie"
                value={manualCategory}
                onChange={e => setManualCategory(e.target.value)}
                required
              />
            )}



            {/* Compétence(s) - Multi, suggestions et création libre */}
            <label className="text-sm font-semibold text-purple-300">Compétence(s)</label>
            {skillForm.category && skillForm.category !== "custom" ? (
              <CreatableSelect
                isMulti
                options={filteredSkillOptions}
                value={
                  skillForm.items
                    ? skillForm.items.split(',').map(s => ({ value: s.trim(), label: s.trim() }))
                    : []
                }
                onChange={selected =>
                  setSkillForm(f => ({
                    ...f,
                    items: selected.map(o => o.value).join(', ')
                  }))
                }
                placeholder="Choisissez ou tapez les compétences"
                className="mb-4"
                styles={{
                  control: base => ({
                    ...base,
                    backgroundColor: '#23243a',
                    color: 'white',
                    borderColor: '#a084fa'
                  }),
                  input: base => ({
                    ...base,
                    color: 'white'
                  }),
                  menu: base => ({
                    ...base,
                    backgroundColor: '#2d2f42',
                    color: 'white'
                  }),
                  multiValue: base => ({
                    ...base,
                    backgroundColor: '#a084fa',
                    color: 'white'
                  }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isFocused ? "#7c3aed" : "#23243a",
                    color: 'white'
                  }),
                }}
                maxMenuHeight={180}
              />
            )
             : (
              <input
                type="text"
                className="px-3 py-2 rounded bg-gray-800 text-white mb-2"
                placeholder="Compétences (séparées par virgule)"
                value={skillForm.items}
                onChange={e => setSkillForm(f => ({ ...f, items: e.target.value }))}
              />
            )}

            

            <div className="flex gap-4 mt-2">
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-white font-semibold"
              >
                {skillForm.id ? "Modifier" : "Ajouter"}
              </button>
              <button
                type="button"
                className="bg-gray-700 hover:bg-gray-800 px-4 py-2 rounded text-white"
                onClick={() => { setShowSkillForm(false); setSkillForm({ category: "", items: "", icon_name: "", id: null }); setEditingSkill(null); }}
              >
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
              skills.map(skill => (
                <SkillCard
                  key={skill.id}
                  skill={skill}
                  isSelected={selectedSkillId === skill.id}
                  onSelect={handleSkillSelect}
                  onDelete={handleSkillDelete}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-400 text-lg">Aucune compétence à afficher.</p>
              </div>
            )}
          </div>
        </div>

        {/* Modal de confirmation de suppression */}
        {modalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[9999]">
            <div className="bg-gray-900 p-8 rounded-2xl shadow-2xl w-full max-w-xs text-center">
              <h2 className="text-xl font-bold text-red-400 mb-3">Confirmer la suppression</h2>
              <p className="text-gray-300 mb-6">
                {modalType === "project"
                  ? "Voulez-vous vraiment supprimer ce projet ? Cette action est irréversible."
                  : "Voulez-vous vraiment supprimer cette compétence ? Cette action est irréversible."}
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white font-semibold"
                  onClick={confirmDelete}
                >
                  Supprimer
                </button>
                <button
                  className="bg-gray-700 hover:bg-gray-800 px-4 py-2 rounded text-white"
                  onClick={closeDeleteModal}
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

      </section>


      {/* AJOUT : Experiences Section - À placer entre la section skills et projects */}
      <section id="experiences" className="py-20 px-4" onClick={clearSelections}>
        <AuthGuard portfolioUserId={user.id}>
          <div className="flex gap-4 justify-end mb-6">
            <button
              onClick={e => { 
                e.stopPropagation(); 
                setShowExperienceForm(true); 
                setExperienceForm({ entreprise: "", poste: "", date_debut: "", date_fin: "", description: "", id: null });
                setFormError("");
              }}
              className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white font-semibold shadow"
            >
              + Ajouter une expérience
            </button>
            <button
              disabled={!selectedExperienceId}
              onClick={e => {
                e.stopPropagation();
                const exp = experiences.find(ex => ex.id === selectedExperienceId);
                if (exp) {
                  setExperienceForm({
                    ...exp,
                    date_debut: formatDateForInput(exp.date_debut),
                    date_fin: formatDateForInput(exp.date_fin),
                    id: exp.id
                  });
                  setShowExperienceForm(true);
                  setFormError("");
                }
              }}
              className={`px-4 py-2 rounded font-semibold shadow
                ${selectedExperienceId ? "bg-yellow-500 hover:bg-yellow-600 text-white" : "bg-gray-700 text-gray-400 cursor-not-allowed"}`}
            >
              Modifier l'expérience
            </button>
          </div>
        </AuthGuard>

        {showExperienceForm && (
          <form
            className="bg-gray-900 p-6 rounded-xl mb-6 shadow-lg max-w-xl mx-auto flex flex-col gap-3"
            onSubmit={handleExperienceSubmit}
          >
            <h3 className="font-bold text-lg mb-2 text-green-300">
              {experienceForm.id ? "Modifier l'expérience" : "Nouvelle expérience"}
            </h3>
            {formError && <div className="text-red-400 mb-2">{formError}</div>}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-green-300 mb-1">
                  Entreprise *
                </label>
                <input
                  type="text"
                  className="px-3 py-2 rounded bg-gray-800 text-white w-full"
                  placeholder="Nom de l'entreprise"
                  value={experienceForm.entreprise}
                  onChange={e => setExperienceForm(f => ({ ...f, entreprise: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-green-300 mb-1">
                  Poste *
                </label>
                <input
                  type="text"
                  className="px-3 py-2 rounded bg-gray-800 text-white w-full"
                  placeholder="Votre fonction"
                  value={experienceForm.poste}
                  onChange={e => setExperienceForm(f => ({ ...f, poste: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-green-300 mb-1">
                  Date de début *
                </label>
                <input
                  type="month"
                  className="px-3 py-2 rounded bg-gray-800 text-white w-full"
                  value={experienceForm.date_debut}
                  onChange={e => setExperienceForm(f => ({ ...f, date_debut: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-green-300 mb-1">
                  Date de fin
                </label>
                <input
                  type="month"
                  className="px-3 py-2 rounded bg-gray-800 text-white w-full"
                  value={experienceForm.date_fin}
                  onChange={e => setExperienceForm(f => ({ ...f, date_fin: e.target.value }))}
                />
                <p className="text-xs text-gray-500 mt-1">Laissez vide si c'est votre poste actuel</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-green-300 mb-1">
                Description
              </label>
              <textarea
                className="px-3 py-2 rounded bg-gray-800 text-white w-full"
                rows="3"
                placeholder="Décrivez vos responsabilités et réalisations..."
                value={experienceForm.description}
                onChange={e => setExperienceForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>

            <div className="flex gap-4 mt-2">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white font-semibold"
              >
                {experienceForm.id ? "Modifier" : "Ajouter"}
              </button>
              <button
                type="button"
                className="bg-gray-700 hover:bg-gray-800 px-4 py-2 rounded text-white"
                onClick={() => { 
                  setShowExperienceForm(false); 
                  setExperienceForm({ entreprise: "", poste: "", date_debut: "", date_fin: "", description: "", id: null }); 
                  setEditingExperience(null); 
                }}
              >
                Annuler
              </button>
            </div>
          </form>
        )}

        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Expériences Professionnelles
          </h2>
          
          {experiences && experiences.length > 0 ? (
            <div className="space-y-6">
              {experiences
                .sort((a, b) => new Date(b.date_debut) - new Date(a.date_debut))
                .map(experience => (
                  <ExperienceCard
                    key={experience.id}
                    experience={experience}
                    isSelected={selectedExperienceId === experience.id}
                    onSelect={handleExperienceSelect}
                    onDelete={handleExperienceDelete}
                    formatDate={formatDate}
                    formatDuration={formatDuration}
                  />
                ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
                <span className="text-3xl">💼</span>
              </div>
              <p className="text-gray-400 text-lg">Aucune expérience professionnelle ajoutée.</p>
              <p className="text-gray-500 text-sm">Cliquez sur "Ajouter une expérience" pour commencer</p>
            </div>
          )}
        </div>
      </section>
      

      {/* Projects Section */}
      <section id="projects" className="py-20 px-4" onClick={clearSelections}>
        <AuthGuard portfolioUserId={user.id}>
          <div className="flex gap-4 justify-end mb-6">
            <button
              onClick={e => { 
                e.stopPropagation(); 
                setShowProjectForm(true); 
                setProjectForm({ title: "", description: "", technologies: "", image_url: "", github_url: "", demo_url: "", id: null });
                setEditingProject(null);
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
                  title: proj.title || "",
                  description: proj.description || "",
                  technologies: Array.isArray(proj.technologies) ? proj.technologies.join(", ") : proj.technologies || "",
                  image_url: proj.image_url || "",
                  github_url: proj.github_url || "",
                  demo_url: proj.demo_url || ""
                });
                setEditingProject(proj); // Set editing state
                setShowProjectForm(true);
                setFormError("");;
                }
              }}
              className={`px-4 py-2 rounded font-semibold shadow
                ${selectedProjectId ? "bg-yellow-500 hover:bg-yellow-600 text-white" : "bg-gray-700 text-gray-400 cursor-not-allowed"}`}
            >
              Modifier le projet
            </button>
          </div>
        </AuthGuard>

        {showProjectForm && (
        <form
          className="bg-gray-900 p-6 rounded-xl mb-6 shadow-lg max-w-xl mx-auto flex flex-col gap-4"
          onSubmit={handleProjectSubmit}
        >
          <h3 className="font-bold text-lg mb-2 text-blue-300">
            {editingProject ? "Modifier le projet" : "Nouveau projet"}
          </h3>
          
          {formError && (
            <div className="text-red-400 mb-2 p-3 bg-red-900/30 rounded-lg border border-red-500/30">
              {formError}
            </div>
          )}

          {/* Titre du projet */}
          <div>
            <label className="block text-sm font-medium text-blue-300 mb-1">
              Titre du projet *
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:border-blue-400 focus:outline-none"
              placeholder="Nom de votre projet"
              value={projectForm.title}
              onChange={e => setProjectForm(f => ({ ...f, title: e.target.value }))}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-blue-300 mb-1">
              Description *
            </label>
            <textarea
              className="w-full px-3 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:border-blue-400 focus:outline-none"
              placeholder="Décrivez votre projet..."
              value={projectForm.description}
              onChange={e => setProjectForm(f => ({ ...f, description: e.target.value }))}
              rows={3}
              required
            />
          </div>

          {/* Technologies - UN SEUL CHAMP avec CreatableSelect */}
          <div>
            <label className="block text-sm font-medium text-blue-300 mb-1">
              Technologies utilisées
            </label>
            
            {/* Sélecteur de catégorie pour filtrer les suggestions */}
            <select
              value={selectedTechCategory}
              onChange={e => setSelectedTechCategory(e.target.value)}
              className="w-full mb-2 px-3 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:border-blue-400 focus:outline-none"
            >
              <option value="">Toutes catégories</option>
              {availableCategories.map(cat =>
                <option key={cat} value={cat}>{cat}</option>
              )}
            </select>

            {/* CreatableSelect pour les technologies */}
            <CreatableSelect
              isMulti
              options={techOptions}
              value={
                projectForm.technologies
                  ? projectForm.technologies.split(",").map(s => ({
                      value: s.trim(),
                      label: s.trim()
                    }))
                  : []
              }
              onChange={selected =>
                setProjectForm(f => ({
                  ...f,
                  technologies: selected.map(o => o.value).join(", ")
                }))
              }
              placeholder="Choisissez ou ajoutez les technologies utilisées"
              styles={{
                control: base => ({
                  ...base,
                  backgroundColor: '#1f2937',
                  borderColor: '#374151',
                  color: 'white',
                  '&:hover': {
                    borderColor: '#60a5fa'
                  }
                }),
                input: base => ({
                  ...base,
                  color: 'white'
                }),
                menu: base => ({
                  ...base,
                  backgroundColor: '#1f2937',
                  color: 'white',
                  border: '1px solid #374151'
                }),
                multiValue: base => ({
                  ...base,
                  backgroundColor: '#3b82f6',
                  color: 'white'
                }),
                multiValueLabel: base => ({
                  ...base,
                  color: 'white'
                }),
                multiValueRemove: base => ({
                  ...base,
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#1e40af',
                    color: 'white'
                  }
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isFocused ? "#3b82f6" : "#1f2937",
                  color: 'white',
                  '&:hover': {
                    backgroundColor: "#3b82f6"
                  }
                }),
              }}
              maxMenuHeight={180}
            />
            <p className="text-xs text-gray-400 mt-1">
              Tapez pour ajouter une nouvelle technologie ou sélectionnez dans la liste
            </p>
          </div>

           {/* Upload d'image */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-blue-300 mb-2">
              Image du projet
            </label>
            <ImageUpload
              type="project"
              currentImage={projectForm.image_url}
              onImageUploaded={(imageUrl) => {
                setProjectForm(f => ({ ...f, image_url: imageUrl }));
              }}
            />
          </div>

          {/* Liens */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-blue-300 mb-1">
                Lien GitHub
              </label>
              <input
                type="url"
                className="w-full px-3 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:border-blue-400 focus:outline-none"
                placeholder="https://github.com/..."
                value={projectForm.github_url}
                onChange={e => setProjectForm(f => ({ ...f, github_url: e.target.value }))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-blue-300 mb-1">
                Lien Démo
              </label>
              <input
                type="url"
                className="w-full px-3 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:border-blue-400 focus:outline-none"
                placeholder="https://monprojet.com"
                value={projectForm.demo_url}
                onChange={e => setProjectForm(f => ({ ...f, demo_url: e.target.value }))}
              />
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-4 mt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded text-white font-semibold transition-colors"
            >
              {editingProject ? "Modifier le projet" : "Ajouter le projet"}
            </button>
            <button
              type="button"
              className="bg-gray-700 hover:bg-gray-800 px-6 py-3 rounded text-white transition-colors"
              onClick={() => { 
                setShowProjectForm(false); 
                setProjectForm({ title: "", description: "", technologies: "", image_url: "", github_url: "", demo_url: "" }); 
                setEditingProject(null);
                setFormError("");
              }}
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
                <ProjectCard
                  key={project.id}
                  project={project}
                  isSelected={selectedProjectId === project.id}
                  onSelect={handleProjectSelect}
                  onDelete={handleProjectDelete}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <span className="text-3xl">💻</span>
                </div>
                <p className="text-gray-400 text-lg">Aucun projet à afficher pour le moment.</p>
                <p className="text-gray-500 text-sm">Cliquez sur "Ajouter un projet" </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal de confirmation de suppression */}
        {modalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[9999]">
            <div className="bg-gray-900 p-8 rounded-2xl shadow-2xl w-full max-w-xs text-center">
              <h2 className="text-xl font-bold text-red-400 mb-3">Confirmer la suppression</h2>
              <p className="text-gray-300 mb-6">
                {modalType === "project"
                  ? "Voulez-vous vraiment supprimer ce projet ? Cette action est irréversible."
                  : modalType === "skill"
                  ? "Voulez-vous vraiment supprimer cette compétence ? Cette action est irréversible."
                  : "Voulez-vous vraiment supprimer cette expérience ? Cette action est irréversible."}
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white font-semibold"
                  onClick={confirmDelete}
                >
                  Supprimer
                </button>
                <button
                  className="bg-gray-700 hover:bg-gray-800 px-4 py-2 rounded text-white"
                  onClick={closeDeleteModal}
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}


      </section>


      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 bg-gray-800/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Contact
          </h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div >
              <h3 className="text-2xl font-semibold mb-6 text-blue-400">Restons en Contact</h3>
              <p className="text-gray-300 mb-8">
                Intéressé par une collaboration ? N'hésitez pas à me contacter pour discuter de vos projets.
              </p>
              <div className="space-y-4">

                {/* localisation */}

                <div className="flex items-center relative group">
                  <MapPin className="w-5 h-5 text-blue-400 mr-3" />
                  <AuthGuard portfolioUserId={user.id} fallback={<span>{user.name}</span>}>
                    {editingField === "location" ? (
                      <>
                        <input
                          className="px-2 py-1 rounded bg-gray-800 text-white"
                          value={editValue}
                          autoFocus
                          onChange={e => setEditValue(e.target.value)}
                          onBlur={saveEdit}
                          disabled={savingEdit}
                        />
                        <button
                          onClick={saveEdit}
                          className="ml-2 text-green-500 font-bold"
                          title="Valider"
                        >✔</button>
                      </>
                    ) : (
                      <>
                        <span className="text-gray-300">{user.location}</span>
                        <button
                          className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition"
                          onClick={() => startEdit("location", user.location)}
                          title="Modifier la localisation"
                          tabIndex={-1}
                        >
                          <Pencil className="w-4 h-4 text-blue-400 hover:text-blue-500" />
                        </button>
                      </>
                    )}
                  </AuthGuard>
                </div>


                {/* telephone */}

                <div className="flex items-center relative group">
                  <Phone className="w-5 h-5 text-blue-400 mr-3" />
                  <AuthGuard portfolioUserId={user.id} fallback={<span>{user.name}</span>}>
                    {editingField === "phone" ? (
                      <>
                        <input
                          className="px-2 py-1 rounded bg-gray-800 text-white"
                          value={editValue}
                          autoFocus
                          onChange={e => setEditValue(e.target.value)}
                          onBlur={saveEdit}
                          disabled={savingEdit}
                        />
                        <button
                          onClick={saveEdit}
                          className="ml-2 text-green-500 font-bold"
                          title="Valider"
                        >✔</button>
                      </>
                    ) : (
                      <>
                        <a href={`tel:${user.phone}`} className="text-gray-300 hover:text-white transition-colors">
                          {user.phone}
                        </a>
                        <button
                          className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition"
                          onClick={() => startEdit("phone", user.phone)}
                          title="Modifier le téléphone"
                          tabIndex={-1}
                        >
                          <Pencil className="w-4 h-4 text-blue-400 hover:text-blue-500" />
                        </button>
                      </>
                    )}
                  </AuthGuard>
                </div>


                {/* Email */}

                
                <div className="flex items-center relative group">
                  <Mail className="w-5 h-5 text-blue-400 mr-3" />
                  <AuthGuard portfolioUserId={user.id} fallback={<span>{user.name}</span>}>
                    {editingField === "email" ? (
                      <>
                        <input
                          className="px-2 py-1 rounded bg-gray-800 text-white"
                          value={editValue}
                          autoFocus
                          onChange={e => setEditValue(e.target.value)}
                          onBlur={saveEdit}
                          disabled={savingEdit}
                        />
                        <button
                          onClick={saveEdit}
                          className="ml-2 text-green-500 font-bold"
                          title="Valider"
                        >✔</button>
                      </>
                    ) : (
                      <>
                        <a href={`mailto:${user.email}`} className="text-gray-300 hover:text-white transition-colors">
                          {user.email}
                        </a>
                        <button
                          className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition"
                          onClick={() => startEdit("email", user.email)}
                          title="Modifier l'email"
                          tabIndex={-1}
                        >
                          <Pencil className="w-4 h-4 text-blue-400 hover:text-blue-500" />
                        </button>
                      </>
                    )}
                  </AuthGuard>
                </div>

              </div>
              <div className="flex space-x-4 mt-6">
                {/* Github */}
                <div className="relative group inline-block">
                  <a
                    href={user.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors inline-flex items-center justify-center"
                  >
                    <Github className="w-5 h-5 text-white" />
                  </a>
                  <button
                    className="absolute -top-2 -right-2 bg-gray-800 rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                    onClick={() => startEdit("github_url", user.github_url)}
                    title="Modifier Github"
                    tabIndex={-1}
                    style={{ zIndex: 10 }}
                  >
                    <Pencil className="w-3 h-3 text-blue-400 hover:text-blue-500" />
                  </button>
                  <AuthGuard portfolioUserId={user.id} fallback={<span>{user.name}</span>}>
                    {editingField === "github_url" && (
                      <div className="absolute left-1/2 -translate-x-1/2 top-14 z-50 bg-gray-800 p-2 rounded shadow flex items-center">
                        <input
                          className="px-2 py-1 rounded bg-gray-900 text-white"
                          value={editValue}
                          autoFocus
                          onChange={e => setEditValue(e.target.value)}
                          onBlur={saveEdit}
                          onKeyDown={e => {
                            if (e.key === "Escape") cancelEdit();
                            if (e.key === "Enter") saveEdit();
                          }}
                          disabled={savingEdit}
                          placeholder="Lien Github"
                        />
                        <button
                          onClick={saveEdit}
                          className="ml-2 text-green-500 font-bold"
                          title="Valider"
                          disabled={editValue === user.github_url || savingEdit}
                        >✔</button>
                        <button
                          onClick={cancelEdit}
                          className="ml-1 text-red-400 font-bold"
                          title="Annuler"
                          type="button"
                        >✗</button>
                      </div>
                    )}
                  </AuthGuard>
                </div>
                
                {/* LinkedIn */}
                <div className="relative group inline-block">
                  <a
                    href={user.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors inline-flex items-center justify-center"
                  >
                    <Linkedin className="w-5 h-5 text-white" />
                  </a>
                  <button
                    className="absolute -top-2 -right-2 bg-gray-800 rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                    onClick={() => startEdit("linkedin_url", user.linkedin_url)}
                    title="Modifier Linkedin"
                    tabIndex={-1}
                    style={{ zIndex: 10 }}
                  >
                    <Pencil className="w-3 h-3 text-blue-400 hover:text-blue-500" />
                  </button>
                  <AuthGuard portfolioUserId={user.id} fallback={<span>{user.name}</span>}>
                    {editingField === "linkedin_url" && (
                      <div className="absolute left-1/2 -translate-x-1/2 top-14 z-50 bg-gray-800 p-2 rounded shadow flex items-center">
                        <input
                          className="px-2 py-1 rounded bg-gray-900 text-white"
                          value={editValue}
                          autoFocus
                          onChange={e => setEditValue(e.target.value)}
                          onBlur={saveEdit}
                          onKeyDown={e => {
                            if (e.key === "Escape") cancelEdit();
                            if (e.key === "Enter") saveEdit();
                          }}
                          disabled={savingEdit}
                          placeholder="Lien Linkedin"
                        />
                        <button
                          onClick={saveEdit}
                          className="ml-2 text-green-500 font-bold"
                          title="Valider"
                          disabled={editValue === user.linkedin_url || savingEdit}
                        >✔</button>
                        <button
                          onClick={cancelEdit}
                          className="ml-1 text-red-400 font-bold"
                          title="Annuler"
                          type="button"
                        >✗</button>
                      </div>
                    )}
                  </AuthGuard>
                </div>
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
