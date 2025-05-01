// app/utils/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwtDecode from 'jwt-decode';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({ userId: null, token: null, name: null });
  const [loading, setLoading] = useState(true);

  const checkToken = async () => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 > Date.now()) {
          setAuth({ userId: decoded.userId, token });
        } else {
          await AsyncStorage.removeItem('token');
        }
      } catch {
        await AsyncStorage.removeItem('token');
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    checkToken();
  }, []);

 const login = async (email, password) => {
    const res = await axios.post('http://<YOUR_IP>:5000/api/auth/login', { email, password });
    const { token, userId, name } = res.data;
    await AsyncStorage.setItem('token', token);
    setAuth({ userId, token, name });
  };

  const register = async (name, email, password) => {
    const res = await axios.post('http://<YOUR_IP>:5000/api/auth/register', { name, email, password });
    const { token, userId } = res.data;
    await AsyncStorage.setItem('token', token);
    setAuth({ userId, token, name });
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    setAuth({ userId: null, token: null, name: null });
  };

  return (
    <AuthContext.Provider value={{ auth, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
