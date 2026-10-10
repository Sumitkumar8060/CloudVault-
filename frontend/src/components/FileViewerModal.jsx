import { useEffect, useState } from 'react';
import { X, Download, FileWarning } from 'lucide-react';
import { getFileBlob } from '../api/fileApi';
import { getPreviewKind } from '../utils/filePreview';
import './FileViewerModal.css';

function FileViewerModal({ file, onClose, onDownload }) {
  const [blobUrl, setBlobUrl] = useState(null);
  const [textContent, setTextContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const previewKind = getPreviewKind(file.mimeType);

  useEffect(() => {
    let objectUrl = null;

    const loadPreview = async () => {
      if (previewKind === 'unsupported') {
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('cloudvault_token');
        const response = await getFileBlob(file.id, token);
        const blob = response.data;

        if (previewKind === 'text') {
          const text = await blob.text();
          setTextContent(text);
        } else {
          objectUrl = window.URL.createObjectURL(blob);
          setBlobUrl(objectUrl);
        }

      } catch (err) {
        setError('Could not load preview.');
      } finally {
        setLoading(false);
      }
    };

    loadPreview();

    // Clean up the temporary object URL when the modal closes, so the
    // browser can free that memory instead of holding onto it forever.
    return () => {
      if (objectUrl) window.URL.revokeObjectURL(objectUrl);
    };
  }, [file.id, previewKind]);

  return (
    <div className="viewer-overlay" onClick={onClose}>
      <div className="viewer-modal" onClick={(e) => e.stopPropagation()}>
        <div className="viewer-header">
          <span className="viewer-filename">{file.name}</span>
          <div className="viewer-header-actions">
            <button className="viewer-icon-btn" onClick={() => onDownload(file.id)} aria-label="Download">
              <Download size={18} />
            </button>
            <button className="viewer-icon-btn" onClick={onClose} aria-label="Close">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="viewer-body">
          {loading && <p className="viewer-status-text">Loading preview…</p>}

          {!loading && error && <p className="viewer-status-text">{error}</p>}

          {!loading && !error && previewKind === 'image' && (
            <img src={blobUrl} alt={file.name} className="viewer-image" />
          )}

          {!loading && !error && previewKind === 'pdf' && (
            <iframe src={blobUrl} title={file.name} className="viewer-pdf" />
          )}

          {!loading && !error && previewKind === 'text' && (
            <pre className="viewer-text">{textContent}</pre>
          )}

          {!loading && !error && previewKind === 'unsupported' && (
            <div className="viewer-unsupported">
              <FileWarning size={36} />
              <p className="viewer-unsupported-title">Preview not available for this file type.</p>
              <p className="viewer-unsupported-subtitle">Download it to view the full content.</p>
              <button className="viewer-download-btn" onClick={() => onDownload(file.id)}>
                Download
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FileViewerModal;