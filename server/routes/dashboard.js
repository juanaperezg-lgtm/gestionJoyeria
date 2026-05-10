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

    // Previous month bounds
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const prevMonthlyExpenses = await prisma.expense.aggregate({
      _sum: { amount: true },
      where: { date: { gte: startOfPrevMonth, lte: endOfPrevMonth } }
    });

    const prevMonthlySales = await prisma.sale.aggregate({
      _sum: { totalAmount: true },
      where: { date: { gte: startOfPrevMonth, lte: endOfPrevMonth } }
    });

    const currentSales = monthlySales._sum.totalAmount || 0;
    const currentExpenses = monthlyExpenses._sum.amount || 0;
    const prevSales = prevMonthlySales._sum.totalAmount || 0;
    const prevExpenses = prevMonthlyExpenses._sum.amount || 0;

    const salesTrend = prevSales === 0 ? (currentSales > 0 ? 100 : 0) : ((currentSales - prevSales) / prevSales) * 100;
    const expensesTrend = prevExpenses === 0 ? (currentExpenses > 0 ? 100 : 0) : ((currentExpenses - prevExpenses) / prevExpenses) * 100;

    const currentProfit = currentSales - currentExpenses;
    const prevProfit = prevSales - prevExpenses;
    const profitTrend = prevProfit === 0 ? (currentProfit > 0 ? 100 : (currentProfit < 0 ? -100 : 0)) : ((currentProfit - prevProfit) / Math.abs(prevProfit)) * 100;

    // Last 7 days sales for chart
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const last7DaysSalesRaw = await prisma.sale.findMany({
        where: { date: { gte: sevenDaysAgo } },
        select: { date: true, totalAmount: true }
    });

    // Aggregate by day
    const chartDataMap = {};
    for (let i = 0; i < 7; i++) {
        const d = new Date(sevenDaysAgo);
        d.setDate(d.getDate() + i);
        const dateStr = d.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric' });
        chartDataMap[dateStr] = 0;
    }

    last7DaysSalesRaw.forEach(sale => {
        const d = new Date(sale.date);
        const dateStr = d.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric' });
        if (chartDataMap[dateStr] !== undefined) {
            chartDataMap[dateStr] += sale.totalAmount;
        }
    });

    const chartData = Object.keys(chartDataMap).map(day => ({
        day,
        amount: chartDataMap[day]
    }));

    // 6. Total products
    const totalProducts = await prisma.product.count();

    const totalSales = salesAgg._sum.totalAmount || 0;
    const totalExpenses = expensesAgg._sum.amount || 0;

    res.json({
      totalSales: currentSales, // Make Dashboard show monthly by default
      totalExpenses: currentExpenses,
      netProfit: currentProfit,
      salesTrend,
      expensesTrend,
      profitTrend,
      totalSalesCount: salesAgg._count,
      totalProducts,
      lowStockCount: lowStockProducts.length,
      lowStockProducts,
      monthlyExpenses: currentExpenses,
      monthlySales: currentSales,
      monthlySalesCount: monthlySales._count,
      chartData
    });

  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
