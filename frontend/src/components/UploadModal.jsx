// import { X, UploadCloud } from 'lucide-react';
// import './UploadModal.css';

// function UploadModal({ onClose }) {
//   return (
//     <div className="upload-modal-overlay" onClick={onClose}>
//       <div className="upload-modal" onClick={(e) => e.stopPropagation()}>
//         <button className="upload-modal-close" onClick={onClose} aria-label="Close">
//           <X size={18} />
//         </button>
//         <UploadCloud size={36} className="upload-modal-icon" />
//         <h3>Upload coming soon</h3>
//         <p>
//           File upload and storage will be available in a future phase of CloudVault,
//           once S3 integration is complete.
//         </p>
//         <button className="upload-modal-btn" onClick={onClose}>Got it</button>
//       </div>
//     </div>
//   );
// }

// export default UploadModal;




import { useState } from 'react';
import { X, UploadCloud } from 'lucide-react';
import './UploadModal.css';

function UploadModal({ onClose, onUploadComplete }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const isRealUpload = Boolean(onUploadComplete);

  const handleFileChange = (e) => {
    setError('');
    setSelectedFile(e.target.files[0] || null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please choose a file first.');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      await onUploadComplete(selectedFile);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="upload-modal-overlay" onClick={onClose}>
      <div className="upload-modal" onClick={(e) => e.stopPropagation()}>
        <button className="upload-modal-close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>

        {!isRealUpload ? (
          <>
            <UploadCloud size={36} className="upload-modal-icon" />
            <h3>Upload coming soon</h3>
            <p>
              File upload will be available here once this page is connected
              to document storage.
            </p>
            <button className="upload-modal-btn" onClick={onClose}>Got it</button>
          </>
        ) : (
          <>
            <UploadCloud size={36} className="upload-modal-icon" />
            <h3>Upload a document</h3>
            <p className="upload-modal-helptext">
              Stored on the server for now — max 20 MB. Cloud storage (S3) comes in a later phase.
            </p>

            <input
              type="file"
              id="upload-modal-input"
              className="upload-modal-file-input"
              onChange={handleFileChange}
            />
            <label htmlFor="upload-modal-input" className="upload-modal-file-label">
              {selectedFile ? selectedFile.name : 'Choose a file'}
            </label>

            {error && <p className="upload-modal-error">{error}</p>}

            <button className="upload-modal-btn" onClick={handleUpload} disabled={isUploading}>
              {isUploading ? 'Uploading…' : 'Upload'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default UploadModal;