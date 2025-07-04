import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

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
  custom_slug: '',
  is_active: true
};

const FormPage = () => {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
  fetch('/api/users')
    .then(res => res.json())
    .then(data => {
      console.log("Réponse /api/users :", data); // <-- Cette ligne doit VRAIMENT s'afficher dans la console navigateur
      setUsers(data);
    })
    .catch((e) => {
      setError('Erreur de chargement');
      console.log("Erreur fetch /api/users", e); // <-- Et celle-ci si erreur
    });
}, []);

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
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok || !data.user) throw new Error(data.message || 'Erreur');
      setUsers([data.user, ...users]);
      setForm(initialForm);
      navigate(`/portfolio/${data.user.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#161a2a] to-[#2e2342] text-slate-100 flex flex-col items-center py-12">
      <div className="w-full max-w-2xl bg-[#181e33]/90 rounded-xl shadow-lg p-8">
        <h1 className="text-3xl md:text-4xl font-bold text-blue-400 mb-8 text-center tracking-tight">
          Créer un nouveau portfolio
        </h1>

        {error && <div className="mb-4 text-red-400">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block font-medium mb-1">Nom complet *</label>
            <input name="name" value={form.name} onChange={handleChange} required
              className="w-full p-2 rounded bg-[#232a47] text-slate-100 border border-blue-900 focus:outline-none" />
          </div>
          <div>
            <label className="block font-medium mb-1">Email *</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required
              className="w-full p-2 rounded bg-[#232a47] text-slate-100 border border-blue-900" />
          </div>
          <div>
            <label className="block font-medium mb-1">Titre / Poste *</label>
            <input name="title" value={form.title} onChange={handleChange} required
              className="w-full p-2 rounded bg-[#232a47] text-slate-100 border border-blue-900" />
          </div>
          <div>
            <label className="block font-medium mb-1">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange}
              className="w-full p-2 rounded bg-[#232a47] text-slate-100 border border-blue-900" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">Années d'expérience</label>
              <input type="number" name="experience_years" min={0} max={50} value={form.experience_years} onChange={handleChange}
                className="w-full p-2 rounded bg-[#232a47] text-slate-100 border border-blue-900" />
            </div>
            <div>
              <label className="block font-medium mb-1">Localisation</label>
              <input name="location" value={form.location} onChange={handleChange}
                className="w-full p-2 rounded bg-[#232a47] text-slate-100 border border-blue-900" />
            </div>
          </div>
          <div>
            <label className="block font-medium mb-1">Téléphone</label>
            <input name="phone" value={form.phone} onChange={handleChange}
              className="w-full p-2 rounded bg-[#232a47] text-slate-100 border border-blue-900" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">GitHub URL</label>
              <input type="url" name="github_url" value={form.github_url} onChange={handleChange}
                className="w-full p-2 rounded bg-[#232a47] text-slate-100 border border-blue-900" />
            </div>
            <div>
              <label className="block font-medium mb-1">LinkedIn URL</label>
              <input type="url" name="linkedin_url" value={form.linkedin_url} onChange={handleChange}
                className="w-full p-2 rounded bg-[#232a47] text-slate-100 border border-blue-900" />
            </div>
          </div>
          {/* <div>
            <label className="block font-medium mb-1">Site Personnel</label>
            <input type="url" name="personal_website" value={form.personal_website} onChange={handleChange}
              className="w-full p-2 rounded bg-[#232a47] text-slate-100 border border-blue-900" />
          </div> */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">Avatar (URL image)</label>
              <input type="url" name="avatar_url" value={form.avatar_url} onChange={handleChange}
                className="w-full p-2 rounded bg-[#232a47] text-slate-100 border border-blue-900" />
            </div>
            {/* <div>
              <label className="block font-medium mb-1">Image d’en-tête (URL)</label>
              <input type="url" name="hero_background" value={form.hero_background} onChange={handleChange}
                className="w-full p-2 rounded bg-[#232a47] text-slate-100 border border-blue-900" />
            </div> */}
          </div>
          
          {/*<div>
            <label className="block font-medium mb-1">Couleur principale</label>
            <input type="color" name="theme_color" value={form.theme_color} onChange={handleChange}
              className="w-24 h-12 p-0 border-none rounded" />
          </div>*/}
          
          {/* <div>
            <label className="block font-medium mb-1">Identifiant personnalisé (slug)</label>
            <input name="custom_slug" value={form.custom_slug} onChange={handleChange}
              className="w-full p-2 rounded bg-[#232a47] text-slate-100 border border-blue-900" />
          </div> */}
          {/* <div className="flex items-center space-x-2">
            <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} />
            <label>Rendre ce portfolio public</label>
          </div> */}
          <button type="submit" disabled={saving}
            className="w-full py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-white text-lg font-bold mt-2 hover:opacity-90 transition disabled:opacity-40">
            {saving ? "Création..." : "Créer le portfolio"}
          </button>
        </form>
      </div>

      <div className="w-full max-w-3xl mt-12">
  <h2 className="text-2xl font-semibold mb-6 text-blue-300">Portfolios existants</h2>
  <div className="grid md:grid-cols-2 gap-6">
    {users.map(user => (
      <div
        key={user.id}
        className="bg-[#20263c] rounded-xl shadow-lg p-6 flex items-center space-x-6 hover:shadow-xl transition"
      >
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

    </div>
  );
};

export default FormPage;


