/**
 * Centralized application configuration.
 * All process.env reads live here — nowhere else.
 */
const config = {
  port: process.env.PORT || 3000,

  database: {
    url: process.env.MONGODB_URI,
    options: {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 20000,
    },
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '7d',
  },

  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASS,
  },
};

export default config;
