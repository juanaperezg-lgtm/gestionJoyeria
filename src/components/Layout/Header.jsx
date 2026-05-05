import React from 'react';
import { Bell, Search, User } from 'lucide-react';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="header-search">
        <Search size={18} className="search-icon" />
        <input type="text" placeholder="Buscar en inventario, ventas..." className="search-input" />
      </div>

      <div className="header-actions">
        <button className="icon-btn notification-btn">
          <Bell size={20} />
          <span className="notification-badge"></span>
        </button>
        
        <div className="user-profile">
          <div className="avatar">
            <User size={20} />
          </div>
          <div className="user-info">
            <span className="user-name">Administrador</span>
            <span className="user-role">Dueño</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
