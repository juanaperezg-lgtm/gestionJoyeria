const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all sales
router.get('/', async (req, res) => {
  try {
    const sales = await prisma.sale.findMany({
      include: {
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: { date: 'desc' }
    });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create sale (and update inventory)
router.post('/', async (req, res) => {
  const { totalAmount, items, clientName, paymentMethod } = req.body;
  
  try {
    // Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'La venta debe tener al menos un artículo.' });
    }
    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({ error: 'El monto total debe ser mayor a 0.' });
    }

    // Verify stock availability for all items
    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) {
        return res.status(404).json({ error: `Producto con ID ${item.productId} no encontrado.` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          error: `Stock insuficiente para "${product.name}". Disponible: ${product.stock}, Solicitado: ${item.quantity}` 
        });
      }
    }

    // We use a transaction to ensure both the sale is created and inventory is updated correctly
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the sale
      const sale = await tx.sale.create({
        data: {
          totalAmount,
          clientName: clientName || 'Cliente en Tienda',
          paymentMethod: paymentMethod || 'Efectivo',
          items: {
            create: items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              priceAtSale: item.priceAtSale
            }))
          }
        },
        include: { 
          items: {
            include: { product: true }
          }
        }
      });

      // 2. Decrease stock for each item
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        });
      }

      return sale;
    });

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete sale (and restore inventory)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const sale = await prisma.sale.findUnique({
      where: { id: Number(id) },
      include: { items: true }
    });

    if (!sale) {
      return res.status(404).json({ error: 'Venta no encontrada.' });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Restore stock for each item
      for (const item of sale.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity
            }
          }
        });
      }

      // 2. Delete the sale (cascade deletes SaleItems)
      await tx.sale.delete({
        where: { id: Number(id) }
      });
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
