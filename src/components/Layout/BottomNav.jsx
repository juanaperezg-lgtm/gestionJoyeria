import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Gem, DollarSign, CreditCard, Users } from 'lucide-react';
import './BottomNav.css';

const BottomNav = () => {
  const menuItems = [
    { path: '/dashboard', name: 'Resumen', icon: <LayoutDashboard size={20} /> },
    { path: '/inventory', name: 'Joyas', icon: <Gem size={20} /> },
    { path: '/sales', name: 'Ventas', icon: <DollarSign size={20} /> },
    { path: '/expenses', name: 'Gastos', icon: <CreditCard size={20} /> },
    { path: '/clients', name: 'Clientes', icon: <Users size={20} /> },
  ];

  return (
    <nav className="bottom-nav">
      <ul>
        {menuItems.map((item) => (
          <li key={item.path}>
            <NavLink 
              to={item.path} 
              className={({ isActive }) => isActive ? "bottom-nav-link active" : "bottom-nav-link"}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text">{item.name}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default BottomNav;
