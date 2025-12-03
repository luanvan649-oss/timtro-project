// src/api/index.ts
import axios from 'axios';
// Lấy giá trị API base từ biến môi trường
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

const api = axios.create({
  baseURL: API_BASE_URL,
});

export default api;