// src/pages/admin/settings/AdminSettings.jsx
import React, { useCallback, useEffect, useState } from 'react';
import { FaUser, FaShieldAlt, FaBell, FaCog, FaServer } from 'react-icons/fa';
import { authAPI, notificationsAPI } from '../../api/endpoints';
import { useSnackbar } from '../../hooks/useSnackbar';
import { useAuth } from '../../contexts/AuthContext';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import FormField from '../../components/ui/FormField';
import FormRow from '../../components/ui/FormRow';
import SkeletonLoader from '../../components/ui/SkeletonLoader';
import '../../styles/modules/settings.css';

const TABS = [
  { id: 'profile',       label: 'Profile',       icon: <FaUser /> },
  { id: 'security',      label: 'Security',      icon: <FaShieldAlt /> },
  { id: 'notifications', label: 'Notifications', icon: <FaBell /> },
  { id: 'general',       label: 'General',       icon: <FaCog /> },
  { id: 'system',        label: 'System',        icon: <FaServer /> },
];

const AdminSettings = () => {
  const { user, checkAuth } = useAuth();
  const [tab, setTab] = useState('profile');
  return (
    <div className="settings-page">
      <PageHeader title="Settings" subtitle="Your account and portal preferences" />
      <div className="settings-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`settings-tab ${tab === t.id ? 'settings-tab--active' : ''}`}
            onClick={() => setTab(t.id)}
          >{t.icon} {t.label}</button>
        ))}
      </div>

      {tab === 'profile' && <ProfileTab user={user} onSaved={checkAuth} />}
      {tab === 'security' && <SecurityTab />}
      {tab === 'notifications' && <NotificationsTab />}
      {tab === 'general' && <GeneralTab />}
      {tab === 'system' && <SystemTab />}
    </div>
  );
};

const ProfileTab = ({ user, onSaved }) => {
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { success, error: showError } = useSnackbar();

  const update = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setError(''); };

  const submit = async () => {
    setLoading(true); setError('');
    try {
      await authAPI.updateProfile(form);
      success('Profile updated');
      onSaved?.();
    } catch (err) {
      const msg = err?.message || 'Update failed';
      setError(msg); showError(msg);
    } finally { setLoading(false); }
  };

  return (
    <Card title="Profile" subtitle="Your personal information">
      <FormRow cols={2}>
        <FormField label="First name" value={form.firstName}
          onChange={(e) => update('firstName', e.target.value)} disabled={loading} />
        <FormField label="Last name" value={form.lastName}
          onChange={(e) => update('lastName', e.target.value)} disabled={loading} />
      </FormRow>
      <FormRow cols={2}>
        <FormField label="Email (read-only)" value={user?.email || ''} disabled />
        <FormField label="Phone" value={form.phone}
          onChange={(e) => update('phone', e.target.value)}
          error={error} disabled={loading} />
      </FormRow>
      <FormRow cols={1}>
        <FormField label="Address" value={form.address}
          onChange={(e) => update('address', e.target.value)} disabled={loading} />
      </FormRow>
      <FormRow cols={2}>
        <FormField label="City" value={form.city}
          onChange={(e) => update('city', e.target.value)} disabled={loading} />
        <FormField label="State" value={form.state}
          onChange={(e) => update('state', e.target.value)} disabled={loading} />
      </FormRow>
      <div className="settings-actions">
        <Button variant="primary" onClick={submit} loading={loading}>Save changes</Button>
      </div>
    </Card>
  );
};

const SecurityTab = () => {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { success, error: showError } = useSnackbar();

  const update = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setError(''); };

  const submit = async () => {
    if (!form.currentPassword || !form.newPassword) {
      return setError('Current and new passwords are required');
    }
    if (form.newPassword !== form.confirmPassword) {
      return setError('Passwords do not match');
    }
    if (form.newPassword.length < 8) {
      return setError('Password must be at least 8 characters');
    }
    setLoading(true); setError('');
    try {
      await authAPI.updatePassword(form.currentPassword, form.newPassword);
      success('Password updated');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      const msg = err?.message || 'Password update failed';
      setError(msg); showError(msg);
    } finally { setLoading(false); }
  };

  return (
    <Card title="Security" subtitle="Change your password">
      <FormRow cols={1}>
        <FormField label="Current password" type="password"
          value={form.currentPassword}
          onChange={(e) => update('currentPassword', e.target.value)}
          required error={error} disabled={loading} />
      </FormRow>
      <FormRow cols={2}>
        <FormField label="New password" type="password"
          value={form.newPassword}
          onChange={(e) => update('newPassword', e.target.value)}
          required help="Min 8 chars, upper + lower + number + special" disabled={loading} />
        <FormField label="Confirm new password" type="password"
          value={form.confirmPassword}
          onChange={(e) => update('confirmPassword', e.target.value)}
          required disabled={loading} />
      </FormRow>
      <div className="settings-actions">
        <Button variant="primary" onClick={submit} loading={loading}>Update password</Button>
      </div>
    </Card>
  );
};

const NotificationsTab = () => {
  const [prefs, setPrefs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { success, error: showError } = useSnackbar();

  useEffect(() => {
    (async () => {
      try {
        const res = await notificationsAPI.getPreferences();
        setPrefs(res?.data?.data || {});
      } catch (err) {
        showError(err?.message || 'Failed to load preferences');
      } finally {
        setLoading(false);
      }
    })();
  }, [showError]);

  const toggle = (key, value) => setPrefs((p) => ({ ...p, [key]: value }));
  const toggleChannel = (key, value) =>
    setPrefs((p) => ({ ...p, channels: { ...p.channels, [key]: value } }));

  const save = async () => {
    setSaving(true);
    try {
      await notificationsAPI.updatePreferences(prefs);
      success('Preferences saved');
    } catch (err) {
      showError(err?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  if (loading) return <Card padding="lg"><SkeletonLoader lines={6} /></Card>;
  if (!prefs) return <Card padding="lg">Failed to load preferences.</Card>;

  return (
    <Card title="Notifications" subtitle="Choose which events you're notified about">
      <div className="settings-section">
        <h4>Categories</h4>
        {[
          ['orderUpdates', 'Order updates'],
          ['deliveryNotifications', 'Delivery notifications'],
          ['promotionalOffers', 'Promotional offers'],
          ['newsletter', 'Newsletter'],
        ].map(([key, label]) => (
          <label key={key} className="settings-checkbox">
            <input type="checkbox" checked={!!prefs[key]}
              onChange={(e) => toggle(key, e.target.checked)} disabled={saving} />
            <span>{label}</span>
          </label>
        ))}
      </div>
      <div className="settings-section">
        <h4>Channels</h4>
        {[
          ['inApp', 'In-app'],
          ['email', 'Email'],
          ['sms', 'SMS'],
          ['push', 'Push'],
        ].map(([key, label]) => (
          <label key={key} className="settings-checkbox">
            <input type="checkbox" checked={!!prefs.channels?.[key]}
              onChange={(e) => toggleChannel(key, e.target.checked)} disabled={saving} />
            <span>{label}</span>
          </label>
        ))}
      </div>
      <div className="settings-actions">
        <Button variant="primary" onClick={save} loading={saving}>Save preferences</Button>
      </div>
    </Card>
  );
};

const GeneralTab = () => (
  <Card title="General" subtitle="Portal-wide settings">
    <div className="settings-notice">
      These settings require a backend endpoint that doesn't exist yet. Values shown are the current defaults.
    </div>
    <FormRow cols={2}>
      <FormField label="Site name" value="e-GAS Admin" disabled />
      <FormField label="Timezone" value="Africa/Lagos" disabled />
    </FormRow>
    <FormRow cols={2}>
      <FormField label="Date format" value="DD/MM/YYYY" disabled />
      <FormField label="Items per page" value="20" disabled />
    </FormRow>
  </Card>
);

const SystemTab = () => (
  <Card title="System" subtitle="Runtime info">
    <FormRow cols={2}>
      <FormField label="Environment" value={process.env.NODE_ENV || 'development'} disabled />
      <FormField label="API base URL" value={process.env.REACT_APP_API_URL || 'https://egas-server-1.onrender.com/api/v1'} disabled />
    </FormRow>
    <div className="settings-notice">
      System preferences (backups, log levels, auto-update) require a backend endpoint.
      For runtime toggles, use <strong>Config</strong> in the sidebar.
    </div>
  </Card>
);

export default AdminSettings;