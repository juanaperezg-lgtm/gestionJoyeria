import React, { useState, useEffect } from 'react';
import { Plus, Search, Calendar, FileText, Trash2 } from 'lucide-react';
import Card from '../components/UI/Card';
import Modal from '../components/UI/Modal';
import ConfirmDialog from '../components/UI/ConfirmDialog';
import Toast from '../components/UI/Toast';
import SaleForm from '../components/Forms/SaleForm';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import EmptyState from '../components/UI/EmptyState';

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });
  
  // Toast state
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  const fetchSales = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/sales');
      if (!response.ok) throw new Error('Error fetching sales');
      const data = await response.json();
      setSales(data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
  };

  const handleSaveSale = async (saleData) => {
    try {
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saleData)
      });
      
      if (!response.ok) throw new Error('Error registrando venta');
      
      showToast('Venta registrada con éxito', 'success');
      setIsFormOpen(false);
      fetchSales();
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/sales/${deleteConfirm.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Error cancelando venta');
      showToast('Venta cancelada y stock restaurado', 'success');
      fetchSales();
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  return (
    <div className="sales dashboard">
      {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ show: false })} />}
      
      <Modal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        title="Nueva Venta"
        size="md"
      >
        <SaleForm 
          onSubmit={handleSaveSale} 
          onCancel={() => setIsFormOpen(false)} 
        />
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
        onConfirm={handleDelete}
        title="Cancelar Venta"
        message="¿Estás seguro de que deseas cancelar esta venta? Los productos volverán al inventario."
        confirmText="Sí, Cancelar Venta"
        isDestructive={true}
      />
      <div className="page-header d-flex-between">
        <div>
          <h1 className="page-title">Registro de Ventas</h1>
          <p className="page-subtitle">Visualiza y registra las ventas realizadas en la tienda.</p>
        </div>
        <button className="btn-primary flex-center gap-2" onClick={() => setIsFormOpen(true)}>
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
          {loading ? (
            <LoadingSpinner />
          ) : sales.length === 0 ? (
            <EmptyState 
              icon={FileText} 
              title="No hay ventas" 
              description="Aún no has registrado ninguna venta."
              actionText="Registrar Primera Venta"
              onAction={() => setIsFormOpen(true)}
            />
          ) : (
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
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.id}>
                    <td className="text-muted">#{sale.id}</td>
                    <td>{new Date(sale.date).toLocaleDateString()}</td>
                    <td className="font-bold">{sale.client ? sale.client.name : 'Cliente en Tienda'}</td>
                    <td className="text-muted" style={{ fontSize: '0.85rem' }}>
                      {sale.items?.map(i => `${i.product?.name} (${i.quantity})`).join(', ')}
                    </td>
                    <td className="text-gold font-serif font-bold">${sale.totalAmount?.toFixed(2)}</td>
                    <td>{sale.paymentMethod || 'Efectivo'}</td>
                    <td>
                      <span className="stock-badge">
                        {sale.status || 'Completado'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="action-btn text-gold" title="Ver Recibo"><FileText size={16} /></button>
                        <button className="action-btn delete" onClick={() => setDeleteConfirm({ isOpen: true, id: sale.id })} title="Cancelar Venta"><Trash2 size={16} /></button>
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

export default Sales;
