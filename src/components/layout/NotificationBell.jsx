// src/components/layout/NotificationBell.jsx
import React, { useEffect, useRef } from 'react';
import { FaBell, FaCheck } from 'react-icons/fa';
import { useNotificationFeed } from '../../hooks/useNotificationFeed';
import Badge from '../ui/Badge';

const typeVariantMap = {
  order: 'primary',
  subscription: 'info',
  delivery: 'success',
  refill: 'warning',
  wallet: 'success',
  support: 'info',
  account: 'neutral',
  system: 'danger',
  promotional: 'remnant',
};

function formatTimeAgo(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

const NotificationBell = () => {
  const { items, unread, loading, open, setOpen, reload, markOneRead, markAllRead } = useNotificationFeed();
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, setOpen]);

  const handleOpen = () => {
    if (!open) reload();
    setOpen(!open);
  };

  const displayUnread = unread > 99 ? '99+' : unread;

  return (
    <div className="notif-bell" ref={ref}>
      <button
        type="button"
        className="notif-bell__trigger"
        onClick={handleOpen}
        aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ''}`}
      >
        <FaBell />
        {unread > 0 && <span className="notif-bell__badge">{displayUnread}</span>}
      </button>

      {open && (
        <div className="notif-bell__dropdown" role="dialog" aria-label="Notifications">
          <div className="notif-bell__header">
            <h3>Notifications</h3>
            <div className="notif-bell__header-actions">
              {unread > 0 && (
                <button type="button" className="notif-bell__mark-all" onClick={markAllRead}>
                  <FaCheck /> Mark all read
                </button>
              )}
            </div>
          </div>

          <div className="notif-bell__list">
            {loading && items.length === 0 ? (
              <div className="notif-bell__state">Loading…</div>
            ) : items.length === 0 ? (
              <div className="notif-bell__state">
                <i className="fas fa-bell-slash" />
                <p>You're all caught up</p>
              </div>
            ) : (
              items.map((n) => (
                <button
                  key={n._id}
                  type="button"
                  className={`notif-bell__item ${n.read ? '' : 'notif-bell__item--unread'}`}
                  onClick={() => !n.read && markOneRead(n._id)}
                >
                  <div className="notif-bell__item-header">
                    <Badge variant={typeVariantMap[n.type] || 'neutral'} size="sm">
                      {n.type}
                    </Badge>
                    <span className="notif-bell__time">{formatTimeAgo(n.createdAt)}</span>
                  </div>
                  <div className="notif-bell__title">{n.title}</div>
                  <div className="notif-bell__message">{n.message}</div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;