import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Trash2, ShoppingBag, AlertTriangle, CheckCircle, X as XIcon } from 'lucide-react';
import Card from '../components/UI/Card';
import Modal from '../components/UI/Modal';
import { useAuth } from '../context/AuthContext';

const Sales = () => {
  const { authFetch } = useAuth();
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showDel, setShowDel] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [saleItems, setSaleItems] = useState([{ productId: '', quantity: 1 }]);
  const [clientName, setClientName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Efectivo');
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
      const [sRes, pRes] = await Promise.all([authFetch('/api/sales'), authFetch('/api/inventory')]);
      if (!sRes.ok || !pRes.ok) throw new Error('Error al cargar datos');
      setSales(await sRes.json());
      setProducts(await pRes.json());
    } catch (e) { toast(e.message, 'error'); }
    finally { setLoading(false); }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setSaleItems([{ productId: '', quantity: 1 }]);
    setClientName('');
    setPaymentMethod('Efectivo');
    setErr('');
    setShowForm(true);
  };

  const openDel = (s) => { setDeleting(s); setErr(''); setShowDel(true); };

  const addItem = () => setSaleItems(p => [...p, { productId: '', quantity: 1 }]);
  const removeItem = (idx) => setSaleItems(p => p.filter((_, i) => i !== idx));
  const updateItem = (idx, field, val) => {
    setSaleItems(p => p.map((item, i) => i === idx ? { ...item, [field]: val } : item));
  };

  const getProduct = (id) => products.find(p => p.id === Number(id));

  const calcTotal = () => {
    return saleItems.reduce((sum, item) => {
      const prod = getProduct(item.productId);
      if (!prod) return sum;
      return sum + prod.price * item.quantity;
    }, 0);
  };

  const submitSale = async (e) => {
    e.preventDefault(); setErr(''); setSaving(true);
    const validItems = saleItems.filter(i => i.productId && i.quantity > 0);
    if (validItems.length === 0) { setErr('Agrega al menos un artículo.'); setSaving(false); return; }

    const items = validItems.map(i => {
      const prod = getProduct(i.productId);
      return { productId: Number(i.productId), quantity: Number(i.quantity), priceAtSale: prod.price };
    });

    try {
      const r = await authFetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ totalAmount: calcTotal(), items, clientName: clientName.trim() || 'Cliente en Tienda', paymentMethod })
      });
      if (!r.ok) { const e = await r.json(); throw new Error(e.error); }
      toast('Venta registrada exitosamente');
      setShowForm(false); load();
    } catch (e) { setErr(e.message); } finally { setSaving(false); }
  };

  const del = async () => {
    setSaving(true); setErr('');
    try {
      const r = await authFetch(`/api/sales/${deleting.id}`, { method: 'DELETE' });
      if (!r.ok) { const e = await r.json(); throw new Error(e.error); }
      toast('Venta eliminada (stock restaurado)');
      setShowDel(false); load();
    } catch (e) { setErr(e.message); } finally { setSaving(false); }
  };

  const filtered = sales.filter(s => {
    if (!search) return true;
    const t = search.toLowerCase();
    return String(s.id).includes(t) || (s.clientName && s.clientName.toLowerCase().includes(t)) || new Date(s.date).toLocaleDateString().includes(t) || s.items?.some(i => i.product?.name?.toLowerCase().includes(t));
  });

  const availableProducts = products.filter(p => p.stock > 0);

  return (
    <div className="sales dashboard">
      <div className="toast-container">
        {toasts.map(t => <div key={t.id} className={`toast ${t.type}`}>{t.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}{t.msg}</div>)}
      </div>

      <div className="page-header d-flex-between">
        <div><h1 className="page-title">Registro de Ventas</h1><p className="page-subtitle">Visualiza y registra las ventas realizadas en la tienda.</p></div>
        <button className="btn-primary flex-center gap-2" onClick={openCreate}><Plus size={18} /><span>Nueva Venta</span></button>
      </div>

      <Card>
        <div className="inventory-toolbar">
          <div className="search-box"><Search size={18} className="text-muted" /><input type="text" placeholder="Buscar por ID, cliente o producto..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        </div>

        {loading ? (
          <div className="loading-container"><div className="loading-spinner"></div><span className="loading-text">Cargando ventas...</span></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon"><ShoppingBag size={32} /></div><h3>{search ? 'Sin resultados' : 'No hay ventas'}</h3><p>{search ? 'No se encontraron ventas.' : 'Registra tu primera venta.'}</p></div>
        ) : (
          <div className="table-responsive">
            <table className="luxury-table">
              <thead><tr><th>ID</th><th>Fecha</th><th>Cliente</th><th>Artículos</th><th>Total</th><th>Método</th><th>Estado</th><th>Acciones</th></tr></thead>
              <tbody>{filtered.map(s => (
                <tr key={s.id}>
                  <td className="text-muted">#{s.id}</td>
                  <td>{new Date(s.date).toLocaleDateString()}</td>
                  <td className="font-bold">{s.clientName || 'Cliente en Tienda'}</td>
                  <td className="text-muted" style={{ fontSize: '0.85rem' }}>{s.items?.map(i => `${i.product?.name} (${i.quantity})`).join(', ')}</td>
                  <td className="text-gold font-serif font-bold">${s.totalAmount?.toFixed(2)}</td>
                  <td>{s.paymentMethod || 'Efectivo'}</td>
                  <td><span className="stock-badge">Completado</span></td>
                  <td><button className="action-btn delete" onClick={() => openDel(s)} title="Eliminar venta"><Trash2 size={16} /></button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </Card>

      {/* New Sale Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Nueva Venta" size="large">
        <form className="modal-form" onSubmit={submitSale}>
          {err && <div className="form-error">{err}</div>}
          <div className="form-row">
            <div className="form-group"><label>Cliente</label><input type="text" value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Cliente en Tienda" /></div>
            <div className="form-group"><label>Método de Pago</label>
              <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                <option value="Efectivo">Efectivo</option><option value="Tarjeta de Crédito">Tarjeta de Crédito</option><option value="Tarjeta de Débito">Tarjeta de Débito</option><option value="Transferencia">Transferencia</option>
              </select>
            </div>
          </div>

          <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Artículos de la Venta</label>
          <div className="sale-items-list">
            {saleItems.map((item, idx) => {
              const prod = getProduct(item.productId);
              return (
                <div className="sale-item-row" key={idx}>
                  <select value={item.productId} onChange={e => updateItem(idx, 'productId', e.target.value)}>
                    <option value="">Seleccionar producto...</option>
                    {availableProducts.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>)}
                  </select>
                  <input type="number" min="1" max={prod ? prod.stock : 999} value={item.quantity} onChange={e => updateItem(idx, 'quantity', parseInt(e.target.value) || 1)} />
                  <span className="sale-item-price">{prod ? `$${(prod.price * item.quantity).toFixed(2)}` : '$0.00'}</span>
                  {saleItems.length > 1 && <button type="button" className="remove-item-btn" onClick={() => removeItem(idx)}><XIcon size={16} /></button>}
                </div>
              );
            })}
          </div>
          <button type="button" className="add-item-btn" onClick={addItem}><Plus size={16} /> Agregar otro artículo</button>

          <div className="sale-total-row">
            <span className="sale-total-label">Total de la Venta</span>
            <span className="sale-total-value">${calcTotal().toFixed(2)}</span>
          </div>

          <div className="modal-actions"><button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>Cancelar</button><button type="submit" className="btn-save" disabled={saving}>{saving ? 'Registrando...' : 'Registrar Venta'}</button></div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={showDel} onClose={() => setShowDel(false)} title="Eliminar Venta" size="small">
        <div className="confirm-dialog">
          <div className="confirm-icon"><AlertTriangle size={28} /></div>
          <p>¿Eliminar esta venta? El stock de los productos será restaurado.</p>
          {deleting && <p className="confirm-item-name">Venta #{deleting.id} — ${deleting.totalAmount?.toFixed(2)}</p>}
          {err && <div className="form-error" style={{ textAlign: 'left', marginTop: '12px' }}>{err}</div>}
        </div>
        <div className="modal-actions"><button className="btn-cancel" onClick={() => setShowDel(false)}>Cancelar</button><button className="btn-danger" onClick={del} disabled={saving}>{saving ? 'Eliminando...' : 'Eliminar Venta'}</button></div>
      </Modal>
    </div>
  );
};

export default Sales;
