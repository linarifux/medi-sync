import axios from 'axios';

// Create an Axios instance
const API = axios.create({
  // Use the Vite environment variable, fallback to localhost if it's missing
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', 
  
});

// Add a request interceptor to automatically attach the token if the user is logged in
API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export default API;