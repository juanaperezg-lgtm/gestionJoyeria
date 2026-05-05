import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Gem, DollarSign, CreditCard, LogOut } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const menuItems = [
    { path: '/dashboard', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/inventory', name: 'Inventario', icon: <Gem size={20} /> },
    { path: '/sales', name: 'Ventas', icon: <DollarSign size={20} /> },
    { path: '/expenses', name: 'Gastos', icon: <CreditCard size={20} /> },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Gem size={28} className="text-gold" />
        <h2>Aura <span className="text-gold">Joyeros</span></h2>
      </div>

      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink 
                to={item.path} 
                className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-text">{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn">
          <LogOut size={20} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
