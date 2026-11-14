// src/components/admin/settlements/SettlementDetail.jsx
import React, { useCallback, useEffect, useState } from 'react';
import { FaCheckCircle, FaMoneyBillWave, FaSyncAlt, FaExclamationTriangle } from 'react-icons/fa';
import { adminSettlementsAPI } from '../../api/endpoints';
import { useSnackbar } from '../../hooks/useSnackbar';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import DataTable from '../../components/ui/DataTable';
import SkeletonLoader from '../../components/ui/SkeletonLoader';

const STATUS_VARIANT = {
  draft: 'neutral', pending_review: 'warning', approved: 'info',
  processing: 'info', paid: 'success', disputed: 'danger', cancelled: 'neutral',
};

const fmt = (d) => (d ? new Date(d).toLocaleString() : '—');
const money = (v) => (v != null ? `₦${Number(v).toLocaleString()}` : '—');

const SettlementDetail = ({ settlement, onClose, onRefresh }) => {
  const open = !!settlement;
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(null);
  const [payRef, setPayRef] = useState('');

  const { success, error: showError } = useSnackbar();

  const load = useCallback(async () => {
    if (!settlement?._id) return;
    try {
      setLoading(true);
      setError(null);
      const res = await adminSettlementsAPI.get(settlement._id);
      const body = res?.data;
      if (body?.success === false) {
        setError(body.message || 'Failed to load settlement');
        return;
      }
      setDetail(body?.data);
    } catch (err) {
      setError(err?.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }, [settlement?._id]);

  useEffect(() => {
    if (open) { setPayRef(''); load(); }
    else setDetail(null);
  }, [open, load]);

  const handleApprove = async () => {
    setBusy('approve');
    try {
      await adminSettlementsAPI.approve(settlement._id);
      success('Settlement approved');
      await load();
      onRefresh?.();
    } catch (err) {
      showError(err?.message || 'Failed to approve');
    } finally {
      setBusy(null);
    }
  };

  const handleMarkPaid = async () => {
    setBusy('pay');
    try {
      await adminSettlementsAPI.markPaid(settlement._id, payRef.trim() || undefined);
      success('Settlement marked paid');
      await load();
      onRefresh?.();
    } catch (err) {
      showError(err?.message || 'Failed to mark paid');
    } finally {
      setBusy(null);
    }
  };

  const s = detail?.settlement || settlement;
  const txns = detail?.transactions || [];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={s ? `Settlement ${s.settlementNumber}` : 'Settlement'}
      subtitle={s?.plantId?.name ? `Plant: ${s.plantId.name}` : ''}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Close</Button>
          <Button variant="outline" leftIcon={<FaSyncAlt />} onClick={load} loading={loading}>
            Refresh
          </Button>
          {s?.status === 'draft' && (
            <Button variant="success" leftIcon={<FaCheckCircle />}
              onClick={handleApprove} loading={busy === 'approve'}>
              Approve
            </Button>
          )}
          {s?.status === 'approved' && (
            <Button variant="primary" leftIcon={<FaMoneyBillWave />}
              onClick={handleMarkPaid} loading={busy === 'pay'}>
              Mark Paid
            </Button>
          )}
        </>
      }
    >
      {loading && !detail ? (
        <SkeletonLoader lines={10} />
      ) : error ? (
        <div className="settle-error">
          <FaExclamationTriangle />
          <p>{error}</p>
          <Button onClick={load}>Retry</Button>
        </div>
      ) : s ? (
        <div className="settle-detail">
          <div className="settle-detail__status">
            <Badge variant={STATUS_VARIANT[s.status] || 'neutral'} dot>
              {String(s.status).replace(/_/g, ' ')}
            </Badge>
          </div>

          <div className="settle-detail__grid">
            <Cell label="Transactions" value={s.totals?.transactionCount ?? 0} />
            <Cell label="Requested" value={`${s.totals?.totalRequestedKg ?? 0} kg`} />
            <Cell label="Confirmed" value={`${s.totals?.totalConfirmedKg ?? 0} kg`} />
            <Cell label="Variance" value={`${s.totals?.totalVarianceKg ?? 0} kg`} />
            <Cell label="Gross" value={money(s.totals?.grossValue)} />
            <Cell label="Adjustments" value={money(s.totals?.adjustments)} />
            <Cell label="Net payable" value={money(s.totals?.netPayable)} strong />
            <Cell label="Currency" value={s.totals?.currency || 'NGN'} />
          </div>

          <div className="settle-detail__meta">
            <div>
              <strong>Period:</strong>{' '}
              {s.period?.startDate ? new Date(s.period.startDate).toLocaleDateString() : '—'}
              {' → '}
              {s.period?.endDate ? new Date(s.period.endDate).toLocaleDateString() : '—'}
              {s.period?.label && ` — ${s.period.label}`}
            </div>
            <div><strong>Generated:</strong> {fmt(s.createdAt)}</div>
            {s.approvedAt && <div><strong>Approved:</strong> {fmt(s.approvedAt)}</div>}
            {s.paidAt && <div><strong>Paid:</strong> {fmt(s.paidAt)}</div>}
            {s.paymentReference && (
              <div><strong>Payment ref:</strong> {s.paymentReference}</div>
            )}
          </div>

          {s.status === 'approved' && (
            <div className="settle-detail__pay">
              <label htmlFor="payRef">Payment reference (optional)</label>
              <input
                id="payRef"
                type="text"
                placeholder="Bank transfer ref / Paystack payout ref"
                value={payRef}
                onChange={(e) => setPayRef(e.target.value)}
              />
            </div>
          )}

          {txns.length > 0 && (
            <div className="settle-detail__txns">
              <h4>Included transactions</h4>
              <DataTable
                columns={[
                  {
                    key: 'transactionId',
                    label: 'Transaction',
                    render: (st) => (
                      <strong>{st.transactionId?.transactionNumber || '—'}</strong>
                    ),
                  },
                  {
                    key: 'cylinder',
                    label: 'Cylinder',
                    render: (st) => st.transactionId?.cylinderTag || '—',
                  },
                  {
                    key: 'confirmedKg',
                    label: 'Confirmed',
                    render: (st) => `${st.confirmedKg ?? 0} kg`,
                  },
                  {
                    key: 'pricePerKg',
                    label: 'Price / kg',
                    render: (st) => money(st.pricePerKg),
                  },
                  {
                    key: 'amount',
                    label: 'Amount',
                    align: 'right',
                    render: (st) => money(st.amount),
                  },
                ]}
                data={txns}
                searchable={false}
                pagination={false}
                rowKey={(st) => st._id}
              />
            </div>
          )}
        </div>
      ) : null}
    </Modal>
  );
};

const Cell = ({ label, value, strong }) => (
  <div className="settle-cell">
    <div className="settle-cell__label">{label}</div>
    <div className={`settle-cell__value ${strong ? 'settle-cell__value--strong' : ''}`}>
      {value}
    </div>
  </div>
);

export default SettlementDetail;