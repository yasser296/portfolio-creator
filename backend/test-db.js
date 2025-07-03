import pkg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pkg;
dotenv.config();

// Configuration de la connexion à PostgreSQL
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'portfolio_db',
  max: 20, // nombre maximum de clients dans le pool
  idleTimeoutMillis: 30000, // temps d'attente avant fermeture d'une connexion inactive
  connectionTimeoutMillis: 2000, // temps d'attente pour obtenir une connexion
};

// Créer le pool de connexions
const pool = new Pool(dbConfig);

async function testConnection() {
  try {
    console.log('🔌 Test de connexion à PostgreSQL...');
    
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    
    console.log('✅ Connexion PostgreSQL réussie !');
    console.log('📅 Timestamp:', result.rows[0].current_time);
    console.log('🗄️  Version:', result.rows[0].pg_version.split(' ')[0] + ' ' + result.rows[0].pg_version.split(' ')[1]);
    
    client.release();
    await pool.end();
    
    console.log('🎉 Test terminé avec succès !');
  } catch (error) {
    console.error('❌ Erreur de connexion à PostgreSQL:');
    console.error('📝 Message:', error.message);
    
    if (error.code === 'ENOTFOUND') {
      console.error('💡 Vérifiez que PostgreSQL est démarré');
    } else if (error.code === '28P01') {
      console.error('💡 Vérifiez votre mot de passe dans .env');
    } else if (error.code === '3D000') {
      console.error('💡 La base de données portfolio_db n\'existe pas encore');
    }
  }
}

testConnection();