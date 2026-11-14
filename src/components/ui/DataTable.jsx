// src/components/ui/DataTable.jsx
import React, { useMemo, useState } from 'react';
import { FaChevronLeft, FaChevronRight, FaSearch, FaTimes } from 'react-icons/fa';

/**
 * DataTable — the one table primitive.
 *
 * columns: [
 *   { key: 'name', label: 'Name', sortable: true, render: (row) => <b>{row.name}</b> },
 *   { key: 'email', label: 'Email', mobileHide: false },
 * ]
 *
 * Props:
 *   columns          — column definitions
 *   data             — array of rows
 *   loading          — bool
 *   emptyState       — ReactNode to show when data is empty
 *   searchable       — default true
 *   pagination       — false to disable; or { page, pageSize, total, onChange }
 *   sortable         — default true
 *   selectable       — adds checkbox column
 *   selectedIds      — Set of selected ids (row.id)
 *   onSelectionChange— (newIds: Array) => void
 *   rowKey           — (row) => id (defaults to row.id || row._id)
 *   onRowClick       — (row) => void
 *   mobileView       — 'cards' (default) | 'table'
 */
const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  emptyState = null,
  searchable = true,
  pagination = false,
  sortable = true,
  selectable = false,
  selectedIds,
  onSelectionChange,
  rowKey = (row) => row?.id ?? row?._id,
  onRowClick,
  mobileView = 'cards',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [page, setPage] = useState(1);
  const pageSize = pagination?.pageSize ?? 20;

  // ─── Filter + sort
  const processed = useMemo(() => {
    let rows = data;

    if (searchable && searchTerm.trim()) {
      const needle = searchTerm.trim().toLowerCase();
      rows = rows.filter((row) =>
        columns.some((col) => {
          const v = row?.[col.key];
          return v != null && String(v).toLowerCase().includes(needle);
        })
      );
    }

    if (sortable && sortConfig.key) {
      rows = [...rows].sort((a, b) => {
        const av = a?.[sortConfig.key];
        const bv = b?.[sortConfig.key];
        if (av == null) return 1;
        if (bv == null) return -1;
        if (typeof av === 'number' && typeof bv === 'number') {
          return sortConfig.direction === 'asc' ? av - bv : bv - av;
        }
        const as = String(av).toLowerCase();
        const bs = String(bv).toLowerCase();
        if (as < bs) return sortConfig.direction === 'asc' ? -1 : 1;
        if (as > bs) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return rows;
  }, [data, columns, searchTerm, searchable, sortable, sortConfig]);

  // ─── Pagination
  const total = processed.length;
  const totalPages = pagination
    ? (pagination.total && pagination.total !== total
        ? Math.ceil(pagination.total / pageSize)
        : Math.ceil(total / pageSize))
    : 1;
  const safePage = pagination ? (pagination.page ?? page) : 1;
  const paginated = pagination
    ? (pagination.total && pagination.total !== total ? processed : processed.slice((safePage - 1) * pageSize, safePage * pageSize))
    : processed;

  const changePage = (next) => {
    if (pagination?.onChange) pagination.onChange(next);
    else setPage(next);
  };

  const toggleSort = (key) => {
    if (!sortable) return;
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  // ─── Selection
  const handleSelectAll = (checked) => {
    if (!onSelectionChange) return;
    if (checked) {
      onSelectionChange(paginated.map(rowKey));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectRow = (id, checked) => {
    if (!onSelectionChange) return;
    const set = new Set(selectedIds || []);
    if (checked) set.add(id); else set.delete(id);
    onSelectionChange(Array.from(set));
  };

  const allSelected = paginated.length > 0 &&
    paginated.every((row) => selectedIds?.has?.(rowKey(row)));

  const someSelected = (selectedIds?.size || 0) > 0 && !allSelected;

  // ─── Render
  return (
    <div className="ui-table-wrapper">
      {searchable && (
        <div className="ui-table__toolbar">
          <div className="ui-table__search">
            <FaSearch className="ui-table__search-icon" />
            <input
              type="text"
              placeholder="Search…"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            />
            {searchTerm && (
              <button
                type="button"
                className="ui-table__search-clear"
                onClick={() => setSearchTerm('')}
                aria-label="Clear search"
              >
                <FaTimes />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Desktop table */}
      <div className={`ui-table-container ui-table-container--${mobileView}`}>
        <table className="ui-table">
          <thead>
            <tr>
              {selectable && (
                <th className="ui-table__select-col">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => { if (el) el.indeterminate = someSelected; }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    aria-label="Select all"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`${sortable && col.sortable !== false ? 'ui-table__th--sortable' : ''} ${col.align === 'right' ? 'ui-table__th--right' : ''}`}
                  onClick={() => sortable && col.sortable !== false && toggleSort(col.key)}
                >
                  <span>{col.label}</span>
                  {sortable && col.sortable !== false && sortConfig.key === col.key && (
                    <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'} ui-table__sort-icon`} />
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="ui-table__state">
                  <div className="ui-table__state-inner">
                    <i className="fas fa-spinner fa-spin" />
                    <span>Loading…</span>
                  </div>
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="ui-table__state">
                  <div className="ui-table__state-inner">
                    {emptyState || (
                      <>
                        <i className="fas fa-inbox" />
                        <span>No records found</span>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              paginated.map((row) => {
                const id = rowKey(row);
                const isSelected = selectedIds?.has?.(id);
                return (
                  <tr
                    key={id}
                    className={`${isSelected ? 'ui-table__row--selected' : ''} ${onRowClick ? 'ui-table__row--clickable' : ''}`}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                  >
                    {selectable && (
                      <td className="ui-table__select-col" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={!!isSelected}
                          onChange={(e) => handleSelectRow(id, e.target.checked)}
                          aria-label="Select row"
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={col.align === 'right' ? 'ui-table__td--right' : ''}
                        data-label={col.label}
                      >
                        {col.render ? col.render(row) : row?.[col.key] ?? '—'}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {(pagination || !searchable) && (
        <div className="ui-table__footer">
          <div className="ui-table__info">
            {total > 0
              ? `Showing ${(safePage - 1) * pageSize + 1}–${Math.min(safePage * pageSize, pagination?.total ?? total)} of ${pagination?.total ?? total}`
              : 'No records'}
          </div>
          {pagination && totalPages > 1 && (
            <div className="ui-table__pagination">
              <button
                type="button"
                className="ui-pagination-btn"
                onClick={() => changePage(safePage - 1)}
                disabled={safePage <= 1}
                aria-label="Previous page"
              >
                <FaChevronLeft />
              </button>
              <span className="ui-pagination__label">
                Page {safePage} of {totalPages}
              </span>
              <button
                type="button"
                className="ui-pagination-btn"
                onClick={() => changePage(safePage + 1)}
                disabled={safePage >= totalPages}
                aria-label="Next page"
              >
                <FaChevronRight />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DataTable;