import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2 as TrashIcon } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import { getTrashFiles, restoreFileById, permanentlyDeleteFileById, emptyTrashApi } from '../api/fileApi';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import TrashFileRow from '../components/TrashFileRow';
import './Trash.css';

function Trash() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const token = localStorage.getItem('cloudvault_token');
        const response = await axiosInstance.get('/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data.user);
      } catch (err) {
        localStorage.removeItem('cloudvault_token');
        localStorage.removeItem('cloudvault_user');
        navigate('/login');
      }
    };

    fetchMe();
  }, [navigate]);

  useEffect(() => {
    const fetchTrash = async () => {
      try {
        const token = localStorage.getItem('cloudvault_token');
        const response = await getTrashFiles(token);
        setFiles(response.data.files);
      } catch (err) {
        setError('Could not load Trash. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTrash();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('cloudvault_token');
    localStorage.removeItem('cloudvault_user');
    navigate('/login');
  };

  const handleRestore = async (id) => {
    const token = localStorage.getItem('cloudvault_token');
    const previous = files;
    setFiles((current) => current.filter((f) => f.id !== id));

    try {
      await restoreFileById(id, token);
    } catch (err) {
      setFiles(previous);
      alert('Could not restore the file.');
    }
  };

  const handlePermanentDelete = async (id) => {
    const token = localStorage.getItem('cloudvault_token');
    const previous = files;
    setFiles((current) => current.filter((f) => f.id !== id));

    try {
      await permanentlyDeleteFileById(id, token);
    } catch (err) {
      setFiles(previous);
      alert('Could not permanently delete the file.');
    }
  };

  const handleEmptyTrash = async () => {
    const confirmed = window.confirm(
      `Permanently delete all ${files.length} file(s) in Trash? This cannot be undone.`
    );
    if (!confirmed) return;

    const token = localStorage.getItem('cloudvault_token');
    const previous = files;
    setFiles([]);

    try {
      await emptyTrashApi(token);
    } catch (err) {
      setFiles(previous);
      alert('Could not empty the Trash.');
    }
  };

  if (!user) {
    return <p className="trash-loading">Loading…</p>;
  }

  return (
    <div className="dashboard-shell">
      <Sidebar user={user} onLogout={handleLogout} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="dashboard-main">
        <Topbar user={user} onLogout={handleLogout} onMenuClick={() => setSidebarOpen(true)} />

        <div className="trash-content">
          <div className="trash-header">
            <div>
              <h1 className="trash-title">Trash</h1>
              <p className="trash-subtitle">
                Files here can be restored or permanently deleted. Nothing is deleted forever until you choose to.
              </p>
            </div>
            {files.length > 0 && (
              <button className="trash-empty-btn" onClick={handleEmptyTrash}>
                Empty Trash
              </button>
            )}
          </div>

          <div className="trash-list-card">
            {loading ? (
              <p className="trash-status-text">Loading…</p>
            ) : error ? (
              <p className="trash-status-text">{error}</p>
            ) : files.length === 0 ? (
              <div className="trash-empty-state">
                <TrashIcon size={36} className="trash-empty-icon" />
                <p className="trash-empty-title">Trash is empty.</p>
                <p className="trash-empty-subtitle">Deleted files will show up here.</p>
              </div>
            ) : (
              files.map((file) => (
                <TrashFileRow
                  key={file.id}
                  file={file}
                  onRestore={handleRestore}
                  onPermanentDelete={handlePermanentDelete}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Trash;