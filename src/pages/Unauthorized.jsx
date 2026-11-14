// src/pages/Unauthorized.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaLock } from 'react-icons/fa';
import Button from '../components/ui/Button';

const Unauthorized = () => (
  <div
    style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--surface-alt)',
      padding: 'var(--sp-6)',
      textAlign: 'center',
    }}
  >
    <div
      style={{
        width: 80,
        height: 80,
        borderRadius: '50%',
        background: 'var(--color-danger-soft)',
        color: 'var(--color-danger)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '2rem',
        marginBottom: 'var(--sp-5)',
      }}
    >
      <FaLock />
    </div>
    <h1 style={{ fontSize: 'var(--fs-2xl)', marginBottom: 'var(--sp-2)' }}>
      Access denied
    </h1>
    <p
      style={{
        color: 'var(--text-muted)',
        fontSize: 'var(--fs-sm)',
        maxWidth: 420,
        marginBottom: 'var(--sp-6)',
      }}
    >
      Your account doesn't have permission to view this page. If you believe
      this is a mistake, contact your administrator.
    </p>
    <Link to="/" style={{ textDecoration: 'none' }}>
      <Button variant="primary">Back to home</Button>
    </Link>
  </div>
);

export default Unauthorized;