import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2 } from 'lucide-react';
import Card from '../components/UI/Card';
import './Inventory.css';

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await fetch('/api/inventory');
        if (!response.ok) throw new Error('Error fetching inventory');
        const data = await response.json();
        setItems(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  return (
    <div className="inventory">
      <div className="page-header d-flex-between">
        <div>
          <h1 className="page-title">Catálogo de Joyas</h1>
          <p className="page-subtitle">Gestiona tu inventario y existencias.</p>
        </div>
        <button className="btn-primary flex-center gap-2">
          <Plus size={18} />
          <span>Nueva Joya</span>
        </button>
      </div>

      <Card className="inventory-card">
        <div className="inventory-toolbar">
          <div className="search-box">
            <Search size={18} className="text-muted" />
            <input type="text" placeholder="Buscar por nombre, ID o categoría..." />
          </div>
          <button className="btn-outline flex-center gap-2">
            <Filter size={18} />
            <span>Filtros</span>
          </button>
        </div>

        <div className="table-responsive">
          <table className="luxury-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Nombre de la Joya</th>
                <th>Categoría</th>
                <th>Descripción</th>
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
                  <td>{item.description}</td>
                  <td className="font-serif">${item.price.toFixed(2)}</td>
                  <td>
                    <span className={`stock-badge ${item.stock <= 2 ? 'low' : ''}`}>
                      {item.stock} {item.stock === 1 ? 'unidad' : 'unidades'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn edit"><Edit size={16} /></button>
                      <button className="action-btn delete"><Trash2 size={16} /></button>
                    </div>
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

export default Inventory;
