import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Package } from 'lucide-react';
import Card from '../components/UI/Card';
import './Dashboard.css';

const Dashboard = () => {
  const [statsData, setStatsData] = useState({
    totalSales: 0,
    totalExpenses: 0,
    netProfit: 0,
    lowStockCount: 0
  });
  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, salesRes] = await Promise.all([
          fetch('/api/dashboard/stats'),
          fetch('/api/sales')
        ]);
        
        const stats = await statsRes.json();
        const sales = await salesRes.json();
        
        setStatsData(stats);
        setRecentSales(sales.slice(0, 5)); // Mostrar solo las últimas 5 ventas
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = [
    { title: 'Ingresos Totales', value: `$${(statsData.totalSales || 0).toFixed(2)}`, icon: <DollarSign size={24} />, trend: 'Actual', isPositive: true },
    { title: 'Ventas Registradas', value: recentSales.length.toString(), icon: <TrendingUp size={24} />, trend: 'Este mes', isPositive: true },
    { title: 'Gastos', value: `$${(statsData.totalExpenses || 0).toFixed(2)}`, icon: <TrendingDown size={24} />, trend: 'Actual', isPositive: false },
    { title: 'Joyas con Bajo Stock', value: statsData.lowStockCount.toString(), icon: <Package size={24} />, trend: 'Atención', isPositive: statsData.lowStockCount === 0 },
  ];

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1 className="page-title">Resumen Financiero</h1>
        <p className="page-subtitle">Bienvenido de nuevo a Aura Joyeros.</p>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <Card key={index} className="stat-card">
            <div className="stat-icon-wrapper">
              {stat.icon}
            </div>
            <div className="stat-info">
              <span className="stat-title">{stat.title}</span>
              <h3 className="stat-value">{stat.value}</h3>
              <span className={`stat-trend ${stat.isPositive ? 'positive' : 'negative'}`}>
                {stat.trend} desde el mes pasado
              </span>
            </div>
          </Card>
        ))}
      </div>

      <div className="dashboard-content">
        <Card className="recent-sales-card">
          <div className="card-header">
            <h3>Ventas Recientes</h3>
            <button className="btn-outline" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>Ver todas</button>
          </div>
          <div className="table-responsive">
            <table className="luxury-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Artículo</th>
                  <th>Cliente</th>
                  <th>Fecha</th>
                  <th>Monto</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map((sale) => (
                  <tr key={sale.id}>
                    <td>#{sale.id}</td>
                    <td className="text-gold">
                      {sale.items?.map(i => `${i.product?.name}`).join(', ')}
                    </td>
                    <td>Cliente Tienda</td>
                    <td className="text-muted">{new Date(sale.date).toLocaleDateString()}</td>
                    <td className="font-serif font-bold">${sale.totalAmount?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
