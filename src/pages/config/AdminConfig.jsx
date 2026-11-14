// src/pages/admin/config/AdminConfig.jsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FaSyncAlt, FaInbox, FaExclamationTriangle, FaSave, FaToggleOn,
  FaToggleOff, FaTrashAlt, FaCog, FaFlag,
} from 'react-icons/fa';
import { adminConfigAPI } from '../../api/endpoints';
import { useSnackbar } from '../../hooks/useSnackbar';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import FormField from '../../components/ui/FormField';
import FormRow from '../../components/ui/FormRow';
import SkeletonLoader from '../../components/ui/SkeletonLoader';
import '../../styles/modules/config.css';

const CATEGORIES = [
  { value: 'general',      label: 'General' },
  { value: 'remnant',      label: 'Remnant' },
  { value: 'plant',        label: 'Plant' },
  { value: 'settlement',   label: 'Settlement' },
  { value: 'notification', label: 'Notification' },
  { value: 'security',     label: 'Security' },
  { value: 'feature',      label: 'Feature' },
];

const VALUE_TYPE_BADGE = {
  string: 'neutral',
  number: 'info',
  boolean: 'success',
  json: 'warning',
};

const AdminConfig = () => {
  const [tab, setTab] = useState('configs'); // 'configs' | 'flags'
  const [configs, setConfigs] = useState([]);
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState('all');
  const [busyKey, setBusyKey] = useState(null);
  const [editing, setEditing] = useState(null); // { key, value, category, description }

  const { success, error: showError } = useSnackbar();

  const loadConfigs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = category === 'all'
        ? await adminConfigAPI.listConfigs()
        : await adminConfigAPI.configsByCategory(category);
      const body = res?.data;
      if (body?.success === false) {
        setError(body.message || 'Failed to load configs');
        return;
      }
      setConfigs(body?.data || []);
    } catch (err) {
      setError(err?.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }, [category]);

  const loadFlags = useCallback(async () => {
    try {
      const res = await adminConfigAPI.listFlags();
      const body = res?.data;
      if (body?.success) setFlags(body.data || []);
    } catch (err) {
      showError(err?.message || 'Failed to load flags');
    }
  }, [showError]);

  useEffect(() => {
    if (tab === 'configs') loadConfigs();
    if (tab === 'flags') loadFlags();
  }, [tab, loadConfigs, loadFlags]);

  const filteredConfigs = useMemo(() => {
    if (category === 'all') return configs;
    return configs.filter((c) => c.category === category);
  }, [configs, category]);

  const handleClearCache = async () => {
    setBusyKey('__cache');
    try {
      await adminConfigAPI.clearCache();
      success('Config cache cleared');
    } catch (err) {
      showError(err?.message || 'Failed to clear cache');
    } finally {
      setBusyKey(null);
    }
  };

  const handleEditConfig = (c) => {
    setEditing({
      key: c.key,
      value:
        typeof c.value === 'object'
          ? JSON.stringify(c.value, null, 2)
          : String(c.value ?? ''),
      valueType: c.valueType || 'string',
      category: c.category || 'general',
      description: c.description || '',
    });
  };

  const handleSaveConfig = async () => {
    if (!editing) return;
    setBusyKey(editing.key);
    try {
      let parsedValue = editing.value;
      if (editing.valueType === 'number') parsedValue = Number(editing.value);
      else if (editing.valueType === 'boolean') parsedValue = String(editing.value).toLowerCase() === 'true';
      else if (editing.valueType === 'json') {
        try { parsedValue = JSON.parse(editing.value); }
        catch { return showError('Invalid JSON'); }
      }

      await adminConfigAPI.updateConfig(editing.key, {
        value: parsedValue,
        category: editing.category,
        description: editing.description,
      });
      success(`Config "${editing.key}" updated`);
      setEditing(null);
      await loadConfigs();
    } catch (err) {
      showError(err?.message || 'Failed to update config');
    } finally {
      setBusyKey(null);
    }
  };

  const handleToggleFlag = async (f) => {
    setBusyKey(f.key);
    try {
      await adminConfigAPI.updateFlag(f.key, {
        enabled: !f.enabled,
        description: f.description,
      });
      success(`Flag "${f.key}" ${!f.enabled ? 'enabled' : 'disabled'}`);
      await loadFlags();
    } catch (err) {
      showError(err?.message || 'Failed to toggle flag');
    } finally {
      setBusyKey(null);
    }
  };

  return (
    <div className="config-page">
      <PageHeader
        title="System Configuration"
        subtitle="Runtime settings + feature flags"
        actions={
          <Button
            variant="outline"
            leftIcon={<FaSyncAlt />}
            onClick={tab === 'configs' ? loadConfigs : loadFlags}
            loading={loading}
          >Refresh</Button>
        }
      />

      <div className="config-tabs">
        <button
          type="button"
          className={`config-tab ${tab === 'configs' ? 'config-tab--active' : ''}`}
          onClick={() => setTab('configs')}
        ><FaCog /> System Config</button>
        <button
          type="button"
          className={`config-tab ${tab === 'flags' ? 'config-tab--active' : ''}`}
          onClick={() => setTab('flags')}
        ><FaFlag /> Feature Flags</button>
      </div>

      {tab === 'configs' && (
        <>
          <Card padding="md">
            <div className="config-filters">
              <div className="config-filters__group">
                <label>Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="all">All categories</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div className="config-filters__group config-filters__group--grow" />
              <Button
                variant="danger"
                leftIcon={<FaTrashAlt />}
                onClick={handleClearCache}
                loading={busyKey === '__cache'}
              >Clear Cache</Button>
            </div>
          </Card>

          {error ? (
            <div className="config-error">
              <FaExclamationTriangle />
              <p>{error}</p>
              <Button onClick={loadConfigs}>Retry</Button>
            </div>
          ) : loading ? (
            <SkeletonLoader type="table" rows={5} columns={4} />
          ) : filteredConfigs.length === 0 ? (
            <Card padding="lg">
              <div className="config-empty">
                <FaInbox />
                <p>No configs in this category</p>
              </div>
            </Card>
          ) : (
            <div className="config-list">
              {filteredConfigs.map((c) => (
                <Card key={c.key} padding="md">
                  <div className="config-item">
                    <div className="config-item__main">
                      <div className="config-item__key">
                        <strong>{c.key}</strong>
                        <Badge variant={VALUE_TYPE_BADGE[c.valueType] || 'neutral'} size="sm">
                          {c.valueType}
                        </Badge>
                        <Badge variant="neutral" size="sm">{c.category}</Badge>
                        {c.isEditable === false && (
                          <Badge variant="warning" size="sm">read-only</Badge>
                        )}
                      </div>
                      <div className="config-item__value">
                        {c.description && (
                          <div className="config-item__desc">{c.description}</div>
                        )}
                        <code className="config-item__code">
                          {typeof c.value === 'object'
                            ? JSON.stringify(c.value)
                            : String(c.value)}
                        </code>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<FaSave />}
                      onClick={() => handleEditConfig(c)}
                      disabled={c.isEditable === false}
                    >Edit</Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'flags' && (
        <>
          {loading ? (
            <SkeletonLoader type="table" rows={5} columns={3} />
          ) : flags.length === 0 ? (
            <Card padding="lg">
              <div className="config-empty">
                <FaInbox />
                <p>No feature flags defined</p>
              </div>
            </Card>
          ) : (
            <div className="flag-list">
              {flags.map((f) => (
                <Card key={f._id || f.key} padding="md">
                  <div className="flag-item">
                    <div className="flag-item__main">
                      <div className="flag-item__key">
                        <strong>{f.key}</strong>
                        <Badge variant={f.enabled ? 'success' : 'neutral'} dot>
                          {f.enabled ? 'enabled' : 'disabled'}
                        </Badge>
                        {f.scope && f.scope !== 'global' && (
                          <Badge variant="info" size="sm">{f.scope}</Badge>
                        )}
                      </div>
                      {f.description && (
                        <div className="flag-item__desc">{f.description}</div>
                      )}
                    </div>
                    <Button
                      variant={f.enabled ? 'danger' : 'success'}
                      size="sm"
                      leftIcon={f.enabled ? <FaToggleOff /> : <FaToggleOn />}
                      onClick={() => handleToggleFlag(f)}
                      loading={busyKey === f.key}
                    >
                      {f.enabled ? 'Disable' : 'Enable'}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {editing && (
        <Card padding="lg" className="config-editor">
          <h3 className="config-editor__title">Edit “{editing.key}”</h3>
          <FormRow cols={2}>
            <FormField label="Value type" name="valueType" as="select"
              value={editing.valueType}
              onChange={(e) => setEditing((v) => ({ ...v, valueType: e.target.value }))}>
              <option value="string">String</option>
              <option value="number">Number</option>
              <option value="boolean">Boolean</option>
              <option value="json">JSON</option>
            </FormField>
            <FormField label="Category" name="category" as="select"
              value={editing.category}
              onChange={(e) => setEditing((v) => ({ ...v, category: e.target.value }))}>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </FormField>
          </FormRow>
          <FormRow cols={1}>
            <FormField label="Description" name="description"
              value={editing.description}
              onChange={(e) => setEditing((v) => ({ ...v, description: e.target.value }))}
            />
            <FormField label="Value" name="value"
              as={editing.valueType === 'json' ? 'textarea' : 'input'}
              rows={editing.valueType === 'json' ? 6 : undefined}
              value={editing.value}
              onChange={(e) => setEditing((v) => ({ ...v, value: e.target.value }))}
              help={
                editing.valueType === 'boolean'
                  ? 'Type "true" or "false"'
                  : editing.valueType === 'json'
                  ? 'Paste valid JSON'
                  : undefined
              }
            />
          </FormRow>
          <div className="config-editor__actions">
            <Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
            <Button variant="primary" leftIcon={<FaSave />}
              onClick={handleSaveConfig}
              loading={busyKey === editing.key}>
              Save
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AdminConfig;