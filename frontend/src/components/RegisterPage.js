// frontend/src/components/RegisterPage.js

// frontend/src/components/RegisterPage.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, Briefcase, FileText, Plus, Edit2, Trash2 } from 'lucide-react';
import CreatableSelect from 'react-select/creatable';

// ==================== COMPOSANTS MODAUX ====================

function ProjectFormModal({ onClose, onSave, initialData, techOptions }) {
  const [form, setForm] = useState(
    initialData || { title: '', description: '', technologies: '', github_url: '', demo_url: '' }
  );

  useEffect(() => {
    if (initialData) setForm(initialData);
  }, [initialData]);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 ">
      <form
        className="bg-gray-900 p-6 rounded-xl shadow-lg w-full max-w-md flex flex-col gap-3"
        onSubmit={e => {
          e.preventDefault();
          onSave(form);
          onClose();
        }}
      >
        <h3 className="font-bold text-lg mb-2 text-blue-300">
          {initialData ? 'Modifier le projet' : 'Ajouter un projet'}
        </h3>
        <input
          className="px-3 py-2 rounded bg-gray-800 text-white mb-2"
          placeholder="Titre"
          value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          required
        />
        <textarea
          className="px-3 py-2 rounded bg-gray-800 text-white mb-2"
          placeholder="Description"
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
        />
        <label className="text-sm font-semibold text-blue-300 mb-1">
          Technologies utilisées (multi-sélection possible)
        </label>
        <CreatableSelect
          isMulti
          options={techOptions}
          value={
            form.technologies
              ? Array.isArray(form.technologies)
                ? form.technologies.map(s => ({ value: s, label: s }))
                : form.technologies.split(',').map(s => ({ value: s.trim(), label: s.trim() }))
              : []
          }
          onChange={selected =>
            setForm(f => ({
              ...f,
              technologies: selected.map(o => o.value)
            }))
          }
          placeholder="Choisissez ou tapez les technologies"
          className="mb-4"
          styles={{
            control: base => ({
              ...base,
              backgroundColor: '#23243a',
              color: 'white',
              borderColor: '#38bdf8'
            }),
            input: base => ({ ...base, color: 'white' }),
            menu: base => ({ ...base, backgroundColor: '#2d2f42', color: 'white' }),
            multiValue: base => ({ ...base, backgroundColor: '#38bdf8', color: 'white' }),
            option: (base, state) => ({
              ...base,
              backgroundColor: state.isFocused ? "#38bdf8" : "#23243a",
              color: 'white'
            }),
          }}
          maxMenuHeight={180}
        />
        <input
          className="px-3 py-2 rounded bg-gray-800 text-white mb-2"
          placeholder="Lien vers le code (GitHub, GitLab...)"
          type="url"
          value={form.github_url || ""}
          onChange={e => setForm(f => ({ ...f, github_url: e.target.value }))}
          autoComplete="off"
        />
        <input
          className="px-3 py-2 rounded bg-gray-800 text-white mb-2"
          placeholder="Lien démo (optionnel)"
          type="url"
          value={form.demo_url || ""}
          onChange={e => setForm(f => ({ ...f, demo_url: e.target.value }))}
          autoComplete="off"
        />
        <div className="flex gap-4 mt-2">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white font-semibold"
          >
            {initialData ? 'Modifier' : 'Ajouter'}
          </button>
          <button
            type="button"
            className="bg-gray-700 hover:bg-gray-800 px-4 py-2 rounded text-white"
            onClick={onClose}
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}

function SkillFormModal({ onClose, onSave, initialData, skillsReference = [] }) {
  const [form, setForm] = useState(
    initialData || { category: '', items: '', icon_name: '' }
  );
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [manualCategory, setManualCategory] = useState('');

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
      setIsCustomCategory(false);
      setManualCategory('');
    }
  }, [initialData]);

  const categories = [...new Set(skillsReference.map(s => s.category))];

  const filteredOptions = !form.category || form.category === "custom"
    ? skillsReference.map(s => ({ value: s.skill_name, label: s.skill_name }))
    : skillsReference
        .filter(s => s.category === form.category)
        .map(s => ({ value: s.skill_name, label: s.skill_name }));

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <form
        className="bg-gray-900 p-6 rounded-xl shadow-lg w-full max-w-md flex flex-col gap-3"
        onSubmit={e => {
          e.preventDefault();
          const finalCategory = isCustomCategory ? manualCategory : form.category;
          if (!finalCategory.trim() || !form.items.trim()) return;
          onSave({
            ...form,
            category: finalCategory,
            items: form.items.split(',').map(i => i.trim())
          });
          onClose();
        }}
      >
        <h3 className="font-bold text-lg mb-2 text-purple-300">
          {initialData ? 'Modifier la compétence' : 'Ajouter une compétence'}
        </h3>
        <label className="text-sm font-semibold text-purple-300">Catégorie</label>
        <select
          className="px-3 py-2 rounded bg-gray-800 text-white mb-2"
          value={isCustomCategory ? "custom" : form.category}
          onChange={e => {
            const cat = e.target.value;
            if (cat === "custom") {
              setIsCustomCategory(true);
              setForm(f => ({ ...f, category: "" }));
            } else {
              setIsCustomCategory(false);
              setManualCategory("");
              setForm(f => ({ ...f, category: cat }));
            }
          }}
          required
        >
          <option value="">Choisir une catégorie</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
          <option value="custom">Autre (ajouter manuellement)</option>
        </select>
        {isCustomCategory && (
          <input
            className="px-3 py-2 rounded bg-gray-800 text-white mb-2"
            placeholder="Nouvelle catégorie"
            value={manualCategory}
            onChange={e => setManualCategory(e.target.value)}
            required
          />
        )}
        <label className="text-sm font-semibold text-purple-300">Compétence(s)</label>
        <CreatableSelect
          isMulti
          options={filteredOptions}
          value={
            form.items
              ? form.items.split(',').map(s => ({ value: s.trim(), label: s.trim() }))
              : []
          }
          onChange={selected =>
            setForm(f => ({
              ...f,
              items: selected.map(o => o.value).join(', ')
            }))
          }
          placeholder="Choisissez ou tapez vos compétences"
          className="mb-4"
          styles={{
            control: base => ({ ...base, backgroundColor: '#23243a', color: 'white', borderColor: '#a084fa' }),
            input: base => ({ ...base, color: 'white' }),
            menu: base => ({ ...base, backgroundColor: '#2d2f42', color: 'white' }),
            multiValue: base => ({ ...base, backgroundColor: '#a084fa', color: 'white' }),
            option: (base, state) => ({
              ...base,
              backgroundColor: state.isFocused ? "#7c3aed" : "#23243a",
              color: 'white'
            }),
          }}
          maxMenuHeight={180}
        />
        <input
          className="px-3 py-2 rounded bg-gray-800 text-white mb-2"
          placeholder="Nom de l'icône (facultatif, ex: Code, Server, Palette)"
          value={form.icon_name}
          onChange={e => setForm(f => ({ ...f, icon_name: e.target.value }))}
        />
        <div className="flex gap-4 mt-2">
          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-white font-semibold"
          >
            {initialData ? 'Modifier' : 'Ajouter'}
          </button>
          <button
            type="button"
            className="bg-gray-700 hover:bg-gray-800 px-4 py-2 rounded text-white"
            onClick={onClose}
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}

function ExperienceFormModal({ onClose, onSave, initialData }) {
  const [form, setForm] = useState(
    initialData || { 
      entreprise: '', 
      poste: '', 
      date_debut: '',
      date_fin: '',
      description: '' 
    }
  );

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    return dateString.substring(0, 7);
  };

  useEffect(() => {
    if (initialData) {
      setForm({
        entreprise: initialData.entreprise || '',
        poste: initialData.poste || '',
        date_debut: formatDateForInput(initialData.date_debut) || '',
        date_fin: formatDateForInput(initialData.date_fin) || '',
        description: initialData.description || ''
      });
    }
  }, [initialData]);

  const formatDurationPreview = (date_debut, date_fin) => {
    if (!date_debut) return '';
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
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <form
        className="bg-gray-900 p-6 rounded-xl shadow-lg w-full max-w-md flex flex-col gap-3"
        onSubmit={e => {
          e.preventDefault();
          if (!form.entreprise.trim() || !form.poste.trim() || !form.date_debut) {
            alert('Entreprise, poste et date de début sont obligatoires');
            return;
          }
          onSave(form);
          onClose();
        }}
      >
        <h3 className="font-bold text-lg mb-2 text-green-300">
          {initialData ? "Modifier l'expérience" : "Ajouter une expérience"}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-green-300 mb-1">Entreprise *</label>
            <input
              className="w-full px-3 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:border-green-400"
              placeholder="Nom de l'entreprise"
              value={form.entreprise}
              onChange={e => setForm(f => ({ ...f, entreprise: e.target.value }))}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-green-300 mb-1">Poste *</label>
            <input
              className="w-full px-3 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:border-green-400"
              placeholder="Votre fonction"
              value={form.poste}
              onChange={e => setForm(f => ({ ...f, poste: e.target.value }))}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-green-300 mb-1">Date de début *</label>
            <input
              type="month"
              className="w-full px-3 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:border-green-400"
              value={form.date_debut}
              onChange={e => setForm(f => ({ ...f, date_debut: e.target.value }))}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-green-300 mb-1">Date de fin</label>
            <input
              type="month"
              className="w-full px-3 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:border-green-400"
              value={form.date_fin}
              onChange={e => setForm(f => ({ ...f, date_fin: e.target.value }))}
            />
            <p className="text-xs text-gray-500 mt-1">Laissez vide si c'est votre poste actuel</p>
          </div>
        </div>

        {form.date_debut && (
          <div className="text-center">
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              Durée : {formatDurationPreview(form.date_debut, form.date_fin)}
            </span>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-green-300 mb-1">Description</label>
          <textarea
            className="w-full px-3 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:border-green-400"
            rows="3"
            placeholder="Décrivez vos responsabilités et réalisations..."
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          />
        </div>

        <div className="flex gap-4 mt-2">
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white font-semibold"
          >
            {initialData ? 'Modifier' : 'Ajouter'}
          </button>
          <button
            type="button"
            className="bg-gray-700 hover:bg-gray-800 px-4 py-2 rounded text-white"
            onClick={onClose}
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}

// ==================== COMPOSANT PRINCIPAL ====================

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

  // États pour les projets, compétences et expériences
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [experiences, setExperiences] = useState([]);
  
  // États pour les formulaires modaux
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showSkillForm, setShowSkillForm] = useState(false);
  const [showExperienceForm, setShowExperienceForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [editingSkill, setEditingSkill] = useState(null);
  const [editingExperience, setEditingExperience] = useState(null);
  
  // Référence des compétences
  const [skillsReference, setSkillsReference] = useState([]);

  useEffect(() => {
    fetch('/api/skills_reference')
      .then(res => res.json())
      .then(data => setSkillsReference(data))
      .catch(() => setSkillsReference([]));
  }, []);

  const techOptions = skillsReference.map(s => ({
    value: s.skill_name,
    label: s.skill_name
  }));

  const formatDuration = (date_debut, date_fin) => {
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
  };

  // Handlers pour les projets
  const handleDeleteProject = (proj) => {
    if(window.confirm("Supprimer ce projet ?")) {
      setProjects(projects.filter(p => p !== proj));
    }
  };

  const handleSaveProject = (data) => {
    if(editingProject) {
      setProjects(projects.map(p => (p === editingProject ? data : p)));
    } else {
      setProjects([data, ...projects]);
    }
    setEditingProject(null);
  };

  // Handlers pour les compétences
  const handleDeleteSkill = (skill) => {
    if(window.confirm("Supprimer cette compétence ?")) {
      setSkills(skills.filter(s => s !== skill));
    }
  };

  const handleSaveSkill = (data) => {
    if(editingSkill) {
      setSkills(skills.map(s => (s === editingSkill ? data : s)));
    } else {
      setSkills([data, ...skills]);
    }
    setEditingSkill(null);
  };

  // Handlers pour les expériences
  const handleDeleteExperience = (experience) => {
    if(window.confirm("Supprimer cette expérience ?")) {
      setExperiences(experiences.filter(e => e !== experience));
    }
  };

  const handleSaveExperience = (data) => {
    if(editingExperience) {
      setExperiences(experiences.map(e => (e === editingExperience ? data : e)));
    } else {
      setExperiences([data, ...experiences]);
    }
    setEditingExperience(null);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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
      
      // 1. Créer l'utilisateur via l'authentification
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
        
        window.location.href = `/portfolio/${data.user.id}`;

        const userId = data.user.id;
        const authToken = data.token;
        
        // 2. Créer les projets, compétences et expériences
        try {
          await Promise.all([
            // Créer les projets
            ...projects.map(project => 
              fetch('/api/projects', {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ 
                  ...project, 
                  user_id: userId,
                  technologies: Array.isArray(project.technologies) 
                    ? project.technologies 
                    : project.technologies.split(',').map(t => t.trim())
                })
              })
            ),
            // Créer les compétences
            ...skills.map(skill => 
              fetch('/api/skills', {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ 
                  ...skill, 
                  user_id: userId,
                  items: Array.isArray(skill.items) ? skill.items : [skill.items]
                })
              })
            ),
            // Créer les expériences
            ...experiences.map(experience => 
              fetch('/api/experiences', {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ 
                  ...experience, 
                  user_id: userId,
                  date_debut: experience.date_debut ? experience.date_debut + '-01' : null,
                  date_fin: experience.date_fin ? experience.date_fin + '-01' : null
                })
              })
            )
          ]);
        } catch (err) {
          console.error('Erreur création portfolio items:', err);
          // Continuer même si certains éléments échouent
        }
        
        // Rediriger vers le portfolio
        navigate(`/portfolio/${userId}`);
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
    <div className="min-h-screen bg-gradient-to-br from-[#16172a] to-[#312342ef] flex justify-center px-4 py-20">
      <div className="w-full max-w-4xl mt-20">
        {/* Logo/Titre */}
        <div className="text-center mb-8 ">
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

            {/* Section Informations de compte */}
            <div className="border-b border-gray-700 pb-6">
              <h3 className="text-xl font-semibold text-white mb-4">Informations de compte</h3>
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
            </div>

            {/* Section Informations professionnelles */}
            <div className="border-b border-gray-700 pb-6">
              <h3 className="text-xl font-semibold text-white mb-4">Informations professionnelles</h3>
              <div className="space-y-4">
                {/* Titre professionnel */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Titre professionnel
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
                    Description
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

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Années d'expérience */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Années d'expérience</label>
                    <input
                      type="number"
                      name="experience_years"
                      min={0}
                      value={formData.experience_years}
                      onChange={handleChange}
                      className="w-full px-3 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
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
                      className="w-full px-3 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                      placeholder="Votre ville"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section Portfolio - Projets */}
            <div className="border-b border-gray-700 pb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">Projets</h3>
                <button
                  type="button"
                  onClick={() => { setShowProjectForm(true); setEditingProject(null); }}
                  className="text-blue-500 hover:text-blue-400"
                  title="Ajouter un projet"
                >
                  <Plus size={20} />
                </button>
              </div>
              {projects.length === 0 ? (
                <p className="text-gray-400 text-sm">Aucun projet ajouté</p>
              ) : (
                <ul className="space-y-2">
                  {projects.map((proj, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-white/90 bg-gray-800 px-3 py-2 rounded">
                      <span className="font-medium flex-1">{proj.title}</span>
                      <button
                        type="button"
                        className="text-green-400 hover:text-green-500"
                        onClick={() => { setShowProjectForm(true); setEditingProject(proj); }}
                        title="Modifier"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        type="button"
                        className="text-red-400 hover:text-red-600"
                        onClick={() => handleDeleteProject(proj)}
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Section Portfolio - Compétences */}
            <div className="border-b border-gray-700 pb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">Compétences</h3>
                <button
                  type="button"
                  onClick={() => { setShowSkillForm(true); setEditingSkill(null); }}
                  className="text-purple-400 hover:text-purple-300"
                  title="Ajouter une compétence"
                >
                  <Plus size={20} />
                </button>
              </div>
              {skills.length === 0 ? (
                <p className="text-gray-400 text-sm">Aucune compétence ajoutée</p>
              ) : (
                <ul className="space-y-2">
                  {skills.map((skill, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-white/90 bg-gray-800 px-3 py-2 rounded">
                      <span className="font-medium flex-1">
                        {skill.category} : {Array.isArray(skill.items) ? skill.items.join(', ') : skill.items}
                      </span>
                      <button
                        type="button"
                        className="text-green-400 hover:text-green-500"
                        onClick={() => { setShowSkillForm(true); setEditingSkill(skill); }}
                        title="Modifier"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        type="button"
                        className="text-red-400 hover:text-red-600"
                        onClick={() => handleDeleteSkill(skill)}
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Section Portfolio - Expériences */}
            <div className="border-b border-gray-700 pb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">Expériences Professionnelles</h3>
                <button
                  type="button"
                  onClick={() => { setShowExperienceForm(true); setEditingExperience(null); }}
                  className="text-green-400 hover:text-green-300"
                  title="Ajouter une expérience"
                >
                  <Plus size={20} />
                </button>
              </div>
              {experiences.length === 0 ? (
                <p className="text-gray-400 text-sm">Aucune expérience ajoutée</p>
              ) : (
                <ul className="space-y-3">
                  {experiences
                    .sort((a, b) => new Date(b.date_debut) - new Date(a.date_debut))
                    .map((exp, idx) => (
                    <li key={idx} className="bg-gray-800 p-3 rounded border-l-2 border-green-400">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-green-300">{exp.entreprise}</span>
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                              {formatDuration(exp.date_debut, exp.date_fin)}
                            </span>
                          </div>
                          <div className="text-white/90 text-sm">{exp.poste}</div>
                          <div className="text-gray-400 text-xs">
                            {new Date(exp.date_debut).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })} - 
                            {exp.date_fin ? new Date(exp.date_fin).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : 'Présent'}
                          </div>
                          {exp.description && (
                            <div className="text-gray-300 text-xs mt-1 italic">{exp.description}</div>
                          )}
                        </div>
                        <div className="flex gap-1 ml-2">
                          <button
                            type="button"
                            className="text-green-400 hover:text-green-500"
                            onClick={() => { setShowExperienceForm(true); setEditingExperience(exp); }}
                            title="Modifier"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            className="text-red-400 hover:text-red-600"
                            onClick={() => handleDeleteExperience(exp)}
                            title="Supprimer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Section Contact */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white mb-4">Informations de contact</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {/* Téléphone */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Téléphone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    placeholder=""
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
                    className="w-full px-3 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
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
                    className="w-full px-3 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
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
                    className="w-full px-3 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    placeholder="https://monportfolio.com"
                  />
                </div>
              </div>
            </div>

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
                  Création du compte et du portfolio...
                </div>
              ) : (
                'Créer mon compte et mon portfolio'
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
        <div className="mt-8 pb-12 text-center">
          <p className="text-gray-500 text-sm">
            En créant un compte, vous acceptez nos conditions d'utilisation
          </p>
        </div>
      </div>

      {/* Modals */}
      {showProjectForm && (
        <ProjectFormModal
          onClose={() => { setShowProjectForm(false); setEditingProject(null); }}
          onSave={handleSaveProject}
          initialData={editingProject}
          techOptions={techOptions}
        />
      )}
      {showSkillForm && (
        <SkillFormModal
          onClose={() => { setShowSkillForm(false); setEditingSkill(null); }}
          onSave={handleSaveSkill}
          initialData={editingSkill}
          skillsReference={skillsReference}
        />
      )}
      {showExperienceForm && (
        <ExperienceFormModal
          onClose={() => { setShowExperienceForm(false); setEditingExperience(null); }}
          onSave={handleSaveExperience}
          initialData={editingExperience}
        />
      )}
    </div>
  );
};

export default RegisterPage;