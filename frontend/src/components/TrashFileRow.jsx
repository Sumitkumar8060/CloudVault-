import { RotateCcw, Trash2 } from 'lucide-react';
import { getFileIcon } from '../utils/fileIcons';
import './TrashFileRow.css';

function TrashFileRow({ file, onRestore, onPermanentDelete }) {
  const Icon = getFileIcon(file.type);

  const formattedDate = new Date(file.deletedAt).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const handlePermanentDelete = () => {
    const confirmed = window.confirm(
      `Permanently delete "${file.name}"? This cannot be undone — the file will be gone for good.`
    );
    if (confirmed) {
      onPermanentDelete(file.id);
    }
  };

  return (
    <div className="trash-file-row">
      <div className="trash-file-row-main">
        <Icon size={20} className="trash-file-row-icon" />
        <div className="trash-file-row-info">
          <span className="trash-file-row-name">{file.name}</span>
          <span className="trash-file-row-meta">{file.type.toUpperCase()} · {file.size}</span>
        </div>
      </div>
      <span className="trash-file-row-date">Deleted {formattedDate}</span>
      <div className="trash-file-row-actions">
        <button className="trash-file-row-btn" onClick={() => onRestore(file.id)} title="Restore">
          <RotateCcw size={16} />
        </button>
        <button className="trash-file-row-btn danger" onClick={handlePermanentDelete} title="Delete forever">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

export default TrashFileRow;