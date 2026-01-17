import apiClient from './apiClient';

export const authService = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  register: (data) => apiClient.post('/auth/register', data),
  
  // Invite a new user - POST /users/invite (Admin/Manager only)
  invite: async (data) => {
    const response = await apiClient.post('/users/invite', data);
    
    // Normalize token field (backend might return as 'token', 'inviteToken', 'invite_token', or 'invitationToken')
    const inviteToken = response.inviteToken || response.invite_token || response.token || response.invitationToken;
    
    // Generate the invite URL
    const inviteUrl = inviteToken 
      ? `${window.location.origin}/invite-accept?token=${inviteToken}`
      : null;
    
    return {
      ...response,
      inviteToken,
      inviteUrl,
      email: response.email || data.email
    };
  },
  
  // Accept invite - POST /users/accept-invite (Public)
  acceptInvite: (data) => apiClient.post('/users/accept-invite', data),
  
  getProfile: () => apiClient.get('/auth/me'),
  updateProfile: (data) => apiClient.patch('/auth/profile', data),
  logout: () => apiClient.post('/auth/logout'),
  refreshToken: () => apiClient.post('/auth/refresh-token'),
  forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),
  resetPassword: (data) => apiClient.post('/auth/reset-password', data),
  changePassword: (data) => apiClient.post('/auth/change-password', data),
};

