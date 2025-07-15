// frontend/src/components/ImageUpload.js
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { authFetch } from '../utils/auth';
import config from '../config';

const ImageUpload = ({ 
  onImageUploaded, 
  currentImage = null, 
  type = 'avatar', // 'avatar' ou 'project'
  className = '',
  onUploadStart,
  onUploadError
}) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage);
  const [error, setError] = useState('');

  // Mettre à jour la preview quand currentImage change
  React.useEffect(() => {
    setPreview(currentImage);
  }, [currentImage]);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Vérifier la taille
    const maxSize = type === 'avatar' ? 5 : 10; // MB
    if (file.size > maxSize * 1024 * 1024) {
      setError(`L'image ne doit pas dépasser ${maxSize}MB`);
      return;
    }

    // Prévisualisation
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);

    // Upload
    setUploading(true);
    setError('');
    
    // Notifier le début de l'upload
    if (onUploadStart) {
      onUploadStart();
    }

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await authFetch(`${config.API_URL}/api/upload/${type}`, {
        method: 'POST',
        body: formData,
        headers: {
          // Ne pas mettre Content-Type, fetch le fait automatiquement pour FormData
        }
      });

      const data = await response.json();

      if (response.ok) {
        setPreview(data.imageUrl);
        if (onImageUploaded) {
          onImageUploaded(data.imageUrl);
        }
      } else {
        setError(data.message || 'Erreur lors de l\'upload');
        setPreview(currentImage);
        if (onUploadError) {
          onUploadError(data.message || 'Erreur lors de l\'upload');
        }
      }
    } catch (err) {
      console.error('Erreur upload:', err);
      setError('Erreur de connexion au serveur');
      setPreview(currentImage);
      if (onUploadError) {
        onUploadError('Erreur de connexion au serveur');
      }
    } finally {
      setUploading(false);
    }
  }, [type, currentImage, onImageUploaded, onUploadStart, onUploadError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: false,
    disabled: uploading
  });

  const removeImage = () => {
    setPreview(null);
    if (onImageUploaded) {
      onImageUploaded(null);
    }
  };

  return (
    <div className={className}>
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg">
          {error}
        </div>
      )}

      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className={`w-full rounded-lg ${
              type === 'avatar' ? 'aspect-square object-cover' : 'aspect-video object-cover'
            }`}
          />
          {!uploading && (
            <button
              onClick={removeImage}
              className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 rounded-full text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
              <div className="text-white">
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-sm">Upload en cours...</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition
            ${isDragActive 
              ? 'border-blue-500 bg-blue-500/10' 
              : 'border-gray-600 hover:border-gray-500 bg-gray-800/50'
            }
            ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} />
          
          <div className="flex flex-col items-center">
            {uploading ? (
              <>
                <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-400">Upload en cours...</p>
              </>
            ) : (
              <>
                <Upload className="w-12 h-12 text-gray-400 mb-4" />
                {isDragActive ? (
                  <p className="text-blue-400">Déposez l'image ici...</p>
                ) : (
                  <>
                    <p className="text-gray-300 mb-2">
                      Glissez une image ici ou cliquez pour sélectionner
                    </p>
                    <p className="text-gray-500 text-sm">
                      {type === 'avatar' ? 'JPG, PNG, GIF (max 5MB)' : 'JPG, PNG, GIF, WEBP (max 10MB)'}
                    </p>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;