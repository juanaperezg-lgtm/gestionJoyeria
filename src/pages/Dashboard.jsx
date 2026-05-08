import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Package, Users, ArrowUp, ArrowDown } from 'lucide-react';
import Card from '../components/UI/Card';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const [statsData, setStatsData] = useState({
    totalSales: 0,
    salesTrend: 0,
    totalExpenses: 0,
    expensesTrend: 0,
    netProfit: 0,
    profitTrend: 0,
    lowStockCount: 0,
    lowStockProducts: [],
    totalClients: 0
  });
  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, salesRes] = await Promise.all([
          fetch('/api/dashboard/stats'),
          fetch('/api/sales')
        ]);

        const stats = await statsRes.json();
        const sales = await salesRes.json();

        if (stats && !stats.error) {
          setStatsData(stats);
        }

        if (Array.isArray(sales)) {
          setRecentSales(sales.slice(0, 5));
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const TrendBadge = ({ value }) => {
    const isPositive = value >= 0;
    return (
      <span className={`stat-trend ${isPositive ? 'positive' : 'negative'}`}>
        {isPositive ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
        {Math.abs(value).toFixed(1)}% vs mes anterior
      </span>
    );
  };

  const stats = [
    {
      title: 'Ventas del Mes',
      value: `$${(statsData.totalSales || 0).toFixed(2)}`,
      icon: <DollarSign size={24} />,
      trend: statsData.salesTrend || 0,
      isPositive: (statsData.salesTrend || 0) >= 0,
      color: 'var(--color-gold)'
    },
    {
      title: 'Ganancia Neta',
      value: `$${(statsData.netProfit || 0).toFixed(2)}`,
      icon: <TrendingUp size={24} />,
      trend: statsData.profitTrend || 0,
      isPositive: (statsData.netProfit || 0) >= 0,
      color: (statsData.netProfit || 0) >= 0 ? 'var(--color-success)' : 'var(--color-danger)'
    },
    {
      title: 'Gastos del Mes',
      value: `$${(statsData.totalExpenses || 0).toFixed(2)}`,
      icon: <TrendingDown size={24} />,
      trend: statsData.expensesTrend || 0,
      isPositive: (statsData.expensesTrend || 0) <= 0,
      color: 'var(--color-danger)'
    },
    {
      title: 'Bajo Stock',
      value: statsData.lowStockCount?.toString() || '0',
      icon: <Package size={24} />,
      trend: null,
      isPositive: (statsData.lowStockCount || 0) === 0,
      color: (statsData.lowStockCount || 0) > 0 ? '#e6a817' : 'var(--color-success)'
    },
  ];

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1 className="page-title">Resumen del Negocio</h1>
        <p className="page-subtitle">Bienvenido de nuevo a Aura Joyeros — {new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {loading ? (
        <LoadingSpinner size={50} />
      ) : (
        <>
          {/* Stats Grid */}
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <Card key={index} className="stat-card">
                <div className="stat-icon-wrapper" style={{ backgroundColor: `${stat.color}18`, color: stat.color }}>
                  {stat.icon}
                </div>
                <div className="stat-info">
                  <span className="stat-title">{stat.title}</span>
                  <h3 className="stat-value font-serif" style={{ color: stat.color }}>{stat.value}</h3>
                  {stat.trend !== null ? (
                    <TrendBadge value={stat.trend} />
                  ) : (
                    <span className={`stat-trend ${stat.isPositive ? 'positive' : 'negative'}`}>
                      {stat.isPositive ? 'Stock normal' : `${stat.value} joyas requieren atención`}
                    </span>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* Dashboard Body */}
          <div className="dashboard-content">
            {/* Recent Sales */}
            <Card className="recent-sales-card">
              <div className="card-header">
                <h3>Ventas Recientes</h3>
                <button className="btn-outline" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => navigate('/sales')}>
                  Ver todas
                </button>
              </div>
              <div className="table-responsive">
                {recentSales.length === 0 ? (
                  <p style={{ padding: '20px', color: 'var(--text-secondary)', textAlign: 'center' }}>
                    No hay ventas registradas aún.
                  </p>
                ) : (
                  <table className="luxury-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Artículo(s)</th>
                        <th>Cliente</th>
                        <th>Fecha</th>
                        <th>Monto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentSales.map((sale) => (
                        <tr key={sale.id}>
                          <td className="text-muted">#{sale.id}</td>
                          <td className="text-gold" style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {sale.items?.map(i => i.product?.name).join(', ') || '—'}
                          </td>
                          <td>{sale.client?.name || 'Cliente Tienda'}</td>
                          <td className="text-muted">{new Date(sale.date).toLocaleDateString('es-CO')}</td>
                          <td className="font-serif font-bold text-gold">${sale.totalAmount?.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </Card>

            {/* Low Stock Alert */}
            {statsData.lowStockProducts && statsData.lowStockProducts.length > 0 && (
              <Card style={{ borderColor: 'rgba(230, 168, 23, 0.3)' }}>
                <div className="card-header">
                  <h3 style={{ color: '#e6a817' }}>⚠️ Joyas con Bajo Stock</h3>
                  <button className="btn-outline" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => navigate('/inventory')}>
                    Ver inventario
                  </button>
                </div>
                <div className="table-responsive">
                  <table className="luxury-table">
                    <thead>
                      <tr>
                        <th>SKU</th>
                        <th>Nombre</th>
                        <th>Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statsData.lowStockProducts.map((p) => (
                        <tr key={p.id}>
                          <td className="text-muted">{p.sku}</td>
                          <td className="font-bold">{p.name}</td>
                          <td>
                            <span className="stock-badge low">{p.stock} unidades</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
