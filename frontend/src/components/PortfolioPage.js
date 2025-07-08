// PortfolioPage.js - MODIFICATIONS À APPORTER

import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Portfolio from './Portfolio';
import NotFound from './NotFound';

// 🚀 CACHE SIMPLE - AJOUT
const portfolioCache = new Map();

const PortfolioPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🚀 FONCTION LOADDATA OPTIMISÉE
  const loadData = async () => {
    try {
      setLoading(true);
      
      // Vérifier le cache d'abord
      if (portfolioCache.has(id)) {
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

  // Mise à jour fluide pour l'utilisateur uniquement
  const updateUser = async (updatedFields) => {
    // Mise à jour immédiate
    setData(prevData => ({
      ...prevData,
      user: {
        ...prevData.user,
        ...updatedFields
      }
    }));

    try {
      const response = await fetch(`/api/users/${id}`, {
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
      await loadData();
      return { success: false };
    }
  };

  const updateProjects = (updatedProjects) => {
    setData(prevData => ({
      ...prevData,
      projects: updatedProjects
    }));
  };

  const updateSkills = (updatedSkills) => {
    setData(prevData => ({
      ...prevData,
      skills: updatedSkills
    }));
  };

  const updateExperiences = (updatedExperiences) => {
    setData(prevData => ({
      ...prevData,
      experiences: updatedExperiences
    }));
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
    />
  );
};

export default PortfolioPage;


