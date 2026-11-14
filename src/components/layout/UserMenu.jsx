// src/components/layout/UserMenu.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserCircle, FaSignOutAlt, FaUser, FaCog, FaChevronDown } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { normalizeRole } from '../../utils/permissions';

const UserMenu = ({ collapsed = false }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const handleLogout = async () => {
    setOpen(false);
    await logout?.();
    navigate('/login', { replace: true });
  };

  const role = normalizeRole(user?.role);
  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : user?.email || 'Admin';
  const initials = user?.firstName
    ? `${user.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase()
    : 'A';

  return (
    <div className={`user-menu ${collapsed ? 'user-menu--collapsed' : ''}`} ref={ref}>
      <button
        type="button"
        className="user-menu__trigger"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <div className="user-menu__avatar">
          {user?.profileImage?.secure_url || user?.profileImage?.url ? (
            <img src={user.profileImage.secure_url || user.profileImage.url} alt={displayName} />
          ) : (
            <span>{initials}</span>
          )}
        </div>
        {!collapsed && (
          <>
            <div className="user-menu__text">
              <span className="user-menu__name">{displayName}</span>
              <span className="user-menu__role">{role.replace('-', ' ')}</span>
            </div>
            <FaChevronDown className={`user-menu__caret ${open ? 'is-open' : ''}`} />
          </>
        )}
      </button>

      {open && (
        <div className="user-menu__dropdown" role="menu">
          <div className="user-menu__header">
            <strong>{displayName}</strong>
            <span>{user?.email}</span>
          </div>
          <Link to="/admin/settings" className="user-menu__item" role="menuitem" onClick={() => setOpen(false)}>
            <FaUser /> Profile
          </Link>
          <Link to="/admin/settings" className="user-menu__item" role="menuitem" onClick={() => setOpen(false)}>
            <FaCog /> Settings
          </Link>
          <div className="user-menu__divider" />
          <button type="button" className="user-menu__item user-menu__item--danger" onClick={handleLogout}>
            <FaSignOutAlt /> Sign out
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;