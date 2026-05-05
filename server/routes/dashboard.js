const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get dashboard stats
router.get('/stats', async (req, res) => {
  try {
    // 1. Total Sales
    const sales = await prisma.sale.aggregate({
      _sum: {
        totalAmount: true,
      },
    });
    
    // 2. Total Expenses
    const expenses = await prisma.expense.aggregate({
      _sum: {
        amount: true,
      },
    });

    // 3. Low stock products (e.g. less than 5)
    const lowStockProducts = await prisma.product.findMany({
      where: {
        stock: {
          lt: 5,
        },
      },
      take: 5,
    });

    res.json({
      totalSales: sales._sum.totalAmount || 0,
      totalExpenses: expenses._sum.amount || 0,
      netProfit: (sales._sum.totalAmount || 0) - (expenses._sum.amount || 0),
      lowStockCount: lowStockProducts.length,
      lowStockProducts,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
