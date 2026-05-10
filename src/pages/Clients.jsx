import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit, Trash2, Users, AlertTriangle, CheckCircle, Mail, Phone } from 'lucide-react';
import Card from '../components/UI/Card';
import Modal from '../components/UI/Modal';
import { useAuth } from '../context/AuthContext';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const { authFetch } = useAuth();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showDel, setShowDel] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', notes: '' });
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
      const r = await authFetch('/api/clients');
      if (!r.ok) throw new Error('Error al cargar clientes');
      setClients(await r.json());
    } catch (e) { toast(e.message, 'error'); }
    finally { setLoading(false); }
  }, [authFetch]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', phone: '', email: '', notes: '' });
    setErr(''); setShowForm(true);
  };
  const openEdit = (c) => {
    setEditing(c);
    setForm({ name: c.name, phone: c.phone || '', email: c.email || '', notes: c.notes || '' });
    setErr(''); setShowForm(true);
  };
  const openDel = (c) => { setDeleting(c); setErr(''); setShowDel(true); };

  const submit = async (e) => {
    e.preventDefault(); setErr(''); setSaving(true);
    const d = { name: form.name.trim(), phone: form.phone.trim(), email: form.email.trim(), notes: form.notes.trim() };
    if (!d.name) { setErr('El nombre es obligatorio.'); setSaving(false); return; }
    try {
      const r = await authFetch(editing ? `/api/clients/${editing.id}` : '/api/clients', { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) });
      if (!r.ok) { const e = await r.json(); throw new Error(e.error); }
      toast(editing ? 'Cliente actualizado' : 'Cliente registrado');
      setShowForm(false); load();
    } catch (e) { setErr(e.message); } finally { setSaving(false); }
  };

  const del = async () => {
    setSaving(true); setErr('');
    try {
      const r = await authFetch(`/api/clients/${deleting.id}`, { method: 'DELETE' });
      if (!r.ok) { const e = await r.json(); throw new Error(e.error); }
      toast('Cliente eliminado'); setShowDel(false); load();
    } catch (e) { setErr(e.message); } finally { setSaving(false); }
  };

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const filtered = clients.filter(c => {
    if (!search) return true;
    const t = search.toLowerCase();
    return c.name.toLowerCase().includes(t) || (c.email && c.email.toLowerCase().includes(t)) || (c.phone && c.phone.includes(t));
  });

  return (
    <div className="dashboard">
      <div className="toast-container">
        {toasts.map(t => <div key={t.id} className={`toast ${t.type}`}>{t.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}{t.msg}</div>)}
      </div>

      <div className="page-header d-flex-between">
        <div>
          <h1 className="page-title">Cartera de Clientes</h1>
          <p className="page-subtitle">Gestiona la información y contactos de tus clientes.</p>
        </div>
        <button className="btn-primary flex-center gap-2" onClick={openCreate}><Plus size={18} /><span>Nuevo Cliente</span></button>
      </div>

      <Card>
        <div className="inventory-toolbar">
          <div className="search-box"><Search size={18} className="text-muted" /><input type="text" placeholder="Buscar por nombre, correo o teléfono..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        </div>

        {loading ? (
          <div className="loading-container"><div className="loading-spinner"></div><span className="loading-text">Cargando clientes...</span></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon"><Users size={32} /></div><h3>{search ? 'Sin resultados' : 'No hay clientes'}</h3><p>{search ? 'No se encontraron clientes.' : 'Registra tu primer cliente.'}</p></div>
        ) : (
          <div className="table-responsive">
            <table className="luxury-table">
              <thead><tr><th>Nombre</th><th>Contacto</th><th>Notas</th><th>Ventas</th><th>Acciones</th></tr></thead>
              <tbody>{filtered.map(c => (
                <tr key={c.id}>
                  <td className="font-bold text-gold">{c.name}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem' }}>
                      {c.phone && <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={12} className="text-muted"/> {c.phone}</span>}
                      {c.email && <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={12} className="text-muted"/> {c.email}</span>}
                      {!c.phone && !c.email && <span className="text-muted">—</span>}
                    </div>
                  </td>
                  <td className="text-muted" style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.notes || '—'}</td>
                  <td><span className="stock-badge">{c._count?.sales || 0} compras</span></td>
                  <td><div className="action-buttons"><button className="action-btn edit" onClick={() => openEdit(c)} title="Editar"><Edit size={16} /></button><button className="action-btn delete" onClick={() => openDel(c)} title="Eliminar"><Trash2 size={16} /></button></div></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editing ? "Editar Cliente" : "Nuevo Cliente"} size="medium">
        <form className="modal-form" onSubmit={submit}>
          {err && <div className="form-error">{err}</div>}
          <div className="form-group full-width"><label>Nombre Completo</label><input type="text" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ej: María Hernández" required /></div>
          <div className="form-row">
            <div className="form-group"><label>Teléfono</label><input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="Ej: 300 123 4567" /></div>
            <div className="form-group"><label>Correo Electrónico</label><input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="Ej: maria@correo.com" /></div>
          </div>
          <div className="form-group full-width"><label>Notas adicionales</label><textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Preferencias, tallas de anillo..." /></div>
          <div className="modal-actions"><button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>Cancelar</button><button type="submit" className="btn-save" disabled={saving}>{saving ? 'Guardando...' : (editing ? 'Actualizar' : 'Registrar Cliente')}</button></div>
        </form>
      </Modal>

      <Modal isOpen={showDel} onClose={() => setShowDel(false)} title="Eliminar Cliente" size="small">
        <div className="confirm-dialog">
          <div className="confirm-icon"><AlertTriangle size={28} /></div>
          <p>¿Eliminar este cliente?</p>
          {deleting && <p className="confirm-item-name">{deleting.name}</p>}
          {err && <div className="form-error" style={{ textAlign: 'left', marginTop: '12px' }}>{err}</div>}
        </div>
        <div className="modal-actions"><button className="btn-cancel" onClick={() => setShowDel(false)}>Cancelar</button><button className="btn-danger" onClick={del} disabled={saving}>{saving ? 'Eliminando...' : 'Eliminar'}</button></div>
      </Modal>
    </div>
  );
};

export default Clients;
