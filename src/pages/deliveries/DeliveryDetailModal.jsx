// src/pages/admin/deliveries/DeliveryDetailModal.jsx
import React, { useCallback, useEffect, useState } from 'react';
import {
  FaTruck, FaUser, FaPhone, FaMapMarkerAlt, FaBox, FaWeightHanging,
  FaScaleBalanced, FaRecycle, FaIndustry, FaCheckCircle, FaClock,
  FaExclamationTriangle, FaSyncAlt,
} from 'react-icons/fa';
import { adminDeliveriesAPI } from '../../api/endpoints';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';
import SkeletonLoader from '../../components/ui/SkeletonLoader';

const STATUS_VARIANT = {
  pending: 'neutral', assigned: 'info', accepted: 'warning',
  out_for_delivery: 'primary', delivered: 'success', failed: 'danger',
  cancelled: 'neutral', paused: 'warning',
};

const fmt = (d) => (d ? new Date(d).toLocaleString() : '—');

const Cell = ({ label, value, danger }) => (
  <div className="dd-cell">
    <div className="dd-cell__label">{label}</div>
    <div className={`dd-cell__value ${danger ? 'is-danger' : ''}`}>{value ?? '—'}</div>
  </div>
);

const Step = ({ done, at, label, icon }) => (
  <div className={`dd-step ${done ? 'dd-step--done' : ''}`}>
    <div className="dd-step__icon">{done ? <FaCheckCircle /> : <FaClock />}</div>
    <div className="dd-step__body">
      <div className="dd-step__label">{label}</div>
      <div className="dd-step__time">{done ? fmt(at) : 'Pending'}</div>
    </div>
  </div>
);

const DeliveryDetailModal = ({ delivery, onClose, onRefresh }) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!delivery?._id) return;
    try {
      setLoading(true);
      const res = await adminDeliveriesAPI.getTimeline(delivery._id);
      const body = res?.data;
      if (body?.success) setDetail(body.data);
    } catch { /* use base delivery */ }
    finally { setLoading(false); }
  }, [delivery?._id]);

  useEffect(() => { load(); }, [load]);

  const d = detail?.delivery || delivery;
  const weights = detail?.weights || [];
  const refill = detail?.refillRequest;
  const cylinder = detail?.cylinder;

  return (
    <Modal
      open
      onClose={onClose}
      title={`Delivery — ${d.customerName}`}
      subtitle={d.deliveryDate ? fmt(d.deliveryDate) : ''}
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
        <SkeletonLoader lines={10} />
      ) : (
        <div className="dd">
          <div className="dd__status">
            <Badge variant={STATUS_VARIANT[d.status] || 'neutral'} dot>
              {String(d.status).replace(/_/g, ' ')}
            </Badge>
            {d.remnantDeltaKg > 0 && (
              <Badge variant="remnant" dot>+{d.remnantDeltaKg}kg remnant</Badge>
            )}
          </div>

          <Card padding="md" title="Customer">
            <div className="dd__grid">
              <Cell label="Name" value={d.customerName} />
              <Cell label="Phone" value={d.customerPhone} />
              <Cell label="Address" value={d.address} />
              <Cell label="Scheduled" value={fmt(d.deliveryDate)} />
            </div>
          </Card>

          <Card padding="md" title="Agent & Plan">
            <div className="dd__grid">
              <Cell label="Agent"
                value={d.deliveryAgent
                  ? `${d.deliveryAgent.firstName || ''} ${d.deliveryAgent.lastName || ''}`.trim()
                  : 'Unassigned'} />
              <Cell label="Agent phone" value={d.deliveryAgent?.phone} />
              <Cell label="Plan" value={d.planDetails?.planName || 'One-time'} />
              <Cell label="Size / Freq"
                value={[d.planDetails?.size, d.planDetails?.frequency].filter(Boolean).join(' · ')} />
            </div>
          </Card>

          {(d.preFillWeight != null || d.postFillWeight != null) && (
            <Card padding="md" title="Weights">
              <div className="dd__grid">
                <Cell label="Pre-fill" value={d.preFillWeight != null ? `${d.preFillWeight} kg` : '—'} />
                <Cell label="Post-fill" value={d.postFillWeight != null ? `${d.postFillWeight} kg` : '—'} />
                <Cell label="Refilled" value={d.refilledKg != null ? `${d.refilledKg} kg` : '—'} />
                <Cell label="Remnant credited"
                  value={d.remnantDeltaKg != null ? `${d.remnantDeltaKg} kg` : '—'} />
              </div>
              {weights.length > 0 && (
                <div className="dd-weights">
                  {weights.map((w) => (
                    <div key={w._id} className="dd-weight">
                      <Badge variant={w.phase === 'post_fill' ? 'primary' : 'neutral'} size="sm">
                        {w.phase || w.measurementType || '—'}
                      </Badge>
                      <span>{w.measuredWeight} kg</span>
                      <span className="dd-muted">{fmt(w.createdAt)}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {cylinder && (
            <Card padding="md" title="Cylinder">
              <div className="dd__grid">
                <Cell label="Tag" value={cylinder.tagCode} />
                <Cell label="Size" value={cylinder.size} />
                <Cell label="Status" value={cylinder.status} />
                <Cell label="Last weight"
                  value={cylinder.lastMeasuredWeight != null ? `${cylinder.lastMeasuredWeight} kg` : '—'} />
              </div>
            </Card>
          )}

          {refill && (
            <Card padding="md" title="Refill request">
              <div className="dd__grid">
                <Cell label="Request #" value={refill.requestNumber} />
                <Cell label="Plant" value={refill.plantId?.name} />
                <Cell label="Status" value={String(refill.status || '').replace(/_/g, ' ')} />
                <Cell label="Requested" value={`${refill.requestedQuantity ?? '—'} kg`} />
                <Cell label="Confirmed" value={`${refill.plantConfirmedQuantity ?? '—'} kg`} />
                <Cell label="Variance"
                  value={refill.variance != null ? `${refill.variance} kg` : '—'}
                  danger={Math.abs(refill.variance || 0) > 0.2} />
              </div>
            </Card>
          )}

          <Card padding="md" title="Timeline">
            <div className="dd-timeline">
              <Step done={!!d.createdAt} at={d.createdAt} label="Created" />
              <Step done={!!d.assignedAt} at={d.assignedAt} label="Assigned" />
              <Step done={!!d.acceptedAt} at={d.acceptedAt} label="Accepted" />
              <Step done={!!d.preFillRecordedAt} at={d.preFillRecordedAt} label="Pre-fill recorded" />
              <Step done={!!d.postFillRecordedAt} at={d.postFillRecordedAt} label="Post-fill recorded" />
              <Step done={d.status === 'delivered'} at={d.deliveredAt} label="Delivered" />
            </div>
          </Card>
        </div>
      )}
    </Modal>
  );
};

export default DeliveryDetailModal;