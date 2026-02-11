const { Sequelize } = require('sequelize');

const databaseUrl = process.env.DATABASE_URL || 'postgres://localhost:5432/project_tracker';

// Log the connection attempt (redacting sensitive parts)
const sanitizedUrl = databaseUrl.includes('@')
  ? databaseUrl.replace(/\/\/.*@/, '//****:****@')
  : databaseUrl;

console.log(`[DB] Connecting to: ${sanitizedUrl}`);

const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: databaseUrl.includes('railway')
    ? { ssl: { require: true, rejectUnauthorized: false } }
    : {},
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`[DB] PostgreSQL Connected`);
    await sequelize.sync(); // Auto-create tables
    console.log(`[DB] Tables synced`);
  } catch (error) {
    console.error(`[DB] Connection Error: ${error.message}`);
  }
};

module.exports = { sequelize, connectDB };
