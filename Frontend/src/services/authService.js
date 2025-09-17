import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// **USER API - Fixed to match your backend exactly**
export const userAPI = {
  register: async (formData, avatarFile) => {
    try {
      const data = new FormData();
      
      // Match your backend field names exactly
      data.append('fullName', formData.fullName || '');
      data.append('username', (formData.email || '').split('@')[0].toLowerCase()); // Generate username
      data.append('email', formData.email || '');
      data.append('password', formData.password || '');
      data.append('mobile', formData.mobile || '');
      data.append('city', formData.city || '');
      data.append('state', formData.state || '');
      data.append('pincode', formData.pincode || '');
      data.append('AddressLine1', formData.AddressLine1 || '');
      data.append('AddressLine2', formData.AddressLine2 || '');
      
      // Avatar is required
      if (avatarFile) {
        data.append('avatar', avatarFile);
      }
      
      const response = await api.post('/users/register', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'User registration failed' };
    }
  },

  login: async (email, password) => {
    try {
      const response = await api.post('/users/login', { email, password });
      
      if (response.data.data) {
        const { accessToken, refreshToken, user } = response.data.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Login failed' };
    }
  }
};

// **RECYCLER API - Fixed to match your backend exactly**
export const recyclerAPI = {
  register: async (formData, files) => {
    try {
      const data = new FormData();
      
      // Match your backend field names exactly
      data.append('username', (formData.email || '').split('@')[0].toLowerCase());
      data.append('fullName', formData.fullName || '');
      data.append('email', formData.email || '');
      data.append('mobile', formData.mobile || '');
      data.append('password', formData.password || '');
      data.append('AddressLine1', formData.AddressLine1 || '');
      data.append('AddressLine2', formData.AddressLine2 || '');
      data.append('city', formData.city || '');
      data.append('state', formData.state || '');
      data.append('pincode', formData.pincode || '');
      data.append('shopName', formData.shopName || '');
      
      // Required files for recycler
      if (files.avatar) {
        data.append('avatar', files.avatar);
      }
      if (files.shopImage) {
        data.append('shopImage', files.shopImage);
      }
      if (files.identity) {
        data.append('identity', files.identity);
      }
      
      const response = await api.post('/recyclers/register-recycler', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Recycler registration failed' };
    }
  },

  login: async (email, password) => {
    try {
      const response = await api.post('/recyclers/login-recycler', { email, password });
      
      if (response.data.data) {
        const { accessToken, refreshToken, recycler } = response.data.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify({ ...recycler, role: 'recycler' }));
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Recycler login failed' };
    }
  }
};