import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';                    
import { registerUser as registerUserAPI, loginUser as loginUserAPI } from '../services/api';
import { AuthContext } from './authContext';

const API_BASE = 'http://localhost:3000';    

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for existing token on app load
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        const decoded = jwtDecode(storedToken);

        if (decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem('token');
          setLoading(false);
        } else {
          
          setToken(storedToken);
          setUser(decoded.user);

          
          axios.defaults.baseURL = API_BASE;
          axios.defaults.headers.common['x-auth-token'] = storedToken;

          setLoading(false);
        }
      } catch (err) {
        console.error('Error decoding token:', err);
        localStorage.removeItem('token');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const register = async (name, email, password) => {
    try {
      setError(null);
      setLoading(true);

      const data = await registerUserAPI(name, email, password);

      localStorage.setItem('token', data.token);
      const decoded = jwtDecode(data.token);

      setToken(data.token);
      setUser(decoded.user);

     
      axios.defaults.baseURL = API_BASE;
      axios.defaults.headers.common['x-auth-token'] = data.token;

      setLoading(false);
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.errors?.[0]?.msg || 'Registration failed';
      setError(errorMsg);
      setLoading(false);
      return { success: false, error: errorMsg };
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);

      const data = await loginUserAPI(email, password);

      localStorage.setItem('token', data.token);
      const decoded = jwtDecode(data.token);

      setToken(data.token);
      setUser(decoded.user);

      
      axios.defaults.baseURL = API_BASE;
      axios.defaults.headers.common['x-auth-token'] = data.token;

      setLoading(false);
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.errors?.[0]?.msg || 'Login failed';
      setError(errorMsg);
      setLoading(false);
      return { success: false, error: errorMsg };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setError(null);
    delete axios.defaults.headers.common['x-auth-token']; 
  };

  const value = {
    user,
    token,
    loading,
    error,
    register,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
