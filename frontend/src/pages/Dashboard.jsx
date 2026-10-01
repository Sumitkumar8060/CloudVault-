import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Files, HardDrive, Share2, UploadCloud } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import StatCard from '../components/StatCard';
import StorageCard from '../components/StorageCard';
import RecentFiles from '../components/RecentFiles';
import RecentActivity from '../components/RecentActivity';
import UploadModal from '../components/UploadModal';
import { mockStats, mockFiles, mockActivity } from '../data/mockDashboardData';
import './Dashboard.css';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // Fetches the REAL authenticated user from the existing /api/auth/me endpoint
  // (same pattern used previously) — nothing about the user is hardcoded.
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

  const handleLogout = () => {
    localStorage.removeItem('cloudvault_token');
    localStorage.removeItem('cloudvault_user');
    navigate('/login');
  };

  if (!user) {
    return <p className="dashboard-loading">Loading your dashboard…</p>;
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

        <div className="dashboard-content">
          <div className="dashboard-welcome">
            <div>
              <h1>{getGreeting()}, {user.name}</h1>
              <p>Manage and access your documents securely from one place.</p>
            </div>
            <button className="dashboard-upload-btn" onClick={() => setUploadModalOpen(true)}>
              <Plus size={18} />
              <span>Upload Document</span>
            </button>
          </div>

          {/* Mock stats below — will become real API data once file
              management exists (see mockDashboardData.js) */}
          <div className="dashboard-stats">
            <StatCard label="Total Files" value={mockStats.totalFiles} icon={Files} />
            <StatCard label="Storage Used" value={`${mockStats.storageUsedGB} GB`} icon={HardDrive} />
            <StatCard label="Shared Files" value={mockStats.sharedFiles} icon={Share2} />
            <StatCard label="Recent Uploads" value={mockStats.recentUploads} icon={UploadCloud} />
          </div>

          <div className="dashboard-grid">
            <div className="dashboard-grid-main">
              <RecentFiles files={mockFiles} onUploadClick={() => setUploadModalOpen(true)} />
              <RecentActivity activities={mockActivity} />
            </div>
            <div className="dashboard-grid-side">
              <StorageCard usedGB={mockStats.storageUsedGB} limitGB={mockStats.storageLimitGB} />
            </div>
          </div>
        </div>
      </div>

      {uploadModalOpen && <UploadModal onClose={() => setUploadModalOpen(false)} />}
    </div>
  );
}

export default Dashboard;