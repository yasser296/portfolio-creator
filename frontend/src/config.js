const config = {
  API_URL: 'https://portfolio-creator-production.up.railway.app',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production'
};

export default config;