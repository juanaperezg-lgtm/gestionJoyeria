const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all expenses
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;

    let whereClause = {};

    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) whereClause.date.gte = new Date(startDate);
      if (endDate) {
        let end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        whereClause.date.lte = end;
      }
    }

    if (category) whereClause.category = category;

    const expenses = await prisma.expense.findMany({
      where: whereClause,
      orderBy: { date: 'desc' }
    });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create expense
router.post('/', async (req, res) => {
  try {
    const { amount, description, category, date } = req.body;

    // Validation
    if (!description || !category || amount == null) {
      return res.status(400).json({ error: 'Los campos monto, descripción y categoría son obligatorios.' });
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ error: 'El monto debe ser un número mayor a 0.' });
    }

    const expense = await prisma.expense.create({
      data: {
        amount: numAmount,
        description,
        category,
        date: date ? new Date(date) : new Date()
      },
    });
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update expense
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, description, category, date } = req.body;

    // Validation
    if (!description || !category || amount == null) {
      return res.status(400).json({ error: 'Los campos monto, descripción y categoría son obligatorios.' });
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ error: 'El monto debe ser un número mayor a 0.' });
    }

    const expense = await prisma.expense.update({
      where: { id: Number(id) },
      data: {
        amount: numAmount,
        description,
        category,
        date: date ? new Date(date) : undefined
      },
    });
    res.json(expense);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Gasto no encontrado.' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Delete expense
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.expense.delete({
      where: { id: Number(id) },
    });
    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Gasto no encontrado.' });
    }
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
