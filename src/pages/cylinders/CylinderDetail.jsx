// src/components/admin/cylinders/CylinderDetail.jsx
import React, { useCallback, useEffect, useState } from 'react';
import {
  FaTimes, FaFlag, FaArchive, FaSyncAlt, FaExclamationTriangle,
  FaBox, FaHistory, FaRecycle, FaWeightHanging,
} from 'react-icons/fa';
import { adminCylindersAPI } from '../../api/endpoints';
import { useSnackbar } from '../../hooks/useSnackbar';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';
import DataTable from '../../components/ui/DataTable';
import SkeletonLoader from '../../components/ui/SkeletonLoader';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

const STATUS_VARIANT = {
  active: 'success', in_transit: 'info', at_plant: 'warning',
  under_inspection: 'warning', retired: 'neutral', lost: 'danger', flagged: 'danger',
};

const fmt = (d) => (d ? new Date(d).toLocaleString() : '—');

const CylinderDetail = ({ cylinder, onClose, onRefresh }) => {
  const open = !!cylinder;
  const [tab, setTab] = useState('overview');
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [weights, setWeights] = useState([]);
  const [custody, setCustody] = useState([]);
  const [remnants, setRemnants] = useState([]);
  const [busy, setBusy] = useState(null);
  const [confirm, setConfirm] = useState(null); // { kind: 'flag'|'retire' }

  const { success, error: showError } = useSnackbar();

  const loadDetail = useCallback(async () => {
    if (!cylinder?._id) return;
    try {
      setLoading(true);
      setError(null);
      const res = await adminCylindersAPI.get(cylinder._id);
      const body = res?.data;
      if (body?.success === false) {
        setError(body.message || 'Failed to load cylinder');
        return;
      }
      setDetail(body?.data?.cylinder || body?.data);
    } catch (err) {
      setError(err?.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }, [cylinder?._id]);

  const loadHistory = useCallback(async (which) => {
    if (!cylinder?._id) return;
    try {
      if (which === 'weights') {
        const res = await adminCylindersAPI.weightHistory(cylinder._id, { limit: 50 });
        setWeights(res?.data?.data || []);
      } else if (which === 'custody') {
        const res = await adminCylindersAPI.custodyHistory(cylinder._id, { limit: 50 });
        setCustody(res?.data?.data || []);
      } else if (which === 'remnants') {
        const res = await adminCylindersAPI.remnantHistory(cylinder._id, { limit: 50 });
        setRemnants(res?.data?.data || []);
      }
    } catch (err) {
      showError(err?.message || 'Failed to load history');
    }
  }, [cylinder?._id, showError]);

  useEffect(() => {
    if (!open) return;
    setTab('overview');
    setWeights([]);
    setCustody([]);
    setRemnants([]);
    loadDetail();
  }, [open, loadDetail]);

  useEffect(() => {
    if (!open) return;
    if (tab === 'weights' && weights.length === 0) loadHistory('weights');
    if (tab === 'custody' && custody.length === 0) loadHistory('custody');
    if (tab === 'remnants' && remnants.length === 0) loadHistory('remnants');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, tab]);

  const handleFlag = async (reason) => {
    setBusy('flag');
    try {
      await adminCylindersAPI.flag(cylinder._id, reason);
      success('Cylinder flagged');
      await loadDetail();
      onRefresh?.();
    } catch (err) {
      showError(err?.message || 'Failed to flag');
    } finally {
      setBusy(null);
    }
  };

  const handleRetire = async (reason) => {
    setBusy('retire');
    try {
      await adminCylindersAPI.retire(cylinder._id, reason);
      success('Cylinder retired');
      await loadDetail();
      onRefresh?.();
    } catch (err) {
      showError(err?.message || 'Failed to retire');
    } finally {
      setBusy(null);
    }
  };

  const r = detail || cylinder;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={r ? `Cylinder ${r.tagCode}` : 'Cylinder'}
      subtitle={r?.userId ? `Customer: ${r.userId.firstName || ''} ${r.userId.lastName || ''}` : ''}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Close</Button>
          <Button
            variant="warning"
            leftIcon={<FaFlag />}
            onClick={() => setConfirm({ kind: 'flag' })}
            disabled={busy || r?.status === 'retired'}
          >
            Flag
          </Button>
          <Button
            variant="danger"
            leftIcon={<FaArchive />}
            onClick={() => setConfirm({ kind: 'retire' })}
            disabled={busy || r?.status === 'retired'}
          >
            Retire
          </Button>
        </>
      }
    >
      {loading && !detail ? (
        <SkeletonLoader lines={8} />
      ) : error ? (
        <div className="refill-detail__error">
          <FaExclamationTriangle />
          <p>{error}</p>
          <Button onClick={loadDetail}>Retry</Button>
        </div>
      ) : r ? (
        <div className="cyl-detail">
          <div className="cyl-detail__tabs">
            <button
              type="button"
              className={`cyl-tab ${tab === 'overview' ? 'cyl-tab--active' : ''}`}
              onClick={() => setTab('overview')}
            ><FaBox /> Overview</button>
            <button
              type="button"
              className={`cyl-tab ${tab === 'weights' ? 'cyl-tab--active' : ''}`}
              onClick={() => setTab('weights')}
            ><FaWeightHanging /> Weights</button>
            <button
              type="button"
              className={`cyl-tab ${tab === 'custody' ? 'cyl-tab--active' : ''}`}
              onClick={() => setTab('custody')}
            ><FaHistory /> Custody</button>
            <button
              type="button"
              className={`cyl-tab ${tab === 'remnants' ? 'cyl-tab--active' : ''}`}
              onClick={() => setTab('remnants')}
            ><FaRecycle /> Remnants</button>
          </div>

          {tab === 'overview' && (
            <div className="cyl-overview">
              <div className="cyl-overview__row">
                <Badge variant={STATUS_VARIANT[r.status] || 'neutral'} dot>
                  {String(r.status).replace(/_/g, ' ')}
                </Badge>
                {r.flaggedReason && (
                  <Badge variant="danger">
                    <FaExclamationTriangle /> {r.flaggedReason}
                  </Badge>
                )}
              </div>

              <div className="cyl-overview__grid">
                <Cell label="Size" value={r.size || '—'} />
                <Cell label="Brand" value={r.brand || '—'} />
                <Cell label="Tare (empty) weight" value={r.emptyWeight != null ? `${r.emptyWeight} kg` : '—'} />
                <Cell
                  label="Last measured"
                  value={r.lastMeasuredWeight != null ? `${r.lastMeasuredWeight} kg` : '—'}
                />
                <Cell label="Last measured at" value={fmt(r.lastMeasuredAt)} />
                <Cell label="Custodian" value={r.currentCustodian?.type || '—'} />
                <Cell label="Custodian since" value={fmt(r.currentCustodian?.since)} />
                <Cell label="Registered" value={fmt(r.createdAt)} />
              </div>
            </div>
          )}

          {tab === 'weights' && (
            <DataTable
              columns={[
                {
                  key: 'phase',
                  label: 'Phase',
                  render: (w) => <Badge variant={w.phase === 'post_fill' ? 'primary' : 'neutral'}>{w.phase || w.measurementType || '—'}</Badge>,
                },
                { key: 'measuredWeight', label: 'Measured', render: (w) => `${w.measuredWeight} kg` },
                { key: 'calculatedLpg', label: 'LPG', render: (w) => `${w.calculatedLpg} kg` },
                { key: 'remnantDeltaKg', label: 'Remnant', render: (w) => (w.remnantDeltaKg != null ? `${w.remnantDeltaKg} kg` : '—') },
                { key: 'recordedBy', label: 'By', render: (w) => w.recordedBy ? `${w.recordedBy.firstName || ''} ${w.recordedBy.lastName || ''}`.trim() : '—' },
                { key: 'createdAt', label: 'At', render: (w) => fmt(w.createdAt) },
              ]}
              data={weights}
              searchable={false}
              pagination={false}
              emptyState={<p className="cyl-muted">No weight records</p>}
            />
          )}

          {tab === 'custody' && (
            <DataTable
              columns={[
                { key: 'event', label: 'Event', render: (c) => c.event?.replace(/_/g, ' ') || '—' },
                {
                  key: 'from', label: 'From',
                  render: (c) => `${c.fromCustodian?.type || '—'}`,
                },
                {
                  key: 'to', label: 'To',
                  render: (c) => `${c.toCustodian?.type || '—'}`,
                },
                { key: 'actor', label: 'Actor', render: (c) => c.actorId ? `${c.actorId.firstName || ''} ${c.actorId.lastName || ''}`.trim() : '—' },
                { key: 'createdAt', label: 'At', render: (c) => fmt(c.createdAt) },
              ]}
              data={custody}
              searchable={false}
              pagination={false}
              emptyState={<p className="cyl-muted">No custody records</p>}
            />
          )}

          {tab === 'remnants' && (
            <DataTable
              columns={[
                { key: 'event', label: 'Event', render: (c) => c.event?.replace(/_/g, ' ') || '—' },
                { key: 'delta', label: 'Delta', render: (c) => `${c.delta > 0 ? '+' : ''}${c.delta} kg` },
                { key: 'newBalance', label: 'New balance', render: (c) => `${c.newBalance} kg` },
                { key: 'createdAt', label: 'At', render: (c) => fmt(c.createdAt) },
              ]}
              data={remnants}
              searchable={false}
              pagination={false}
              emptyState={<p className="cyl-muted">No remnant entries</p>}
            />
          )}
        </div>
      ) : null}

      {confirm?.kind === 'flag' && (
        <ReasonDialog
          title="Flag cylinder"
          message="Flagging a cylinder marks it unsafe. Reason is required."
          confirmLabel="Flag"
          onClose={() => setConfirm(null)}
          onConfirm={(reason) => { setConfirm(null); handleFlag(reason); }}
        />
      )}

      {confirm?.kind === 'retire' && (
        <ReasonDialog
          title="Retire cylinder"
          message="Retiring takes a cylinder permanently out of service. Reason is required."
          confirmLabel="Retire"
          onClose={() => setConfirm(null)}
          onConfirm={(reason) => { setConfirm(null); handleRetire(reason); }}
        />
      )}
    </Modal>
  );
};

const Cell = ({ label, value }) => (
  <div className="cyl-cell">
    <div className="cyl-cell__label">{label}</div>
    <div className="cyl-cell__value">{value}</div>
  </div>
);

const ReasonDialog = ({ title, message, confirmLabel, onClose, onConfirm }) => {
  const [reason, setReason] = useState('');
  return (
    <Modal
      open
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button
            variant="danger"
            onClick={() => reason.trim() && onConfirm(reason.trim())}
            disabled={!reason.trim()}
          >{confirmLabel}</Button>
        </>
      }
    >
      <p style={{ margin: '0 0 var(--sp-3)', fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)' }}>
        {message}
      </p>
      <textarea
        rows={3}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Reason…"
        style={{
          width: '100%',
          padding: 'var(--sp-3)',
          border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius-md)',
          fontFamily: 'var(--font-sans)',
          fontSize: 'var(--fs-sm)',
        }}
      />
    </Modal>
  );
};

export default CylinderDetail;