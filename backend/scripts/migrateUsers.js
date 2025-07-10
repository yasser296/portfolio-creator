// backend/scripts/migrateUsers.js
// Script pour migrer les utilisateurs existants

const bcrypt = require('bcrypt');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'portfolio_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD
});

// Option 1: Générer des mots de passe temporaires
// async function generateTemporaryPasswords() {
//   try {
//     console.log('🔄 Génération des mots de passe temporaires...\n');
    
//     // Récupérer tous les utilisateurs sans mot de passe
//     const result = await pool.query(
//       'SELECT id, name, email FROM users WHERE password IS NULL'
//     );
    
//     const users = result.rows;
//     console.log(`📊 ${users.length} utilisateurs à migrer\n`);
    
//     const passwords = [];
    
//     for (const user of users) {
//       // Générer un mot de passe temporaire
//       const tempPassword = `Temp${user.email.split('@')[0]}2025!`;
      
//       // Hasher le mot de passe
//       const hashedPassword = await bcrypt.hash(tempPassword, 10);
      
//       // Mettre à jour l'utilisateur
//       await pool.query(
//         'UPDATE users SET password = $1 WHERE id = $2',
//         [hashedPassword, user.id]
//       );
      
//       passwords.push({
//         name: user.name,
//         email: user.email,
//         tempPassword: tempPassword
//       });
      
//       console.log(`✅ ${user.name} (${user.email}) - Mot de passe généré`);
//     }
    
//     // Sauvegarder les mots de passe dans un fichier
//     const fs = require('fs');
//     fs.writeFileSync(
//       'temporary-passwords.txt',
//       '=== MOTS DE PASSE TEMPORAIRES ===\n\n' +
//       'IMPORTANT: Communiquez ces mots de passe aux utilisateurs de manière sécurisée.\n' +
//       'Ils devront les changer lors de leur première connexion.\n\n' +
//       passwords.map(p => `${p.name}\nEmail: ${p.email}\nMot de passe: ${p.tempPassword}\n`).join('\n---\n\n')
//     );
    
//     console.log('\n✅ Migration terminée !');
//     console.log('📄 Les mots de passe ont été sauvegardés dans temporary-passwords.txt');
    
//   } catch (error) {
//     console.error('❌ Erreur:', error);
//   } finally {
//     await pool.end();
//   }
// }

// Option 2: Créer un système de réinitialisation par token
async function generateResetTokens() {
  try {
    console.log('🔄 Génération des tokens de réinitialisation...\n');
    
    const crypto = require('crypto');
    
    // Récupérer tous les utilisateurs sans mot de passe
    const result = await pool.query(
      'SELECT id, name, email FROM users WHERE password IS NULL'
    );
    
    const users = result.rows;
    const resetLinks = [];
    
    for (const user of users) {
      // Générer un token unique
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 jours
      
      // Sauvegarder le token
      await pool.query(
        'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3',
        [resetToken, expires, user.id]
      );
      
      resetLinks.push({
        name: user.name,
        email: user.email,
        resetLink: `http://localhost:3000/reset-password?token=${resetToken}`
      });
      
      console.log(`✅ ${user.name} (${user.email}) - Token généré`);
    }
    
    // Sauvegarder les liens
    const fs = require('fs');
    fs.writeFileSync(
      'reset-links.txt',
      '=== LIENS DE RÉINITIALISATION ===\n\n' +
      'Envoyez ces liens aux utilisateurs pour qu\'ils créent leur mot de passe.\n' +
      'Les liens expirent dans 7 jours.\n\n' +
      resetLinks.map(r => `${r.name}\nEmail: ${r.email}\nLien: ${r.resetLink}\n`).join('\n---\n\n')
    );
    
    console.log('\n✅ Tokens générés !');
    console.log('📄 Les liens ont été sauvegardés dans reset-links.txt');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await pool.end();
  }
}

// Option 3: Définir un mot de passe par défaut pour tous
// async function setDefaultPassword() {
//   try {
//     const defaultPassword = 'ChangeMe2025!';
//     const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    
//     const result = await pool.query(
//       'UPDATE users SET password = $1 WHERE password IS NULL RETURNING id, name, email',
//       [hashedPassword]
//     );
    
//     console.log(`✅ ${result.rowCount} utilisateurs mis à jour`);
//     console.log(`📝 Mot de passe par défaut: ${defaultPassword}`);
//     console.log('\n⚠️  IMPORTANT: Demandez aux utilisateurs de changer ce mot de passe !');
    
//   } catch (error) {
//     console.error('❌ Erreur:', error);
//   } finally {
//     await pool.end();
//   }
// }

// // Menu principal
// const readline = require('readline');
// const rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout
// });

// console.log('\n🔐 MIGRATION DES UTILISATEURS EXISTANTS\n');
// console.log('Choisissez une option:');
// console.log('1. Générer des mots de passe temporaires uniques');
// console.log('2. Générer des tokens de réinitialisation');
// console.log('3. Définir un mot de passe par défaut pour tous');
// console.log('4. Annuler\n');

// rl.question('Votre choix (1-4): ', async (answer) => {
//   switch(answer) {
//     case '1':
//       await generateTemporaryPasswords();
//       break;
//     case '2':
//       await generateResetTokens();
//       break;
//     case '3':
//       await setDefaultPassword();
//       break;
//     default:
//       console.log('Migration annulée');
//   }
//   rl.close();
//   process.exit(0);
// });

// Pour exécuter : node backend/scripts/migrateUsers.js