continue exactly from the line chat 6 stopped do not start/rewrite the complete file cut from start just continue from the line stopped
Continuing Batch 7 — From Where Chat 6 Stopped
Chat 6 was cut off in AdminReports.jsx inside the PDF export's low-stock-alerts table at:

jsx
head: [['Product', 'Current stock', 'Status']],
Continuing from exactly that line:

File 9 (continued) — src/pages/admin/reports/AdminReports.jsx
jsx
// ...continuing from: head: [['Product', 'Current stock', 'Status']],
            body: data.charts.lowStockAlerts.map((p) => [
              p.product || '—',
              String(p.currentStock ?? 0),
              p.status || '—',
            ]),
            styles: { fontSize: 9, cellPadding: 5 },
            headStyles: { fillColor: [111, 66, 193], textColor: 255 },
            alternateRowStyles: { fillColor: [249, 250, 251] },
          });
          y = doc.lastAutoTable.finalY + 20;
        }

        if (tab === 'subscriptions' && data.charts?.byPlan?.length) {
          sectionTitle('Plan Distribution');
          autoTable(doc, {
            startY: y,
            margin: { left: margin, right: margin },
            head: [['Plan', 'Subscribers', 'Revenue']],
            body: data.charts.byPlan.map((p) => [
              p._id || '—',
              String(p.count ?? 0),
              `₦${Number(p.revenue || 0).toLocaleString()}`,
            ]),
            styles: { fontSize: 9, cellPadding: 5 },
            headStyles: { fillColor: [111, 66, 193], textColor: 255 },
            alternateRowStyles: { fillColor: [249, 250, 251] },
          });
          y = doc.lastAutoTable.finalY + 20;
        }

        if (tab === 'users' && data.charts?.byRole?.length) {
          sectionTitle('Users by Role');
          autoTable(doc, {
            startY: y,
            margin: { left: margin, right: margin },
            head: [['Role', 'Users']],
            body: data.charts.byRole.map((r) => [r._id || '—', String(r.count ?? 0)]),
            styles: { fontSize: 9, cellPadding: 5 },
            headStyles: { fillColor: [111, 66, 193], textColor: 255 },
            alternateRowStyles: { fillColor: [249, 250, 251] },
          });
          y = doc.lastAutoTable.finalY + 20;
        }
      }

      // ── Footer on each page ──
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `e-GAS Admin · Generated ${new Date().toLocaleString()}`,
          margin,
          pageHeight - 24
        );
        doc.text(`Page ${i} / ${pageCount}`, pageWidth - margin, pageHeight - 24, {
          align: 'right',
        });
      }

      const filename = `e-gas-${tab}-${range.startDate}_to_${range.endDate}.pdf`;
      doc.save(filename);
      success('PDF downloaded');
    } catch (err) {
      showError(err?.message || 'PDF export failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="reports-page">
      <PageHeader
        title="Reports"
        subtitle="Deep business performance, health, and financial analytics"
        actions={
          <>
            <Button variant="outline" leftIcon={<FaSyncAlt />} onClick={load} loading={loading}>
              Refresh
            </Button>
            <Button variant="danger" leftIcon={<FaFilePdf />}
              onClick={handleExportPdf}
              loading={exporting}
              disabled={!data}>
              Download PDF
            </Button>
          </>
        }
      />

      {/* Date range selector */}
      <Card padding="md">
        <div className="reports-filters">
          <div className="reports-filters__group reports-filters__group--grow">
            <label>Range</label>
            <div className="reports-presets">
              {Object.keys(RANGE_LABELS).filter((k) => k !== 'custom').map((k) => (
                <button
                  key={k}
                  type="button"
                  className={`reports-preset ${rangeKey === k ? 'reports-preset--active' : ''}`}
                  onClick={() => setPreset(k)}
                >
                  {RANGE_LABELS[k]}
                </button>
              ))}
              <button
                type="button"
                className={`reports-preset ${rangeKey === 'custom' ? 'reports-preset--active' : ''}`}
                onClick={() => setRangeKey('custom')}
              >
                Custom
              </button>
            </div>
          </div>
          {rangeKey === 'custom' && (
            <>
              <div className="reports-filters__group">
                <label>From</label>
                <input type="date" value={range.startDate}
                  onChange={(e) => setRange((r) => ({ ...r, startDate: e.target.value }))} />
              </div>
              <div className="reports-filters__group">
                <label>To</label>
                <input type="date" value={range.endDate}
                  onChange={(e) => setRange((r) => ({ ...r, endDate: e.target.value }))} />
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Tabs */}
      <div className="reports-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`reports-tab ${tab === t.id ? 'reports-tab--active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {error ? (
        <Card padding="lg">
          <EmptyState icon={<FaExclamationTriangle />} title="Couldn't load report"
            description={error} action={<Button onClick={load}>Retry</Button>} />
        </Card>
      ) : loading ? (
        <Card padding="lg"><SkeletonLoader lines={10} /></Card>
      ) : tab === 'business-health' ? (
        <BusinessHealthView data={data} />
      ) : tab === 'realtime' ? (
        <RealtimeView data={realtime} />
      ) : tab === 'sales' ? (
        <SalesView data={data} />
      ) : tab === 'users' ? (
        <UsersView data={data} />
      ) : tab === 'inventory' ? (
        <InventoryView data={data} />
      ) : tab === 'subscriptions' ? (
        <SubscriptionsView data={data} />
      ) : (
        <FinancialView data={data} />
      )}
    </div>
  );
};

// ─── Helpers ───
function prettify(key) {
  return String(key)
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (c) => c.toUpperCase())
    .replace(/_/g, ' ')
    .trim();
}

const StatRow = ({ items }) => (
  <div className="report-stats">
    {items.map((it, i) => (
      <div key={i} className={`mini-stat mini-stat--${it.tone || 'primary'}`}>
        <div className="mini-stat__value">{it.value}</div>
        <div className="mini-stat__label">{it.label}</div>
        {it.change != null && (
          <div className={`report-trend ${it.change >= 0 ? 'up' : 'down'}`}>
            {it.change >= 0 ? '+' : ''}{Number(it.change).toFixed(1)}%
          </div>
        )}
      </div>
    ))}
  </div>
);

// ─── Business Health ───
const BusinessHealthView = ({ data }) => {
  if (!data) return <EmptyState title="No data" />;
  const score = data.overallScore ?? 0;
  const grade = data.grade || '—';
  const gradeColor =
    score >= 85 ? 'success' :
    score >= 70 ? 'info' :
    score >= 50 ? 'warning' : 'danger';

  return (
    <div className="report-view">
      <Card padding="lg">
        <div className="health-hero">
          <div className={`health-score health-score--${gradeColor}`}>
            <div className="health-score__number">{score}</div>
            <div className="health-score__suffix">/100</div>
          </div>
          <div className="health-hero__text">
            <h2>Overall business health</h2>
            <Badge variant={gradeColor} dot>{String(grade).toUpperCase()}</Badge>
            <p>
              Composite score across disputes, reconciliation, deliveries,
              retention, support, and inventory. Higher is better.
            </p>
          </div>
        </div>
      </Card>

      <div className="health-components">
        {(data.components || []).map((c) => (
          <Card key={c.key} padding="md">
            <div className="health-comp">
              <div className="health-comp__head">
                <span>{c.label}</span>
                <Badge
                  variant={c.score >= 85 ? 'success' : c.score >= 70 ? 'info' : c.score >= 50 ? 'warning' : 'danger'}
                  dot
                >
                  {c.score}/100
                </Badge>
              </div>
              <div className="health-bar">
                <div
                  className="health-bar__fill"
                  style={{ width: `${c.score}%` }}
                />
              </div>
              <div className="health-comp__details">
                {Object.entries(c)
                  .filter(([k]) => !['key', 'label', 'score'].includes(k))
                  .map(([k, v]) => (
                    <span key={k} className="health-comp__detail">
                      {prettify(k)}: <strong>{v}</strong>
                    </span>
                  ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// ─── Sales ───
const SalesView = ({ data }) => {
  if (!data) return <EmptyState title="No sales data" />;
  const s = data.summary || {};
  return (
    <div className="report-view">
      <StatRow items={[
        { label: 'Total sales', value: `₦${Number(s.totalSales || 0).toLocaleString()}`, change: s.salesChange, tone: 'primary' },
        { label: 'Orders', value: Number(s.totalOrders || 0).toLocaleString(), change: s.ordersChange, tone: 'info' },
        { label: 'Avg order value', value: `₦${Number(s.averageOrderValue || 0).toLocaleString()}`, change: s.aovChange, tone: 'success' },
      ]} />

      <div className="report-grid-2">
        <Card title="Top products">
          {(data.charts?.topProducts || []).length === 0 ? (
            <EmptyState title="No product sales in this range" />
          ) : (
            <DataTable
              columns={[
                { key: 'name', label: 'Product' },
                { key: 'unitsSold', label: 'Units', align: 'right' },
                {
                  key: 'revenue', label: 'Revenue', align: 'right',
                  render: (p) => `₦${Number(p.revenue || 0).toLocaleString()}`,
                },
              ]}
              data={data.charts.topProducts}
              searchable={false}
              pagination={false}
            />
          )}
        </Card>

        <Card title="Payment methods">
          {(data.charts?.paymentMethodDistribution || []).length === 0 ? (
            <EmptyState title="No payment data" />
          ) : (
            <ul className="report-list">
              {data.charts.paymentMethodDistribution.map((p, i) => (
                <li key={i}>
                  <span>{p._id || '—'}</span>
                  <span>{p.count} orders · ₦{Number(p.revenue || 0).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {(data.charts?.dailySales || []).length > 0 && (
        <Card title="Daily sales" subtitle="Revenue and order count per day">
          <DataTable
            columns={[
              { key: '_id', label: 'Date' },
              { key: 'orders', label: 'Orders', align: 'right' },
              {
                key: 'revenue', label: 'Revenue', align: 'right',
                render: (r) => `₦${Number(r.revenue || 0).toLocaleString()}`,
              },
            ]}
            data={data.charts.dailySales}
            searchable={false}
            pagination={false}
          />
        </Card>
      )}
    </div>
  );
};

// ─── Users ───
const UsersView = ({ data }) => {
  if (!data) return <EmptyState title="No user data" />;
  const s = data.summary || {};
  return (
    <div className="report-view">
      <StatRow items={[
        { label: 'Total users', value: Number(s.totalUsers || 0).toLocaleString(), tone: 'primary' },
        { label: 'New users', value: Number(s.newUsers || 0).toLocaleString(), change: s.registrationChange, tone: 'success' },
        { label: 'Active users', value: Number(s.activeUsers || 0).toLocaleString(), tone: 'info' },
      ]} />

      <div className="report-grid-2">
        <Card title="By role">
          {(data.charts?.byRole || []).length === 0 ? (
            <EmptyState title="No role data" />
          ) : (
            <ul className="report-list">
              {data.charts.byRole.map((r, i) => (
                <li key={i}><span>{r._id || '—'}</span><span>{r.count}</span></li>
              ))}
            </ul>
          )}
        </Card>
        <Card title="Top cities">
          {(data.charts?.byCity || []).length === 0 ? (
            <EmptyState title="No city data" />
          ) : (
            <ul className="report-list">
              {data.charts.byCity.map((c, i) => (
                <li key={i}><span>{c._id || '—'}</span><span>{c.count}</span></li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {(data.charts?.dailyRegistrations || []).length > 0 && (
        <Card title="Daily registrations">
          <DataTable
            columns={[
              { key: '_id', label: 'Date' },
              { key: 'count', label: 'New users', align: 'right' },
            ]}
            data={data.charts.dailyRegistrations}
            searchable={false}
            pagination={false}
          />
        </Card>
      )}
    </div>
  );
};

// ─── Inventory ───
const InventoryView = ({ data }) => {
  if (!data) return <EmptyState title="No inventory data" />;
  const s = data.summary || {};
  return (
    <div className="report-view">
      <StatRow items={[
        { label: 'Products', value: Number(s.totalProducts || 0).toLocaleString(), tone: 'primary' },
        { label: 'Low stock', value: Number(s.lowStockItems || 0).toLocaleString(), tone: 'warning' },
        { label: 'Out of stock', value: Number(s.outOfStockItems || 0).toLocaleString(), tone: 'danger' },
        { label: 'Inventory value', value: `₦${Number(s.inventoryValue || 0).toLocaleString()}`, tone: 'success' },
      ]} />

      {(data.charts?.lowStockAlerts || []).length > 0 && (
        <Card title="Low stock alerts" subtitle="Reorder these soon">
          <DataTable
            columns={[
              { key: 'product', label: 'Product' },
              { key: 'category', label: 'Category' },
              { key: 'currentStock', label: 'Current', align: 'right' },
              { key: 'minimumRequired', label: 'Min', align: 'right' },
              {
                key: 'status', label: 'Status',
                render: (r) => (
                  <Badge variant={r.status === 'Critical' ? 'danger' : 'warning'} dot>
                    {r.status}
                  </Badge>
                ),
              },
            ]}
            data={data.charts.lowStockAlerts}
            searchable={false}
            pagination={false}
          />
        </Card>
      )}

      {(data.charts?.categoryDistribution || []).length > 0 && (
        <Card title="By category">
          <DataTable
            columns={[
              { key: '_id', label: 'Category' },
              { key: 'count', label: 'Products', align: 'right' },
              { key: 'stock', label: 'Units', align: 'right' },
              {
                key: 'value', label: 'Value', align: 'right',
                render: (r) => `₦${Number(r.value || 0).toLocaleString()}`,
              },
            ]}
            data={data.charts.categoryDistribution}
            searchable={false}
            pagination={false}
          />
        </Card>
      )}
    </div>
  );
};

// ─── Subscriptions ───
const SubscriptionsView = ({ data }) => {
  if (!data) return <EmptyState title="No subscription data" />;
  const s = data.summary || {};
  return (
    <div className="report-view">
      <StatRow items={[
        { label: 'Active', value: Number(s.activeSubscriptions || 0).toLocaleString(), tone: 'success' },
        { label: 'New', value: Number(s.newSubscriptions || 0).toLocaleString(), change: s.subscriptionsChange, tone: 'info' },
        { label: 'MRR', value: `₦${Number(s.mrr || 0).toLocaleString()}`, tone: 'primary' },
        { label: 'Churn', value: `${Number(s.churnRate || 0).toFixed(1)}%`, tone: 'danger' },
        { label: 'ARPU', value: `₦${Number(s.arpu || 0).toLocaleString()}`, tone: 'remnant' },
      ]} />

      <div className="report-grid-2">
        <Card title="By plan">
          {(data.charts?.byPlan || []).length === 0 ? (
            <EmptyState title="No plan data" />
          ) : (
            <DataTable
              columns={[
                { key: '_id', label: 'Plan' },
                { key: 'count', label: 'Subs', align: 'right' },
                {
                  key: 'revenue', label: 'Revenue', align: 'right',
                  render: (r) => `₦${Number(r.revenue || 0).toLocaleString()}`,
                },
              ]}
              data={data.charts.byPlan}
              searchable={false}
              pagination={false}
            />
          )}
        </Card>
        <Card title="By frequency">
          {(data.charts?.byFrequency || []).length === 0 ? (
            <EmptyState title="No frequency data" />
          ) : (
            <ul className="report-list">
              {data.charts.byFrequency.map((f, i) => (
                <li key={i}><span>{f._id || '—'}</span><span>{f.count}</span></li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
};

// ─── Financial ───
const FinancialView = ({ data }) => {
  if (!data) return <EmptyState title="No financial data" />;
  const s = data.summary || {};
  return (
    <div className="report-view">
      <StatRow items={[
        { label: 'Total revenue', value: `₦${Number(s.totalRevenue || 0).toLocaleString()}`, change: s.revenueChange, tone: 'primary' },
        { label: 'Total expenses', value: `₦${Number(s.totalExpenses || 0).toLocaleString()}`, tone: 'danger' },
        { label: 'Gross profit', value: `₦${Number(s.grossProfit || 0).toLocaleString()}`, tone: 'success' },
        { label: 'Profit margin', value: `${Number(s.profitMargin || 0).toFixed(1)}%`, tone: 'info' },
        { label: 'Cash flow', value: `₦${Number(s.cashFlow || 0).toLocaleString()}`, tone: 'remnant' },
        { label: 'ROI', value: `${Number(s.roi || 0).toFixed(1)}%`, tone: 'warning' },
      ]} />

      {(data.charts?.dailyRevenue || []).length > 0 && (
        <Card title="Daily revenue" subtitle="Completed orders per day">
          <DataTable
            columns={[
              { key: '_id', label: 'Date' },
              {
                key: 'revenue', label: 'Revenue', align: 'right',
                render: (r) => `₦${Number(r.revenue || 0).toLocaleString()}`,
              },
            ]}
            data={data.charts.dailyRevenue}
            searchable={false}
            pagination={false}
          />
        </Card>
      )}
    </div>
  );
};

// ─── Real-time ───
const RealtimeView = ({ data }) => {
  if (!data) return <EmptyState title="No real-time data" />;
  const m = data.metrics || data;
  return (
    <div className="report-view">
      <StatRow items={[
        { label: 'Active users', value: Number(m.activeUsers || 0).toLocaleString(), tone: 'primary' },
        { label: 'Live orders', value: Number(m.liveOrders || 0).toLocaleString(), tone: 'info' },
        { label: 'Revenue today', value: `₦${Number(m.revenueToday || 0).toLocaleString()}`, tone: 'remnant' },
        { label: 'Active subs', value: Number(m.subscriptionsActive || 0).toLocaleString(), tone: 'success' },
      ]} />

      <Card title="System">
        <div className="realtime-grid">
          <Cell label="Health" value={`${m.systemHealth ?? 0}%`} />
          <Cell label="Uptime" value={`${m.uptime ?? 0}%`} />
          <Cell label="Response" value={`${m.responseTime ?? 0}ms`} />
          <Cell label="Error rate" value={`${Number(m.errorRate || 0).toFixed(2)}%`} />
        </div>
      </Card>
    </div>
  );
};

const Cell = ({ label, value }) => (
  <div className="rep-cell">
    <div className="rep-cell__label">{label}</div>
    <div className="rep-cell__value">{value}</div>
  </div>
);

export default AdminReports;
File 10 — CSS deltas
Append to src/styles/modules/overview.css
css
/* ── Alerts panel ── */
.overview-alerts {
  background: var(--surface);
  border: 1px solid var(--border);
  border-left: 4px solid var(--color-warning);
  border-radius: var(--radius-lg);
  padding: var(--sp-4);
}
.overview-alerts__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--sp-3);
  flex-wrap: wrap;
  gap: var(--sp-2);
}
.overview-alerts__head h3 {
  margin: 0;
  font-size: var(--fs-base);
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  color: var(--text-primary);
}
.overview-alerts__head h3 svg { color: var(--color-warning); }
.overview-alerts__head span {
  font-size: var(--fs-xs);
  color: var(--text-muted);
}
.overview-alerts__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--sp-2);
}
.overview-alert {
  display: flex;
  align-items: flex-start;
  gap: var(--sp-3);
  padding: var(--sp-3);
  background: var(--surface-alt);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  border-left-width: 3px;
  cursor: pointer;
  text-align: left;
  transition: transform var(--t-fast), box-shadow var(--t-fast);
  font-family: inherit;
  color: inherit;
  width: 100%;
}
.overview-alert:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}
.overview-alert--danger  { border-left-color: var(--color-danger); }
.overview-alert--warning { border-left-color: var(--color-warning); }
.overview-alert--info    { border-left-color: var(--color-info); }
.overview-alert--success { border-left-color: var(--color-success); }
.overview-alert__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  flex-shrink: 0;
  font-size: 0.95rem;
}
.overview-alert--danger  .overview-alert__icon { background: var(--color-danger-soft);  color: var(--color-danger); }
.overview-alert--warning .overview-alert__icon { background: var(--color-warning-soft); color: var(--color-warning); }
.overview-alert--info    .overview-alert__icon { background: var(--color-info-soft);    color: var(--color-info); }
.overview-alert--success .overview-alert__icon { background: var(--color-success-soft); color: var(--color-success); }
.overview-alert__body { flex: 1; min-width: 0; }
.overview-alert__count {
  font-size: var(--fs-lg);
  font-weight: var(--fw-bold);
  line-height: 1.1;
  color: var(--text-primary);
}
.overview-alert__label {
  font-size: var(--fs-sm);
  font-weight: var(--fw-semibold);
  color: var(--text-primary);
  margin-top: 2px;
}
.overview-alert__desc {
  font-size: var(--fs-xs);
  color: var(--text-muted);
  margin-top: 2px;
  line-height: var(--lh-normal);
}
.overview-alert__arrow {
  font-size: 0.7rem;
  color: var(--text-muted);
  align-self: center;
  flex-shrink: 0;
}

/* ── Compact KPI strip ── */
.overview-kpis {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: var(--sp-2);
}
.mini-stat__top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.mini-stat__icon {
  font-size: 0.95rem;
  color: var(--text-muted);
  display: inline-flex;
}
.mini-stat__trend {
  font-size: 0.65rem;
  font-weight: var(--fw-semibold);
  padding: 1px var(--sp-1);
  border-radius: var(--radius-full);
}
.mini-stat__trend.up   { background: var(--color-success-soft); color: #065f46; }
.mini-stat__trend.down { background: var(--color-danger-soft);  color: #991b1b; }

@media (max-width: 640px) {
  .overview-kpis { grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); }
  .overview-alerts__grid { grid-template-columns: 1fr; }
}
Append to src/styles/modules/users.css
css
/* ── Compact stat strip ── */
.users-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: var(--sp-2);
}

/* ── Colourful action buttons ── */
.user-actions { display: flex; gap: var(--sp-1); flex-wrap: wrap; justify-content: flex-end; }
.user-actions .ui-btn { transition: transform var(--t-fast), box-shadow var(--t-fast); }
.user-actions .ui-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: var(--shadow-sm); }

/* ── User detail modal ── */
.user-detail { display: flex; flex-direction: column; gap: var(--sp-4); }
.user-detail__hero {
  display: flex;
  align-items: center;
  gap: var(--sp-4);
  padding: var(--sp-4);
  background: var(--surface-alt);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
}
.user-detail__avatar {
  width: 72px; height: 72px;
  border-radius: 50%;
  background: var(--egas-primary);
  color: var(--text-inverse);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: var(--fs-xl);
  font-weight: var(--fw-bold);
  flex-shrink: 0;
  overflow: hidden;
}
.user-detail__avatar img { width: 100%; height: 100%; object-fit: cover; }
.user-detail__hero-info { flex: 1; min-width: 0; }
.user-detail__hero-info h3 {
  margin: 0 0 var(--sp-2);
  font-size: var(--fs-lg);
  color: var(--text-primary);
}
.user-detail__pills {
  display: flex;
  gap: var(--sp-1);
  flex-wrap: wrap;
}
.user-detail__wallet {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.user-detail__wallet-value {
  font-size: var(--fs-2xl);
  font-weight: var(--fw-bold);
  color: var(--egas-primary);
  margin-top: var(--sp-1);
}
.user-detail__wallet-icon {
  font-size: 2rem;
  color: var(--egas-primary);
  opacity: 0.4;
}
.user-detail__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: var(--sp-3);
}
.user-detail__row {
  display: flex;
  gap: var(--sp-3);
  align-items: flex-start;
  padding: var(--sp-2);
  border-radius: var(--radius-md);
  background: var(--surface-alt);
}
.user-detail__row-icon {
  width: 28px; height: 28px;
  border-radius: var(--radius-sm);
  background: var(--egas-primary-soft);
  color: var(--egas-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  flex-shrink: 0;
}
.user-detail__row-body { flex: 1; min-width: 0; }
.user-detail__row-label {
  font-size: var(--fs-xs);
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: var(--fw-semibold);
}
.user-detail__row-value {
  font-size: var(--fs-sm);
  color: var(--text-primary);
  word-break: break-word;
}
.user-detail__link {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-1);
  color: var(--egas-primary);
  font-size: var(--fs-sm);
  text-decoration: none;
}
.user-detail__link:hover { text-decoration: underline; }

@media (max-width: 640px) {
  .user-detail__hero { flex-direction: column; text-align: center; }
  .user-detail__grid { grid-template-columns: 1fr; }
}
Append to src/styles/modules/deliveries.css
css
.deliveries-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: var(--sp-2);
}
.del-actions { display: flex; gap: var(--sp-1); flex-wrap: wrap; justify-content: flex-end; }
.del-actions .ui-btn { transition: transform var(--t-fast), box-shadow var(--t-fast); }
.del-actions .ui-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: var(--shadow-sm); }

/* ── Delivery detail modal ── */
.dd { display: flex; flex-direction: column; gap: var(--sp-4); }
.dd__status { display: inline-flex; gap: var(--sp-2); flex-wrap: wrap; }
.dd__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: var(--sp-3);
}
.dd-cell {
  padding: var(--sp-3);
  background: var(--surface-alt);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
}
.dd-cell__label {
  font-size: var(--fs-xs);
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: var(--sp-1);
}
.dd-cell__value { font-size: var(--fs-sm); color: var(--text-primary); word-break: break-word; }
.dd-cell__value.is-danger { color: var(--color-danger); font-weight: var(--fw-semibold); }
.dd-muted { font-size: var(--fs-xs); color: var(--text-muted); }

.dd-weights {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
  margin-top: var(--sp-3);
  padding-top: var(--sp-3);
  border-top: 1px solid var(--border);
}
.dd-weight {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  font-size: var(--fs-sm);
}

.dd-timeline {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}
.dd-step {
  display: flex;
  gap: var(--sp-3);
  align-items: flex-start;
  padding: var(--sp-2) var(--sp-3);
  background: var(--surface-alt);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  opacity: 0.7;
}
.dd-step--done { opacity: 1; }
.dd-step__icon {
  width: 24px; height: 24px;
  border-radius: 50%;
  background: var(--gray-100);
  color: var(--text-muted);
  display: inline-flex;
  align-items: center;
  justify-content: center;
 
