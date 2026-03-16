import axios from 'axios';

const fallbackApiBaseUrl = `${window.location.protocol}//${window.location.hostname}:5000/api`;

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || fallbackApiBaseUrl
});

export const uploadLogFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const triggerAnalysis = async (objectName) => {
  const response = await api.post('/analyze', { objectName });
  return response.data;
};

export const fetchResults = async () => {
  const response = await api.get('/results');
  return response.data;
};

export const fetchAnomalies = async () => {
  const response = await api.get('/anomalies');
  return response.data;
};
