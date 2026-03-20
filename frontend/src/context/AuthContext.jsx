import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './auth-context';

function getStoredUser() {
  const storedUser = localStorage.getItem('user');
  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch (error) {
    console.error('Failed to parse stored user details', error);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    return token ? getStoredUser() : null;
  });
  const navigate = useNavigate();

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);

    if (userData.role === 'instructor' || userData.role === 'Instructor') {
      navigate('/dashboard');
    } else {
      navigate('/student-dashboard');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading: false }}>
      {children}
    </AuthContext.Provider>
  );
};
