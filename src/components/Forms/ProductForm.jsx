import React, { useState, useEffect } from 'react';

const ProductForm = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: 'Anillos',
    description: '',
    price: '',
    cost: '',
    stock: '',
    imageUrl: ''
  });
  
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        price: initialData.price.toString(),
        cost: initialData.cost.toString(),
        stock: initialData.stock.toString()
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.sku) newErrors.sku = 'Requerido';
    if (!formData.name) newErrors.name = 'Requerido';
    if (!formData.price || isNaN(formData.price)) newErrors.price = 'Precio válido requerido';
    if (!formData.cost || isNaN(formData.cost)) newErrors.cost = 'Costo válido requerido';
    if (!formData.stock || isNaN(formData.stock)) newErrors.stock = 'Stock válido requerido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        ...formData,
        price: parseFloat(formData.price),
        cost: parseFloat(formData.cost),
        stock: parseInt(formData.stock, 10)
      });
    }
  };

  const margin = formData.price && formData.cost && !isNaN(formData.price) && !isNaN(formData.cost) 
    ? (((parseFloat(formData.price) - parseFloat(formData.cost)) / parseFloat(formData.price)) * 100).toFixed(1)
    : 0;

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <div className="input-group">
          <label className="input-label">SKU</label>
          <input type="text" name="sku" value={formData.sku} onChange={handleChange} className="input-field" placeholder="Ej. A-001" />
          {errors.sku && <span style={{ color: 'var(--color-danger)', fontSize: '0.8rem' }}>{errors.sku}</span>}
        </div>
        <div className="input-group">
          <label className="input-label">Categoría</label>
          <select name="category" value={formData.category} onChange={handleChange} className="input-field">
            <option value="Anillos">Anillos</option>
            <option value="Collares">Collares</option>
            <option value="Pulseras">Pulseras</option>
            <option value="Aretes">Aretes</option>
            <option value="Relojes">Relojes</option>
            <option value="Otros">Otros</option>
          </select>
        </div>
        <div className="input-group" style={{ gridColumn: '1 / -1' }}>
          <label className="input-label">Nombre del Producto</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} className="input-field" placeholder="Anillo de compromiso 18k..." />
          {errors.name && <span style={{ color: 'var(--color-danger)', fontSize: '0.8rem' }}>{errors.name}</span>}
        </div>
        <div className="input-group" style={{ gridColumn: '1 / -1' }}>
          <label className="input-label">Descripción</label>
          <textarea name="description" value={formData.description || ''} onChange={handleChange} className="input-field" rows="2" />
        </div>
        <div className="input-group">
          <label className="input-label">Precio de Venta ($)</label>
          <input type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} className="input-field" />
          {errors.price && <span style={{ color: 'var(--color-danger)', fontSize: '0.8rem' }}>{errors.price}</span>}
        </div>
        <div className="input-group">
          <label className="input-label">Costo ($)</label>
          <input type="number" step="0.01" name="cost" value={formData.cost} onChange={handleChange} className="input-field" />
          {errors.cost && <span style={{ color: 'var(--color-danger)', fontSize: '0.8rem' }}>{errors.cost}</span>}
        </div>
        <div className="input-group">
          <label className="input-label">Stock Inicial</label>
          <input type="number" name="stock" value={formData.stock} onChange={handleChange} className="input-field" />
          {errors.stock && <span style={{ color: 'var(--color-danger)', fontSize: '0.8rem' }}>{errors.stock}</span>}
        </div>
        <div className="input-group" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Margen de Ganancia:</span>
          <span style={{ fontSize: '1.2rem', color: margin > 30 ? 'var(--color-success)' : 'var(--color-gold)' }}>
            {margin}%
          </span>
        </div>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <button type="button" className="btn-outline" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn-primary">{initialData ? 'Actualizar' : 'Guardar Joya'}</button>
      </div>
    </form>
  );
};

export default ProductForm;
