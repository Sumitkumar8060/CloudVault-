import axiosInstance from './axiosInstance';

const authHeader = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export const createShareLink = (fileId, token, expiresInHours) => {
  return axiosInstance.post(
    `/api/files/${fileId}/share`,
    { expiresInHours },
    authHeader(token)
  );
};

export const getActiveShareLink = (fileId, token) => {
  return axiosInstance.get(
    `/api/files/${fileId}/share`,
    authHeader(token)
  );
};

export const revokeShareLink = (fileId, token) => {
  return axiosInstance.delete(
    `/api/files/${fileId}/share`,
    authHeader(token)
  );
};

// Public endpoint: no authentication header required.
export const getPublicShareInfo = (token) => {
  return axiosInstance.get(`/api/public/share/${token}`);
};