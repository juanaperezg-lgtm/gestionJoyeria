import React, { useState, useEffect } from 'react';
import { Plus, Search, TrendingDown, Edit, Trash2 } from 'lucide-react';
import Card from '../components/UI/Card';
import Modal from '../components/UI/Modal';
import ConfirmDialog from '../components/UI/ConfirmDialog';
import Toast from '../components/UI/Toast';
import ExpenseForm from '../components/Forms/ExpenseForm';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import EmptyState from '../components/UI/EmptyState';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });

  // Toast state
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/expenses');
      if (!response.ok) throw new Error('Error cargando gastos');
      const data = await response.json();
      setExpenses(data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
  };

  const handleSaveExpense = async (expenseData) => {
    try {
      const url = editingItem ? `/api/expenses/${editingItem.id}` : '/api/expenses';
      const method = editingItem ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseData)
      });

      if (!response.ok) throw new Error('Error guardando gasto');

      showToast(editingItem ? 'Gasto actualizado correctamente' : 'Gasto registrado con éxito', 'success');
      setIsFormOpen(false);
      fetchExpenses();
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/expenses/${deleteConfirm.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Error eliminando gasto');
      showToast('Gasto eliminado', 'success');
      fetchExpenses();
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const openCreate = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  // Compute dynamic total for current month
  const now = new Date();
  const totalMonth = expenses
    .filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, e) => sum + e.amount, 0);

  const totalAll = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="expenses dashboard">
      {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ show: false })} />}

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingItem ? 'Editar Gasto' : 'Registrar Gasto'}
        size="sm"
      >
        <ExpenseForm
          initialData={editingItem}
          onSubmit={handleSaveExpense}
          onCancel={() => setIsFormOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
        onConfirm={handleDelete}
        title="Eliminar Gasto"
        message="¿Estás seguro de que deseas eliminar este gasto? Esta acción no se puede deshacer."
        confirmText="Sí, Eliminar"
        isDestructive={true}
      />

      <div className="page-header d-flex-between">
        <div>
          <h1 className="page-title">Gastos y Compras</h1>
          <p className="page-subtitle">Control de gastos operativos y compra de materiales.</p>
        </div>
        <button className="btn-primary flex-center gap-2" onClick={openCreate}>
          <Plus size={18} />
          <span>Registrar Gasto</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="stats-grid" style={{ marginBottom: '24px', gridTemplateColumns: 'repeat(2, 1fr)' }}>
        <Card className="stat-card" style={{ borderColor: 'rgba(139, 0, 0, 0.3)' }}>
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(139, 0, 0, 0.1)', color: 'var(--color-danger)' }}>
            <TrendingDown size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-title">Gastos del Mes Actual</span>
            <h3 className="stat-value font-serif" style={{ color: 'var(--color-danger)' }}>${totalMonth.toFixed(2)}</h3>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(212, 175, 55, 0.1)', color: 'var(--color-gold)' }}>
            <TrendingDown size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-title">Gastos Totales Acumulados</span>
            <h3 className="stat-value font-serif">${totalAll.toFixed(2)}</h3>
          </div>
        </Card>
      </div>

      <Card>
        <div className="inventory-toolbar">
          <div className="search-box">
            <Search size={18} className="text-muted" />
            <input type="text" placeholder="Buscar gastos por concepto..." />
          </div>
        </div>

        <div className="table-responsive">
          {loading ? (
            <LoadingSpinner />
          ) : expenses.length === 0 ? (
            <EmptyState
              icon={TrendingDown}
              title="No hay gastos registrados"
              description="Aún no has registrado ningún gasto. Comienza agregando uno."
              actionText="Registrar Primer Gasto"
              onAction={openCreate}
            />
          ) : (
            <table className="luxury-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Concepto</th>
                  <th>Categoría</th>
                  <th>Monto</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id}>
                    <td className="text-muted">{new Date(expense.date).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td className="font-bold">{expense.description}</td>
                    <td>
                      <span className="stock-badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        {expense.category}
                      </span>
                    </td>
                    <td className="font-serif font-bold" style={{ color: 'var(--color-danger)' }}>
                      -${expense.amount?.toFixed(2)}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="action-btn edit" onClick={() => openEdit(expense)} title="Editar">
                          <Edit size={16} />
                        </button>
                        <button className="action-btn delete" onClick={() => setDeleteConfirm({ isOpen: true, id: expense.id })} title="Eliminar">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Expenses;
