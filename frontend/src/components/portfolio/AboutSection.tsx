import React from 'react';

interface User {
  name?: string;
  description?: string;
  avatar_url?: string;
}

interface Stats {
  projects: number;
  experience: number;
  clients: number;
  views: number;
}

interface AboutSectionProps {
  user: User;
  stats: Stats;
  editingField: string | null;
  editValue: string;
  savingEdit: boolean;
  startEdit: (field: string, value: string) => void;
  saveEdit: () => void;
  setEditValue: (value: string) => void;
  handleEditKeyDown: (e: React.KeyboardEvent) => void;
}

const AboutSection: React.FC<AboutSectionProps> = ({
  user,
  stats,
  editingField,
  editValue,
  savingEdit,
  startEdit,
  saveEdit,
  setEditValue,
  handleEditKeyDown
}) => {
  return (
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
                  onClick={() => startEdit("description", user.description || '')}
                >
                  {user.description}
                </span>
              )}
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
          <div className="relative">
            <div className="w-48 h-48 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-6xl font-bold shadow-xl border-8 border-[#22234a] overflow-hidden mb-8">
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                  onError={e => { 
                    const target = e.target as HTMLImageElement;
                    target.src = "https://ui-avatars.com/api/?name=?";
                  }}
                />
              ) : (
                <div className="w-full h-96 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center">
                  <div className="text-8xl opacity-20">👨‍💻</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;