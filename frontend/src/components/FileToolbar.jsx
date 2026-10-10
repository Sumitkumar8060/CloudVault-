import { Search, Plus } from 'lucide-react';
import './FileToolbar.css';

const typeFilters = [
  { label: 'All types', value: 'all' },
  { label: 'PDF', value: 'pdf' },
  { label: 'Documents', value: 'doc' },
  { label: 'Images', value: 'image' },
  { label: 'Spreadsheets', value: 'sheet' },
  { label: 'Archives', value: 'archive' },
];

function FileToolbar({ searchTerm, onSearchChange, activeType, onTypeChange, onUploadClick }) {
  return (
    <div className="file-toolbar">
      <div className="file-toolbar-search">
        <Search size={17} />
        <input
          type="text"
          placeholder="Search your files..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <select
        className="file-toolbar-filter"
        value={activeType}
        onChange={(e) => onTypeChange(e.target.value)}
      >
        {typeFilters.map((filter) => (
          <option key={filter.value} value={filter.value}>
            {filter.label}
          </option>
        ))}
      </select>

      <button className="file-toolbar-upload-btn" onClick={onUploadClick}>
        <Plus size={17} />
        <span>Upload</span>
      </button>
    </div>
  );
}

export default FileToolbar;