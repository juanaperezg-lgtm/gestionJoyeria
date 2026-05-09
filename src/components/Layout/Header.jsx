import React, { useState, useEffect, useRef } from 'react';
import { Bell, Search, User, Package, ShoppingBag, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

const Header = () => {
  const { user, authFetch } = useAuth();
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifCount, setNotifCount] = useState(0);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Load notifications
  useEffect(() => {
    const loadNotifs = async () => {
      try {
        const [statsRes, salesRes] = await Promise.all([
          authFetch('/api/dashboard/stats'),
          authFetch('/api/sales')
        ]);
        const notifs = [];
        
        if (statsRes.ok) {
          const stats = await statsRes.json();
          if (stats.lowStockProducts && stats.lowStockProducts.length > 0) {
            stats.lowStockProducts.forEach(p => {
              notifs.push({
                id: `stock-${p.id}`,
                type: 'warning',
                icon: <Package size={16} />,
                title: 'Stock bajo',
                message: `"${p.name}" tiene solo ${p.stock} ${p.stock === 1 ? 'unidad' : 'unidades'}`,
              });
            });
          }
        }

        if (salesRes.ok) {
          const sales = await salesRes.json();
          const today = new Date().toDateString();
          const todaySales = sales.filter(s => new Date(s.date).toDateString() === today);
          todaySales.slice(0, 3).forEach(s => {
            notifs.push({
              id: `sale-${s.id}`,
              type: 'success',
              icon: <ShoppingBag size={16} />,
              title: 'Venta del día',
              message: `Venta #${s.id} — $${s.totalAmount?.toFixed(2)} a ${s.clientName || 'Cliente'}`,
            });
          });
        }

        setNotifications(notifs);
        setNotifCount(notifs.length);
      } catch (e) {
        // Silently fail for notifications
      }
    };
    loadNotifs();
    const interval = setInterval(loadNotifs, 60000); // Refresh every 60s
    return () => clearInterval(interval);
  }, [authFetch]);

  return (
    <header className="header">
      <div className="header-search">
        <Search size={18} className="search-icon" />
        <input type="text" placeholder="Buscar en inventario, ventas..." className="search-input" />
      </div>

      <div className="header-actions">
        <div className="notification-wrapper" ref={dropdownRef}>
          <button className="icon-btn notification-btn" onClick={() => setShowNotifs(!showNotifs)}>
            <Bell size={20} />
            {notifCount > 0 && <span className="notification-badge">{notifCount}</span>}
          </button>

          {showNotifs && (
            <div className="notif-dropdown">
              <div className="notif-header">
                <h4>Notificaciones</h4>
                <button className="notif-close" onClick={() => setShowNotifs(false)}><X size={16} /></button>
              </div>
              {notifications.length === 0 ? (
                <div className="notif-empty">
                  <Bell size={24} />
                  <p>Sin notificaciones</p>
                </div>
              ) : (
                <div className="notif-list">
                  {notifications.map(n => (
                    <div key={n.id} className={`notif-item notif-${n.type}`}>
                      <div className="notif-icon">{n.icon}</div>
                      <div className="notif-content">
                        <span className="notif-title">{n.title}</span>
                        <span className="notif-message">{n.message}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="user-profile">
          <div className="avatar">
            <User size={20} />
          </div>
          <div className="user-info">
            <span className="user-name">{user?.name || 'Usuario'}</span>
            <span className="user-role">{user?.role === 'admin' ? 'Administrador' : user?.role || ''}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
