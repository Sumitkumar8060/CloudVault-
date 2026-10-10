import { useEffect, useState } from 'react';
import { X, Copy, Check, Link2 } from 'lucide-react';
import { createShareLink, getActiveShareLink, revokeShareLink } from '../api/shareApi';
import './ShareModal.css';

const expiryOptions = [
  { label: '1 hour', hours: 1 },
  { label: '24 hours', hours: 24 },
  { label: '7 days', hours: 24 * 7 },
];

function ShareModal({ file, onClose }) {
  const [share, setShare] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [expiryHours, setExpiryHours] = useState(24);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchShare = async () => {
      try {
        const token = localStorage.getItem('cloudvault_token');
        const response = await getActiveShareLink(file.id, token);
        setShare(response.data.share);
      } catch (err) {
        setError('Could not load share status.');
      } finally {
        setLoading(false);
      }
    };

    fetchShare();
  }, [file.id]);

  const handleCreate = async () => {
    setCreating(true);
    setError('');
    try {
      const token = localStorage.getItem('cloudvault_token');
      const response = await createShareLink(file.id, token, expiryHours);
      setShare(response.data.share);
    } catch (err) {
      setError('Could not create a share link. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async () => {
    const confirmed = window.confirm('Revoke this share link? Anyone with the link will lose access immediately.');
    if (!confirmed) return;

    try {
      const token = localStorage.getItem('cloudvault_token');
      await revokeShareLink(file.id, token);
      setShare(null);
    } catch (err) {
      setError('Could not revoke the share link.');
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(share.shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="share-modal-overlay" onClick={onClose}>
      <div className="share-modal" onClick={(e) => e.stopPropagation()}>
        <button className="share-modal-close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>

        <Link2 size={28} className="share-modal-icon" />
        <h3>Share "{file.name}"</h3>

        {loading ? (
          <p className="share-modal-status">Checking share status…</p>
        ) : error ? (
          <p className="share-modal-error">{error}</p>
        ) : share ? (
          <>
            <p className="share-modal-helptext">
              Anyone with this link can view and download this file until it expires or is revoked.
            </p>
            <div className="share-modal-link-row">
              <input type="text" readOnly value={share.shareUrl} className="share-modal-link-input" />
              <button className="share-modal-copy-btn" onClick={handleCopy}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
            <p className="share-modal-expiry">
              Expires: {new Date(share.expiresAt).toLocaleString()}
            </p>
            <button className="share-modal-revoke-btn" onClick={handleRevoke}>
              Revoke link
            </button>
          </>
        ) : (
          <>
            <p className="share-modal-helptext">
              Create a temporary link anyone can use to view or download this file — no login required.
            </p>
            <label className="share-modal-label">Link expires after</label>
            <select
              className="share-modal-select"
              value={expiryHours}
              onChange={(e) => setExpiryHours(Number(e.target.value))}
            >
              {expiryOptions.map((opt) => (
                <option key={opt.hours} value={opt.hours}>{opt.label}</option>
              ))}
            </select>
            <button className="share-modal-create-btn" onClick={handleCreate} disabled={creating}>
              {creating ? 'Creating…' : 'Create share link'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default ShareModal;