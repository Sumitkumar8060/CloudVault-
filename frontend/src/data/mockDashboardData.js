// Temporary mock data for Dashboard & My Files UI.
// Once the file metadata API exists (Phase 3), mockAllFiles will be replaced
// by a real GET /api/files response in this same shape — components
// consuming it (FileRow, MyFiles, RecentFiles) won't need to change.

export const mockStats = {
  totalFiles: 24,
  storageUsedGB: 1.8,
  storageLimitGB: 5,
  sharedFiles: 6,
  recentUploads: 4,
};

export const mockAllFiles = [
  { id: 1, name: 'Resume.pdf', type: 'pdf', size: '245 KB', uploadedAt: '2026-09-28T10:00:00Z' },
  { id: 2, name: 'AWS-Certificate.pdf', type: 'pdf', size: '612 KB', uploadedAt: '2026-09-30T10:32:00Z' },
  { id: 3, name: 'Marksheet.pdf', type: 'pdf', size: '189 KB', uploadedAt: '2026-09-25T14:10:00Z' },
  { id: 4, name: 'Internship-Certificate.pdf', type: 'pdf', size: '304 KB', uploadedAt: '2026-09-20T09:45:00Z' },
  { id: 5, name: 'Project-Report.docx', type: 'doc', size: '88 KB', uploadedAt: '2026-09-18T16:20:00Z' },
  { id: 6, name: 'Profile-Photo.jpg', type: 'image', size: '1.2 MB', uploadedAt: '2026-09-15T08:05:00Z' },
  { id: 7, name: 'Expense-Sheet.xlsx', type: 'sheet', size: '54 KB', uploadedAt: '2026-09-10T12:00:00Z' },
  { id: 8, name: 'Backup-Files.zip', type: 'archive', size: '4.6 MB', uploadedAt: '2026-09-05T11:30:00Z' },
];

// Dashboard's "Recent Documents" shows just the most recently uploaded few.
export const mockRecentFiles = [...mockAllFiles]
  .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
  .slice(0, 4);

export const mockActivity = [
  { id: 1, action: 'uploaded', fileName: 'AWS-Certificate.pdf', timestamp: 'Today, 10:32 AM' },
  { id: 2, action: 'downloaded', fileName: 'Resume.pdf', timestamp: 'Today, 09:15 AM' },
  { id: 3, action: 'shared', fileName: 'Project-Report.pdf', timestamp: 'Yesterday' },
];