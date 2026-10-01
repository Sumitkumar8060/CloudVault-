import './AuthLayout.css';

function AuthLayout({ children }) {
  return (
    <div className="auth-shell">
      <div className="auth-motif">
        <svg viewBox="0 0 200 200" className="auth-motif-svg" aria-hidden="true">
          <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
          <circle cx="100" cy="100" r="65" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
          <circle cx="100" cy="100" r="40" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
          <circle cx="100" cy="100" r="6" fill="rgba(255,255,255,0.6)" />
        </svg>
        <div className="auth-motif-text">
          <h1>CloudVault</h1>
          <p>Your documents, secured.</p>
        </div>
      </div>

      <div className="auth-panel">
        <div className="auth-panel-inner">
          <h1 className="auth-panel-brand">CloudVault</h1>
          {children}
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;