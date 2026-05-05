import React, { useState, useEffect } from 'react';
import { Plus, Search, ArrowDownCircle, TrendingDown } from 'lucide-react';
import Card from '../components/UI/Card';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const response = await fetch('/api/expenses');
        const data = await response.json();
        setExpenses(data);
      } catch (err) {
        console.error("Error fetching expenses:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, []);

  return (
    <div className="expenses dashboard">
      <div className="page-header d-flex-between">
        <div>
          <h1 className="page-title">Gastos y Compras</h1>
          <p className="page-subtitle">Control de gastos operativos y compra de materiales.</p>
        </div>
        <button className="btn-outline flex-center gap-2" style={{ borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}>
          <Plus size={18} />
          <span>Registrar Gasto</span>
        </button>
      </div>

      <div className="stats-grid" style={{ marginBottom: '20px' }}>
        <Card className="stat-card" style={{ borderColor: 'rgba(139, 0, 0, 0.2)' }}>
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(139, 0, 0, 0.1)', color: 'var(--color-danger)' }}>
            <TrendingDown size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-title">Gastos del Mes</span>
            <h3 className="stat-value">$22,600</h3>
          </div>
        </Card>
      </div>

      <Card>
        <div className="inventory-toolbar">
          <div className="search-box">
            <Search size={18} className="text-muted" />
            <input type="text" placeholder="Buscar gastos..." />
          </div>
        </div>

        <div className="table-responsive">
          <table className="luxury-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha</th>
                <th>Concepto</th>
                <th>Categoría</th>
                <th>Proveedor</th>
                <th>Monto</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id}>
                  <td className="text-muted">#{expense.id}</td>
                  <td>{new Date(expense.date).toLocaleDateString()}</td>
                  <td className="font-bold">{expense.description}</td>
                  <td>
                    <span className="stock-badge" style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)', border: 'none' }}>
                      {expense.category}
                    </span>
                  </td>
                  <td>-</td>
                  <td className="font-serif font-bold" style={{ color: 'var(--color-danger)' }}>${expense.amount?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Expenses;
