import React from 'react';

interface SaveStatusIndicatorProps {
  saveStatus: string | null;
}

const SaveStatusIndicator: React.FC<SaveStatusIndicatorProps> = ({ saveStatus }) => {
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

export default SaveStatusIndicator;