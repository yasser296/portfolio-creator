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

    {/* Cas : AVATAR rempli */}
    {preview && type === "avatar" ? (
      <div className="relative group w-32 h-32 mx-auto">
        <img
          src={preview}
          alt="Preview"
          className="w-32 h-32 object-cover rounded-full border-4 border-blue-800 shadow-lg transition-all duration-300 group-hover:brightness-90"
        />
        {!uploading && (
          <button
            onClick={removeImage}
            className="absolute top-1 right-1 p-2 bg-red-600 hover:bg-red-700 rounded-full text-white shadow transition opacity-0 group-hover:opacity-100"
            title="Supprimer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
            <div className="text-white">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm">Upload en cours...</p>
            </div>
          </div>
        )}
      </div>
    ) : null}

    {/* Cas : AVATAR vide */}
    {!preview && type === "avatar" && (
      <div
        {...getRootProps()}
        className={`
          w-32 h-32 mx-auto flex flex-col items-center justify-center
          rounded-full border-4 border-dashed
          bg-gradient-to-br from-blue-900/70 to-purple-800/70
          border-gray-700 text-white shadow-lg cursor-pointer
          hover:border-blue-400 hover:shadow-2xl transition-all duration-300
          relative
          ${uploading ? "opacity-60 cursor-not-allowed" : ""}
        `}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <>
            <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
            <p className="text-gray-300">Upload en cours...</p>
          </>
        ) : (
          <>
            <Upload className="w-9 h-9 mb-2 text-blue-300 opacity-80" />
            <p className="text-gray-100 font-semibold text-sm">Photo de profil</p>
            {/* <span className="text-gray-400 text-xs mt-">
              JPG, PNG, GIF (max 5MB)
            </span> */}
          </>
        )}
        {/* Facultatif : Initiales (si pas d'image ET pas d’upload) */}
        {/* {!uploading && !preview && userName && (
          <span className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-blue-100/70 pointer-events-none select-none">
            {userName.split(" ").map(n => n[0]).join("")}
          </span>
        )} */}
      </div>
    )}

    {/* Cas : image projet (bloc rempli ou vide) */}
    {type !== "avatar" && (
      preview ? (
        <div className="relative group w-full aspect-video mx-auto rounded-xl overflow-hidden shadow-lg">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover rounded-xl transition-all duration-300 group-hover:brightness-90"
          />
          {!uploading && (
            <button
              onClick={removeImage}
              className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 rounded-full text-white shadow transition opacity-0 group-hover:opacity-100"
              title="Supprimer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
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
          className={`
            w-full aspect-video flex flex-col items-center justify-center
            rounded-xl border-2 border-dashed border-gray-700
            bg-gradient-to-br from-gray-800/50 to-blue-900/40
            text-white shadow cursor-pointer
            hover:border-blue-400 hover:shadow-xl transition-all duration-300
            ${uploading ? "opacity-60 cursor-not-allowed" : ""}
          `}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <>
              <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
              <p className="text-gray-300">Upload en cours...</p>
            </>
          ) : (
            <>
              <Upload className="w-10 h-10 mb-2 text-blue-300 opacity-80" />
              <p className="text-gray-100 font-semibold text-sm">
                Glissez une image ou cliquez ici
              </p>
              <span className="text-gray-400 text-xs mt-1">
                JPG, PNG, GIF, WEBP (max 10MB)
              </span>
            </>
          )}
        </div>
      )
    )}
  </div>

  );
};

export default ImageUpload;