import { useState, useEffect, createContext, useContext } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          // Verify token and get fresh user data
          const userData = await authService.getProfile();
          setUser(userData);
        } catch (error) {
          console.error("Failed to restore session", error);
          localStorage.removeItem('auth_token');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authService.login({ email, password });
      // Assuming response contains access_token, adapt if needed
      const token = response.access_token || response.token || response.accessToken;
      const userData = response.user; // If provided

      if (token) {
        localStorage.setItem('auth_token', token);
        // If user data isn't in login response, fetch it
        if (userData) {
          setUser(userData);
        } else {
          const profile = await authService.getProfile();
          setUser(profile);
        }
        return true;
      } else {
        throw new Error('No access token received');
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    window.location.href = '/login'; 
  };

  const updateUser = async (data) => {
    try {
      const updatedUser = await authService.updateProfile(data);
      // Merge updated fields into current user state
      setUser(prev => ({ ...prev, ...updatedUser }));
      return updatedUser;
    } catch (error) {
      throw error;
    }
  };

  const hasRole = (allowedRoles) => {
    if (!user) return false;
    if (!allowedRoles || allowedRoles.length === 0) return true;
    
    // Normalize user role to lowercase for comparison
    const userRole = user.role?.toLowerCase();
    
    // If passed a single string, wrap in array
    const rolesToCheck = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    
    return rolesToCheck.some(role => role.toLowerCase() === userRole);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasRole, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
