import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit, Trash2, Package, AlertTriangle, CheckCircle } from 'lucide-react';
import Card from '../components/UI/Card';
import Modal from '../components/UI/Modal';
import './Inventory.css';

const API = '/api/inventory';
const CATS = ['Anillos','Collares','Pulseras','Aretes','Relojes','Cadenas','Dijes','Broches','Otro'];
const empty = { sku:'', name:'', category:'Anillos', description:'', price:'', cost:'', stock:'' };

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showDel, setShowDel] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [form, setForm] = useState(empty);
  const [err, setErr] = useState('');
  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState([]);

  const toast = (msg, type='success') => {
    const id = Date.now();
    setToasts(p => [...p, {id,msg,type}]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3000);
  };

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const r = await fetch(API);
      if (!r.ok) throw new Error('Error al cargar');
      setItems(await r.json());
    } catch(e) { toast(e.message,'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm(empty); setErr(''); setShowForm(true); };
  const openEdit = (p) => {
    setEditing(p);
    setForm({ sku:p.sku, name:p.name, category:p.category, description:p.description||'', price:String(p.price), cost:String(p.cost), stock:String(p.stock) });
    setErr(''); setShowForm(true);
  };
  const openDel = (p) => { setDeleting(p); setErr(''); setShowDel(true); };

  const submit = async (e) => {
    e.preventDefault(); setErr(''); setSaving(true);
    const d = { sku:form.sku.trim(), name:form.name.trim(), category:form.category, description:form.description.trim(), price:parseFloat(form.price), cost:parseFloat(form.cost), stock:parseInt(form.stock)||0 };
    if (!d.sku||!d.name||!d.category) { setErr('SKU, nombre y categoría son obligatorios.'); setSaving(false); return; }
    if (isNaN(d.price)||d.price<0) { setErr('Precio inválido.'); setSaving(false); return; }
    if (isNaN(d.cost)||d.cost<0) { setErr('Costo inválido.'); setSaving(false); return; }
    try {
      const r = await fetch(editing ? `${API}/${editing.id}` : API, { method: editing?'PUT':'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(d) });
      if (!r.ok) { const e = await r.json(); throw new Error(e.error); }
      toast(editing ? 'Producto actualizado' : 'Producto creado');
      setShowForm(false); load();
    } catch(e) { setErr(e.message); } finally { setSaving(false); }
  };

  const del = async () => {
    setSaving(true); setErr('');
    try {
      const r = await fetch(`${API}/${deleting.id}`, {method:'DELETE'});
      if (!r.ok) { const e = await r.json(); throw new Error(e.error); }
      toast('Producto eliminado'); setShowDel(false); load();
    } catch(e) { setErr(e.message); } finally { setSaving(false); }
  };

  const set = (k,v) => setForm(p => ({...p,[k]:v}));
  const filtered = items.filter(i => { if(!search) return true; const s=search.toLowerCase(); return i.name.toLowerCase().includes(s)||i.sku.toLowerCase().includes(s)||i.category.toLowerCase().includes(s)||(i.description&&i.description.toLowerCase().includes(s)); });

  return (
    <div className="inventory">
      <div className="toast-container">
        {toasts.map(t => <div key={t.id} className={`toast ${t.type}`}>{t.type==='success'?<CheckCircle size={18}/>:<AlertTriangle size={18}/>}{t.msg}</div>)}
      </div>
      <div className="page-header d-flex-between">
        <div><h1 className="page-title">Catálogo de Joyas</h1><p className="page-subtitle">Gestiona tu inventario y existencias.</p></div>
        <button className="btn-primary flex-center gap-2" onClick={openCreate}><Plus size={18}/><span>Nueva Joya</span></button>
      </div>
      <Card className="inventory-card">
        <div className="inventory-toolbar">
          <div className="search-box"><Search size={18} className="text-muted"/><input type="text" placeholder="Buscar por nombre, SKU o categoría..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
        </div>
        {loading ? (
          <div className="loading-container"><div className="loading-spinner"></div><span className="loading-text">Cargando inventario...</span></div>
        ) : filtered.length===0 ? (
          <div className="empty-state"><div className="empty-state-icon"><Package size={32}/></div><h3>{search?'Sin resultados':'Inventario vacío'}</h3><p>{search?'No se encontraron productos.':'Agrega tu primera joya para comenzar.'}</p></div>
        ) : (
          <div className="table-responsive">
            <table className="luxury-table"><thead><tr><th>SKU</th><th>Nombre</th><th>Categoría</th><th>Descripción</th><th>Costo</th><th>Precio</th><th>Stock</th><th>Acciones</th></tr></thead>
              <tbody>{filtered.map(i => (
                <tr key={i.id}>
                  <td className="text-muted">{i.sku}</td><td className="text-gold font-bold">{i.name}</td><td>{i.category}</td><td className="text-muted">{i.description||'—'}</td>
                  <td className="font-serif">${i.cost.toFixed(2)}</td><td className="font-serif text-gold">${i.price.toFixed(2)}</td>
                  <td><span className={`stock-badge ${i.stock<=2?'low':''}`}>{i.stock} {i.stock===1?'ud':'uds'}</span></td>
                  <td><div className="action-buttons"><button className="action-btn edit" onClick={()=>openEdit(i)} title="Editar"><Edit size={16}/></button><button className="action-btn delete" onClick={()=>openDel(i)} title="Eliminar"><Trash2 size={16}/></button></div></td>
                </tr>
              ))}</tbody></table>
          </div>
        )}
      </Card>

      <Modal isOpen={showForm} onClose={()=>setShowForm(false)} title={editing?'Editar Joya':'Nueva Joya'} size="medium">
        <form className="modal-form" onSubmit={submit}>
          {err && <div className="form-error">{err}</div>}
          <div className="form-row">
            <div className="form-group"><label>SKU / Código</label><input type="text" value={form.sku} onChange={e=>set('sku',e.target.value)} placeholder="Ej: J-003" required/></div>
            <div className="form-group"><label>Categoría</label><select value={form.category} onChange={e=>set('category',e.target.value)}>{CATS.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
          </div>
          <div className="form-group full-width"><label>Nombre de la Joya</label><input type="text" value={form.name} onChange={e=>set('name',e.target.value)} placeholder="Ej: Anillo Diamante 1ct" required/></div>
          <div className="form-group full-width"><label>Descripción</label><textarea value={form.description} onChange={e=>set('description',e.target.value)} placeholder="Materiales, kilates..."/></div>
          <div className="form-row">
            <div className="form-group"><label>Costo ($)</label><input type="number" step="0.01" min="0" value={form.cost} onChange={e=>set('cost',e.target.value)} placeholder="0.00" required/></div>
            <div className="form-group"><label>Precio Venta ($)</label><input type="number" step="0.01" min="0" value={form.price} onChange={e=>set('price',e.target.value)} placeholder="0.00" required/></div>
          </div>
          <div className="form-row"><div className="form-group"><label>Stock</label><input type="number" min="0" step="1" value={form.stock} onChange={e=>set('stock',e.target.value)} placeholder="0"/></div><div className="form-group"></div></div>
          <div className="modal-actions"><button type="button" className="btn-cancel" onClick={()=>setShowForm(false)}>Cancelar</button><button type="submit" className="btn-save" disabled={saving}>{saving?'Guardando...':(editing?'Actualizar':'Crear Joya')}</button></div>
        </form>
      </Modal>

      <Modal isOpen={showDel} onClose={()=>setShowDel(false)} title="Confirmar Eliminación" size="small">
        <div className="confirm-dialog">
          <div className="confirm-icon"><AlertTriangle size={28}/></div>
          <p>¿Eliminar este producto?</p>
          {deleting && <p className="confirm-item-name">{deleting.name}</p>}
          <p style={{fontSize:'0.8rem',marginTop:'8px'}}>Esta acción no se puede deshacer.</p>
          {err && <div className="form-error" style={{textAlign:'left',marginTop:'12px'}}>{err}</div>}
        </div>
        <div className="modal-actions"><button className="btn-cancel" onClick={()=>setShowDel(false)}>Cancelar</button><button className="btn-danger" onClick={del} disabled={saving}>{saving?'Eliminando...':'Eliminar'}</button></div>
      </Modal>
    </div>
  );
};

export default Inventory;
