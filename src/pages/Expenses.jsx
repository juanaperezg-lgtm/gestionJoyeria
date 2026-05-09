import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Trash2, Wallet, AlertTriangle, CheckCircle } from 'lucide-react';
import Card from '../components/UI/Card';
import Modal from '../components/UI/Modal';

const EXPENSE_CATS = ['Operativos', 'Proveedores', 'Salarios', 'Servicios', 'Marketing', 'Mantenimiento', 'Impuestos', 'Otro'];

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [showDel, setShowDel] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [form, setForm] = useState({ amount: '', description: '', category: 'Operativos', date: '' });
  const [err, setErr] = useState('');
  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState([]);

  const toast = (msg, type = 'success') => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3000);
  };

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [eRes, sRes] = await Promise.all([fetch('/api/expenses'), fetch('/api/dashboard/stats')]);
      if (!eRes.ok) throw new Error('Error al cargar gastos');
      const expensesData = await eRes.json();
      setExpenses(expensesData);
      
      if (sRes.ok) {
        const stats = await sRes.json();
        setMonthlyTotal(stats.monthlyExpenses || 0);
      }
    } catch (e) { toast(e.message, 'error'); }
    finally { setLoading(false); }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setForm({ amount: '', description: '', category: 'Operativos', date: new Date().toISOString().split('T')[0] });
    setErr(''); setShowForm(true);
  };
  const openDel = (exp) => { setDeleting(exp); setErr(''); setShowDel(true); };

  const submit = async (e) => {
    e.preventDefault(); setErr(''); setSaving(true);
    const d = { amount: parseFloat(form.amount), description: form.description.trim(), category: form.category, date: form.date || undefined };
    if (!d.description || !d.category) { setErr('Descripción y categoría son obligatorios.'); setSaving(false); return; }
    if (isNaN(d.amount) || d.amount <= 0) { setErr('El monto debe ser mayor a 0.'); setSaving(false); return; }
    try {
      const r = await fetch('/api/expenses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) });
      if (!r.ok) { const e = await r.json(); throw new Error(e.error); }
      toast('Gasto registrado exitosamente');
      setShowForm(false); load();
    } catch (e) { setErr(e.message); } finally { setSaving(false); }
  };

  const del = async () => {
    setSaving(true); setErr('');
    try {
      const r = await fetch(`/api/expenses/${deleting.id}`, { method: 'DELETE' });
      if (!r.ok) { const e = await r.json(); throw new Error(e.error); }
      toast('Gasto eliminado');
      setShowDel(false); load();
    } catch (e) { setErr(e.message); } finally { setSaving(false); }
  };

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const filtered = expenses.filter(exp => {
    if (!search) return true;
    const t = search.toLowerCase();
    return exp.description.toLowerCase().includes(t) || exp.category.toLowerCase().includes(t) || new Date(exp.date).toLocaleDateString().includes(t);
  });

  return (
    <div className="expenses dashboard">
      <div className="toast-container">
        {toasts.map(t => <div key={t.id} className={`toast ${t.type}`}>{t.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}{t.msg}</div>)}
      </div>

      <div className="page-header d-flex-between">
        <div>
          <h1 className="page-title">Gastos y Compras</h1>
          <p className="page-subtitle">Control de gastos operativos y compra de materiales. Total del mes: ${monthlyTotal}</p>
        </div>
        <button className="btn-primary flex-center gap-2" onClick={openCreate} style={{ background: 'linear-gradient(135deg, #6b0000 0%, var(--color-danger) 100%)', color: 'var(--color-pearl)' }}>
          <Plus size={18} /><span>Registrar Gasto</span>
        </button>
      </div>

  <Card>
    <div className="inventory-toolbar">
      <div className="search-box"><Search size={18} className="text-muted" /><input type="text" placeholder="Buscar gastos..." value={search} onChange={e => setSearch(e.target.value)} /></div>
    </div>

    {loading ? (
      <div className="loading-container"><div className="loading-spinner"></div><span className="loading-text">Cargando gastos...</span></div>
    ) : filtered.length === 0 ? (
      <div className="empty-state"><div className="empty-state-icon"><Wallet size={32} /></div><h3>{search ? 'Sin resultados' : 'No hay gastos'}</h3><p>{search ? 'No se encontraron gastos.' : 'Registra tu primer gasto.'}</p></div>
    ) : (
      <div className="table-responsive">
        <table className="luxury-table">
          <thead><tr><th>ID</th><th>Fecha</th><th>Concepto</th><th>Categoría</th><th>Monto</th><th>Acciones</th></tr></thead>
          <tbody>{filtered.map(exp => (
            <tr key={exp.id}>
              <td className="text-muted">#{exp.id}</td>
              <td>{new Date(exp.date).toLocaleDateString()}</td>
              <td className="font-bold">{exp.description}</td>
              <td><span className="stock-badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: 'none' }}>{exp.category}</span></td>
              <td className="font-serif font-bold" style={{ color: 'var(--color-danger)' }}>-${exp.amount?.toFixed(2)}</td>
              <td><button className="action-btn delete" onClick={() => openDel(exp)} title="Eliminar"><Trash2 size={16} /></button></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    )}
  </Card>

{/* New Expense Modal */ }
<Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Registrar Gasto" size="medium">
  <form className="modal-form" onSubmit={submit}>
    {err && <div className="form-error">{err}</div>}
    <div className="form-group full-width"><label>Concepto / Descripción</label><input type="text" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Ej: Alquiler local comercial" required /></div>
    <div className="form-row">
      <div className="form-group"><label>Monto ($)</label><input type="number" step="0.01" min="0.01" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="0.00" required /></div>
      <div className="form-group"><label>Categoría</label><select value={form.category} onChange={e => set('category', e.target.value)}>{EXPENSE_CATS.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
    </div>
    <div className="form-row"><div className="form-group"><label>Fecha</label><input type="date" value={form.date} onChange={e => set('date', e.target.value)} /></div><div className="form-group"></div></div>
    <div className="modal-actions"><button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>Cancelar</button><button type="submit" className="btn-save" disabled={saving}>{saving ? 'Guardando...' : 'Registrar Gasto'}</button></div>
  </form>
</Modal>

{/* Delete Confirmation */ }
<Modal isOpen={showDel} onClose={() => setShowDel(false)} title="Eliminar Gasto" size="small">
  <div className="confirm-dialog">
    <div className="confirm-icon"><AlertTriangle size={28} /></div>
    <p>¿Eliminar este gasto?</p>
    {deleting && <p className="confirm-item-name">{deleting.description} — ${deleting.amount?.toFixed(2)}</p>}
    {err && <div className="form-error" style={{ textAlign: 'left', marginTop: '12px' }}>{err}</div>}
  </div>
  <div className="modal-actions"><button className="btn-cancel" onClick={() => setShowDel(false)}>Cancelar</button><button className="btn-danger" onClick={del} disabled={saving}>{saving ? 'Eliminando...' : 'Eliminar'}</button></div>
</Modal>
    </div >
  );
};

export default Expenses;
