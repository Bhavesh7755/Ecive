export const handleAuthError = (error) => {
  if (error.response) {
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return data.message || 'Invalid request. Please check your input.';
      case 401:
        return 'Invalid credentials. Please try again.';
      case 403:
        return 'Access denied. Please contact support.';
      case 409:
        return 'User already exists with this email.';
      case 422:
        return 'Validation failed. Please check all required fields.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return data.message || 'Something went wrong. Please try again.';
    }
  } else if (error.request) {
    return 'Network error. Please check your connection.';
  } else {
    return error.message || 'An unexpected error occurred.';
  }
};

export const tokenUtils = {
  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  },

  getAccessToken: () => localStorage.getItem('accessToken'),
  
  getRefreshToken: () => localStorage.getItem('refreshToken'),
  
  clearTokens: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  isTokenExpired: (token) => {
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }
};