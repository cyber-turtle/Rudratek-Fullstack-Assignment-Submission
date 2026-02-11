const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Project = require('../models/Project');
const { z } = require('zod');

// Zod schemas for validation
const projectSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  status: z.enum(['active', 'on_hold', 'completed']).optional(),
  clientName: z.string().min(1, 'Client name is required'),
  budget: z.number().min(0).optional(),
}).refine(data => !data.endDate || data.endDate >= data.startDate, {
  message: "End date must be after start date",
  path: ["endDate"],
});

const statusUpdateSchema = z.object({
  status: z.enum(['active', 'on_hold', 'completed']),
});

// @desc    Create a new project
// @route   POST /projects
router.post('/', async (req, res) => {
  try {
    const validatedData = projectSchema.parse(req.body);
    const project = await Project.create(validatedData);
    res.status(201).json(project);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(400).json({ message: error.message });
  }
});

// @desc    Get all projects (with filtering, sorting, searching)
// @route   GET /projects
router.get('/', async (req, res) => {
  try {
    const { status, search, sort } = req.query;
    let where = {};

    // Filtering by Status (e.g., ?status=active)
    if (status) {
      where.status = status;
    }

    // Joint Search: Matches project name OR client name (Case-Insensitive)
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { clientName: { [Op.iLike]: `%${search}%` } },
      ];
    }

    // Sorting
    let order = [['createdAt', 'DESC']]; // Default sort
    if (sort === 'startDate') {
      order = [['startDate', 'ASC']];
    } else if (sort === '-startDate') {
      order = [['startDate', 'DESC']];
    } else if (sort === 'createdAt') {
      order = [['createdAt', 'ASC']];
    }

    const projects = await Project.findAll({ where, order });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get single project by ID
// @route   GET /projects/:id
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update project status
// @route   PATCH /projects/:id/status
router.patch('/:id/status', async (req, res) => {
  try {
    // Validate request body using Zod
    const { status: newStatus } = statusUpdateSchema.parse(req.body);
    
    // Find project to check current status
    const project = await Project.findByPk(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const currentStatus = project.status;

    // State Transition Logic Enforcement
    let isValidTransition = false;
    
    // Active can move to On Hold or Completed
    if (currentStatus === 'active' && (newStatus === 'on_hold' || newStatus === 'completed')) isValidTransition = true;
    
    // On Hold can move back to Active or to Completed
    if (currentStatus === 'on_hold' && (newStatus === 'active' || newStatus === 'completed')) isValidTransition = true;
    
    // Completed is a terminal state
    if (currentStatus === 'completed') isValidTransition = false; 

    // Idempotency: same status = no-op
    if (currentStatus === newStatus) isValidTransition = true;

    if (!isValidTransition) {
      return res.status(400).json({ 
        message: `Invalid status transition from '${currentStatus}' to '${newStatus}'. Completed projects cannot be reopened.` 
      });
    }

    // Persist status change to PostgreSQL
    project.status = newStatus;
    await project.save();
    res.json(project);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete project
// @route   DELETE /projects/:id
router.delete('/:id', async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await project.destroy();
    res.json({ message: 'Project removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
