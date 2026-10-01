import { useState } from 'react';
import { Menu, Search, Bell, ChevronDown, LogOut, Settings } from 'lucide-react';
import './Topbar.css';

function Topbar({ user, onLogout, onMenuClick }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="topbar">
      <button className="topbar-menu-btn" onClick={onMenuClick} aria-label="Open menu">
        <Menu size={22} />
      </button>

      <div className="topbar-search">
        <Search size={17} className="topbar-search-icon" />
        <input type="text" placeholder="Search files..." disabled />
      </div>

      <div className="topbar-actions">
        <button className="topbar-icon-btn" aria-label="Notifications" disabled>
          <Bell size={19} />
        </button>

        <div className="topbar-user-menu">
          <button className="topbar-user-btn" onClick={() => setMenuOpen(!menuOpen)}>
            <div className="topbar-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
            <span className="topbar-user-name">{user?.name}</span>
            <ChevronDown size={15} />
          </button>

          {menuOpen && (
            <div className="topbar-dropdown">
              <button className="topbar-dropdown-item" disabled>
                <Settings size={15} />
                <span>Settings</span>
              </button>
              <button className="topbar-dropdown-item" onClick={onLogout}>
                <LogOut size={15} />
                <span>Log out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Topbar;