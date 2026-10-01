// Temporary mock data for the Dashboard UI.
// Once file management exists (Phase 3+), these will be replaced by real API calls
// (e.g. GET /api/files, GET /api/files/stats, GET /api/activity) that return
// data in these same shapes — components below won't need to change.

export const mockStats = {
  totalFiles: 24,
  storageUsedGB: 1.8,
  storageLimitGB: 5,
  sharedFiles: 6,
  recentUploads: 4,
};

export const mockFiles = [
  { id: 1, name: 'Resume.pdf', type: 'pdf', size: '245 KB', uploadedAt: '2026-09-28T10:00:00Z' },
  { id: 2, name: 'AWS-Certificate.pdf', type: 'pdf', size: '612 KB', uploadedAt: '2026-09-30T10:32:00Z' },
  { id: 3, name: 'Marksheet.pdf', type: 'pdf', size: '189 KB', uploadedAt: '2026-09-25T14:10:00Z' },
  { id: 4, name: 'Internship-Certificate.pdf', type: 'pdf', size: '304 KB', uploadedAt: '2026-09-20T09:45:00Z' },
];

export const mockActivity = [
  { id: 1, action: 'uploaded', fileName: 'AWS-Certificate.pdf', timestamp: 'Today, 10:32 AM' },
  { id: 2, action: 'downloaded', fileName: 'Resume.pdf', timestamp: 'Today, 09:15 AM' },
  { id: 3, action: 'shared', fileName: 'Project-Report.pdf', timestamp: 'Yesterday' },
];