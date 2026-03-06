import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api', // adjust string port based on your backend start
});

export default api;
