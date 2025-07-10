// backend/scripts/insertSkills.mjs
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: 'postgresql://postgres:jUPFKksxhRBKqOjXKYcZYhwAPYkSNRbi@shinkansen.proxy.rlwy.net:25327/railway',
  ssl: { rejectUnauthorized: false }
});

async function insertSkills() {
  try {
    await pool.query(`
      INSERT INTO skills_reference (category, skill_name, icon_name) VALUES
      -- Frontend
      ('Frontend', 'React', 'Code'),
      ('Frontend', 'Vue.js', 'Code'),
      ('Frontend', 'Angular', 'Code'),
      ('Frontend', 'TypeScript', 'Code'),
      ('Frontend', 'JavaScript', 'Code'),
      ('Frontend', 'HTML5', 'Code'),
      ('Frontend', 'CSS3', 'Code'),
      ('Frontend', 'Sass/SCSS', 'Code'),
      ('Frontend', 'Tailwind CSS', 'Code'),
      ('Frontend', 'Bootstrap', 'Code'),
      ('Frontend', 'Material-UI', 'Code'),
      ('Frontend', 'Next.js', 'Code'),
      ('Frontend', 'Gatsby', 'Code'),
      ('Frontend', 'Redux', 'Code'),
      ('Frontend', 'Webpack', 'Code'),

      -- Backend
      ('Backend', 'Node.js', 'Server'),
      ('Backend', 'Express.js', 'Server'),
      ('Backend', 'Python', 'Server'),
      ('Backend', 'Django', 'Server'),
      ('Backend', 'Flask', 'Server'),
      ('Backend', 'Java', 'Server'),
      ('Backend', 'Spring Boot', 'Server'),
      ('Backend', 'PHP', 'Server'),
      ('Backend', 'Laravel', 'Server'),
      ('Backend', 'Ruby on Rails', 'Server'),
      ('Backend', 'C#', 'Server'),
      ('Backend', '.NET Core', 'Server'),
      ('Backend', 'GraphQL', 'Server'),
      ('Backend', 'REST API', 'Server'),
      ('Backend', 'Microservices', 'Server'),

      -- Base de données
      ('Base de données', 'PostgreSQL', 'Database'),
      ('Base de données', 'MySQL', 'Database'),
      ('Base de données', 'MongoDB', 'Database'),
      ('Base de données', 'Redis', 'Database'),
      ('Base de données', 'SQLite', 'Database'),
      ('Base de données', 'Oracle', 'Database'),
      ('Base de données', 'SQL Server', 'Database'),
      ('Base de données', 'Cassandra', 'Database'),
      ('Base de données', 'Elasticsearch', 'Database'),

      -- DevOps
      ('DevOps', 'Docker', 'Package'),
      ('DevOps', 'Kubernetes', 'Package'),
      ('DevOps', 'AWS', 'Cloud'),
      ('DevOps', 'Google Cloud', 'Cloud'),
      ('DevOps', 'Azure', 'Cloud'),
      ('DevOps', 'CI/CD', 'Settings'),
      ('DevOps', 'Jenkins', 'Settings'),
      ('DevOps', 'GitHub Actions', 'Settings'),
      ('DevOps', 'GitLab CI', 'Settings'),
      ('DevOps', 'Terraform', 'Settings'),
      ('DevOps', 'Ansible', 'Settings'),

      -- Mobile
      ('Mobile', 'React Native', 'Smartphone'),
      ('Mobile', 'Flutter', 'Smartphone'),
      ('Mobile', 'Swift', 'Smartphone'),
      ('Mobile', 'Kotlin', 'Smartphone'),
      ('Mobile', 'Ionic', 'Smartphone'),

      -- Outils
      ('Outils', 'Git', 'GitBranch'),
      ('Outils', 'GitHub', 'GitBranch'),
      ('Outils', 'GitLab', 'GitBranch'),
      ('Outils', 'Bitbucket', 'GitBranch'),
      ('Outils', 'Jira', 'Trello'),
      ('Outils', 'Confluence', 'FileText'),
      ('Outils', 'Slack', 'MessageSquare'),
      ('Outils', 'VS Code', 'Code'),
      ('Outils', 'IntelliJ IDEA', 'Code'),
      ('Outils', 'Postman', 'Send'),
      ('Outils', 'Figma', 'Palette'),
      ('Outils', 'Adobe XD', 'Palette')
      ON CONFLICT DO NOTHING;
    `);
    console.log('✅ Données insérées avec succès');
  } catch (err) {
    console.error('❌ Erreur insertion :', err.message);
  } finally {
    await pool.end();
  }
}

insertSkills();

