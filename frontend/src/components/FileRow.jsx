import { useState } from 'react';
// import { FileText, Image, FileSpreadsheet, Archive, File, MoreVertical } from 'lucide-react';
import { MoreVertical } from 'lucide-react';
import { getFileIcon } from '../utils/fileIcons';
import { getPreviewKind } from '../utils/filePreview';
import './FileRow.css';

// const iconByType = {
//   pdf: FileText,
//   doc: FileText,
//   image: Image,
//   sheet: FileSpreadsheet,
//   archive: Archive,
// };

function FileRow({ file, onDelete, onDownload, onView, onShare }) {
  const [menuOpen, setMenuOpen] = useState(false);
  // const Icon = iconByType[file.type] || File;
  const Icon = getFileIcon(file.type);
  const hasActions = Boolean(onDelete || onDownload || onView || onShare);

  const canPreview = Boolean(onView) && getPreviewKind(file.mimeType) !== 'unsupported';

  const formattedDate = new Date(file.uploadedAt).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const handleDeleteClick = () => {
    setMenuOpen(false);
    const confirmed = window.confirm(`Delete "${file.name}"? This cannot be undone.`);
    if (confirmed) {
      onDelete(file.id);
    }
  };

  const handleDownloadClick = () => {
    setMenuOpen(false);
    onDownload(file.id);
  };

  const handlePreviewClick = () => {
    setMenuOpen(false);
    onView(file);
  };

  const handleShareClick = () => {
    setMenuOpen(false);
    onShare(file);
  };

  return (
    <div className="file-row">
      <div className="file-row-main">
        <Icon size={20} className="file-row-icon" />
        <div className="file-row-info">
          <span className="file-row-name">{file.name}</span>
          <span className="file-row-meta">{file.type.toUpperCase()} · {file.size}</span>
        </div>
      </div>
      <span className="file-row-date">{formattedDate}</span>

      <button
        className="file-row-action"
        aria-label={hasActions ? 'File actions' : 'File actions (coming soon)'}
        title={hasActions ? undefined : 'Coming soon'}
        onClick={hasActions ? () => setMenuOpen(!menuOpen) : undefined}
        disabled={!hasActions}
      >
        <MoreVertical size={17} />
      </button>

      {menuOpen && (
        <div className="file-row-menu">
          <button
            className="file-row-menu-item"
            onClick={handlePreviewClick}
            disabled={!canPreview}
            title={!canPreview ? 'Preview not available for this file type' : undefined}
          >
            Preview
          </button>
          <button className="file-row-menu-item" onClick={handleDownloadClick} disabled={!onDownload}>
            Download
          </button>
          <button className="file-row-menu-item" disabled>Rename</button>
          <button className="file-row-menu-item" onClick={handleShareClick} disabled={!onShare}>
            Share
          </button>
          <button className="file-row-menu-item danger" onClick={handleDeleteClick} disabled={!onDelete}>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default FileRow;