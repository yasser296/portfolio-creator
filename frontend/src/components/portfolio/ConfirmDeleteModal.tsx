import React from 'react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  type: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  type,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[9999]">
      <div className="bg-gray-900 p-8 rounded-2xl shadow-2xl w-full max-w-xs text-center">
        <h2 className="text-xl font-bold text-red-400 mb-3">Confirmer la suppression</h2>
        <p className="text-gray-300 mb-6">
          {type === "project"
            ? "Voulez-vous vraiment supprimer ce projet ? Cette action est irréversible."
            : "Voulez-vous vraiment supprimer cette compétence ? Cette action est irréversible."}
        </p>
        <div className="flex gap-4 justify-center">
          <button
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white font-semibold"
            onClick={onConfirm}
          >
            Supprimer
          </button>
          <button
            className="bg-gray-700 hover:bg-gray-800 px-4 py-2 rounded text-white"
            onClick={onCancel}
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;