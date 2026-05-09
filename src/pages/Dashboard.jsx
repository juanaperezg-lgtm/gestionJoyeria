import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, TrendingUp, TrendingDown, Package, Gem, AlertTriangle } from 'lucide-react';
import Card from '../components/UI/Card';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalSales: 0, totalExpenses: 0, netProfit: 0,
    lowStockCount: 0, totalSalesCount: 0, totalProducts: 0,
    monthlySales: 0, monthlyExpenses: 0, monthlySalesCount: 0,
    lowStockProducts: []
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
        if (statsRes.ok) setStats(await statsRes.json());
        if (salesRes.ok) {
          const sales = await salesRes.json();
          setRecentSales(sales.slice(0, 5));
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const cards = [
    { title: 'Ingresos Totales', value: `$${stats.totalSales.toFixed(2)}`, icon: <DollarSign size={24} />, sub: `${stats.totalSalesCount} ventas registradas`, pos: true },
    { title: 'Ganancia Neta', value: `$${stats.netProfit.toFixed(2)}`, icon: <TrendingUp size={24} />, sub: 'Ingresos - Gastos', pos: stats.netProfit >= 0 },
    { title: 'Gastos Totales', value: `$${stats.totalExpenses.toFixed(2)}`, icon: <TrendingDown size={24} />, sub: `$${stats.monthlyExpenses.toFixed(2)} este mes`, pos: false },
    { title: 'Bajo Stock', value: String(stats.lowStockCount), icon: <Package size={24} />, sub: stats.lowStockCount > 0 ? 'Productos requieren atención' : 'Todo en orden', pos: stats.lowStockCount === 0 },
  ];

  if (loading) {
    return (
      <div className="dashboard">
        <div className="page-header"><h1 className="page-title">Resumen Financiero</h1><p className="page-subtitle">Cargando datos...</p></div>
        <div className="loading-container"><div className="loading-spinner"></div><span className="loading-text">Cargando dashboard...</span></div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1 className="page-title">Resumen Financiero</h1>
        <p className="page-subtitle">Bienvenido de nuevo a Aura Joyeros. Tienes {stats.totalProducts} productos en inventario.</p>
      </div>

      <div className="stats-grid">
        {cards.map((c, i) => (
          <Card key={i} className="stat-card">
            <div className="stat-icon-wrapper">{c.icon}</div>
            <div className="stat-info">
              <span className="stat-title">{c.title}</span>
              <h3 className="stat-value" style={c.title === 'Ganancia Neta' ? { color: c.pos ? 'var(--color-success)' : 'var(--color-danger)' } : undefined}>{c.value}</h3>
              <span className={`stat-trend ${c.pos ? 'positive' : 'negative'}`}>{c.sub}</span>
            </div>
          </Card>
        ))}
      </div>

      <div className="dashboard-content">
        <Card className="recent-sales-card">
          <div className="card-header">
            <h3>Ventas Recientes</h3>
            <button className="btn-outline" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => navigate('/sales')}>Ver todas</button>
          </div>
          {recentSales.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px' }}>
              <div className="empty-state-icon"><Gem size={28} /></div>
              <h3>Sin ventas aún</h3>
              <p>Las ventas recientes aparecerán aquí.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="luxury-table">
                <thead><tr><th>ID</th><th>Artículos</th><th>Cliente</th><th>Fecha</th><th>Monto</th></tr></thead>
                <tbody>
                  {recentSales.map((sale) => (
                    <tr key={sale.id}>
                      <td>#{sale.id}</td>
                      <td className="text-gold">{sale.items?.map(i => i.product?.name).join(', ')}</td>
                      <td>{sale.clientName || 'Cliente en Tienda'}</td>
                      <td className="text-muted">{new Date(sale.date).toLocaleDateString()}</td>
                      <td className="font-serif font-bold">${sale.totalAmount?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {stats.lowStockCount > 0 && (
          <Card className="recent-sales-card" style={{ marginTop: '20px' }}>
            <div className="card-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={20} style={{ color: 'var(--color-gold)' }} /> Productos con Bajo Stock
              </h3>
              <button className="btn-outline" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => navigate('/inventory')}>Ver inventario</button>
            </div>
            <div className="table-responsive">
              <table className="luxury-table">
                <thead><tr><th>SKU</th><th>Producto</th><th>Stock</th></tr></thead>
                <tbody>
                  {stats.lowStockProducts?.map(p => (
                    <tr key={p.id}>
                      <td className="text-muted">{p.sku}</td>
                      <td className="text-gold font-bold">{p.name}</td>
                      <td><span className="stock-badge low">{p.stock} {p.stock === 1 ? 'ud' : 'uds'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
