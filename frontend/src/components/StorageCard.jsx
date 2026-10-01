import { HardDrive } from 'lucide-react';
import './StorageCard.css';

function StorageCard({ usedGB, limitGB }) {
  const percent = Math.min(100, Math.round((usedGB / limitGB) * 100));

  return (
    <div className="storage-card">
      <div className="storage-card-header">
        <HardDrive size={18} />
        <span>Storage</span>
      </div>
      <p className="storage-card-text">
        {usedGB} GB of {limitGB} GB used
      </p>
      <div className="storage-bar-track">
        <div className="storage-bar-fill" style={{ width: `${percent}%` }} />
      </div>
      <span className="storage-card-percent">{percent}% used</span>
    </div>
  );
}

export default StorageCard;