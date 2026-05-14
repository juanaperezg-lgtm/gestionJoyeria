import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const SaleForm = ({ onSubmit, onCancel }) => {
  const { authFetch } = useAuth();
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('Efectivo');
  
  useEffect(() => {
    authFetch('/api/inventory').then(res => res.json()).then(data => setProducts(data.filter(p => p.stock > 0)));
  }, [authFetch]);

  const addItem = () => {
    if (products.length > 0) {
      setItems([...items, { productId: products[0].id, quantity: 1, priceAtSale: products[0].price }]);
    }
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    if (field === 'productId') {
      const prod = products.find(p => p.id === parseInt(value, 10));
      newItems[index] = { ...newItems[index], productId: prod.id, priceAtSale: prod.price };
    } else {
      newItems[index] = { ...newItems[index], [field]: field === 'quantity' ? parseInt(value, 10) || 1 : parseFloat(value) || 0 };
    }
    setItems(newItems);
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.priceAtSale * item.quantity), 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (items.length === 0) return alert('Agrega al menos un producto');
    
    // Check stock
    for(let item of items) {
      const p = products.find(p => p.id === item.productId);
      if(p && item.quantity > p.stock) {
        return alert(`Stock insuficiente para ${p.name}. Disponible: ${p.stock}`);
      }
    }

    onSubmit({
      items,
      totalAmount,
      paymentMethod,
      status: 'Completado'
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h4 style={{ color: 'var(--color-pearl)' }}>Productos</h4>
          <button type="button" onClick={addItem} className="btn-outline flex-center gap-2" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
            <Plus size={14} /> Añadir Joya
          </button>
        </div>
        
        {items.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '8px', color: 'var(--text-secondary)' }}>
            No hay productos en esta venta.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {items.map((item, index) => {
              const prod = products.find(p => p.id === item.productId);
              return (
                <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '10px', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '6px' }}>
                  <select value={item.productId} onChange={(e) => updateItem(index, 'productId', e.target.value)} className="input-field" style={{ padding: '8px' }}>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>)}
                  </select>
                  <input type="number" min="1" max={prod?.stock || 99} value={item.quantity} onChange={(e) => updateItem(index, 'quantity', e.target.value)} className="input-field" style={{ padding: '8px' }} />
                  <input type="number" step="0.01" value={item.priceAtSale} onChange={(e) => updateItem(index, 'priceAtSale', e.target.value)} className="input-field" style={{ padding: '8px' }} />
                  <button type="button" onClick={() => removeItem(index)} className="icon-btn text-danger"><Trash2 size={18} /></button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <div className="input-group">
          <label className="input-label">Método de Pago</label>
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="input-field">
            <option value="Efectivo">Efectivo</option>
            <option value="Tarjeta">Tarjeta de Crédito/Débito</option>
            <option value="Transferencia">Transferencia Bancaria</option>
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-end', paddingBottom: '16px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Venta</span>
          <h2 style={{ color: 'var(--color-gold)', margin: 0 }}>${totalAmount.toFixed(2)}</h2>
        </div>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <button type="button" className="btn-outline" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn-primary" disabled={items.length === 0}>Completar Venta</button>
      </div>
    </form>
  );
};

export default SaleForm;
