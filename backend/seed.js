// This simple script is to inject data into the database

const dotenv = require('dotenv');
dotenv.config();

const { connectDB } = require('./database');
const Project = require('./models/Project');

const projects = [
  {
    name: 'Website Redesign',
    description: 'Complete overhaul of the corporate website with new branding.',
    startDate: '2024-01-15',
    endDate: '2024-03-30',
    status: 'active',
    clientName: 'Acme Corp',
    budget: 15000,
  },
  {
    name: 'Mobile App Development',
    description: 'iOS and Android app for customer loyalty program.',
    startDate: '2023-11-01',
    endDate: '2024-02-28',
    status: 'on_hold',
    clientName: 'Retail Giants',
    budget: 45000,
  },
  {
    name: 'Internal Dashboard',
    description: 'Analytics dashboard for internal sales team.',
    startDate: '2023-09-01',
    endDate: '2023-12-15',
    status: 'completed',
    clientName: 'Sales Dept',
    budget: 8000,
  },
  {
    name: 'API Migration',
    description: 'Migrating legacy REST API to GraphQL.',
    startDate: '2024-02-01',
    status: 'active',
    clientName: 'TechStart Inc',
    budget: 12000,
  },
  {
    name: 'Cloud Infrastructure Setup',
    description: 'AWS setup with Terraform and Kubernetes.',
    startDate: '2024-03-10',
    status: 'active',
    clientName: 'FinTech Solutions',
    budget: 25000,
  },
];

const seedData = async () => {
  try {
    await connectDB();
    await Project.destroy({ where: {}, truncate: true });
    console.log('Data destroyed.');

    await Project.bulkCreate(projects);
    console.log('Data imported!');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

seedData();
