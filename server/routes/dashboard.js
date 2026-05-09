const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get dashboard stats
router.get('/stats', async (req, res) => {
  try {
    // 1. Total Sales Amount
    const salesAgg = await prisma.sale.aggregate({
      _sum: {
        totalAmount: true,
      },
      _count: true
    });
    
    // 2. Total Expenses Amount
    const expensesAgg = await prisma.expense.aggregate({
      _sum: {
        amount: true,
      },
    });

    // 3. Monthly expenses (current month)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    
    const monthlyExpenses = await prisma.expense.aggregate({
      _sum: { amount: true },
      where: {
        date: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      }
    });

    // 4. Monthly sales (current month)
    const monthlySales = await prisma.sale.aggregate({
      _sum: { totalAmount: true },
      _count: true,
      where: {
        date: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      }
    });

    // 5. Low stock products (less than 5)
    const lowStockProducts = await prisma.product.findMany({
      where: {
        stock: {
          lt: 5,
        },
      },
      orderBy: { stock: 'asc' },
      take: 10,
    });

    // 6. Total products
    const totalProducts = await prisma.product.count();

    const totalSales = salesAgg._sum.totalAmount || 0;
    const totalExpenses = expensesAgg._sum.amount || 0;

    res.json({
      totalSales,
      totalExpenses,
      netProfit: totalSales - totalExpenses,
      totalSalesCount: salesAgg._count,
      totalProducts,
      lowStockCount: lowStockProducts.length,
      lowStockProducts,
      monthlyExpenses: monthlyExpenses._sum.amount || 0,
      monthlySales: monthlySales._sum.totalAmount || 0,
      monthlySalesCount: monthlySales._count,
    });

  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
