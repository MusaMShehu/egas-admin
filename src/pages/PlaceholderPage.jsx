// src/pages/PlaceholderPage.jsx
import React from 'react';
import { usePermissions } from '../hooks/usePermissions';
import EmptyState from '../components/ui/EmptyState';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

const PlaceholderPage = ({ title = 'Coming soon', superAdminOnly = false }) => {
  const { isSuperAdmin } = usePermissions();
  const navigate = useNavigate();

  if (superAdminOnly && !isSuperAdmin) {
    return (
      <div>
        <PageHeader title="Restricted" subtitle="Only super-admins can access this page." />
        <EmptyState
          icon={<i className="fas fa-lock" />}
          title="Access denied"
          description="Contact a super-admin if you believe you should have access."
          action={<Button variant="outline" onClick={() => navigate('/admin/overview')}>Back to overview</Button>}
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={title} subtitle="This page is being built in a later batch." />
      <EmptyState
        icon={<i className="fas fa-tools" />}
        title="Under construction"
        description={`${title} will be available in an upcoming batch. All the backend endpoints it needs are already wired through adminAPI.`}
        action={<Button variant="outline" onClick={() => navigate('/admin/overview')}>Back to overview</Button>}
      />
    </div>
  );
};

export default PlaceholderPage;