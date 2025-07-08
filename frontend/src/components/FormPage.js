import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import CreatableSelect from 'react-select/creatable';

const initialForm = {
  name: '',
  email: '',
  title: '',
  description: '',
  experience_years: 1,
  location: '',
  phone: '',
  github_url: '',
  linkedin_url: '',
  personal_website: '',
  avatar_url: '',
  hero_background: '',
  theme_color: '#4638f4',
  is_active: true
};

const FormPage = () => {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  const [skillsReference, setSkillsReference] = useState([]);
  
  const [showExperienceForm, setShowExperienceForm] = useState(false);
  const [editingExperience, setEditingExperience] = useState(null);
  const [experiences, setExperiences] = useState([]); // Local pour les expériences

  // const skillOptions = Object.entries(
  // skillsReference.reduce((acc, s) => {
  //   acc[s.category] = acc[s.category] || [];
  //   acc[s.category].push({ value: s.skill_name, label: s.skill_name });
  //   return acc;
  //   }, {})
  // ).map(([category, options]) => ({
  //   label: category,
  //   options
  // }));

  // Version plate pour les technologies, si tu veux toutes catégories confondues :
  const techOptions = skillsReference.map(s => ({
    value: s.skill_name,
    label: s.skill_name
  }));

  


  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch((e) => setError('Erreur de chargement'));
  }, []);

  // Gère la suppression d'une expérience
  const handleDeleteExperience = (experience) => {
    if(window.confirm("Supprimer cette expérience ?")) {
      setExperiences(experiences.filter(e => e !== experience));
    }
  };

  // Ajout ou modification d'expérience
  const handleSaveExperience = (data) => {
    if(editingExperience) {
      setExperiences(experiences.map(e => (e === editingExperience ? data : e)));
    } else {
      setExperiences([data, ...experiences]);
    }
    setEditingExperience(null);
  };

  // Fonctions utilitaires pour l'affichage
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

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      // Créer l'utilisateur d'abord
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok || !data.user) throw new Error(data.message || 'Erreur');
      
      const userId = data.user.id;
      
      // Ensuite créer les projets, compétences ET expériences
      await Promise.all([
        // Créer les projets
        ...projects.map(project => 
          fetch('/api/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...project, user_id: userId })
          })
        ),
        // Créer les compétences
        ...skills.map(skill => 
          fetch('/api/skills', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...skill, user_id: userId })
          })
        ),
        // NOUVEAU : Créer les expériences
        ...experiences.map(experience => 
          fetch('/api/experiences', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...experience, user_id: userId })
          })
        )
      ]);
      
      setUsers([data.user, ...users]);
      setForm(initialForm);
      setProjects([]); // Reset projets
      setSkills([]);   // Reset compétences
      setExperiences([]); // Reset expériences
      setShowForm(false);
      navigate(`/portfolio/${data.user.id}`);
    } catch (err) {
      setError(err.message || 'Erreur lors de la création du portfolio');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePortfolio = async (userId) => {
  if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce portfolio ?")) return;
  try {
    const resp = await fetch(`/api/users/${userId}`, { method: "DELETE" });
    if (!resp.ok) throw new Error("Suppression échouée");
    setUsers(users => users.filter(u => u.id !== userId));
  } catch (err) {
    alert("Erreur lors de la suppression : " + err.message);
  }
};


    // Juste après tes hooks existants, AVANT le return
    const [showProjectForm, setShowProjectForm] = useState(false);
    const [showSkillForm, setShowSkillForm] = useState(false);
    const [editingProject, setEditingProject] = useState(null); // Projet sélectionné pour édition
    const [editingSkill, setEditingSkill] = useState(null);     // Skill sélectionné pour édition
    const [projects, setProjects] = useState([]); // Local pour les projets
    const [skills, setSkills] = useState([]);     // Local pour les skills

    const [toDelete, setToDelete] = useState(null);


    // Gère la suppression d'un projet
    const handleDeleteProject = (proj) => {
      if(window.confirm("Supprimer ce projet ?")) {
        setProjects(projects.filter(p => p !== proj));
      }
    };

    // Gère la suppression d'une compétence
    const handleDeleteSkill = (skill) => {
      if(window.confirm("Supprimer cette compétence ?")) {
        setSkills(skills.filter(s => s !== skill));
      }
    };

    // Ajout ou modification de projet
    const handleSaveProject = (data) => {
      if(editingProject) {
        setProjects(projects.map(p => (p === editingProject ? data : p)));
      } else {
        setProjects([data, ...projects]);
      }
      setEditingProject(null);
    };

    // Ajout ou modification de compétence
    const handleSaveSkill = (data) => {
      if(editingSkill) {
        setSkills(skills.map(s => (s === editingSkill ? data : s)));
      } else {
        setSkills([data, ...skills]);
      }
      setEditingSkill(null);
    };

    // Récupère les compétences au chargement
    useEffect(() => {
      fetch('/api/skills_reference')
        .then(res => res.json())
        .then(data => {
          setSkillsReference(data);
        })
        .catch(() => setSkillsReference([]));
    }, [])


  return (
    <div className="min-h-screen bg-gradient-to-br from-[#16172a] to-[#312342ef] text-slate-100 flex flex-col items-center py-12 input-bg-gray-800">
      <div className="w-full max-w-xl bg-[#181e33]/90 rounded-xl shadow-lg p-8">
        <h1 className="text-4xl font-extrabold text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-10">
          Portfolio Creator
        </h1>

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="block w-full mb-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 rounded-xl shadow-lg transition"
          >
            Créer un portfolio
          </button>
        )}

        {showForm && (
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-700/20 border border-red-400/40 text-red-300 rounded p-3 mb-3">{error}</div>
            )}
            {saving && (
              <div className="text-blue-400 mb-3">Enregistrement en cours...</div>
            )}
            <div>
              <label className="block text-sm font-semibold mb-1">Nom complet *</label>
              <input
                className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-blue-400"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Email *</label>
              <input
                className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-blue-400"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Titre</label>
              <input
                className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-blue-400"
                name="title"
                value={form.title}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Description</label>
              <textarea
                className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-blue-400"
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
              />
            </div>
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block text-sm font-semibold mb-1">Téléphone</label>
                <input
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-blue-400"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>
              <div className="w-1/2">
                <label className="block text-sm font-semibold mb-1">Lieu</label>
                <input
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-blue-400"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block text-sm font-semibold mb-1">GitHub</label>
                <input
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-blue-400"
                  name="github_url"
                  value={form.github_url}
                  onChange={handleChange}
                />
              </div>
              <div className="w-1/2">
                <label className="block text-sm font-semibold mb-1">LinkedIn</label>
                <input
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-blue-400"
                  name="linkedin_url"
                  value={form.linkedin_url}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Avatar (URL image)</label>
              <input
                className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-blue-400"
                name="avatar_url"
                value={form.avatar_url}
                onChange={handleChange}
              />
            </div>

            {/* Projets */}
            <div>
              <div className="flex items-center mb-2">
                <label className="block font-semibold text-blue-300 text-lg">
                  Projets
                </label>
                <button
                  type="button"
                  onClick={() => { setShowProjectForm(true); setEditingProject(null); }}
                  className="ml-2 text-blue-500 hover:text-blue-700"
                  title="Ajouter un projet"
                >
                  <Plus size={20} />
                </button>
              </div>
              <ul className="ml-4 space-y-1">
                {projects.length === 0 && <li className="text-gray-400 text-sm">Aucun projet.</li>}
                {projects.map((proj, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-white/90">
                    <span className="font-medium">{proj.title}</span>
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
            </div>

            {/* Compétences */}
            <div>
              <div className="flex items-center mb-2">
                <label className="block font-semibold text-purple-300 text-lg">
                  Compétences
                </label>
                <button
                  type="button"
                  onClick={() => { setShowSkillForm(true); setEditingSkill(null); }}
                  className="ml-2 text-purple-400 hover:text-purple-600"
                  title="Ajouter une compétence"
                >
                  <Plus size={20} />
                </button>
              </div>
              <ul className="ml-4 space-y-1">
                {skills.length === 0 && <li className="text-gray-400 text-sm">Aucune compétence.</li>}
                {skills.map((skill, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-white/90">
                    <span className="font-medium">{skill.category} : {Array.isArray(skill.items) ? skill.items.join(', ') : skill.items}</span>
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
            </div>
            
            {/* Expériences Professionnelles */}
            <div>
              <div className="flex items-center mb-2">
                <label className="block font-semibold text-green-300 text-lg">
                  Expériences Professionnelles
                </label>
                <button
                  type="button"
                  onClick={() => { setShowExperienceForm(true); setEditingExperience(null); }}
                  className="ml-2 text-green-400 hover:text-green-600"
                  title="Ajouter une expérience"
                >
                  <Plus size={20} />
                </button>
              </div>
              <ul className="ml-4 space-y-2">
                {experiences.length === 0 && <li className="text-gray-400 text-sm">Aucune expérience.</li>}
                {experiences
                  .sort((a, b) => new Date(b.date_debut) - new Date(a.date_debut))
                  .map((exp, idx) => (
                  <li key={idx} className="bg-gray-800/50 p-3 rounded border-l-2 border-green-400">
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
            </div>
            
            <div className="flex gap-4 mt-2">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 rounded-xl shadow-lg transition"
                disabled={saving}
              >
                Valider
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="w-full bg-gray-700 hover:bg-gray-900 text-white font-semibold py-3 rounded-xl shadow transition"
                disabled={saving}
              >
                Annuler
              </button>
            </div>
          </form>
          
        )}

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

      {/* ---- LISTE DES PORTFOLIOS EXISTANTS ---- */}
      <div className="w-full max-w-3xl mt-12">
        <h2 className="text-2xl font-semibold mb-6 text-blue-300">Portfolios existants</h2>
        <div className="grid md:grid-cols-2 gap-6">
          
          {users.map(user => (
            <div
              key={user.id}
              className="relative bg-[#20263c] rounded-xl shadow-lg p-6 flex items-center space-x-6 hover:shadow-xl transition"
            >
              {/* Bouton X de suppression */}
            <button
              onClick={() => setToDelete(user.id)}
              className="absolute top-3 right-3 hover:bg-purple-700 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-md transition text-lg"
              title="Supprimer ce portfolio"
            >
              &times;
            </button>

              <img
                src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`}
                alt={user.name}
                className="w-16 h-16 rounded-full border"
              />
              <div className="flex-1">
                <div className="font-bold text-xl text-slate-100">{user.name}</div>
                <div className="text-blue-400">{user.title}</div>
                <div className="text-xs text-gray-400">{user.email}</div>
                <div className="mt-2">
                  <Link
                    to={`/portfolio/${user.id}`}
                    className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs px-4 py-2 rounded-lg font-semibold shadow hover:scale-105 transition"
                  >
                    Voir le Portfolio
                  </Link>                
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* ---- FIN LISTE ---- */}

      {toDelete && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
          <div className="bg-[#23263a] rounded-lg shadow-lg p-8 max-w-sm w-full text-center">
            <div className="text-xl font-bold text-red-400 mb-4">Confirmer la suppression</div>
            <div className="text-gray-300 mb-6">Voulez-vous vraiment supprimer ce portfolio&nbsp;?</div>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  handleDeletePortfolio(toDelete);
                  setToDelete(null);
                }}
                className="bg-red-600 hover:bg-red-700 px-5 py-2 rounded text-white font-semibold"
              >
                Supprimer
              </button>
              <button
                onClick={() => setToDelete(null)}
                className="bg-gray-600 hover:bg-gray-800 px-5 py-2 rounded text-white font-semibold"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      
    </div>
    

    
    
  );
};

function ProjectFormModal({ onClose, onSave, initialData, techOptions }) {
  const [form, setForm] = useState(
    initialData || { title: '', description: '', technologies: '', github_url: '', demo_url: ''  }
  );

  useEffect(() => {
    if (initialData) setForm(initialData);
  }, [initialData]);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
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
              backgroundColor: '#38bdf8',
              color: 'white'
            }),
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
        {/* Select catégorie */}
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

        {/* Compétences */}
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

        <input
          className="px-3 py-2 rounded bg-gray-800 text-white mb-2"
          placeholder="Nom de l’icône (facultatif, ex: Code, Server, Palette)"
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

function ExperienceFormModal({ onClose, onSave, initialData  }) {
  const [form, setForm] = useState(
    initialData || { 
      entreprise: '', 
      poste: '', 
      date_debut: '',  // ✅ Utiliser date_debut
      date_fin: '',    // ✅ Utiliser date_fin
      description: '' 
    }
  );

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    // "2025-03-01" → "2025-03"
    return dateString.substring(0, 7);
  };

  useEffect(() => {
    if (initialData) {
      // ✅ CORRIGER pour s'assurer que les valeurs sont définies
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
            <label className="block text-sm font-medium text-green-300 mb-1">
              Entreprise *
            </label>
            <input
              className="w-full px-3 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:border-green-400"
              placeholder="Nom de l'entreprise"
              value={form.entreprise}
              onChange={e => setForm(f => ({ ...f, entreprise: e.target.value }))}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-green-300 mb-1">
              Poste *
            </label>
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
            <label className="block text-sm font-medium text-green-300 mb-1">
              Date de début *
            </label>
            <input
              type="month"
              className="w-full px-3 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:border-green-400"
              value={form.date_debut}
              onChange={e => setForm(f => ({ ...f, date_debut: e.target.value }))}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-green-300 mb-1">
              Date de fin
            </label>
            <input
              type="month"
              className="w-full px-3 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:border-green-400"
              value={form.date_fin}
              onChange={e => setForm(f => ({ ...f, date_fin: e.target.value }))}
            />
            <p className="text-xs text-gray-500 mt-1">Laissez vide si c'est votre poste actuel</p>
          </div>
        </div>

        {/* Aperçu de la durée */}
        {form.date_debut && (
          <div className="text-center">
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              Durée : {formatDurationPreview(form.date_debut, form.date_fin)}
            </span>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-green-300 mb-1">
            Description
          </label>
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



export default FormPage;



