// backend/server.js - Version avec PostgreSQL
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

const { 
  authenticateToken, 
  checkOwnership, 
  generateToken, 
  hashPassword, 
  verifyPassword 
} = require('./auth');

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

app.use((req, res, next) => {
  req.pool = pool;
  next();
});

// ===== ROUTES D'AUTHENTIFICATION =====

// Route d'inscription
app.post('/api/auth/register', async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password,
      title,
      description,
      experience_years,
      location,
      phone,
      github_url,
      linkedin_url,
      personal_website,
      avatar_url,
      hero_background
    } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nom, email et mot de passe sont obligatoires' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Le mot de passe doit contenir au moins 6 caractères' 
      });
    }

    if (github_url && !github_url.startsWith("https://")) {
      newErrors.github_url = 'URL GitHub invalide';
    }


    // Vérifier si l'email existe déjà
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cet email est déjà utilisé' 
      });
    }

    // Hasher le mot de passe
    const hashedPassword = await hashPassword(password);

    // Créer l'utilisateur
    const result = await pool.query(
      `INSERT INTO users 
       (name, email, password, title, description, is_active, experience_years, location, phone, github_url, linkedin_url, personal_website, avatar_url, hero_background) 
       VALUES ($1, $2, $3, $4, $5 , $6, $7, $8, $9, $10, $11, $12, $13, $14) 
       RETURNING id, name, email, title, description, created_at`,
      [name, email, hashedPassword, title || null, description || null , true, experience_years || null, location || null, phone || null, github_url || null, linkedin_url || null, personal_website || null, avatar_url || null, hero_background || null]
    );

    const user = result.rows[0];

    // Générer le token
    const token = generateToken(user);

    // Mettre à jour last_login
    await pool.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );

    res.status(201).json({
      success: true,
      message: 'Inscription réussie',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        title: user.title,
        description: user.description,
        is_active: user.is_active,
        experience_years: user.experience_years,
        location: user.location,
        phone: user.phone,
        github_url: user.github_url,
        linkedin_url: user.linkedin_url,
        personal_website: user.personal_website,
        avatar_url: user.avatar_url,
        hero_background: user.hero_background
      }
    });

  } catch (error) {
    console.error('Erreur inscription:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de l\'inscription' 
    });
  }
});

// Route de connexion
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email et mot de passe requis' 
      });
    }

    // Chercher l'utilisateur
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND is_active = true',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Email ou mot de passe incorrect' 
      });
    }

    const user = result.rows[0];

    // Vérifier le mot de passe
    const isValid = await verifyPassword(password, user.password);

    if (!isValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Email ou mot de passe incorrect' 
      });
    }

    // Générer le token
    const token = generateToken(user);

    // Mettre à jour last_login
    await pool.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );

    res.json({
      success: true,
      message: 'Connexion réussie',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        title: user.title,
        description: user.description,
        avatar_url: user.avatar_url,
        location: user.location,
        github_url: user.github_url,
        linkedin_url: user.linkedin_url,
        personal_website: user.personal_website,
        experience_years: user.experience_years,
        hero_background: user.hero_background,
        phone: user.phone

      }
    });

  } catch (error) {
    console.error('Erreur connexion:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la connexion' 
    });
  }
});

// Route pour vérifier le token et récupérer l'utilisateur
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, title, description, avatar_url, location, github_url, linkedin_url FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Utilisateur non trouvé' 
      });
    }

    res.json({
      success: true,
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Erreur /me:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur' 
    });
  }
});

// Route de déconnexion (optionnel, côté client on supprime juste le token)
app.post('/api/auth/logout', authenticateToken, (req, res) => {
  // On pourrait invalider le token côté serveur si on le stocke
  res.json({ 
    success: true, 
    message: 'Déconnexion réussie' 
  });
});

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
    const skills = result.rows.map(skill => {
    let parsedItems;

    if (Array.isArray(skill.items)) {
      parsedItems = skill.items;
    } else {
      try {
        parsedItems = JSON.parse(skill.items);
        if (!Array.isArray(parsedItems)) {
          throw new Error();
        }
      } catch {
        parsedItems = skill.items.split(',').map(item => item.trim());
      }
    }

    return {
      ...skill,
      items: parsedItems
    };
  });
    
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
app.post('/api/projects', authenticateToken, async (req, res) => {
  try {
    const { title, description, technologies, image_url, github_url, demo_url, featured = false } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ success: false, message: "Titre et description sont requis" });
    }
    
    // Forcer l'user_id à être celui de l'utilisateur connecté
    const result = await pool.query(`
      INSERT INTO projects 
      (user_id, title, description, technologies, image_url, github_url, demo_url, featured)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      req.user.id, // Utiliser l'ID de l'utilisateur connecté
      title, description,
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
app.post('/api/skills', authenticateToken, async (req, res) => {
  try {
    const { category, items, icon_name, display_order = 0 } = req.body;
    
    if (!category || !items) {
      return res.status(400).json({ success: false, message: "Category et items sont requis" });
    }
    
    const result = await pool.query(`
      INSERT INTO skills (user_id, category, items, icon_name, display_order)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [
      req.user.id, // Utiliser l'ID de l'utilisateur connecté
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
        avatar_url, hero_background, theme_color
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

// GET /api/users/:id - MODIFIER la route existante pour inclure les expériences
app.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Récupérer l'utilisateur
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (userResult.rows.length === 0) {
      return res.json({ success: false, message: 'Utilisateur non trouvé' });
    }
    
    // Récupérer les projets
    const projectsResult = await pool.query(
      'SELECT * FROM projects WHERE user_id = $1 ORDER BY created_at DESC', 
      [id]
    );
    
    // Récupérer les compétences
    const skillsResult = await pool.query(
      'SELECT * FROM skills WHERE user_id = $1 ORDER BY category', 
      [id]
    );
    
    // NOUVEAU : Récupérer les expériences
    const experiencesResult = await pool.query(
      'SELECT * FROM experiences WHERE user_id = $1 ORDER BY date_debut DESC', 
      [id]
    );
    
    res.json({
      user: userResult.rows[0],
      projects: projectsResult.rows,
      skills: skillsResult.rows,
      experiences: experiencesResult.rows // AJOUT
    });
    
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});



// Supprimer un utilisateur/portfolio par ID
app.delete('/api/users/:id', authenticateToken, checkOwnership('user'), async (req, res) => {
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
app.put('/api/users/:id', authenticateToken, checkOwnership('user'), async (req, res) => {
  try {
    const { id } = req.params;
    const allowedFields = [
      'name', 'email', 'title', 'description', 'experience_years',
      'location', 'phone', 'github_url', 'linkedin_url', 
      'personal_website', 'avatar_url', 'hero_background',
      'theme_color' // RETIRER custom_slug d'ici
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
})

// Route pour mettre à jour un projet
app.put('/api/projects/:id', authenticateToken, checkOwnership('project'), async (req, res) => {
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
app.put('/api/skills/:id', authenticateToken, checkOwnership('skill'), async (req, res) => {
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
      items: Array.isArray(result.rows[0].items)
        ? result.rows[0].items
        : JSON.parse(result.rows[0].items || '[]')
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
app.delete('/api/projects/:id', authenticateToken, checkOwnership('project'), async (req, res) => {
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
app.delete('/api/skills/:id', authenticateToken, checkOwnership('skill'), async (req, res) => {
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
      is_active = true
    } = req.body;

    // Validation minimale
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Les champs name et email sont obligatoires'
      });
    }

    // Insertion en base SANS custom_slug
    const result = await pool.query(
      `INSERT INTO users
        (name, email, title, description, experience_years, location, phone,
         github_url, linkedin_url, personal_website, avatar_url, hero_background,
         theme_color, is_active)
       VALUES
        ($1, $2, $3, $4, $5, $6, $7,
         $8, $9, $10, $11, $12,
         $13, $14)
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
        is_active
      ]
    );

    const newUser = result.rows[0];
    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      user: newUser
    });
  } catch (error) {
    console.error('Erreur création user:', error);
    
    if (error.code === "23505" && error.constraint === "users_email_key") {
      return res.status(400).json({ 
        success: false,
        message: "Cet email existe déjà." 
      });
    }
    
    console.error('Erreur détaillée:', error.message);
    return res.status(500).json({ 
      success: false,
      message: "Erreur serveur. Veuillez réessayer plus tard." 
    });
  }
});

// POST /api/experiences - Créer une nouvelle expérience
app.post('/api/experiences', authenticateToken, async (req, res) => {
  try {
    const { entreprise, poste, date_debut, date_fin, description } = req.body;
    
    if (!entreprise || !poste || !date_debut) {
      return res.status(400).json({ 
        success: false, 
        message: 'Entreprise, poste et date_debut sont obligatoires' 
      });
    }
    
    const dateDebutFormatted = date_debut + '-01';
    const dateFinFormatted = date_fin ? date_fin + '-01' : null;
    
    const result = await pool.query(
      `INSERT INTO experiences (user_id, entreprise, poste, date_debut, date_fin, description) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [req.user.id, entreprise, poste, dateDebutFormatted, dateFinFormatted, description || '']
    );
    
    res.status(201).json({
      success: true,
      experience: result.rows[0]
    });
    
  } catch (error) {
    console.error('Erreur création expérience:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// PUT /api/experiences/:id - Modifier une expérience
app.put('/api/experiences/:id', authenticateToken, checkOwnership('experience'), async (req, res) => {
  try {
    const { id } = req.params;
    const { entreprise, poste, date_debut, date_fin, description } = req.body;
    
    // Validation
    if (!entreprise || !poste || !date_debut) {
      return res.status(400).json({ 
        success: false, 
        message: 'entreprise, poste et date_debut sont obligatoires' 
      });
    }
    
    // ✅ CONVERSION DES DATES : Ajouter "-01" pour les rendre compatibles PostgreSQL
    const dateDebutFormatted = date_debut + '-01'; // "2025-03" → "2025-03-01"
    const dateFinFormatted = date_fin ? date_fin + '-01' : null; // "2025-04" → "2025-04-01" ou null
    
    const result = await pool.query(
      `UPDATE experiences 
       SET entreprise = $1, poste = $2, date_debut = $3, date_fin = $4, 
           description = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 
       RETURNING *`,
      [entreprise, poste, dateDebutFormatted, dateFinFormatted, description || '', id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Expérience non trouvée' });
    }
    
    res.json({
      success: true,
      experience: result.rows[0]
    });
    
  } catch (error) {
    console.error('Erreur modification expérience:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// DELETE /api/experiences/:id - Supprimer une expérience
app.delete('/api/experiences/:id', authenticateToken, checkOwnership('skill'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM experiences WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Expérience non trouvée' });
    }
    
    res.json({
      success: true,
      message: 'Expérience supprimée avec succès'
    });
    
  } catch (error) {
    console.error('Erreur suppression expérience:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/users/:id/experiences - Récupérer toutes les expériences d'un utilisateur
app.get('/api/users/:id/experiences', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM experiences WHERE user_id = $1 ORDER BY date_debut DESC', 
      [id]
    );
    
    res.json(result.rows);
    
  } catch (error) {
    console.error('Erreur récupération expériences:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// backend/server.js - Ajouter ces routes après les routes d'authentification existantes

// Route pour vérifier un token de réinitialisation
app.post('/api/auth/verify-reset-token', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ 
        success: false, 
        message: 'Token manquant' 
      });
    }
    
    // Vérifier si le token existe et n'est pas expiré
    const result = await pool.query(
      `SELECT id, email, name 
       FROM users 
       WHERE reset_token = $1 
       AND reset_token_expires > NOW()
       AND is_active = true`,
      [token]
    );
    
    if (result.rows.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Token invalide ou expiré' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Token valide' 
    });
    
  } catch (error) {
    console.error('Erreur vérification token:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur' 
    });
  }
});

// Route pour réinitialiser le mot de passe avec un token
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    
    // Validation
    if (!token || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Token et mot de passe requis' 
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Le mot de passe doit contenir au moins 6 caractères' 
      });
    }
    
    // Vérifier le token
    const userResult = await pool.query(
      `SELECT id, email, name 
       FROM users 
       WHERE reset_token = $1 
       AND reset_token_expires > NOW()
       AND is_active = true`,
      [token]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Token invalide ou expiré' 
      });
    }
    
    const user = userResult.rows[0];
    
    // Hasher le nouveau mot de passe
    const hashedPassword = await hashPassword(password);
    
    // Mettre à jour le mot de passe et effacer le token
    await pool.query(
      `UPDATE users 
       SET password = $1, 
           reset_token = NULL, 
           reset_token_expires = NULL,
           updated_at = NOW()
       WHERE id = $2`,
      [hashedPassword, user.id]
    );
    
    res.json({ 
      success: true, 
      message: 'Mot de passe réinitialisé avec succès' 
    });
    
  } catch (error) {
    console.error('Erreur réinitialisation:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la réinitialisation' 
    });
  }
});

// Route pour demander une réinitialisation de mot de passe (optionnel)
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email requis' 
      });
    }
    
    // Vérifier si l'utilisateur existe
    const userResult = await pool.query(
      'SELECT id, name, email FROM users WHERE email = $1 AND is_active = true',
      [email]
    );
    
    if (userResult.rows.length === 0) {
      // Pour des raisons de sécurité, on ne révèle pas si l'email existe
      return res.json({ 
        success: true, 
        message: 'Si cet email existe, un lien de réinitialisation a été envoyé' 
      });
    }
    
    const user = userResult.rows[0];
    
    // Générer un token de réinitialisation
    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 heures
    
    // Sauvegarder le token
    await pool.query(
      'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3',
      [resetToken, expires, user.id]
    );
    
    // Ici, vous devriez envoyer un email avec le lien
    // Pour le développement, on log juste le lien
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    console.log(`\n📧 Lien de réinitialisation pour ${user.email}:`);
    console.log(resetLink);
    console.log('\n');
    
    // Dans un vrai projet, utilisez un service d'email comme SendGrid, Nodemailer, etc.
    // Exemple avec Nodemailer :
    /*
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    
    await transporter.sendMail({
      from: 'noreply@portfolio-creator.com',
      to: user.email,
      subject: 'Réinitialisation de votre mot de passe',
      html: `
        <h2>Bonjour ${user.name},</h2>
        <p>Vous avez demandé une réinitialisation de mot de passe.</p>
        <p>Cliquez sur le lien ci-dessous pour créer un nouveau mot de passe :</p>
        <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background: #4F46E5; color: white; text-decoration: none; border-radius: 5px;">
          Réinitialiser mon mot de passe
        </a>
        <p>Ce lien expire dans 24 heures.</p>
        <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
      `
    });
    */
    
    res.json({ 
      success: true, 
      message: 'Si cet email existe, un lien de réinitialisation a été envoyé' 
    });
    
  } catch (error) {
    console.error('Erreur forgot password:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur' 
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