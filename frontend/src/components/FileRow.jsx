import { FileText, MoreVertical } from 'lucide-react';

function FileRow({ file }) {
  const formattedDate = new Date(file.uploadedAt).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="file-row">
      <div className="file-row-main">
        <FileText size={20} className="file-row-icon" />
        <div className="file-row-info">
          <span className="file-row-name">{file.name}</span>
          <span className="file-row-meta">{file.type.toUpperCase()} · {file.size}</span>
        </div>
      </div>
      <span className="file-row-date">{formattedDate}</span>
      <button className="file-row-action" aria-label="File actions" disabled>
        <MoreVertical size={17} />
      </button>
    </div>
  );
}

export default FileRow;