import axiosInstance from './axiosInstance';

const authHeader = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const createShareLink = (fileId, token, expiresInHours) => {
  return axiosInstance.post(`/files/${fileId}/share`, { expiresInHours }, authHeader(token));
};

export const getActiveShareLink = (fileId, token) => {
  return axiosInstance.get(`/files/${fileId}/share`, authHeader(token));
};

export const revokeShareLink = (fileId, token) => {
  return axiosInstance.delete(`/files/${fileId}/share`, authHeader(token));
};

// No auth header — this calls the public endpoint, same as anyone
// opening the link would, logged in or not.
export const getPublicShareInfo = (token) => {
  return axiosInstance.get(`/public/share/${token}`);
};