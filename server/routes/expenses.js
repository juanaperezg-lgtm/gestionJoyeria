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
    
    if (amount === undefined || !description || !category) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const expense = await prisma.expense.create({
      data: {
        amount: parseFloat(amount),
        description,
        category,
        date: date ? new Date(date) : undefined
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
    
    const parsedData = {};
    if (amount !== undefined) parsedData.amount = parseFloat(amount);
    if (description) parsedData.description = description;
    if (category) parsedData.category = category;
    if (date) parsedData.date = new Date(date);

    const expense = await prisma.expense.update({
      where: { id: Number(id) },
      data: parsedData,
    });
    res.json(expense);
  } catch (error) {
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
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
