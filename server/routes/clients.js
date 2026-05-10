const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all clients
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    
    let whereClause = {};
    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } }
      ];
    }

    const clients = await prisma.client.findMany({
      where: whereClause,
      include: {
        _count: { select: { sales: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create client
router.post('/', async (req, res) => {
  try {
    const { name, phone, email, notes } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'El nombre es obligatorio.' });
    }

    const client = await prisma.client.create({
      data: {
        name,
        phone: phone || null,
        email: email || null,
        notes: notes || null
      }
    });
    res.status(201).json(client);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update client
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email, notes } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'El nombre es obligatorio.' });
    }

    const client = await prisma.client.update({
      where: { id: Number(id) },
      data: {
        name,
        phone: phone || null,
        email: email || null,
        notes: notes || null
      }
    });
    res.json(client);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Cliente no encontrado.' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Delete client
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if client has associated sales
    const salesCount = await prisma.sale.count({
      where: { clientId: Number(id) }
    });

    if (salesCount > 0) {
      return res.status(409).json({
        error: `No se puede eliminar este cliente porque tiene ${salesCount} venta(s) asociada(s).`
      });
    }

    await prisma.client.delete({
      where: { id: Number(id) }
    });
    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Cliente no encontrado.' });
    }
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
