import React from 'react';
import { ChevronDown, Github, Linkedin, Mail } from 'lucide-react';

interface User {
  name?: string;
  title?: string;
  email?: string;
  github_url?: string;
  linkedin_url?: string;
}

interface HeroSectionProps {
  user: User;
  editingField: string | null;
  editValue: string;
  savingEdit: boolean;
  startEdit: (field: string, value: string) => void;
  saveEdit: () => void;
  setEditValue: (value: string) => void;
  handleEditKeyDown: (e: React.KeyboardEvent) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  user,
  editingField,
  editValue,
  savingEdit,
  startEdit,
  saveEdit,
  setEditValue,
  handleEditKeyDown
}) => {
  return (
    <section
      id="hero"
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden pt-24 pb-12"
    >
      {/* Avatar compact */}
      <div className="mb-6 z-10">
        <div className="w-28 h-28 mx-auto bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-3xl font-bold shadow-md border-2 border-[#22234a]">
          {user?.name ? user.name.split(" ").map((n) => n[0]).join("") : "JD"}
        </div>
      </div>

      {/* Nom */}
      <div className="font-bold text-4xl md:text-5xl mb-2">
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
            onClick={() => startEdit("name", user.name || '')}
          >
            {user.name}
          </span>
        )}
      </div>

      {/* Titre */}
      <div className="text-blue-400 mb-2">
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
            onClick={() => startEdit("title", user.title || '')}
          >
            {user.title}
          </span>
        )}
      </div>

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
  );
};

export default HeroSection;