// src/components/delivery/AgentDeliveryCard.jsx
import React from 'react';
import {
  FaCheckCircle, FaTimesCircle, FaTruck, FaPhone, FaMapMarkerAlt,
  FaWeightHanging, FaScaleBalanced, FaBalanceScale, FaSync,
} from 'react-icons/fa';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

const STATUS_VARIANT = {
  assigned:        'warning',
  accepted:        'info',
  out_for_delivery:'primary',
  paused:          'neutral',
  delivered:       'success',
  failed:          'danger',
};

const AgentDeliveryCard = ({
  delivery,
  loading,
  onAccept,
  onOutForDelivery,
  onDelivered,
  onFailed,
  onSync,
  onRecordPreFill,
  onRecordPostFill,
}) => {
  const d = delivery;
  const plan = d.planDetails || {};
  const isPaused = d.status === 'paused';
  const needsPreFill = !d.preFillWeightRecordId && ['assigned', 'accepted'].includes(d.status);
  const needsPostFill =
    d.preFillWeightRecordId &&
    !d.postFillWeightRecordId &&
    ['accepted', 'out_for_delivery'].includes(d.status) &&
    !isPaused;
  const canDeliver = ['accepted', 'out_for_delivery'].includes(d.status) && !isPaused;
  const canFail = ['assigned', 'accepted', 'out_for_delivery'].includes(d.status);

  return (
    <div className={`agent-card ${isPaused ? 'agent-card--paused' : ''}`}>
      <div className="agent-card__top">
        <div className="agent-card__customer">
          <div className="agent-card__name">{d.customerName}</div>
          <div className="agent-card__contact">
            <span><FaPhone /> {d.customerPhone}</span>
            <span><FaMapMarkerAlt /> {d.address}</span>
          </div>
        </div>
        <Badge variant={STATUS_VARIANT[d.status] || 'neutral'} dot>
          {d.status.replace(/_/g, ' ')}
        </Badge>
      </div>

      <div className="agent-card__plan">
        <div>
          <span className="agent-card__plan-label">Plan:</span>{' '}
          {plan.planName || 'One-Time'} — {plan.size || d.requestedKg || '—'}
        </div>
        <div>
          <span className="agent-card__plan-label">Scheduled:</span>{' '}
          {d.deliveryDate
            ? new Date(d.deliveryDate).toLocaleString()
            : '—'}
        </div>
        {d.cylinderTag && (
          <div>
            <span className="agent-card__plan-label">Cylinder:</span> {d.cylinderTag}
          </div>
        )}
        {d.retryCount > 0 && (
          <div className="agent-card__retry">Retry #{d.retryCount}</div>
        )}
      </div>

      {(d.preFillWeight != null || d.postFillWeight != null || d.remnantDeltaKg != null) && (
        <div className="agent-card__weights">
          {d.preFillWeight != null && (
            <div className="agent-weight">
              <FaWeightHanging />
              <span className="agent-weight__label">Pre-fill</span>
              <span className="agent-weight__value">{d.preFillWeight} kg</span>
            </div>
          )}
          {d.postFillWeight != null && (
            <div className="agent-weight">
              <FaBalanceScale />
              <span className="agent-weight__label">Post-fill</span>
              <span className="agent-weight__value">{d.postFillWeight} kg</span>
            </div>
          )}
          {d.remnantDeltaKg != null && (
            <div className="agent-weight agent-weight--remnant">
              <span className="agent-weight__label">Remnant credited</span>
              <span className="agent-weight__value">{d.remnantDeltaKg} kg</span>
            </div>
          )}
        </div>
      )}

      <div className="agent-card__actions">
        {d.status === 'assigned' && (
          <Button variant="primary" size="sm" loading={loading} onClick={() => onAccept(d)}>
            Accept
          </Button>
        )}
        {d.status === 'accepted' && !needsPreFill && !needsPostFill && (
          <Button variant="warning" size="sm" loading={loading} onClick={() => onOutForDelivery(d)}>
            Start Delivery
          </Button>
        )}
        {needsPreFill && (
          <Button
            variant="primary"
            size="sm"
            loading={loading}
            leftIcon={<FaWeightHanging />}
            onClick={() => onRecordPreFill(d)}
          >
            Record Pre-Fill
          </Button>
        )}
        {needsPostFill && (
          <Button
            variant="primary"
            size="sm"
            loading={loading}
            leftIcon={<FaBalanceScale />}
            onClick={() => onRecordPostFill(d)}
          >
            Record Post-Fill
          </Button>
        )}
        {canDeliver && d.postFillWeightRecordId && (
          <Button
            variant="success"
            size="sm"
            loading={loading}
            leftIcon={<FaCheckCircle />}
            onClick={() => onDelivered(d)}
          >
            Delivered
          </Button>
        )}
        {canFail && (
          <Button
            variant="danger"
            size="sm"
            loading={loading}
            leftIcon={<FaTimesCircle />}
            onClick={() => onFailed(d)}
          >
            Failed
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<FaSync />}
          onClick={() => onSync(d)}
        >
          Sync
        </Button>
      </div>
    </div>
  );
};

export default AgentDeliveryCard;