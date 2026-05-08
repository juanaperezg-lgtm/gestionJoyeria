const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all products
router.get('/', async (req, res) => {
  try {
    const { search, category } = req.query;
    
    let whereClause = {};
    
    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { sku: { contains: search } }
      ];
    }
    
    if (category) {
      whereClause.category = category;
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create product
router.post('/', async (req, res) => {
  try {
    const { sku, name, price, cost, category } = req.body;
    
    if (!sku || !name || price === undefined || cost === undefined || !category) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    // Convert string to float/int if needed from frontend
    const parsedData = {
      ...req.body,
      price: parseFloat(price),
      cost: parseFloat(cost),
      stock: req.body.stock ? parseInt(req.body.stock, 10) : 0
    };

    const product = await prisma.product.create({
      data: parsedData,
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update product
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const parsedData = { ...req.body };
    if (parsedData.price !== undefined) parsedData.price = parseFloat(parsedData.price);
    if (parsedData.cost !== undefined) parsedData.cost = parseFloat(parsedData.cost);
    if (parsedData.stock !== undefined) parsedData.stock = parseInt(parsedData.stock, 10);

    const product = await prisma.product.update({
      where: { id: Number(id) },
      data: parsedData,
    });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete product
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.product.delete({
      where: { id: Number(id) },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
