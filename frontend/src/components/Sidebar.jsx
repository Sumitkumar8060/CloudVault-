import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Folder,
  Share2,
  Clock,
  Trash2,
  Settings,
  LogOut,
} from 'lucide-react';
import './Sidebar.css';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, enabled: true },
  { label: 'My Files', path: '/files', icon: Folder, enabled: false },
  { label: 'Shared With Me', path: '/shared', icon: Share2, enabled: false },
  { label: 'Recent', path: '/recent', icon: Clock, enabled: false },
  { label: 'Trash', path: '/trash', icon: Trash2, enabled: false },
  { label: 'Settings', path: '/settings', icon: Settings, enabled: false },
];

function Sidebar({ user, onLogout, isOpen, onClose }) {
  const location = useLocation();

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}

      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand">CloudVault</div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            if (!item.enabled) {
              return (
                <div key={item.path} className="sidebar-nav-item disabled">
                  <span className="sidebar-nav-item-label">
                    <Icon size={18} />
                    {item.label}
                  </span>
                  <span className="sidebar-nav-soon">Soon</span>
                </div>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{user?.name}</span>
              <span className="sidebar-user-email">{user?.email}</span>
            </div>
          </div>
          <button className="sidebar-logout-btn" onClick={onLogout}>
            <LogOut size={16} />
            <span>Log out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;