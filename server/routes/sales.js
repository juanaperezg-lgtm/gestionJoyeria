const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all sales
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate, status, clientId, paymentMethod } = req.query;
    
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
    
    if (status) whereClause.status = status;
    if (paymentMethod) whereClause.paymentMethod = paymentMethod;
    if (clientId) whereClause.clientId = parseInt(clientId, 10);

    const sales = await prisma.sale.findMany({
      where: whereClause,
      include: {
        items: {
          include: {
            product: true
          }
        },
        client: true
      },
      orderBy: { date: 'desc' }
    });
    res.json(sales);
  } catch (error) {
    console.error("Get Sales Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Create sale (and update inventory)
router.post('/', async (req, res) => {
  const { totalAmount, items, paymentMethod, status, clientId } = req.body;
  
  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'La venta debe incluir al menos un producto.' });
  }

  try {
    // We use a transaction to ensure both the sale is created and inventory is updated correctly
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the sale
      const sale = await tx.sale.create({
        data: {
          totalAmount: parseFloat(totalAmount),
          paymentMethod: paymentMethod || "Efectivo",
          status: status || "Completado",
          clientId: clientId ? parseInt(clientId, 10) : null,
          items: {
            create: items.map(item => ({
              productId: parseInt(item.productId, 10),
              quantity: parseInt(item.quantity, 10),
              priceAtSale: parseFloat(item.priceAtSale)
            }))
          }
        },
        include: { items: true, client: true }
      });

      // 2. Decrease stock for each item
      for (const item of items) {
        await tx.product.update({
          where: { id: parseInt(item.productId, 10) },
          data: {
            stock: {
              decrement: parseInt(item.quantity, 10)
            }
          }
        });
      }

      return sale;
    });

    res.status(201).json(result);
  } catch (error) {
    console.error("Create Sale Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Delete (Cancel) sale and restore inventory
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.$transaction(async (tx) => {
      // Get sale items first
      const sale = await tx.sale.findUnique({
        where: { id: parseInt(id, 10) },
        include: { items: true }
      });

      if (!sale) {
        throw new Error("Venta no encontrada");
      }

      // Restore stock
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

      // Delete sale (Cascade will delete SaleItem due to schema)
      await tx.sale.delete({
        where: { id: parseInt(id, 10) }
      });
    });

    res.status(204).send();
  } catch (error) {
    console.error("Delete Sale Error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
