import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Portfolio from './Portfolio'; // Ton composant stylé
import NotFound from './NotFound';

const PortfolioPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  // const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/users/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success === false) setData(null);
        else setData(data);
        // setLoading(false);
      });
  }, [id]);

  // if (loading) return <div>Chargement...</div>;
  if (!data) return <NotFound />;

  return (
    <Portfolio user={data.user} projects={data.projects} skills={data.skills} />
  );
};

export default PortfolioPage;

