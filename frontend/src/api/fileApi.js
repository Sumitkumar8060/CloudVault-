import axiosInstance from './axiosInstance';

const authHeader = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export const getFiles = (token) => {
  return axiosInstance.get('/files', authHeader(token));
};

export const deleteFileById = (id, token) => {
  return axiosInstance.delete(`/files/${id}`, authHeader(token));
};

export const uploadFile = (file, token) => {
  const formData = new FormData();
  formData.append('file', file);

  return axiosInstance.post('/files', formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const downloadFileBlob = (id, token) => {
  return axiosInstance.get(`/files/${id}/download`, {
    ...authHeader(token),
    responseType: 'blob',
  });
};

export const getFileBlob = (id, token) => {
  return axiosInstance.get(`/files/${id}/view`, {
    ...authHeader(token),
    responseType: 'blob',
  });
};


export const getTrashFiles = (token) => {
  return axiosInstance.get('/files/trash', authHeader(token));
};

export const restoreFileById = (id, token) => {
  return axiosInstance.post(`/files/${id}/restore`, {}, authHeader(token));
};

export const permanentlyDeleteFileById = (id, token) => {
  return axiosInstance.delete(`/files/${id}/permanent`, authHeader(token));
};

export const emptyTrashApi = (token) => {
  return axiosInstance.delete('/files/trash', authHeader(token));
};