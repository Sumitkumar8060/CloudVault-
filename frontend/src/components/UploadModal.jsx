import { X, UploadCloud } from 'lucide-react';
import './UploadModal.css';

function UploadModal({ onClose }) {
  return (
    <div className="upload-modal-overlay" onClick={onClose}>
      <div className="upload-modal" onClick={(e) => e.stopPropagation()}>
        <button className="upload-modal-close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
        <UploadCloud size={36} className="upload-modal-icon" />
        <h3>Upload coming soon</h3>
        <p>
          File upload and storage will be available in a future phase of CloudVault,
          once S3 integration is complete.
        </p>
        <button className="upload-modal-btn" onClick={onClose}>Got it</button>
      </div>
    </div>
  );
}

export default UploadModal;