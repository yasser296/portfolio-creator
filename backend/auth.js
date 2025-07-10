const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Configuration JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

// Middleware d'authentification
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Token manquant. Veuillez vous connecter.' 
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        message: 'Token invalide ou expiré.' 
      });
    }
    req.user = user;
    next();
  });
};

// Middleware pour vérifier la propriété d'une ressource
const checkOwnership = (resourceType) => {
  return async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
      let isOwner = false;

      switch (resourceType) {
        case 'user':
          isOwner = parseInt(id) === userId;
          break;
        
        case 'project':
          const projectResult = await req.pool.query(
            'SELECT user_id FROM projects WHERE id = $1',
            [id]
          );
          isOwner = projectResult.rows.length > 0 && 
                   projectResult.rows[0].user_id === userId;
          break;
        
        case 'skill':
          const skillResult = await req.pool.query(
            'SELECT user_id FROM skills WHERE id = $1',
            [id]
          );
          isOwner = skillResult.rows.length > 0 && 
                   skillResult.rows[0].user_id === userId;
          break;
        
        case 'experience':
          const expResult = await req.pool.query(
            'SELECT user_id FROM experiences WHERE id = $1',
            [id]
          );
          isOwner = expResult.rows.length > 0 && 
                   expResult.rows[0].user_id === userId;
          break;
      }

      if (!isOwner) {
        return res.status(403).json({ 
          success: false, 
          message: 'Accès non autorisé à cette ressource.' 
        });
      }

      next();
    } catch (error) {
      console.error('Erreur vérification propriété:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la vérification des permissions.' 
      });
    }
  };
};

// Générer un token JWT
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email,
      name: user.name 
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

// Hasher un mot de passe
const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

// Vérifier un mot de passe
const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

module.exports = {
  authenticateToken,
  checkOwnership,
  generateToken,
  hashPassword,
  verifyPassword,
  JWT_SECRET
};