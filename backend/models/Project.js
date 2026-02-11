const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const Project = sequelize.define('Project', {
  // Primary Key using UUID for security and frontend compatibility (_id)
  _id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  // Basic Project Information
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Project name is required' },
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      isDate: true,
    },
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    validate: {
      isAfterStart(value) {
        if (value && this.startDate && value < this.startDate) {
          throw new Error('End date must be after or equal to the start date');
        }
      },
    },
  },
  // Project Status with terminal 'completed' state logic
  status: {
    type: DataTypes.ENUM('active', 'on_hold', 'completed'),
    defaultValue: 'active',
  },
  // Business Metadata
  clientName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Client name is required' },
    },
  },
  // Extra field permitted by assignment (Budget Tracking)
  budget: {
    type: DataTypes.FLOAT,
    allowNull: true,
    validate: {
      min: { args: [0], msg: 'Budget cannot be negative' },
    },
  },
}, {
  timestamps: true, // adds createdAt and updatedAt
  tableName: 'projects',
});

module.exports = Project;
