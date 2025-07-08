import React from 'react';
import { MapPin, Phone, Mail, Github, Linkedin, Pencil } from 'lucide-react';

interface User {
  name?: string;
  email?: string;
  location?: string;
  phone?: string;
  github_url?: string;
  linkedin_url?: string;
}

interface ContactForm {
  name: string;
  email: string;
  message: string;
}

interface SubmitStatus {
  loading: boolean;
  message: string;
  type: string;
}

interface ContactSectionProps {
  user: User;
  contactForm: ContactForm;
  submitStatus: SubmitStatus;
  editingField: string | null;
  editValue: string;
  savingEdit: boolean;
  startEdit: (field: string, value: string) => void;
  saveEdit: () => void;
  cancelEdit: () => void;
  setEditValue: (value: string) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleContactSubmit: (e: React.FormEvent) => void;
}

const ContactSection: React.FC<ContactSectionProps> = ({
  user,
  contactForm,
  submitStatus,
  editingField,
  editValue,
  savingEdit,
  startEdit,
  saveEdit,
  cancelEdit,
  setEditValue,
  handleInputChange,
  handleContactSubmit
}) => {
  return (
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
              {/* Localisation */}
              <div className="flex items-center relative group">
                <MapPin className="w-5 h-5 text-blue-400 mr-3" />
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
                      onClick={() => startEdit("location", user.location || '')}
                      title="Modifier la localisation"
                      tabIndex={-1}
                    >
                      <Pencil className="w-4 h-4 text-blue-400 hover:text-blue-500" />
                    </button>
                  </>
                )}
              </div>

              {/* Téléphone */}
              <div className="flex items-center relative group">
                <Phone className="w-5 h-5 text-blue-400 mr-3" />
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
                      onClick={() => startEdit("phone", user.phone || '')}
                      title="Modifier le téléphone"
                      tabIndex={-1}
                    >
                      <Pencil className="w-4 h-4 text-blue-400 hover:text-blue-500" />
                    </button>
                  </>
                )}
              </div>

              {/* Email */}
              <div className="flex items-center relative group">
                <Mail className="w-5 h-5 text-blue-400 mr-3" />
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
                      onClick={() => startEdit("email", user.email || '')}
                      title="Modifier l'email"
                      tabIndex={-1}
                    >
                      <Pencil className="w-4 h-4 text-blue-400 hover:text-blue-500" />
                    </button>
                  </>
                )}
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
                  onClick={() => startEdit("github_url", user.github_url || '')}
                  title="Modifier Github"
                  tabIndex={-1}
                  style={{ zIndex: 10 }}
                >
                  <Pencil className="w-3 h-3 text-blue-400 hover:text-blue-500" />
                </button>
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
                  onClick={() => startEdit("linkedin_url", user.linkedin_url || '')}
                  title="Modifier Linkedin"
                  tabIndex={-1}
                  style={{ zIndex: 10 }}
                >
                  <Pencil className="w-3 h-3 text-blue-400 hover:text-blue-500" />
                </button>
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
  );
};

export default ContactSection;