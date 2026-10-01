import { FileText } from 'lucide-react';
import FileRow from './FileRow';
import './RecentFiles.css';

function RecentFiles({ files, onUploadClick }) {
  return (
    <div className="recent-files">
      <div className="recent-files-header">
        <h2>Recent Documents</h2>
      </div>

      {files.length === 0 ? (
        <div className="recent-files-empty">
          <FileText size={36} className="recent-files-empty-icon" />
          <p className="recent-files-empty-title">No documents yet.</p>
          <p className="recent-files-empty-subtitle">
            Upload your first document to get started.
          </p>
          <button className="recent-files-empty-btn" onClick={onUploadClick}>
            Upload Document
          </button>
        </div>
      ) : (
        <div className="recent-files-list">
          {files.map((file) => (
            <FileRow key={file.id} file={file} />
          ))}
        </div>
      )}
    </div>
  );
}

export default RecentFiles;