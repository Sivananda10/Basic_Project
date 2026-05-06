import axiosInstance from './axiosInstance';

export const submitPrediction = (data) =>
  axiosInstance.post('/predict/', data);

export const getHistory = () =>
  axiosInstance.get('/history/');

export const submitFeedback = (predictionId, data) =>
  axiosInstance.post(`/feedback/${predictionId}/`, data);

export const submitContact = (data) =>
  axiosInstance.post('/contact/', data);

export const getAdminDashboard = () =>
  axiosInstance.get('/admin/dashboard/');

export const saveFollowup = (predictionId, followup) =>
  axiosInstance.post(`/predict/${predictionId}/followup/`, { followup });
