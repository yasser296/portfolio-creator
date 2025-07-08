import React from 'react';
import { Github, ExternalLink } from 'lucide-react';
import CreatableSelect from 'react-select/creatable';
import ConfirmDeleteModal from './ConfirmDeleteModal';

interface Project {
  id: number;
  title: string;
  description: string;
  technologies: string[];
  image_url?: string;
  github_url?: string;
  demo_url?: string;
  featured?: boolean;
  view_count?: number;
}

interface ProjectForm {
  title: string;
  description: string;
  technologies: string;
  image_url: string;
  github_url: string;
  demo_url: string;
  id?: number | null;
}

interface ProjectsSectionProps {
  projects: Project[];
  showProjectForm: boolean;
  setShowProjectForm: (show: boolean) => void;
  projectForm: ProjectForm;
  setProjectForm: (form: ProjectForm | ((prev: ProjectForm) => ProjectForm)) => void;
  formError: string;
  setFormError: (error: string) => void;
  selectedProjectId: number | null;
  setSelectedProjectId: (id: number | null) => void;
  modalOpen: boolean;
  modalType: string;
  modalTargetId: number | null;
  techOptions: any[];
  clearSelections: () => void;
  openDeleteModal: (type: string, id: number) => void;
  closeDeleteModal: () => void;
  confirmDelete: () => void;
  handleProjectSubmit: (e: React.FormEvent) => void;
}

const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  projects,
  showProjectForm,
  setShowProjectForm,
  projectForm,
  setProjectForm,
  formError,
  setFormError,
  selectedProjectId,
  setSelectedProjectId,
  modalOpen,
  modalType,
  modalTargetId,
  techOptions,
  clearSelections,
  openDeleteModal,
  closeDeleteModal,
  confirmDelete,
  handleProjectSubmit
}) => {
  return (
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
                title: proj.title,
                description: proj.description,
                technologies: Array.isArray(proj.technologies) ? proj.technologies.join(", ") : "",
                image_url: proj.image_url || "",
                github_url: proj.github_url || "",
                demo_url: proj.demo_url || "",
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

      {showProjectForm && (
        <form
          className="bg-gray-900 p-6 rounded-xl mb-6 shadow-lg max-w-xl mx-auto flex flex-col gap-3"
          onSubmit={handleProjectSubmit}
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
          <label className="font-semibold text-blue-300 mb-2">Technologies utilisées</label>
          <CreatableSelect
            isMulti
            options={techOptions}
            value={projectForm.technologies
              ? projectForm.technologies.split(",").map(s => ({
                  value: s.trim(),
                  label: s.trim()
                }))
              : []
            }
            onChange={selected => setProjectForm(f => ({
              ...f,
              technologies: selected ? selected.map(o => o.value).join(", ") : ""
            }))}
            placeholder="Choisissez ou tapez les technologies utilisées"
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
              {projectForm.id ? "Modifier" : "Ajouter"}
            </button>
            <button
              type="button"
              className="bg-gray-700 hover:bg-gray-800 px-4 py-2 rounded text-white"
              onClick={() => { 
                setShowProjectForm(false); 
                setProjectForm({ title: "", description: "", technologies: "", image_url: "", github_url: "", demo_url: "", id: null }); 
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
              <div
                key={project.id}
                onClick={e => { e.stopPropagation(); setSelectedProjectId(project.id); }}
                tabIndex={0}
                className={`bg-gray-800 rounded-xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300 border-2 cursor-pointer relative
                  ${selectedProjectId === project.id ? "border-yellow-400" : "border-transparent"}`}
              >
                <button
                  type="button"
                  className="absolute top-2 right-2 bg-blue-700 hover:bg-blue-800 text-white w-6 h-6 rounded-full flex items-center justify-center z-20 shadow"
                  title="Supprimer ce projet"
                  onClick={e => { e.stopPropagation(); openDeleteModal("project", project.id); }}
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
                  onError={e => { 
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=250&fit=crop'; 
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
                    {project.view_count && project.view_count > 0 && (
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

      <ConfirmDeleteModal
        isOpen={modalOpen}
        type={modalType}
        onConfirm={confirmDelete}
        onCancel={closeDeleteModal}
      />
    </section>
  );
};

export default ProjectsSection;