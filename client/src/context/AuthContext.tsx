import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../api/client.js';
import { User, UserRole } from '../types/index.js';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: any) => Promise<{ user: User; otpSent: boolean }>;
  verifyOtp: (email: string, otp: string) => Promise<boolean>;
  resendOtp: (email: string) => Promise<void>;
  demoLogin: (role: UserRole) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch current user on initial page mount
  const refreshUser = async () => {
    try {
      const response = await apiClient.get('/auth/me');
      if (response.data.success && response.data.data) {
        setUser(response.data.data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const loggedInUser = response.data.data.user;
      setUser(loggedInUser);
      toast.success(`Welcome back, ${loggedInUser.name}!`);
      return loggedInUser;
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any): Promise<{ user: User; otpSent: boolean }> => {
    setIsLoading(true);
    try {
      const response = await apiClient.post('/auth/register', data);
      const newUser = response.data.data.user;
      setUser(newUser);
      toast.success('Registration successful! Please check your email for the OTP.');
      return { user: newUser, otpSent: response.data.data.otpSent };
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Registration failed';
      toast.error(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (email: string, otp: string): Promise<boolean> => {
    try {
      const response = await apiClient.post('/auth/verify-otp', { email, otp });
      if (response.data.success) {
        toast.success('Email verified successfully!');
        if (user) {
          setUser({ ...user, isEmailVerified: true });
        }
        return true;
      }
      return false;
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Invalid or expired OTP';
      toast.error(msg);
      throw new Error(msg);
    }
  };

  const resendOtp = async (email: string): Promise<void> => {
    try {
      await apiClient.post('/auth/resend-otp', { email });
      toast.success('A new OTP has been sent to your email!');
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to resend OTP';
      toast.error(msg);
      throw new Error(msg);
    }
  };

  const demoLogin = async (role: UserRole): Promise<User> => {
    setIsLoading(true);
    try {
      const response = await apiClient.post(`/auth/demo/${role.toLowerCase()}`);
      const demoUser = response.data.data.user;
      setUser(demoUser);
      toast.success(`⚡ Demo login active: ${demoUser.name} (${role})`);
      return demoUser;
    } catch (error: any) {
      const msg = error.response?.data?.message || `Failed to switch to Demo ${role}`;
      toast.error(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (err) {
      console.warn('Logout request failed:', err);
    } finally {
      setUser(null);
      toast.success('Logged out');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        verifyOtp,
        resendOtp,
        demoLogin,
        logout,
        refreshUser,
      }}
    >
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
