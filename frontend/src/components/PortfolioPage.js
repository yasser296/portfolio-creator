// PortfolioPage.jsx - VERSION FINALE COMPLÈTE
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Portfolio from './Portfolio';
import NotFound from './NotFound';

const PortfolioPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fonction pour charger toutes les données
  const loadData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/${id}`);
      const result = await response.json();
      
      if (result.success === false) {
        setData(null);
      } else {
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
        setData(prevData => ({
          ...prevData,
          user: result.user
        }));
      }

      return { success: true };
    } catch (error) {
      console.error('Erreur:', error);
      await loadData(); // Recharge en cas d'erreur
      return { success: false };
    }
  };

  // Fonction pour mettre à jour les projets (pas utilisée mais nécessaire pour la compatibilité)
  const updateProjects = (updatedProjects) => {
    setData(prevData => ({
      ...prevData,
      projects: updatedProjects
    }));
  };

  // Fonction pour mettre à jour les compétences (pas utilisée mais nécessaire pour la compatibilité)
  const updateSkills = (updatedSkills) => {
    setData(prevData => ({
      ...prevData,
      skills: updatedSkills
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
      updateUser={updateUser}
      updateProjects={updateProjects}
      updateSkills={updateSkills}
      loadData={loadData}
    />
  );
};

export default PortfolioPage;


