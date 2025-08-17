// src/services/apiClient.js
import axios from 'axios';

const api = axios.create({
  // baseURL boleh kosong karena kita pakai URL absolut / path relatif
  timeout: 120000, // 120s, sesuaikan dgn durasi backend
  withCredentials: false,
  validateStatus: (status) => status >= 200 && status < 300,
});

export default api;
