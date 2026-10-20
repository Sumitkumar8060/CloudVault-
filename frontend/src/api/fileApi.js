import axiosInstance from './axiosInstance';

const authHeader = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export const getFiles = (token) => {
  return axiosInstance.get('/api/files', authHeader(token));
};

export const deleteFileById = (id, token) => {
  return axiosInstance.delete(`/api/files/${id}`, authHeader(token));
};

export const uploadFile = (file, token) => {
  const formData = new FormData();
  formData.append('file', file);

  return axiosInstance.post('/api/files', formData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const downloadFileBlob = (id, token) => {
  return axiosInstance.get(`/api/files/${id}/download`, {
    ...authHeader(token),
    responseType: 'blob',
  });
};

export const getFileBlob = (id, token) => {
  return axiosInstance.get(`/api/files/${id}/view`, {
    ...authHeader(token),
    responseType: 'blob',
  });
};

export const getTrashFiles = (token) => {
  return axiosInstance.get('/api/files/trash', authHeader(token));
};

export const restoreFileById = (id, token) => {
  return axiosInstance.post(
    `/api/files/${id}/restore`,
    {},
    authHeader(token)
  );
};

export const permanentlyDeleteFileById = (id, token) => {
  return axiosInstance.delete(
    `/api/files/${id}/permanent`,
    authHeader(token)
  );
};

export const emptyTrashApi = (token) => {
  return axiosInstance.delete('/api/files/trash', authHeader(token));
};