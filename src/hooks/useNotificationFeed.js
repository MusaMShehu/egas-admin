// src/hooks/useNotificationFeed.js
import { useCallback, useEffect, useState } from 'react';
import { notificationsAPI } from '../api/endpoints';
import { useAuth } from '../contexts/AuthContext';
import { useLiveEvent } from '../contexts/LiveContext';

export const useNotificationFeed = ({ pageSize = 15 } = {}) => {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const [listRes, countsRes] = await Promise.all([
        notificationsAPI.list({ limit: pageSize }),
        notificationsAPI.counts(),
      ]);
      const listBody = listRes.data;
      const countsBody = countsRes.data;
      if (listBody?.success) setItems(listBody.data || []);
      if (countsBody?.success) setUnread(countsBody.data?.unread || 0);
    } catch (err) {
      console.warn('[notif feed] load error:', err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, pageSize]);

  useEffect(() => { load(); }, [load]);

  // Live updates from backend queue worker
  useLiveEvent('notification.new', (payload) => {
    if (!payload) return;
    setItems((prev) => [payload, ...prev].slice(0, pageSize));
    setUnread((n) => n + 1);
  });

  const markOneRead = async (id) => {
    try {
      await notificationsAPI.markRead(id);
      setItems((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true, readAt: new Date() } : n))
      );
      setUnread((n) => Math.max(0, n - 1));
    } catch (err) {
      console.warn('[notif feed] mark read error:', err.message);
    }
  };

  const markAllRead = async () => {
    try {
      await notificationsAPI.markAllRead();
      setItems((prev) => prev.map((n) => ({ ...n, read: true, readAt: new Date() })));
      setUnread(0);
    } catch (err) {
      console.warn('[notif feed] mark all read error:', err.message);
    }
  };

  return {
    items,
    unread,
    loading,
    open,
    setOpen,
    reload: load,
    markOneRead,
    markAllRead,
  };
};

export default useNotificationFeed;