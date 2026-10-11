import axios from 'axios';

export const API_URL: string = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:3001' : window.location.origin)
).replace(/\/$/, '');

axios.interceptors.request.use((config) => {
  if (config.url && config.url.startsWith('http://localhost:3001')) {
    config.url = config.url.replace('http://localhost:3001', API_URL);
  }
  return config;
});

export default API_URL;
