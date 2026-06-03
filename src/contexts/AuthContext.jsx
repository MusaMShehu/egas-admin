// import React, { createContext, useState, useEffect, useContext, useCallback } from "react";

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [token, setToken] = useState(() => localStorage.getItem("token"));
//   const [user, setUser] = useState(() => {
//     const storedUser = localStorage.getItem("user");
//     return storedUser ? JSON.parse(storedUser) : null;
//   });
//   const [loading, setLoading] = useState(true);

//   // ✅ Memoized fetchProfile to prevent infinite re-renders
//   const fetchProfile = useCallback(async (jwt) => {
//     try {
//       const res = await fetch("https://egas-server-1.onrender.com/api/v1/auth/me", {
//         method: "GET",
//         headers: {
//           Authorization: `Bearer ${jwt}`,
//           "Content-Type": "application/json",
//         },
//       });

//       if (!res.ok) throw new Error("Unauthorized");

//       const data = await res.json();

//       setUser(data.user);
//       setToken(jwt);
//       localStorage.setItem("token", jwt);
//       localStorage.setItem("user", JSON.stringify(data.user));
//     } catch (err) {
//       console.error("Profile fetch failed:", err.message);
//       logout();
//     } finally {
//       setLoading(false);
//     }
//   }, []); // ✅ empty dependency array

//   // ✅ Login
//   const login = async (email, password) => {
//     const res = await fetch("https://egas-server-1.onrender.com/api/v1/auth/login", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ email, password }),
//     });

//     const data = await res.json();
//     if (res.ok) {
//       setUser(data.user);
//       setToken(data.token);
//       localStorage.setItem("token", data.token);
//       localStorage.setItem("user", JSON.stringify(data.user));
//     } else {
//       throw new Error(data.message || "Login failed");
//     }
//   };

//   // ✅ Register
//   const register = async (formData) => {
//     const res = await fetch("https://egas-server-1.onrender.com/api/v1/auth/register", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(formData),
//     });

//     const data = await res.json();
//     if (res.ok) {
//       setUser(data.user);
//       setToken(data.token);
//       localStorage.setItem("token", data.token);
//       localStorage.setItem("user", JSON.stringify(data.user));
//     } else {
//       throw new Error(data.message || "Registration failed");
//     }
//   };

//   // ✅ Logout (fully resets)
//   const logout = useCallback(() => {
//     setUser(null);
//     setToken(null);
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");
//   }, []);

//   // ✅ Validate token on load (only once)
//   useEffect(() => {
//     if (token) {
//       fetchProfile(token);
//     } else {
//       setLoading(false);
//     }
//   }, [token, fetchProfile]);

//   return (
//     <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);






















// // src/contexts/AuthContext.jsx
// import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
// import { authAPI } from '../api/endpoints';

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);

//   // Fetch current user profile (uses HTTP-only cookie)
//   const fetchCurrentUser = useCallback(async () => {
//     try {
//       const response = await authAPI.getCurrentUser();
//       if (response.success && response.data) {
//         setUser(response.data.user || response.data);
//         setIsAuthenticated(true);
//         return true;
//       }
//       return false;
//     } catch (error) {
//       console.error('Failed to fetch user:', error);
//       return false;
//     }
//   }, []);

//   // Initialize auth on mount
//   useEffect(() => {
//     const initAuth = async () => {
//       setLoading(true);
//       const success = await fetchCurrentUser();
//       if (!success) {
//         setUser(null);
//         setIsAuthenticated(false);
//       }
//       setLoading(false);
//     };
//     initAuth();
//   }, [fetchCurrentUser]);

//   // Listen for logout events
//   useEffect(() => {
//     const handleLogout = () => {
//       setUser(null);
//       setIsAuthenticated(false);
//     };
//     window.addEventListener('auth:logout', handleLogout);
//     return () => window.removeEventListener('auth:logout', handleLogout);
//   }, []);

//   // Login
//   const login = async (email, password) => {
//     try {
//       const response = await authAPI.login(email, password);
//       if (response.success) {
//         const userData = response.data.user || response.data;
//         setUser(userData);
//         setIsAuthenticated(true);
//         return { success: true, data: userData };
//       }
//       return { success: false, message: response.message || 'Login failed' };
//     } catch (error) {
//       return { success: false, message: error.message || 'Login failed' };
//     }
//   };

//   // Register
//   const register = async (userData) => {
//     try {
//       const response = await authAPI.register(userData);
//       if (response.success) {
//         const user = response.data.user || response.data;
//         setUser(user);
//         setIsAuthenticated(true);
//         return { success: true, data: user };
//       }
//       return { success: false, message: response.message || 'Registration failed' };
//     } catch (error) {
//       return { success: false, message: error.message || 'Registration failed' };
//     }
//   };

//   // Logout
//   const logout = async () => {
//     try {
//       await authAPI.logout();
//     } catch (error) {
//       console.error('Logout error:', error);
//     } finally {
//       setUser(null);
//       setIsAuthenticated(false);
//     }
//   };

//   // Change password
//   const changePassword = async (currentPassword, newPassword) => {
//     try {
//       const response = await authAPI.changePassword(currentPassword, newPassword);
//       return { success: response.success, message: response.message };
//     } catch (error) {
//       return { success: false, message: error.message || 'Failed to change password' };
//     }
//   };

//   const value = {
//     user,
//     loading,
//     isAuthenticated,
//     login,
//     register,
//     logout,
//     changePassword,
//     fetchCurrentUser,
//   };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };



















// // src/contexts/AuthContext.jsx
// import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
// import { authAPI } from '../api/endpoints';
// // import ApiService from '../api/apiService';

// const AuthContext = createContext(null);

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within AuthProvider');
//   }
//   return context;
// };

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);

//   // Check authentication status on mount
//   const checkAuth = useCallback(async () => {
//     try {
//       const response = await authAPI.getCurrentUser();
//       const data = response.data;
//       if (data.success && (data.user || data.data)) {
//       const userData = data.user || data.data;
//       setUser(userData);
//       setIsAuthenticated(true);
//         // Store minimal user info for quick access (NO TOKEN)
//         localStorage.setItem('user', JSON.stringify({
//           id: userData.id || userData._id,
//           firstName: userData.firstName,
//           lastName: userData.lastName,
//           email: userData.email,
//           role: userData.role,
//           profileImage: userData.profileImage
//         }));
//       } else {
//         setUser(null);
//         setIsAuthenticated(false);
//         localStorage.removeItem('user');
//       }
//     } catch (error) {
//       console.error('Auth check failed:', error);
//       setUser(null);
//       setIsAuthenticated(false);
//       localStorage.removeItem('user');
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     checkAuth();
//   }, [checkAuth]);

//   // Listen for logout events
//   useEffect(() => {
//     const handleLogout = () => {
//       setUser(null);
//       setIsAuthenticated(false);
//       localStorage.removeItem('user');
//     };
//     window.addEventListener('auth:logout', handleLogout);
//     return () => window.removeEventListener('auth:logout', handleLogout);
//   }, []);

//   const login = async (email, password) => {
//     const response = await authAPI.login( email, password );
//       const data = response.data;
//       if (data.success && (data.user || data.data)) {
//       const userData = data.user || data.data;
//       setUser(userData);
//       setIsAuthenticated(true);
//       localStorage.setItem('user', JSON.stringify({
//         id: userData.id || userData._id,
//         firstName: userData.firstName,
//         lastName: userData.lastName,
//         email: userData.email,
//         role: userData.role,
//         profileImage: userData.profileImage
//       }));
//       return response;
//     }
//     throw new Error(response.message || 'Login failed');
//   };

//   const logout = async () => {
//     try {
//       await authAPI.logout();
//     } catch (error) {
//       console.error('Logout error:', error);
//     } finally {
//       setUser(null);
//       setIsAuthenticated(false);
//       localStorage.removeItem('user');
//       sessionStorage.clear();
//     }
//   };

//   const register = async (formData) => {
//     const response = await authAPI.register(formData);
//     const data = response.data;
//       if (data.success && (data.user || data.data)) {
//       const userData = data.user || data.data;
//       setUser(userData);
//       setIsAuthenticated(true);
//       localStorage.setItem('user', JSON.stringify({
//         id: userData.id || userData._id,
//         firstName: userData.firstName,
//         lastName: userData.lastName,
//         email: userData.email,
//         role: userData.role,
//         profileImage: userData.profileImage
//       }));
//       return response;
//     }
//     throw new Error(response.message || 'Registration failed');
//   };

//   const updateProfile = async (profileData) => {
//     const response = await authAPI.updateProfile(profileData);
//     const data = response.data;
//     if (data.success && data.data) {
//       const userData = data.user || data.data;
//       setUser(prev => ({ ...prev, ...data.data }));
//       localStorage.setItem('user', JSON.stringify({
//         ...data.data,
//         // id: data.data.id || data.data._id
//         id: userData.id || userData._id,
//       }));
//       return response;
//     }
//     throw new Error(response.message || 'Profile update failed');
//   };

//   const updatePassword = async (currentPassword, newPassword) => {
//     return authAPI.updatePassword({ currentPassword, newPassword });
//   };

//   return (
//     <AuthContext.Provider value={{
//       user,
//       isLoading,
//       isAuthenticated,
//       login,
//       logout,
//       register,
//       updateProfile,
//       updatePassword,
//       checkAuth
//     }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };





















// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import ApiService from '../api/authEndpoints';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on mount
  const checkAuth = useCallback(async () => {
    try {
      const response = await ApiService.auth.getMe();
      const data = response.data;
      if (data.success && (data.user || data.data)) {
      const userData = data.user || data.data;
      setUser(userData);
      setIsAuthenticated(true);
        // Store minimal user info for quick access (NO TOKEN)
        localStorage.setItem('user', JSON.stringify({
          id: userData.id || userData._id,
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          role: userData.role,
          profileImage: userData.profileImage
        }));
      } else {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Listen for logout events
  useEffect(() => {
    const handleLogout = () => {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('user');
    };
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  const login = async (email, password) => {
    const response = await ApiService.auth.login({ email, password });
      const data = response.data;
      if (data.success && (data.user || data.data)) {
      const userData = data.user || data.data;
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify({
        id: userData.id || userData._id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        role: userData.role,
        profileImage: userData.profileImage
      }));
      return response;
    }
    throw new Error(response.message || 'Login failed');
  };

  const logout = async () => {
    try {
      await ApiService.auth.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('user');
      sessionStorage.clear();
    }
  };

  const register = async (formData) => {
    const response = await ApiService.auth.register(formData);
    const data = response.data;
      if (data.success && (data.user || data.data)) {
      const userData = data.user || data.data;
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify({
        id: userData.id || userData._id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        role: userData.role,
        profileImage: userData.profileImage
      }));
      return response;
    }
    throw new Error(response.message || 'Registration failed');
  };

  const updateProfile = async (profileData) => {
    const response = await ApiService.auth.updateProfile(profileData);
    const data = response.data;
    if (data.success && data.data) {
      const userData = data.user || data.data;
      setUser(prev => ({ ...prev, ...data.data }));
      localStorage.setItem('user', JSON.stringify({
        ...data.data,
        // id: data.data.id || data.data._id
        id: userData.id || userData._id,
      }));
      return response;
    }
    throw new Error(response.message || 'Profile update failed');
  };

  const updatePassword = async (currentPassword, newPassword) => {
    return ApiService.auth.updatePassword({ currentPassword, newPassword });
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated,
      login,
      logout,
      register,
      updateProfile,
      updatePassword,
      checkAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};