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
  const { totalAmount, items } = req.body;
  
  try {
    // We use a transaction to ensure both the sale is created and inventory is updated correctly
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the sale
      const sale = await tx.sale.create({
        data: {
          totalAmount,
          items: {
            create: items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              priceAtSale: item.priceAtSale
            }))
          }
        },
        include: { items: true }
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

module.exports = router;
