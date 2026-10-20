


import axiosInstance from './axiosInstance';

export const registerUser = (data) => {
  return axiosInstance.post('/api/auth/register', data);
};

export const loginUser = (data) => {
  return axiosInstance.post('/api/auth/login', data);
};