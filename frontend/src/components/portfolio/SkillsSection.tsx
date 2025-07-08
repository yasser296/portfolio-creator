import React from 'react';
import { Code, Server, Smartphone, Palette } from 'lucide-react';
import CreatableSelect from 'react-select/creatable';
import ConfirmDeleteModal from './ConfirmDeleteModal';

interface Skill {
  id: number;
  category: string;
  items: string[];
  icon_name?: string;
}

interface SkillForm {
  category: string;
  items: string;
  icon_name: string;
  id?: number | null;
}

interface SkillsSectionProps {
  skills: Skill[];
  showSkillForm: boolean;
  setShowSkillForm: (show: boolean) => void;
  skillForm: SkillForm;
  setSkillForm: (form: SkillForm | ((prev: SkillForm) => SkillForm)) => void;
  formError: string;
  setFormError: (error: string) => void;
  selectedSkillId: number | null;
  setSelectedSkillId: (id: number | null) => void;
  modalOpen: boolean;
  modalType: string;
  modalTargetId: number | null;
  skillOptions: any[];
  clearSelections: () => void;
  openDeleteModal: (type: string, id: number) => void;
  closeDeleteModal: () => void;
  confirmDelete: () => void;
  handleSkillSubmit: (e: React.FormEvent) => void;
}

const SkillsSection: React.FC<SkillsSectionProps> = ({
  skills,
  showSkillForm,
  setShowSkillForm,
  skillForm,
  setSkillForm,
  formError,
  setFormError,
  selectedSkillId,
  setSelectedSkillId,
  modalOpen,
  modalType,
  modalTargetId,
  skillOptions,
  clearSelections,
  openDeleteModal,
  closeDeleteModal,
  confirmDelete,
  handleSkillSubmit
}) => {
  const getIconComponent = (iconName?: string) => {
    const icons = {
      'Code': Code,
      'Server': Server,
      'Smartphone': Smartphone,
      'Palette': Palette
    };
    return icons[iconName as keyof typeof icons] || Code;
  };

  return (
    <section id="skills" className="py-20 px-4 bg-gray-800/50" onClick={clearSelections}>
      <div className="flex gap-4 justify-end mb-6">
        <button
          onClick={e => { 
            e.stopPropagation(); 
            setShowSkillForm(true); 
            setSkillForm({ category: "", items: "", icon_name: "", id: null }); 
            setFormError(""); 
          }}
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
                category: skill.category,
                items: Array.isArray(skill.items) ? skill.items.join(", ") : "",
                icon_name: skill.icon_name || "",
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
          onSubmit={handleSkillSubmit}
        >
          <h3 className="font-bold text-lg mb-2 text-purple-300">
            {skillForm.id ? "Modifier la compétence" : "Nouvelle compétence"}
          </h3>
          {formError && <div className="text-red-400 mb-2">{formError}</div>}
          <label className="font-semibold text-purple-300 mb-2">Compétences</label>
          <CreatableSelect
            isMulti
            options={skillOptions}
            value={skillForm.items
              ? skillForm.items.split(",").map(s => ({
                  value: s.trim(),
                  label: s.trim()
                }))
              : []
            }
            onChange={selected => setSkillForm(f => ({
              ...f,
              items: selected ? selected.map(o => o.value).join(", ") : ""
            }))}
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
            type="text"
            className="px-3 py-2 rounded bg-gray-800 text-white mb-2"
            placeholder="Nom de l'icône (optionnel, ex: Code, Server, Palette...)"
            value={skillForm.icon_name}
            onChange={e => setSkillForm(f => ({ ...f, icon_name: e.target.value }))}
          />
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
              onClick={() => { 
                setShowSkillForm(false); 
                setSkillForm({ category: "", items: "", icon_name: "", id: null }); 
              }}
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
            skills.map(skill => {
              const IconComponent = getIconComponent(skill.icon_name);
              const items = Array.isArray(skill.items) ? skill.items : [];
              return (
                <div
                  key={skill.id}
                  onClick={e => { e.stopPropagation(); setSelectedSkillId(skill.id); }}
                  tabIndex={0}
                  className={`relative bg-gray-800 rounded-xl p-6 hover:bg-gray-700 transition-colors border-2 cursor-pointer group
                    ${selectedSkillId === skill.id ? "border-yellow-400" : "border-transparent"}`}
                >
                  <button
                    type="button"
                    className="absolute top-2 right-2 bg-purple-700 hover:bg-purple-800 text-white w-6 h-6 rounded-full flex items-center justify-center z-20 shadow opacity-0 group-hover:opacity-100 transition"
                    title="Supprimer cette compétence"
                    onClick={e => { e.stopPropagation(); openDeleteModal("skill", skill.id); }}
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
            })
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-400 text-lg">Aucune compétence à afficher.</p>
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

export default SkillsSection;