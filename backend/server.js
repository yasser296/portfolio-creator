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

// POST /api/projects (user classique)
app.post('/api/projects', async (req, res) => {
  try {
    const { user_id, title, description, technologies, image_url, github_url, demo_url, featured = false } = req.body;
    if (!user_id || !title || !description) {
      return res.status(400).json({ success: false, message: "user_id, titre et description sont requis" });
    }
    const result = await pool.query(`
      INSERT INTO projects 
      (user_id, title, description, technologies, image_url, github_url, demo_url, featured)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      user_id, title, description,
      JSON.stringify(technologies || []),
      image_url, github_url, demo_url, featured
    ]);
    res.status(201).json({ success: true, message: "Projet ajouté avec succès", project: result.rows[0] });
  } catch (error) {
    console.error('Erreur création projet:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/users/:id/projects
app.get('/api/users/:id/projects', async (req, res) => {
  try {
    const userId = req.params.id;
    const result = await pool.query(`
      SELECT * FROM projects WHERE user_id = $1 ORDER BY created_at DESC
    `, [userId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur récupération projets' });
  }
});

// POST /api/skills
app.post('/api/skills', async (req, res) => {
  try {
    const { user_id, category, items, icon_name, display_order = 0 } = req.body;
    if (!user_id || !category || !items) {
      return res.status(400).json({ success: false, message: "user_id, category et items sont requis" });
    }
    const result = await pool.query(`
      INSERT INTO skills (user_id, category, items, icon_name, display_order)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [
      user_id,
      category,
      JSON.stringify(items),
      icon_name || null,
      display_order
    ]);
    res.status(201).json({ success: true, message: "Compétence ajoutée", skill: result.rows[0] });
  } catch (error) {
    console.error('Erreur ajout skill:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/users/:id/skills
app.get('/api/users/:id/skills', async (req, res) => {
  try {
    const userId = req.params.id;
    const result = await pool.query(`
      SELECT * FROM skills WHERE user_id = $1 ORDER BY display_order, category
    `, [userId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur récupération compétences' });
  }
});


// juste après les routes existantes, avant le 404 API

// 1) Lister tous les users actifs
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, name, email, title, description, experience_years, location,
        phone, github_url, linkedin_url, personal_website,
        avatar_url, hero_background, theme_color, custom_slug
      FROM users
      WHERE is_active = true
      ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur /users:', err);
    res.status(500).json({ success: false, message: 'Erreur récupération users' });
  }
});

// 2) Récupérer un user + ses projects & skills
app.get('/api/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const u = await pool.query(
      `SELECT * FROM users WHERE id = $1 AND is_active = true`,
      [userId]
    );
    if (u.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User non trouvé' });
    }
    const user = u.rows[0];

    const p = await pool.query(`
      SELECT id, title, description, technologies, image_url,
             github_url, demo_url, featured, view_count
      FROM projects
      WHERE user_id = $1 AND is_active = true
      ORDER BY created_at DESC
    `, [userId]);

    const s = await pool.query(`
      SELECT id, category, items, icon_name, display_order
      FROM skills
      WHERE user_id = $1 AND is_active = true
      ORDER BY display_order, category
    `, [userId]);

    const projects = p.rows.map(pr => ({
      ...pr,
      technologies: pr.technologies || []
    }));
    const skills = s.rows.map(sk => ({
      ...sk,
      items: sk.items || []
    }));

    res.json({ user, projects, skills });
  } catch (err) {
    console.error(`Erreur /api/users/${req.params.id}:`, err);
    res.status(500).json({ success: false, message: 'Erreur récupération user' });
  }
});

// Supprimer un utilisateur/portfolio par ID
app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Optionnel : vérifier si l'utilisateur existe avant de supprimer
    const check = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (check.rows.length === 0) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });

    // Suppression (provoque le ON DELETE CASCADE sur les tables enfants)
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (e) {
    console.error("Erreur suppression utilisateur:", e);
    res.status(500).json({ success: false, message: 'Suppression échouée' });
  }
});

// Route pour mettre à jour un utilisateur
app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const allowedFields = [
      'name', 'email', 'title', 'description', 'experience_years',
      'location', 'phone', 'github_url', 'linkedin_url', 
      'personal_website', 'avatar_url', 'hero_background',
      'theme_color', 'custom_slug'
    ];
    
    // Filtrer uniquement les champs autorisés
    const updates = {};
    allowedFields.forEach(field => {
      if (req.body.hasOwnProperty(field)) {
        updates[field] = req.body[field];
      }
    });
    
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Aucun champ à mettre à jour' 
      });
    }
    
    // Construire la requête UPDATE dynamiquement
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    
    const values = [id, ...Object.values(updates)];
    
    const result = await pool.query(
      `UPDATE users 
       SET ${setClause}, updated_at = NOW() 
       WHERE id = $1 AND is_active = true
       RETURNING *`,
      values
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Utilisateur non trouvé' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Utilisateur mis à jour avec succès',
      user: result.rows[0] 
    });
  } catch (error) {
    console.error('Erreur mise à jour utilisateur:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la mise à jour' 
    });
  }
});

// Route pour mettre à jour un projet
app.put('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, description, technologies, 
      image_url, github_url, demo_url, featured 
    } = req.body;
    
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (technologies !== undefined) updates.technologies = JSON.stringify(technologies);
    if (image_url !== undefined) updates.image_url = image_url;
    if (github_url !== undefined) updates.github_url = github_url;
    if (demo_url !== undefined) updates.demo_url = demo_url;
    if (featured !== undefined) updates.featured = featured;
    
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Aucun champ à mettre à jour' 
      });
    }
    
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    
    const values = [id, ...Object.values(updates)];
    
    const result = await pool.query(
      `UPDATE projects 
       SET ${setClause}, updated_at = NOW() 
       WHERE id = $1
       RETURNING *`,
      values
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Projet non trouvé' 
      });
    }
    
    const project = {
      ...result.rows[0],
      technologies: JSON.parse(result.rows[0].technologies || '[]')
    };
    
    res.json({ 
      success: true, 
      message: 'Projet mis à jour avec succès',
      project 
    });
  } catch (error) {
    console.error('Erreur mise à jour projet:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la mise à jour' 
    });
  }
});

// Route pour mettre à jour une compétence
app.put('/api/skills/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { category, items, icon_name, display_order } = req.body;
    
    const updates = {};
    if (category !== undefined) updates.category = category;
    if (items !== undefined) updates.items = JSON.stringify(items);
    if (icon_name !== undefined) updates.icon_name = icon_name;
    if (display_order !== undefined) updates.display_order = display_order;
    
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Aucun champ à mettre à jour' 
      });
    }
    
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    
    const values = [id, ...Object.values(updates)];
    
    const result = await pool.query(
      `UPDATE skills 
       SET ${setClause}, updated_at = NOW() 
       WHERE id = $1
       RETURNING *`,
      values
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Compétence non trouvée' 
      });
    }
    
    const skill = {
      ...result.rows[0],
      items: JSON.parse(result.rows[0].items || '[]')
    };
    
    res.json({ 
      success: true, 
      message: 'Compétence mise à jour avec succès',
      skill 
    });
  } catch (error) {
    console.error('Erreur mise à jour compétence:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la mise à jour' 
    });
  }
});

// Route pour supprimer un projet
app.delete('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Option 1: Suppression logique (recommandé)
    // const result = await pool.query(
    //   `UPDATE projects 
    //    SET is_active = false, updated_at = NOW() 
    //    WHERE id = $1
    //    RETURNING id`,
    //   [id]
    // );
    
    // Option 2: Suppression physique (décommentez si préféré)
    const result = await pool.query(
      'DELETE FROM projects WHERE id = $1 RETURNING id',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Projet non trouvé' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Projet supprimé avec succès' 
    });
  } catch (error) {
    console.error('Erreur suppression projet:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la suppression' 
    });
  }
});

// Route pour supprimer une compétence
app.delete('/api/skills/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Option 1: Suppression logique
    // const result = await pool.query(
    //   `UPDATE skills 
    //    SET is_active = false, updated_at = NOW() 
    //    WHERE id = $1
    //    RETURNING id`,
    //   [id]
    // );
    
    // Option 2: Suppression physique (décommentez si préféré)
    const result = await pool.query(
    'DELETE FROM skills WHERE id = $1 RETURNING id',
    [id]
     );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Compétence non trouvée' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Compétence supprimée avec succès' 
    });
  } catch (error) {
    console.error('Erreur suppression compétence:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la suppression' 
    });
  }
});

// Route pour mettre à jour partiellement un utilisateur (PATCH)
app.patch('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const field = Object.keys(req.body)[0];
    const value = req.body[field];
    
    if (!field || value === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: 'Aucun champ à mettre à jour' 
      });
    }
    
    const allowedFields = [
      'name', 'email', 'title', 'description', 'location',
      'phone', 'github_url', 'linkedin_url', 'experience_years'
    ];
    
    if (!allowedFields.includes(field)) {
      return res.status(400).json({ 
        success: false, 
        message: `Le champ ${field} n'est pas autorisé` 
      });
    }
    
    const result = await pool.query(
      `UPDATE users 
       SET ${field} = $2, updated_at = NOW() 
       WHERE id = $1
       RETURNING *`,
      [id, value]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Utilisateur non trouvé' 
      });
    }
    
    res.json({ 
      success: true, 
      message: `${field} mis à jour avec succès`,
      user: result.rows[0] 
    });
  } catch (error) {
    console.error('Erreur patch utilisateur:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la mise à jour' 
    });
  }
});

// Route pour récupérer les références de compétences
app.get('/api/skills_reference', async (req, res) => {
  const result = await pool.query("SELECT * FROM skills_reference ORDER BY category, skill_name");
  res.json(result.rows);
});


// Route pour créer un nouvel utilisateur (portfolio)
app.post('/api/users', async (req, res) => {
  try {
    // 1) Récupérer les champs depuis le corps de la requête
    const {
      name,
      email,
      title = null,
      description = null,
      experience_years = 0,
      location = null,
      phone = null,
      github_url = null,
      linkedin_url = null,
      personal_website = null,
      avatar_url = null,
      hero_background = null,
      theme_color = null,
      custom_slug = null,
      is_active = true
    } = req.body;

    // 2) Validation minimale
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Les champs name et email sont obligatoires'
      });
    }

    // 3) Insertion en base avec RETURNING *
    const result = await pool.query(
      `INSERT INTO users
        (name, email, title, description, experience_years, location, phone,
         github_url, linkedin_url, personal_website, avatar_url, hero_background,
         theme_color, custom_slug, is_active)
       VALUES
        ($1, $2, $3, $4, $5, $6, $7,
         $8, $9, $10, $11, $12,
         $13, $14, $15)
       RETURNING *`,
      [
        name,
        email,
        title,
        description,
        experience_years,
        location,
        phone,
        github_url,
        linkedin_url,
        personal_website,
        avatar_url,
        hero_background,
        theme_color,
        custom_slug,
        is_active
      ]
    );

    // 4) Renvoi de l’utilisateur créé
    const newUser = result.rows[0];
    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      user: newUser
    });
  } catch (error) {
    console.error('Erreur création user:', error);
    // Cas où c’est une violation d’unicité sur l’email (code postgres 23505)
    if (err.code === "23505" && err.constraint === "users_email_key") {
      return res.status(400).json({ message: "Cet email existe déjà." });
    }
    // Autres erreurs : ne pas exposer le détail technique
    console.error('Erreur création user:', err); // On log pour debug interne
    return res.status(500).json({ message: "Erreur serveur. Veuillez réessayer plus tard." });
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