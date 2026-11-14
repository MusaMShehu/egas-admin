// src/components/ui/FilterBar.jsx
import React from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';

/**
 * FilterBar — declarative filter row.
 *
 * Usage:
 *   <FilterBar
 *     value={{ search, status, startDate, endDate }}
 *     onChange={(patch) => setState(s => ({ ...s, ...patch }))}
 *     filters={[
 *       { key: 'search', type: 'search', placeholder: 'Search…', grow: true },
 *       { key: 'status', type: 'select', label: 'Status',
 *         options: [{ value: 'all', label: 'All' }, …] },
 *       { key: 'startDate', type: 'date', label: 'From' },
 *       { key: 'endDate',   type: 'date', label: 'To' },
 *     ]}
 *     extra={<>…optional right-side actions…</>}
 *   />
 *
 * filter spec:
 *   key        — string
 *   type       — 'search' | 'select' | 'date' | 'number' | 'custom'
 *   label      — optional label above the control
 *   placeholder— for search/number
 *   options    — for select (array of { value, label })
 *   render     — for type: 'custom', function receiving (value, onChange)
 *   grow       — takes remaining horizontal space
 *   minWidth   — optional number (default 160)
 */
const FilterBar = ({
  value = {},
  onChange,
  filters = [],
  extra = null,
  className = '',
}) => {
  const set = (key, v) => onChange?.({ [key]: v });

  return (
    <div className={`ui-filter-bar ${className}`}>
      <div className="ui-filter-bar__fields">
        {filters.map((f) => {
          const v = value[f.key] ?? '';
          const style = {
            flex: f.grow ? 1 : undefined,
            minWidth: f.grow ? 220 : f.minWidth ?? 160,
          };

          if (f.type === 'custom') {
            return (
              <div key={f.key} className="ui-filter-bar__group" style={style}>
                {f.label && <label className="ui-filter-bar__label">{f.label}</label>}
                {f.render?.(v, (next) => set(f.key, next))}
              </div>
            );
          }

          if (f.type === 'search') {
            return (
              <div key={f.key} className="ui-filter-bar__group" style={style}>
                {f.label && <label className="ui-filter-bar__label">{f.label}</label>}
                <div className="ui-filter-bar__search">
                  <FaSearch className="ui-filter-bar__search-icon" />
                  <input
                    type="text"
                    placeholder={f.placeholder || 'Search…'}
                    value={v}
                    onChange={(e) => set(f.key, e.target.value)}
                  />
                  {v && (
                    <button
                      type="button"
                      className="ui-filter-bar__clear"
                      onClick={() => set(f.key, '')}
                      aria-label="Clear"
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>
              </div>
            );
          }

          if (f.type === 'select') {
            return (
              <div key={f.key} className="ui-filter-bar__group" style={style}>
                {f.label && <label className="ui-filter-bar__label">{f.label}</label>}
                <select value={v} onChange={(e) => set(f.key, e.target.value)}>
                  {f.options.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            );
          }

          // date | number | text (fallback)
          return (
            <div key={f.key} className="ui-filter-bar__group" style={style}>
              {f.label && <label className="ui-filter-bar__label">{f.label}</label>}
              <input
                type={f.type}
                placeholder={f.placeholder}
                value={v}
                onChange={(e) => set(f.key, e.target.value)}
              />
            </div>
          );
        })}
      </div>
      {extra && <div className="ui-filter-bar__extra">{extra}</div>}
    </div>
  );
};

export default FilterBar;