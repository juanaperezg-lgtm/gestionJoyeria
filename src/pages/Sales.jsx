import React, { useState, useEffect } from 'react';
import { Plus, Search, Calendar, FileText } from 'lucide-react';
import Card from '../components/UI/Card';

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const response = await fetch('/api/sales');
        const data = await response.json();
        setSales(data);
      } catch (err) {
        console.error("Error fetching sales:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, []);

  return (
    <div className="sales dashboard">
      <div className="page-header d-flex-between">
        <div>
          <h1 className="page-title">Registro de Ventas</h1>
          <p className="page-subtitle">Visualiza y registra las ventas realizadas en la tienda.</p>
        </div>
        <button className="btn-primary flex-center gap-2">
          <Plus size={18} />
          <span>Nueva Venta</span>
        </button>
      </div>

      <Card>
        <div className="inventory-toolbar">
          <div className="search-box">
            <Search size={18} className="text-muted" />
            <input type="text" placeholder="Buscar por ID, cliente o fecha..." />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-outline flex-center gap-2">
              <Calendar size={18} />
              <span>Este Mes</span>
            </button>
            <button className="btn-outline flex-center gap-2">
              <FileText size={18} />
              <span>Exportar</span>
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="luxury-table">
            <thead>
              <tr>
                <th>ID Venta</th>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Artículos</th>
                <th>Total</th>
                <th>Método</th>
                <th>Estado</th>
                <th>Recibo</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id}>
                  <td className="text-muted">#{sale.id}</td>
                  <td>{new Date(sale.date).toLocaleDateString()}</td>
                  <td className="font-bold">Cliente en Tienda</td>
                  <td className="text-muted" style={{ fontSize: '0.85rem' }}>
                    {sale.items?.map(i => `${i.product?.name} (${i.quantity})`).join(', ')}
                  </td>
                  <td className="text-gold font-serif font-bold">${sale.totalAmount?.toFixed(2)}</td>
                  <td>Efectivo / Tarjeta</td>
                  <td>
                    <span className="stock-badge">
                      Completado
                    </span>
                  </td>
                  <td>
                    <button className="action-btn text-gold"><FileText size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Sales;
