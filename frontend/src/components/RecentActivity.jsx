import { Upload, Download, Share2, Trash2 } from 'lucide-react';
import './RecentActivity.css';

const iconMap = {
  uploaded: Upload,
  downloaded: Download,
  shared: Share2,
  deleted: Trash2,
};

function RecentActivity({ activities }) {
  return (
    <div className="recent-activity">
      <h2>Recent Activity</h2>

      {activities.length === 0 ? (
        <p className="recent-activity-empty">No activity yet.</p>
      ) : (
        <ul className="recent-activity-list">
          {activities.map((item) => {
            const Icon = iconMap[item.action] || Upload;
            return (
              <li key={item.id} className="recent-activity-item">
                <div className="recent-activity-icon">
                  <Icon size={15} />
                </div>
                <div className="recent-activity-text">
                  <span>You {item.action} <strong>{item.fileName}</strong></span>
                  <span className="recent-activity-time">{item.timestamp}</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default RecentActivity;