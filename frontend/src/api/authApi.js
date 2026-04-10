import axiosInstance from './axiosInstance';

export const registerUser = (data) =>
  axiosInstance.post('/auth/register/', data);

export const loginUser = (data) =>
  axiosInstance.post('/auth/login/', data);

export const logoutUser = (refreshToken) =>
  axiosInstance.post('/auth/logout/', { refresh: refreshToken });

export const getProfile = () =>
  axiosInstance.get('/profile/');

export const updateProfile = (data) =>
  axiosInstance.put('/profile/', data);

export const changePassword = (data) =>
  axiosInstance.post('/profile/change-password/', data);
