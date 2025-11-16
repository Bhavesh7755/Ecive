// src/services/authService.js
import axios from 'axios';
import { tokenUtils } from '../utils/authUtils';

const API_BASE_URL = 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// attach access token automatically
api.interceptors.request.use((config) => {
  const token = tokenUtils.getAccessToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Utility to extract error messages
const extractErrorMessage = (error) => {
  if (!error) return 'An unknown error occurred.';
  if (error.response) {
    if (typeof error.response.data === 'string') return error.response.data;
    if (error.response.data) {
      if (error.response.data.message) return error.response.data.message;
      if (error.response.data.error) return error.response.data.error;
      if (error.response.data.errors) {
        return Object.values(error.response.data.errors).join(', ');
      }
      // handle ApiResponse wrapper: { message, data, success }
      if (error.response.data.message) return error.response.data.message;
    }
    return `Request failed with status ${error.response.status}`;
  }
  if (error.message) return error.message;
  return 'An error occurred, please try again.';
};

export const userAPI = {
  register: async (formData, avatarFile) => {
    try {
      const data = new FormData();

      // Append form fields (your backend expects these exact field names)
      data.append('fullName', formData.fullName || '');
      data.append('username', (formData.email || '').split('@')[0].toLowerCase());
      data.append('email', formData.email || '');
      data.append('password', formData.password || '');
      data.append('mobile', formData.mobile || '');
      data.append('city', formData.city || '');
      data.append('state', formData.state || '');
      data.append('pincode', formData.pincode || '');
      data.append('AddressLine1', formData.AddressLine1 || '');
      data.append('AddressLine2', formData.AddressLine2 || '');

      if (avatarFile) {
        data.append('avatar', avatarFile);
      }

      const response = await api.post('/users/register', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },

  login: async (email, password) => {
    try {
      const response = await api.post('/users/login', { email, password });
      if (response.data?.data) {
        const { accessToken, refreshToken, user } = response.data.data;
        tokenUtils.setTokens(accessToken, refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
      }
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },

  logout: async () => {
    try {
      await api.post('/users/logout');
      tokenUtils.clearTokens();
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get('/users/current-user');
      // return ApiResponse object from server
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },

  refreshToken: async () => {
    try {
      const response = await api.post('/users/refresh-token');
      if (response.data?.data) {
        const { accessToken, refreshToken } = response.data.data;
        tokenUtils.setTokens(accessToken, refreshToken);
      }
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },

  changePassword: async (oldPassword, newPassword) => {
    try {
      const response = await api.post('/users/change-password', { oldPassword, newPassword });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },

  updateAccount: async (accountData) => {
    try {
      const response = await api.patch('/users/update-account', accountData);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },

  updateAvatar: async (avatarFile) => {
    try {
      const formData = new FormData();
      formData.append('avatar', avatarFile);
      const response = await api.patch('/users/update-avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },
};

// recyclerAPI and postAPI unchanged except ensure they use the same 'api' instance
// export const recyclerAPI = {
//   register: async (formData, files) => {
//     try {
//       const data = new FormData();

//       // Backend expects these exact field names
//       data.append('username', (formData.email || '').split('@')[0].toLowerCase());
//       data.append('fullName', formData.fullName || '');
//       data.append('email', formData.email || '');
//       data.append('mobile', formData.mobile || '');
//       data.append('password', formData.password || '');
//       data.append('AddressLine1', formData.AddressLine1 || '');
//       data.append('AddressLine2', formData.AddressLine2 || '');
//       data.append('city', formData.city || '');
//       data.append('state', formData.state || '');
//       data.append('pincode', formData.pincode || '');
//       data.append('shopName', formData.shopName || '');

//       if (files.avatar) data.append('avatar', files.avatar);
//       if (files.shopImage) data.append('shopImage', files.shopImage);
//       if (files.identity) data.append('identity', files.identity);

//       const response = await api.post('/recyclers/register-recycler', data, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//       });

//       return response.data;
//     } catch (error) {
//       throw new Error(extractErrorMessage(error));
//     }
//   },

//   login: async (email, password) => {
//     try {
//       const response = await api.post('/recyclers/login', { email, password });
//       if (response.data?.data) {
//         const { accessToken, refreshToken, recycler } = response.data.data;
//         tokenUtils.setTokens(accessToken, refreshToken);
//         localStorage.setItem('user', JSON.stringify({ ...recycler, role: 'recycler' }));
//       }
//       return response.data;
//     } catch (error) {
//       throw new Error(extractErrorMessage(error));
//     }
//   },

//   logout: async () => {
//     try {
//       await api.post('/recyclers/logout');
//       tokenUtils.clearTokens();
//     } catch (error) {
//       throw new Error(extractErrorMessage(error));
//     }
//   },

//   refreshToken: async () => {
//     try {
//       const response = await api.post('/recyclers/refresh-token');
//       if (response.data?.data) {
//         const { accessToken, refreshToken } = response.data.data;
//         tokenUtils.setTokens(accessToken, refreshToken);
//       }
//       return response.data;
//     } catch (error) {
//       throw new Error(extractErrorMessage(error));
//     }
//   },

//   getMyRequests: async () => {
//     try {
//       const response = await api.get('/recyclers/my-requests');
//       return response.data?.data || [];
//     } catch (error) {
//       throw new Error(extractErrorMessage(error));
//     }
//   },

//   updateRequestStatus: async (requestId, action, finalPrice = null) => {
//     try {
//       const payload = finalPrice ? { finalPrice } : {};
//       const response = await api.patch(`/recyclers/requests/${requestId}/${action}`, payload);
//       return response.data;
//     } catch (error) {
//       throw new Error(extractErrorMessage(error));
//     }
//   },

//   getRecyclerProfile: async () => {
//     try {
//       const response = await api.get('/recyclers/profile');
//       return response.data?.data || response.data;
//     } catch (error) {
//       throw new Error(extractErrorMessage(error));
//     }
//   },

//   updateRecyclerProfile: async (recyclerData) => {
//     try {
//       const response = await api.put('/recyclers/profile', recyclerData);
//       return response.data;
//     } catch (error) {
//       throw new Error(extractErrorMessage(error));
//     }
//   },

//   getRecyclerRequests: async () => {
//     try {
//       const response = await api.get('/recyclers/requests');
//       return response.data?.data || [];
//     } catch (error) {
//       throw new Error(extractErrorMessage(error));
//     }
//   },

//   acceptRecyclerRequest: async (requestId) => {
//     try {
//       const response = await api.post(`/recyclers/requests/${requestId}/accept`);
//       return response.data;
//     } catch (error) {
//       throw new Error(extractErrorMessage(error));
//     }
//   },

//   rejectRecyclerRequest: async (requestId) => {
//     try {
//       const response = await api.post(`/recyclers/requests/${requestId}/reject`);
//       return response.data;
//     } catch (error) {
//       throw new Error(extractErrorMessage(error));
//     }
//   },

//   getRecyclerStats: async () => {
//     try {
//       const response = await api.get('/recyclers/stats');
//       return response.data?.data || response.data;
//     } catch (error) {
//       throw new Error(extractErrorMessage(error));
//     }
//   },

//   getRecyclerNotifications: async () => {
//     try {
//       const response = await api.get('/recyclers/notifications');
//       return response.data?.data || [];
//     } catch (error) {
//       throw new Error(extractErrorMessage(error));
//     }
//   },

//   markRecyclerNotificationAsRead: async (notificationId) => {
//     try {
//       const response = await api.put(`/recyclers/notifications/${notificationId}/read`);
//       return response.data;
//     } catch (error) {
//       throw new Error(extractErrorMessage(error));
//     }
//   },

//   getRecyclerEarnings: async () => {
//     try {
//       const response = await api.get('/recyclers/earnings');
//       return response.data?.data || response.data;
//     } catch (error) {
//       throw new Error(extractErrorMessage(error));
//     }
//   },

//   getRecyclerOrders: async (status = "all") => {
//     try {
//       const response = await api.get(`/recyclers/orders?status=${status}`);
//       return response.data?.data || response.data;
//     } catch (error) {
//       throw new Error(extractErrorMessage(error));
//     }
//   },
// };




export const recyclerAPI = {
  register: async (formData, files) => {
    try {
      const data = new FormData();

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

      if (files.avatar) data.append('avatar', files.avatar);
      if (files.shopImage) data.append('shopImage', files.shopImage);
      if (files.identity) data.append('identity', files.identity);

      const response = await api.post('/recyclers/register-recycler', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },

  login: async (email, password) => {
    try {
      const response = await api.post('/recyclers/recycler-login', { email, password });
      if (response.data?.data) {
        const { accessToken, refreshToken, recycler } = response.data.data;
        tokenUtils.setTokens(accessToken, refreshToken);
        localStorage.setItem('user', JSON.stringify({ ...recycler, role: 'recycler' }));
      }
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },

  logout: async () => {
    try {
      await api.post('/recyclers/recycler-logout');
      tokenUtils.clearTokens();
      localStorage.removeItem('user');
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },

  refreshToken: async () => {
    try {
      const response = await api.post('/recyclers/refresh-token-recycler');
      if (response.data?.data) {
        const { accessToken, refreshToken } = response.data.data;
        tokenUtils.setTokens(accessToken, refreshToken);
      }
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },

  // ✅ Correct API for fetching assigned requests
  getRecyclerRequests: async () => {
    const response = await api.get(`/recyclers/requests`);
    return response.data?.data || [];
  },


  // ✅ Match backend → /recyclers/requests/:requestId/:action
  updateRequestStatus: async (requestId, action, finalPrice = null) => {
    try {
      const payload = finalPrice ? { finalPrice } : {};
      const response = await api.patch(`/recyclers/requests/${requestId}/${action}`, payload);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },

  getRecyclerProfile: async () => {
    try {
      const response = await api.get('/recyclers/profile');
      return response.data?.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },

  updateRecyclerProfile: async (recyclerData) => {
    try {
      const response = await api.put('/recyclers/profile', recyclerData);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },

  getRecyclerNotifications: async () => {
    try {
      const response = await api.get('/recyclers/notifications');
      return response.data?.data || [];
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },

  // ✅ Mark notification as read → updates request status to 'expired'
  markRecyclerNotificationAsRead: async (notificationId) => {
    try {
      const response = await api.put(`/recyclers/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },

  getRecyclerEarnings: async () => {
    try {
      const response = await api.get('/recyclers/earnings');
      return response.data?.data || {};
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },

  getRecyclerOrders: async (status = "all") => {
    try {
      const response = await api.get(`/recyclers/orders?status=${status}`);
      return response.data?.data || [];
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },

  getRecyclerDashboardStats: async () => {
    return api.get("/recycler/dashboard-stats");
  },

};






export const postAPI = {
  uploadImages: async (files) => {
    try {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      const response = await api.post('/posts/upload-images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },

  createPost: async (postData) => {
    try {
      const response = await api.post('/posts/create', postData);
      return response.data?.data || response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },
  // Get posts by logged in user
  getMyPosts: async () => {
    try {
      const response = await api.get('/posts/my-Posts');
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },


  // Get nearby recyclers by lat, lng and radiusKm
  // Get nearby recyclers by user's city
  getNearbyRecyclers: async (city) => {
    try {
      const response = await api.get(`/posts/nearby-recyclers?city=${encodeURIComponent(city)}`);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },



  // Select recycler for a post
  selectRecycler: async (postId, recyclerId) => {
    try {
      const response = await api.post(`/posts/${postId}/select-recycler`, { recyclerId });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },

  // Get recycler details by ID
  getRecyclerById: async (id) => {
    try {
      const response = await api.get(`/recyclers/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },

  // Send request to recycler for a post
  sendRequestToRecycler: async (postId, recyclerId, products) => {
    try {
      const response = await api.post(`/posts/${postId}/send-request`, {
        recyclerId,
        products
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message);
    }
  },


  // Add chat message for negotiation
  addMessage: async (postId, message, priceOffer = null) => {
    try {
      const response = await api.post(`/posts/${postId}/add-message`, { message, priceOffer });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },

  // Accept AI price
  acceptAIPrice: async (postId) => {
    try {
      const response = await api.post(`/posts/${postId}/accept-ai-price`);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },

  // Finalize negotiated price
  finalizePrice: async (postId, price) => {
    try {
      const response = await api.post(`/posts/${postId}/finalize-price`, { finalPrice: price });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },

  // Get post details by ID
  getPostDetails: async (postId) => {
    try {
      const response = await api.get(`/posts/${postId}`);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },

  // Update post status
  updatePostStatus: async (postId, status) => {
    try {
      const response = await api.patch(`/posts/${postId}/status`, { status });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },
};