// backend/scripts/generateResetLinks.js
// backend/scripts/generateResetLinksDirecte.js
// Script avec connexion directe (remplacez les valeurs)

const { Pool } = require('pg');
const crypto = require('crypto');

// REMPLACEZ CES VALEURS PAR VOS PROPRES INFORMATIONS
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'portfolio_db',
  user: 'postgres',
  password: 'yasserpasse'  // ← CHANGEZ ICI !
});

async function generateLinks() {
  try {
    console.log('\n🔄 Génération des liens de réinitialisation...\n');
    
    // Test de connexion
    await pool.connect();
    console.log('✅ Connexion à PostgreSQL réussie\n');
    
    // Récupérer tous les utilisateurs sans mot de passe
    const result = await pool.query(
      'SELECT id, name, email FROM users WHERE password IS NULL OR password = \'\''
    );
    
    const users = result.rows;
    console.log(`📊 ${users.length} utilisateurs trouvés\n`);
    
    if (users.length === 0) {
      console.log('ℹ️  Aucun utilisateur sans mot de passe trouvé.');
      console.log('Peut-être que les utilisateurs ont déjà des mots de passe ?');
      
      // Afficher tous les utilisateurs
      const allUsers = await pool.query('SELECT id, name, email, password IS NOT NULL as has_password FROM users');
      console.log('\nUtilisateurs dans la base :');
      allUsers.rows.forEach(u => {
        console.log(`- ${u.name} (${u.email}) - Mot de passe: ${u.has_password ? 'OUI' : 'NON'}`);
      });
      
      return;
    }
    
    console.log('='.repeat(80));
    console.log('LIENS DE RÉINITIALISATION - COPIEZ CES LIENS !');
    console.log('='.repeat(80));
    
    for (const user of users) {
      // Générer un token unique
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 jours
      
      // Sauvegarder le token dans la base
      await pool.query(
        'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3',
        [resetToken, expires, user.id]
      );
      
      // Afficher directement dans la console
      console.log(`\n👤 ${user.name}`);
      console.log(`📧 Email: ${user.email}`);
      console.log(`🔗 Lien: http://localhost:3000/reset-password?token=${resetToken}`);
      console.log('-'.repeat(80));
    }
    
    console.log('\n✅ Tous les liens ont été générés !');
    console.log('⚠️  Ces liens expirent dans 7 jours');
    console.log('📋 Copiez ces liens et ouvrez-les dans votre navigateur\n');
    
  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    console.log('\n💡 Conseils de dépannage :');
    console.log('1. Vérifiez que PostgreSQL est démarré');
    console.log('2. Vérifiez le mot de passe dans ce script (ligne 11)');
    console.log('3. Vérifiez que la base de données "portfolio_db" existe');
    console.log('4. Essayez de vous connecter avec : psql -U postgres -d portfolio_db');
  } finally {
    await pool.end();
  }
}

// Exécuter directement
generateLinks();