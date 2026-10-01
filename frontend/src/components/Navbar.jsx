import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">CloudVault</Link>
      <div className="navbar-actions">
        <Link to="/login" className="navbar-link">Log in</Link>
        <Link to="/register" className="navbar-btn">Create account</Link>
      </div>
    </nav>
  );
}

export default Navbar;