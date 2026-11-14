// src/pages/admin/users/UserDetailModal.jsx
import React from 'react';
import {
  FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendar,
  FaVenusMars, FaEdit, FaCheckCircle, FaTimesCircle, FaExternalLinkAlt,
  FaWallet, FaMap, FaClipboardList, FaHistory,
} from 'react-icons/fa';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';
import '../../styles/modules/users.css';

const ROLE_VARIANT = {
  admin: 'danger', 'super-admin': 'danger', superadmin: 'danger',
  customer_care: 'info', delivery: 'warning',
  plant_admin: 'success', plant_supervisor: 'success',
  plant_operator: 'success', plant_staff: 'success',
  user: 'neutral',
};

const fmt = (d) => (d ? new Date(d).toLocaleString() : '—');

const Row = ({ icon, label, value, link }) => (
  <div className="user-detail__row">
    <div className="user-detail__row-icon">{icon}</div>
    <div className="user-detail__row-body">
      <div className="user-detail__row-label">{label}</div>
      <div className="user-detail__row-value">
        {link ? (
          <a href={link} target="_blank" rel="noopener noreferrer" className="user-detail__link">
            {value} <FaExternalLinkAlt />
          </a>
        ) : value || '—'}
      </div>
    </div>
  </div>
);

const UserDetailModal = ({ user, onClose, onEdit }) => {
  if (!user) return null;

  const profileUrl =
    user.profileImage?.secure_url || user.profileImage?.url || null;
  const initials = `${(user.firstName || '')[0] || ''}${(user.lastName || '')[0] || ''}`.toUpperCase() || 'U';

  const gps = user.gpsCoordinates?.coordinates;
  const hasGps = Array.isArray(gps) && gps.length === 2;
  const gpsLink = hasGps
    ? `https://www.google.com/maps?q=${gps[1]},${gps[0]}`
    : null;

  const walletBalance =
    user.wallet?.balance ?? user.walletBalance ?? null;

  return (
    <Modal
      open
      onClose={onClose}
      title={`${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User'}
      subtitle={user.email}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Close</Button>
          <Button variant="warning" leftIcon={<FaEdit />} onClick={() => onEdit?.(user)}>
            Edit user
          </Button>
        </>
      }
    >
      <div className="user-detail">
        {/* Hero */}
        <div className="user-detail__hero">
          <div className="user-detail__avatar">
            {profileUrl ? (
              <img src={profileUrl} alt={`${user.firstName} ${user.lastName}`} />
            ) : (
              <span>{initials}</span>
            )}
          </div>
          <div className="user-detail__hero-info">
            <h3>{`${user.firstName || ''} ${user.lastName || ''}`.trim()}</h3>
            <div className="user-detail__pills">
              <Badge variant={ROLE_VARIANT[user.role] || 'neutral'}>{user.role || '—'}</Badge>
              <Badge variant={user.isActive ? 'success' : 'neutral'} dot>
                {user.isActive ? 'Active' : 'Inactive'}
              </Badge>
              {user.emailVerified
                ? <Badge variant="success" size="sm"><FaCheckCircle /> Email verified</Badge>
                : <Badge variant="warning" size="sm"><FaTimesCircle /> Email unverified</Badge>}
              {user.phoneVerified
                ? <Badge variant="success" size="sm"><FaCheckCircle /> Phone verified</Badge>
                : <Badge variant="warning" size="sm"><FaTimesCircle /> Phone unverified</Badge>}
            </div>
          </div>
        </div>

        {/* Wallet tile */}
        {walletBalance != null && (
          <Card padding="md">
            <div className="user-detail__wallet">
              <div>
                <div className="user-detail__row-label">Wallet balance</div>
                <div className="user-detail__wallet-value">
                  ₦{Number(walletBalance).toLocaleString()}
                </div>
              </div>
              <FaWallet className="user-detail__wallet-icon" />
            </div>
          </Card>
        )}

        {/* Identity grid */}
        <Card padding="md" title="Identity">
          <div className="user-detail__grid">
            <Row icon={<FaEnvelope />} label="Email" value={user.email || '—'} />
            <Row icon={<FaPhone />} label="Phone" value={user.phone || '—'} />
            <Row icon={<FaCalendar />} label="Date of birth"
              value={user.dob ? new Date(user.dob).toLocaleDateString() : '—'} />
            <Row icon={<FaVenusMars />} label="Gender" value={user.gender || '—'} />
          </div>
        </Card>

        {/* Location */}
        <Card padding="md" title="Location">
          <div className="user-detail__grid">
            <Row icon={<FaMapMarkerAlt />} label="Address" value={user.address || '—'} />
            <Row icon={<FaMap />} label="City / State"
              value={[user.city, user.state].filter(Boolean).join(', ') || '—'} />
            <Row icon={<FaMapMarkerAlt />} label="Country" value={user.country || '—'} />
            <Row
              icon={<FaMapMarkerAlt />}
              label="GPS coordinates"
              value={hasGps ? `${gps[1].toFixed(5)}, ${gps[0].toFixed(5)}` : '—'}
              link={gpsLink}
            />
          </div>
        </Card>

        {/* Account metadata */}
        <Card padding="md" title="Account">
          <div className="user-detail__grid">
            <Row icon={<FaUser />} label="User ID" value={user._id} />
            <Row icon={<FaClipboardList />} label="Role" value={user.role || '—'} />
            <Row icon={<FaHistory />} label="Created" value={fmt(user.createdAt)} />
            <Row icon={<FaHistory />} label="Last updated" value={fmt(user.updatedAt)} />
            <Row icon={<FaHistory />} label="Last login" value={fmt(user.lastLogin)} />
            <Row icon={<FaCalendar />} label="Member since"
              value={user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'} />
          </div>
        </Card>
      </div>
    </Modal>
  );
};

export default UserDetailModal;