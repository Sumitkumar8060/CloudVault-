import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileX, AlertCircle } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import { getFiles, deleteFileById, uploadFile, downloadFileBlob } from '../api/fileApi';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import FileToolbar from '../components/FileToolbar';
import FileRow from '../components/FileRow';
import UploadModal from '../components/UploadModal';
import FileViewerModal from '../components/FileViewerModal';
import ShareModal from '../components/ShareModal';
import './MyFiles.css';

function MyFiles() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeType, setActiveType] = useState('all');

  const [files, setFiles] = useState([]);
  const [filesLoading, setFilesLoading] = useState(true);
  const [filesError, setFilesError] = useState('');
  const [viewerFile, setViewerFile] = useState(null);
  const [shareModalFile, setShareModalFile] = useState(null);

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
    const fetchFiles = async () => {
      try {
        const token = localStorage.getItem('cloudvault_token');
        const response = await getFiles(token);
        setFiles(response.data.files);
      } catch (err) {
        setFilesError('Could not load your files. Please try again.');
      } finally {
        setFilesLoading(false);
      }
    };

    fetchFiles();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('cloudvault_token');
    localStorage.removeItem('cloudvault_user');
    navigate('/login');
  };

  const handleDeleteFile = async (id) => {
    const token = localStorage.getItem('cloudvault_token');
    const previousFiles = files;

    setFiles((current) => current.filter((f) => f.id !== id));

    try {
      await deleteFileById(id, token);
    } catch (err) {
      setFiles(previousFiles);
      alert('Could not delete the file. Please try again.');
    }
  };

  // Called by UploadModal once a file is picked and the user clicks "Upload".
  // Throwing here lets UploadModal catch it and show the error inline, rather
  // than this function swallowing it silently.
  const handleUpload = async (selectedFile) => {
    const token = localStorage.getItem('cloudvault_token');
    const response = await uploadFile(selectedFile, token);
    setFiles((current) => [response.data.file, ...current]);
  };

  const handleDownload = async (id, name) => {
    try {
      const token = localStorage.getItem('cloudvault_token');
      const response = await downloadFileBlob(id, token);

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

    } catch (err) {
      alert('Could not download the file. Please try again.');
    }
  };

  const filteredFiles = useMemo(() => {
    return files.filter((file) => {
      const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = activeType === 'all' || file.type === activeType;
      return matchesSearch && matchesType;
    });
  }, [files, searchTerm, activeType]);

  if (!user) {
    return <p className="myfiles-loading">Loading your files…</p>;
  }

  return (
    <div className="dashboard-shell">
      <Sidebar
        user={user}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="dashboard-main">
        <Topbar
          user={user}
          onLogout={handleLogout}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <div className="myfiles-content">
          <h1 className="myfiles-title">My Files</h1>
          <p className="myfiles-subtitle">
            {files.length} {files.length === 1 ? 'file' : 'files'} total
          </p>

          <FileToolbar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            activeType={activeType}
            onTypeChange={setActiveType}
            onUploadClick={() => setUploadModalOpen(true)}
          />

          <div className="myfiles-list-card">
            {filesLoading ? (
              <p className="myfiles-status-text">Loading files…</p>
            ) : filesError ? (
              <div className="myfiles-empty">
                <AlertCircle size={36} className="myfiles-empty-icon" />
                <p className="myfiles-empty-title">{filesError}</p>
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="myfiles-empty">
                <FileX size={36} className="myfiles-empty-icon" />
                <p className="myfiles-empty-title">
                  {files.length === 0 ? 'No documents yet.' : 'No matching files.'}
                </p>
                <p className="myfiles-empty-subtitle">
                  {files.length === 0
                    ? 'Upload your first document to get started.'
                    : 'Try a different search term or filter.'}
                </p>
              </div>
            ) : (
              filteredFiles.map((file) => (
                <FileRow
                  key={file.id}
                  file={file}
                  onDelete={handleDeleteFile}
                  onDownload={handleDownload}
                  onView={setViewerFile}
                  onShare={setShareModalFile}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {uploadModalOpen && (
        <UploadModal
          onClose={() => setUploadModalOpen(false)}
          onUploadComplete={handleUpload}
        />
      )}

      {viewerFile && (
        <FileViewerModal
          file={viewerFile}
          onClose={() => setViewerFile(null)}
          onDownload={handleDownload}
        />
      )}

      {shareModalFile && (
        <ShareModal 
          file={shareModalFile} 
          onClose={() => setShareModalFile(null)}
        />
)}


    </div>
  );
}

export default MyFiles;