// src/components/admin/refills/AdminRefillDetail.jsx
import React, { useCallback, useEffect, useState } from 'react';
import {
  FaTimes, FaTruck, FaIndustry, FaUser, FaBox, FaClipboardCheck,
  FaCheckCircle, FaExclamationTriangle, FaClock, FaSyncAlt,
} from 'react-icons/fa';
import { adminRefillsAPI } from '../../api/endpoints';
import { useSnackbar } from '../../hooks/useSnackbar';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import SkeletonLoader from '../../components/ui/SkeletonLoader';

const STATUS_VARIANT = {
  created: 'neutral', received: 'info', inspection_pending: 'warning',
  approved: 'info', rejected: 'danger', refilling: 'info',
  quantity_recorded: 'warning', confirmed: 'success', disputed: 'danger',
  reconciled: 'primary', settled: 'success', cancelled: 'neutral',
};

const fmt = (d) => (d ? new Date(d).toLocaleString() : '—');

const AdminRefillDetail = ({ request, onClose, onRefresh }) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { error: showError } = useSnackbar();

  const load = useCallback(async () => {
    if (!request?._id) return;
    try {
      setLoading(true);
      setError(null);
      const res = await adminRefillsAPI.get(request._id);
      const body = res?.data;
      if (body?.success === false) {
        setError(body.message || 'Failed to load detail');
        return;
      }
      setDetail(body?.data?.request || body?.data);
    } catch (err) {
      setError(err?.message || 'Network error');
      showError(err?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [request?._id, showError]);

  useEffect(() => {
    if (request?._id) load();
    else setDetail(null);
  }, [request?._id, load]);

  const open = !!request;

  const r = detail || request;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={r ? `${r.requestNumber} — Refill Request` : 'Refill Request'}
      subtitle={r?.plantId?.name ? `Plant: ${r.plantId.name}` : ''}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Close</Button>
          <Button variant="outline" leftIcon={<FaSyncAlt />} onClick={load} loading={loading}>
            Refresh
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
          <Button onClick={load}>Retry</Button>
        </div>
      ) : r ? (
        <div className="refill-detail">
          <div className="refill-detail__status">
            <Badge variant={STATUS_VARIANT[r.status] || 'neutral'} dot>
              {String(r.status).replace(/_/g, ' ')}
            </Badge>
            {r.attemptNumber > 1 && (
              <Badge variant="warning">Retry #{r.attemptNumber}</Badge>
            )}
          </div>

          <div className="refill-detail__grid">
            <div className="refill-detail__cell">
              <div className="refill-detail__label"><FaIndustry /> Plant</div>
              <div className="refill-detail__value">
                {r.plantId?.name || '—'}
                {r.plantId?.code ? ` (${r.plantId.code})` : ''}
              </div>
            </div>

            <div className="refill-detail__cell">
              <div className="refill-detail__label"><FaUser /> Agent</div>
              <div className="refill-detail__value">
                {r.agentId
                  ? `${r.agentId.firstName || ''} ${r.agentId.lastName || ''}`.trim() || '—'
                  : '—'}
                {r.agentId?.phone ? ` · ${r.agentId.phone}` : ''}
              </div>
            </div>

            <div className="refill-detail__cell">
              <div className="refill-detail__label"><FaBox /> Cylinder</div>
              <div className="refill-detail__value">
                {r.cylinderTag || '—'}
                {r.cylinderSize ? ` · ${r.cylinderSize}` : ''}
              </div>
            </div>

            <div className="refill-detail__cell">
              <div className="refill-detail__label"><FaTruck /> Delivery</div>
              <div className="refill-detail__value">
                {r.deliveryId?.deliveryDate
                  ? new Date(r.deliveryId.deliveryDate).toLocaleDateString()
                  : '—'}
                {r.deliveryId?.status ? ` · ${r.deliveryId.status}` : ''}
              </div>
            </div>
          </div>

          <div className="refill-detail__section">
            <h4>Quantities</h4>
            <div className="refill-detail__qty-grid">
              <div>
                <span>Requested</span>
                <strong>{r.requestedQuantity ?? '—'} kg</strong>
              </div>
              <div>
                <span>Plant confirmed</span>
                <strong>{r.plantConfirmedQuantity ?? '—'} kg</strong>
              </div>
              <div>
                <span>Variance</span>
                <strong className={Math.abs(r.variance || 0) > 0.2 ? 'is-danger' : ''}>
                  {r.variance != null ? (r.variance > 0 ? '+' : '') + r.variance : '—'} kg
                </strong>
              </div>
              <div>
                <span>Price / kg</span>
                <strong>{r.pricePerKg != null ? `₦${r.pricePerKg}` : '—'}</strong>
              </div>
            </div>
          </div>

          <div className="refill-detail__section">
            <h4>Timeline</h4>
            <div className="refill-timeline">
              <Step
                done={!!r.createdAt}
                at={r.createdAt}
                label="Request created"
                icon={<FaBox />}
              />
              <Step
                done={!!r.receivedAt}
                at={r.receivedAt}
                label="Cylinder received at plant"
                icon={<FaIndustry />}
              />
              <Step
                done={!!r.confirmedAt}
                at={r.confirmedAt}
                label="Refill confirmed"
                icon={<FaCheckCircle />}
              />
              <Step
                done={!!r.transactionId?.collectedAt}
                at={r.transactionId?.collectedAt}
                label="Collected from plant"
                icon={<FaTruck />}
              />
            </div>
          </div>

          {r.agentNotes && (
            <div className="refill-detail__section">
              <h4>Agent notes</h4>
              <pre className="refill-detail__notes">{r.agentNotes}</pre>
            </div>
          )}

          {r.rejectedReason && (
            <div className="refill-detail__section refill-detail__section--danger">
              <h4><FaExclamationTriangle /> Rejection</h4>
              <p>{r.rejectedReason}</p>
            </div>
          )}
        </div>
      ) : null}
    </Modal>
  );
};

const Step = ({ done, at, label, icon }) => (
  <div className={`refill-step ${done ? 'refill-step--done' : ''}`}>
    <div className="refill-step__icon">{done ? <FaCheckCircle /> : <FaClock />}</div>
    <div className="refill-step__body">
      <div className="refill-step__label">{label}</div>
      <div className="refill-step__time">{done ? fmt(at) : 'Pending'}</div>
    </div>
  </div>
);

export default AdminRefillDetail;