import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");
export const getImageSrc = (imageUrl) => {
  if (!imageUrl) return "";
  return imageUrl.startsWith("http") ? imageUrl : `${API_ORIGIN}${imageUrl}`;
};
const api = axios.create({ baseURL: API_URL });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("campusfind_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
