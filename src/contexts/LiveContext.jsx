// src/contexts/LiveContext.jsx
import React, {
  createContext, useContext, useEffect, useRef, useState, useCallback,
} from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useSnackbar } from '../hooks/useSnackbar';

const LiveContext = createContext(null);

const SOCKET_URL ='http://localhost:5000';
//   process.env.REACT_APP_SOCKET_URL ||
//   process.env.REACT_APP_API_BASE?.replace(/\/api\/?.*$/, '') ||
//  'http://localhost:5000/ap1/v1';

export const LiveProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { info } = useSnackbar();
  const socketRef = useRef(null);
  const listenersRef = useRef(new Map()); // event → Set<handler>
  const [connected, setConnected] = useState(false);

  // Connect / disconnect based on auth
  // useEffect(() => {
  //   if (!isAuthenticated || !user) {
  //     // Tear down if logged out
  //     if (socketRef.current) {
  //       socketRef.current.disconnect();
  //       socketRef.current = null;
  //       setConnected(false);
  //     }
  //     return;
  //   }

  //   // Token from the cookie — Socket.IO sends cookies automatically
  //   // when withCredentials is true. Fallback header auth is unused here
  //   // because backend requires token via socket.handshake.auth.token.
  //   const token = getTokenFromCookie();
  //   if (!token) return;

  //   const socket = io(SOCKET_URL, {
  //     auth: { token },
  //     transports: ['websocket', 'polling'],
  //     withCredentials: true,
  //   });
  //   socketRef.current = socket;

  //   socket.on('connect', () => {
  //     setConnected(true);
  //   });
  //   socket.on('disconnect', () => {
  //     setConnected(false);
  //   });
  //   socket.on('connect_error', (err) => {
  //     console.warn('[Live] socket connect_error:', err.message);
  //   });

  //   // Universal "safety net": any notification.new event fires a toast
  //   const onNotificationNew = (payload) => {
  //     if (payload?.priority === 'high') {
  //       info(payload.title || 'New notification');
  //     }
  //   };
  //   socket.on('notification.new', onNotificationNew);

  //   return () => {
  //     socket.off('notification.new', onNotificationNew);
  //     socket.disconnect();
  //     socketRef.current = null;
  //     setConnected(false);
  //   };
  // }, [isAuthenticated, user, info]);


  useEffect(() => {
  if (!isAuthenticated || !user) {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setConnected(false);
    }

    return;
  }

  const socket = io(SOCKET_URL, {
  path: '/socket.io/',
  transports: ['websocket', 'polling'],
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
});
  socketRef.current = socket;

  socket.on('connect', () => {
    console.log('[Live] Connected:', socket.id);
    setConnected(true);
  });

  socket.on('disconnect', (reason) => {
    console.warn('[Live] Disconnected:', reason);
    setConnected(false);
  });

  socket.on('connect_error', (err) => {
    console.warn('[Live] Connection error:', err.message);
    setConnected(false);
  });

  const onNotificationNew = (payload) => {
    if (payload?.priority === 'high') {
      info(payload.title || 'New notification');
    }
  };

  socket.on('notification.new', onNotificationNew);

  return () => {
    socket.off('notification.new', onNotificationNew);
    socket.disconnect();
    socketRef.current = null;
    setConnected(false);
  };
}, [isAuthenticated, user, info]);

  // Subscribe
  const subscribe = useCallback((event, handler) => {
    if (!event || typeof handler !== 'function') return () => {};
    // Attach to local set
    if (!listenersRef.current.has(event)) {
      listenersRef.current.set(event, new Set());
    }
    listenersRef.current.get(event).add(handler);
    // Attach to socket if connected
    socketRef.current?.on(event, handler);

    // Return unsubscribe
    return () => {
      listenersRef.current.get(event)?.delete(handler);
      socketRef.current?.off(event, handler);
    };
  }, []);

  // On reconnect, re-attach all listeners
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
    const onReconnect = () => {
      listenersRef.current.forEach((handlers, event) => {
        handlers.forEach((h) => socket.on(event, h));
      });
    };
    socket.on('reconnect', onReconnect);
    return () => socket.off('reconnect', onReconnect);
  }, [connected]);

  const value = { connected, subscribe, socket: socketRef.current };
  return <LiveContext.Provider value={value}>{children}</LiveContext.Provider>;
};

export const useLive = () => {
  const ctx = useContext(LiveContext);
  if (!ctx) throw new Error('useLive must be used within <LiveProvider>');
  return ctx;
};

/**
 * Subscribe to a socket event.
 *   useLiveEvent('delivery.post_fill_recorded', (payload) => { ... });
 */
export const useLiveEvent = (event, handler) => {
  const { subscribe } = useLive();
  useEffect(() => {
    if (!event || typeof handler !== 'function') return;
    const unsub = subscribe(event, handler);
    return unsub;
  }, [event, handler, subscribe]);
};

/**
 * Join a room keyed to a resource ID.
 *   useLiveRoom('order', orderId);
 * Backend joins order:{id} on `track-order`; user/agent/plant/admin rooms
 * are joined automatically on connect.
 */
export const useLiveRoom = (prefix, id) => {
  const { socket } = useLive();
  useEffect(() => {
    if (!socket || !id) return;
    if (prefix === 'order') {
      socket.emit('track-order', id);
    }
    // Other rooms are auto-joined by the server based on role.
  }, [socket, prefix, id]);
};

// ---------- helpers ----------
function getTokenFromCookie() {
  // Backend sets accessToken as httpOnly cookie.
  // Socket.IO on same-origin will send cookies automatically.
  // But the server middleware also accepts `socket.handshake.auth.token`,
  // so read from localStorage if it's mirrored there (login flow does this).
  try {
    return localStorage.getItem('accessToken') || localStorage.getItem('token') || undefined;
  } catch {
    return undefined;
  }
}