import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2 } from 'lucide-react';
import Card from '../components/UI/Card';
import Modal from '../components/UI/Modal';
import ConfirmDialog from '../components/UI/ConfirmDialog';
import Toast from '../components/UI/Toast';
import ProductForm from '../components/Forms/ProductForm';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import EmptyState from '../components/UI/EmptyState';
import './Inventory.css';

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });
  
  // Toast state
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const url = searchQuery ? `/api/inventory?search=${encodeURIComponent(searchQuery)}` : '/api/inventory';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Error fetching inventory');
      const data = await response.json();
      setItems(data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      fetchInventory();
    }
  };

  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
  };

  const handleSaveProduct = async (productData) => {
    try {
      const url = editingItem ? `/api/inventory/${editingItem.id}` : '/api/inventory';
      const method = editingItem ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      
      if (!response.ok) throw new Error('Error guardando joya');
      
      showToast(editingItem ? 'Joya actualizada con éxito' : 'Nueva joya añadida', 'success');
      setIsFormOpen(false);
      fetchInventory();
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/inventory/${deleteConfirm.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Error eliminando joya');
      showToast('Joya eliminada del catálogo', 'success');
      fetchInventory();
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

  return (
    <div className="inventory">
      {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ show: false })} />}
      
      <Modal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        title={editingItem ? "Editar Joya" : "Nueva Joya"}
        size="md"
      >
        <ProductForm 
          initialData={editingItem} 
          onSubmit={handleSaveProduct} 
          onCancel={() => setIsFormOpen(false)} 
        />
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
        onConfirm={handleDelete}
        title="Eliminar Joya"
        message="¿Estás seguro de que deseas eliminar este producto del inventario? Esta acción no se puede deshacer."
        confirmText="Sí, Eliminar"
        isDestructive={true}
      />

      <div className="page-header d-flex-between">
        <div>
          <h1 className="page-title">Catálogo de Joyas</h1>
          <p className="page-subtitle">Gestiona tu inventario y existencias.</p>
        </div>
        <button className="btn-primary flex-center gap-2" onClick={openCreate}>
          <Plus size={18} />
          <span>Nueva Joya</span>
        </button>
      </div>

      <Card className="inventory-card">
        <div className="inventory-toolbar">
          <div className="search-box">
            <Search size={18} className="text-muted" />
            <input 
              type="text" 
              placeholder="Buscar por nombre o SKU... (Presiona Enter)" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
            />
          </div>
          <button className="btn-outline flex-center gap-2">

            <Filter size={18} />
            <span>Filtros</span>
          </button>
        </div>

        <div className="table-responsive">
          {loading ? (
            <LoadingSpinner />
          ) : items.length === 0 ? (
            <EmptyState 
              icon={Search} 
              title="No hay productos" 
              description="No se encontraron joyas en el inventario que coincidan con tu búsqueda."
              actionText="Añadir Primera Joya"
              onAction={openCreate}
            />
          ) : (
            <table className="luxury-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Nombre de la Joya</th>
                  <th>Categoría</th>
                  <th>Precio Venta</th>
                  <th>Stock</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="text-muted">{item.sku}</td>
                    <td className="text-gold font-bold">{item.name}</td>
                    <td>{item.category}</td>
                    <td className="font-serif">${item.price.toFixed(2)}</td>
                    <td>
                      <span className={`stock-badge ${item.stock <= 2 ? 'low' : ''}`}>
                        {item.stock} {item.stock === 1 ? 'unidad' : 'unidades'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="action-btn edit" onClick={() => openEdit(item)}><Edit size={16} /></button>
                        <button className="action-btn delete" onClick={() => setDeleteConfirm({ isOpen: true, id: item.id })}><Trash2 size={16} /></button>
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

export default Inventory;
