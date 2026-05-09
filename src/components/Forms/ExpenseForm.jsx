import React, { useState, useEffect } from 'react';

const ExpenseForm = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: 'Operativos',
    date: new Date().toISOString().split('T')[0]
  });
  
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        amount: initialData.amount.toString(),
        date: new Date(initialData.date).toISOString().split('T')[0]
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.amount || isNaN(formData.amount)) newErrors.amount = 'Requerido';
    if (!formData.description) newErrors.description = 'Requerido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        ...formData,
        amount: parseFloat(formData.amount)
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginBottom: '20px' }}>
        <div className="input-group">
          <label className="input-label">Monto ($)</label>
          <input type="number" step="0.01" name="amount" value={formData.amount} onChange={handleChange} className="input-field" placeholder="0.00" />
          {errors.amount && <span style={{ color: 'var(--color-danger)', fontSize: '0.8rem' }}>{errors.amount}</span>}
        </div>
        <div className="input-group">
          <label className="input-label">Concepto</label>
          <input type="text" name="description" value={formData.description} onChange={handleChange} className="input-field" placeholder="Ej. Pago de luz..." />
          {errors.description && <span style={{ color: 'var(--color-danger)', fontSize: '0.8rem' }}>{errors.description}</span>}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="input-group">
            <label className="input-label">Categoría</label>
            <select name="category" value={formData.category} onChange={handleChange} className="input-field">
              <option value="Operativos">Operativos (Alquiler, Luz, etc)</option>
              <option value="Inventario">Compra de Inventario</option>
              <option value="Marketing">Marketing / Publicidad</option>
              <option value="Salarios">Salarios</option>
              <option value="Otros">Otros</option>
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Fecha</label>
            <input type="date" name="date" value={formData.date} onChange={handleChange} className="input-field" />
          </div>
        </div>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <button type="button" className="btn-outline" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn-primary">{initialData ? 'Actualizar' : 'Registrar Gasto'}</button>
      </div>
    </form>
  );
};

export default ExpenseForm;
