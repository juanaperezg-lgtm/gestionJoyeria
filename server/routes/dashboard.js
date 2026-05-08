const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
    // 1. Total Sales (Current Month)
    const currentMonthSales = await prisma.sale.aggregate({
      where: { date: { gte: startOfMonth } },
      _sum: { totalAmount: true },
    });
    
    // Total Sales (Previous Month)
    const prevMonthSales = await prisma.sale.aggregate({
      where: { date: { gte: startOfPrevMonth, lt: startOfMonth } },
      _sum: { totalAmount: true },
    });

    // 2. Total Expenses (Current Month)
    const currentMonthExpenses = await prisma.expense.aggregate({
      where: { date: { gte: startOfMonth } },
      _sum: { amount: true },
    });
    
    // Total Expenses (Previous Month)
    const prevMonthExpenses = await prisma.expense.aggregate({
      where: { date: { gte: startOfPrevMonth, lt: startOfMonth } },
      _sum: { amount: true },
    });

    // 3. Low stock products
    const lowStockProducts = await prisma.product.findMany({
      where: { stock: { lt: 5 } },
      take: 5,
    });
    
    const lowStockCount = await prisma.product.count({
      where: { stock: { lt: 5 } }
    });

    // 4. Clients count
    const totalClients = await prisma.client.count();

    // Calculate trends
    const salesCurrent = currentMonthSales._sum.totalAmount || 0;
    const salesPrev = prevMonthSales._sum.totalAmount || 0;
    const salesTrend = salesPrev === 0 ? 100 : ((salesCurrent - salesPrev) / salesPrev) * 100;

    const expensesCurrent = currentMonthExpenses._sum.amount || 0;
    const expensesPrev = prevMonthExpenses._sum.amount || 0;
    const expensesTrend = expensesPrev === 0 ? 100 : ((expensesCurrent - expensesPrev) / expensesPrev) * 100;

    const netProfitCurrent = salesCurrent - expensesCurrent;
    const netProfitPrev = salesPrev - expensesPrev;
    const profitTrend = netProfitPrev === 0 ? 100 : ((netProfitCurrent - netProfitPrev) / Math.abs(netProfitPrev)) * 100;

    res.json({
      totalSales: salesCurrent,
      salesTrend: salesTrend,
      totalExpenses: expensesCurrent,
      expensesTrend: expensesTrend,
      netProfit: netProfitCurrent,
      profitTrend: profitTrend,
      lowStockCount: lowStockCount,
      lowStockProducts,
      totalClients
    });

  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
