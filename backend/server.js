// backend/server.js - Version avec PostgreSQL
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configuration PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'portfolio_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  ssl: false
});

// Test de connexion au démarrage
pool.connect()
  .then(() => console.log('✅ Connexion PostgreSQL établie'))
  .catch(err => console.error('❌ Erreur connexion PostgreSQL:', err.message));

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== ROUTES API AVEC POSTGRESQL =====

// Route de test
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as timestamp, version() as db_version');
    res.json({ 
      status: 'OK', 
      message: 'Backend et PostgreSQL fonctionnent !',
      timestamp: result.rows[0].timestamp,
      database: 'Connected',
      version: result.rows[0].db_version.split(' ')[0] + ' ' + result.rows[0].db_version.split(' ')[1]
    });
  } catch (error) {
    console.error('Erreur health check:', error);
    res.status(500).json({ 
      status: 'Error', 
      message: 'Problème avec la base de données',
      database: 'Disconnected'
    });
  }
});

// Route pour récupérer les projets
app.get('/api/projects', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, title, description, technologies, image_url, 
        github_url, demo_url, featured, view_count,
        created_at, updated_at
      FROM projects 
      WHERE is_active = true 
      ORDER BY featured DESC, created_at DESC
    `);
    
    // Parser les technologies JSON
    const projects = result.rows.map(project => ({
      ...project,
      technologies: Array.isArray(project.technologies) ? project.technologies : JSON.parse(project.technologies || '[]')
    }));
    
    res.json(projects);
  } catch (error) {
    console.error('Erreur récupération projets:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la récupération des projets' 
    });
  }
});

// Route pour récupérer un projet spécifique
app.get('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT * FROM projects 
      WHERE id = $1 AND is_active = true
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Projet non trouvé' 
      });
    }
    
    const project = {
      ...result.rows[0],
      technologies: Array.isArray(result.rows[0].technologies) 
        ? result.rows[0].technologies 
        : JSON.parse(result.rows[0].technologies || '[]')
    };
    
    // Incrémenter le compteur de vues
    await pool.query('UPDATE projects SET view_count = view_count + 1 WHERE id = $1', [id]);
    
    res.json(project);
  } catch (error) {
    console.error('Erreur récupération projet:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la récupération du projet' 
    });
  }
});

// Route pour récupérer les compétences
app.get('/api/skills', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, category, items, icon_name, display_order
      FROM skills 
      WHERE is_active = true 
      ORDER BY display_order, category
    `);
    
    // Parser les items JSON
    const skills = result.rows.map(skill => ({
      ...skill,
      items: Array.isArray(skill.items) ? skill.items : JSON.parse(skill.items || '[]')
    }));
    
    res.json(skills);
  } catch (error) {
    console.error('Erreur récupération compétences:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la récupération des compétences' 
    });
  }
});

// Route pour les statistiques
app.get('/api/stats', async (req, res) => {
  try {
    const projectsCount = await pool.query('SELECT COUNT(*) FROM projects WHERE is_active = true');
    const messagesCount = await pool.query('SELECT COUNT(*) FROM contact_messages');
    const totalViews = await pool.query('SELECT SUM(view_count) as total FROM projects WHERE is_active = true');
    
    res.json({
      projects: parseInt(projectsCount.rows[0].count),
      experience: 1, // Années d'expérience (statique)
      clients: parseInt(messagesCount.rows[0].count),
      views: parseInt(totalViews.rows[0].total || 0),
      technologies: ['React', 'Node.js', 'PostgreSQL', 'Express', 'Vue.js', 'Python']
    });
  } catch (error) {
    console.error('Erreur récupération stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la récupération des statistiques' 
    });
  }
});

// Route pour envoyer un message de contact
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Tous les champs sont requis' 
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email invalide' 
      });
    }

    // Sauvegarder en base de données
    const result = await pool.query(`
      INSERT INTO contact_messages (name, email, message, ip_address)
      VALUES ($1, $2, $3, $4)
      RETURNING id, created_at
    `, [name, email, message, req.ip || 'unknown']);

    console.log('📧 Nouveau message reçu:', { 
      id: result.rows[0].id, 
      name, 
      email, 
      timestamp: result.rows[0].created_at 
    });
    console.log('📝 Message:', message);

    res.json({ 
      success: true, 
      message: 'Message enregistré avec succès !',
      id: result.rows[0].id
    });

  } catch (error) {
    console.error('Erreur envoi message:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de l\'envoi du message' 
    });
  }
});

// Route pour récupérer les messages (admin)
app.get('/api/admin/messages', async (req, res) => {
  try {
    const { page = 1, limit = 10, status = 'all' } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = '';
    let params = [limit, offset];
    
    if (status === 'unread') {
      whereClause = 'WHERE is_read = false';
    } else if (status === 'read') {
      whereClause = 'WHERE is_read = true';
    }
    
    const result = await pool.query(`
      SELECT 
        id, name, email, message, is_read, email_sent,
        created_at, updated_at, ip_address
      FROM contact_messages 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `, params);
    
    const countResult = await pool.query(`
      SELECT COUNT(*) FROM contact_messages ${whereClause}
    `);
    
    res.json({
      messages: result.rows,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(countResult.rows[0].count / limit),
        total_messages: parseInt(countResult.rows[0].count),
        per_page: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Erreur récupération messages:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la récupération des messages' 
    });
  }
});

// Route pour marquer un message comme lu
app.patch('/api/admin/messages/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      UPDATE contact_messages 
      SET is_read = true, updated_at = NOW() 
      WHERE id = $1
      RETURNING *
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Message non trouvé' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Message marqué comme lu' 
    });
  } catch (error) {
    console.error('Erreur mise à jour message:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la mise à jour' 
    });
  }
});

// Route pour créer un nouveau projet (admin)
app.post('/api/admin/projects', async (req, res) => {
  try {
    const { 
      title, description, technologies, image_url, 
      github_url, demo_url, featured = false 
    } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ 
        success: false, 
        message: 'Titre et description sont requis' 
      });
    }
    
    const result = await pool.query(`
      INSERT INTO projects 
      (title, description, technologies, image_url, github_url, demo_url, featured)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      title, 
      description, 
      JSON.stringify(technologies || []), 
      image_url, 
      github_url, 
      demo_url, 
      featured
    ]);
    
    const project = {
      ...result.rows[0],
      technologies: JSON.parse(result.rows[0].technologies)
    };
    
    res.status(201).json({
      success: true,
      message: 'Projet créé avec succès',
      project
    });
  } catch (error) {
    console.error('Erreur création projet:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la création du projet' 
    });
  }
});

// Route 404 pour API
app.use('/api/*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route API non trouvée' 
  });
});

// Route par défaut
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 Portfolio Backend API avec PostgreSQL',
    version: '2.0.0',
    database: 'PostgreSQL',
    endpoints: {
      health: '/api/health',
      projects: '/api/projects',
      skills: '/api/skills',
      stats: '/api/stats',
      contact: 'POST /api/contact',
      admin_messages: '/api/admin/messages',
      admin_projects: 'POST /api/admin/projects'
    }
  });
});

// Gestion des erreurs globales
app.use((error, req, res, next) => {
  console.error('Erreur serveur:', error);
  res.status(500).json({
    success: false,
    message: 'Erreur interne du serveur'
  });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📡 API disponible sur http://localhost:${PORT}`);
  console.log(`🔗 Frontend sur http://localhost:3000`);
  console.log(`📊 Test API: http://localhost:${PORT}/api/health`);
  console.log(`🗄️  Base de données: PostgreSQL`);
});

// Gestion propre de l'arrêt
process.on('SIGTERM', async () => {
  console.log('🔄 Arrêt du serveur...');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\n🔄 Arrêt du serveur...');
  await pool.end();
  process.exit(0);
});

module.exports = app;