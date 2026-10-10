import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FileWarning, Download, FileText } from 'lucide-react';
import { getPublicShareInfo } from '../api/shareApi';
import { getPreviewKind } from '../utils/filePreview';
import './SharedFile.css';

const API_URL = import.meta.env.VITE_API_URL;

function SharedFile() {
  const { token } = useParams();
  const [file, setFile] = useState(null);
  const [textContent, setTextContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const viewUrl = `${API_URL}/public/share/${token}/view`;
  const downloadUrl = `${API_URL}/public/share/${token}/download`;

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const response = await getPublicShareInfo(token);
        setFile(response.data.file);
      } catch (err) {
        setError(err.response?.data?.message || 'This share link is invalid or has expired.');
      } finally {
        setLoading(false);
      }
    };

    fetchInfo();
  }, [token]);

  useEffect(() => {
    if (file && getPreviewKind(file.mimeType) === 'text') {
      fetch(viewUrl).then((r) => r.text()).then(setTextContent).catch(() => {});
    }
  }, [file, viewUrl]);

  const previewKind = file ? getPreviewKind(file.mimeType) : 'unsupported';

  return (
    <div className="shared-file-shell">
      <div className="shared-file-card">
        <h1 className="shared-file-brand">CloudVault</h1>

        {loading && <p className="shared-file-status">Loading…</p>}

        {!loading && error && (
          <div className="shared-file-error">
            <FileWarning size={36} />
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && file && (
          <>
            <div className="shared-file-info">
              <FileText size={20} />
              <div>
                <p className="shared-file-name">{file.name}</p>
                <p className="shared-file-meta">{file.type.toUpperCase()} · {file.size}</p>
              </div>
            </div>

            <div className="shared-file-preview">
              {previewKind === 'image' && <img src={viewUrl} alt={file.name} />}
              {previewKind === 'pdf' && <iframe src={viewUrl} title={file.name} />}
              {previewKind === 'text' && <pre>{textContent}</pre>}
              {previewKind === 'unsupported' && (
                <p className="shared-file-no-preview">Preview not available for this file type.</p>
              )}
            </div>

            <a className="shared-file-download-btn" href={downloadUrl}>
              <Download size={17} />
              <span>Download</span>
            </a>
          </>
        )}
      </div>
    </div>
  );
}

export default SharedFile;