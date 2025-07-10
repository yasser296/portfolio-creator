// PortfolioPage.js - MODIFICATIONS À APPORTER

// PortfolioPage.js - MODIFICATIONS POUR CORRIGER LE CACHE

import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Portfolio from './Portfolio';
import NotFound from './NotFound';
import { authFetch, isPortfolioOwner, getCurrentUser } from '../utils/auth';

// 🚀 CACHE SIMPLE - AJOUT
const portfolioCache = new Map();

// 🚀 EXPOSER LE CACHE À L'OBJET WINDOW POUR PERMETTRE L'INVALIDATION
window.portfolioCache = portfolioCache;

const PortfolioPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🚀 FONCTION LOADDATA OPTIMISÉE AVEC OPTION FORCE RELOAD
  const loadData = async (forceReload = false) => {
    try {
      setLoading(true);
      
      // Vérifier le cache d'abord (sauf si forceReload est true)
      if (!forceReload && portfolioCache.has(id)) {
        console.log('💾 Chargé depuis le cache !');
        setData(portfolioCache.get(id));
        setLoading(false);
        return;
      }
      
      // Sinon charger depuis le serveur
      console.log('🌐 Chargement depuis le serveur...');
      const response = await fetch(`/api/users/${id}`);
      const result = await response.json();
      
      if (result.success === false) {
        setData(null);
      } else {
        // Sauvegarder en cache
        portfolioCache.set(id, result);
        setData(result);
      }
    } catch (error) {
      console.error('Erreur chargement:', error);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  // 🚀 FONCTION POUR INVALIDER LE CACHE
  const invalidateCache = () => {
    portfolioCache.delete(id);
  };

  // Mise à jour fluide pour l'utilisateur uniquement
  const updateUser = async (updatedFields) => {
     // Vérifier d'abord si l'utilisateur est propriétaire
    if (!isPortfolioOwner(parseInt(id))) {
      return { success: false, message: 'Non autorisé' };
    }
    // Mise à jour immédiate
    setData(prevData => ({
      ...prevData,
      user: {
        ...prevData.user,
        ...updatedFields
      }
    }));

    try {
      const response = await authFetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });

      if (!response.ok) throw new Error('Erreur de sauvegarde');

      const result = await response.json();
      
      if (result.user) {
        const newData = {
          ...data,
          user: result.user
        };
        setData(newData);
        // Mettre à jour le cache aussi
        portfolioCache.set(id, newData);
      }

      return { success: true };
    } catch (error) {
      console.error('Erreur:', error);
      await loadData(true); // Force reload en cas d'erreur
      return { success: false };
    }
  };

  // 🚀 MISE À JOUR OPTIMISTE DES PROJETS
  const updateProjects = (updatedProjects) => {
    setData(prevData => {
      const newData = {
        ...prevData,
        projects: updatedProjects
      };
      // Mettre à jour le cache immédiatement
      portfolioCache.set(id, newData);
      return newData;
    });
  };

  // 🚀 MISE À JOUR OPTIMISTE DES COMPÉTENCES
  const updateSkills = (updatedSkills) => {
    setData(prevData => {
      const newData = {
        ...prevData,
        skills: updatedSkills
      };
      // Mettre à jour le cache immédiatement
      portfolioCache.set(id, newData);
      return newData;
    });
  };

  // 🚀 MISE À JOUR OPTIMISTE DES EXPÉRIENCES
  const updateExperiences = (updatedExperiences) => {
    setData(prevData => {
      const newData = {
        ...prevData,
        experiences: updatedExperiences
      };
      // Mettre à jour le cache immédiatement
      portfolioCache.set(id, newData);
      return newData;
    });
  };

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  if (loading) return <div>Chargement...</div>;
  if (!data) return <NotFound />;

  return (
    <Portfolio 
      user={data.user} 
      projects={data.projects} 
      skills={data.skills}
      experiences={data.experiences || []}
      updateUser={updateUser}
      updateProjects={updateProjects}
      updateSkills={updateSkills}
      updateExperiences={updateExperiences}
      loadData={loadData}
      invalidateCache={invalidateCache}
      isOwner={isPortfolioOwner(data.user?.id)}
    />
  );
};

export default PortfolioPage;


