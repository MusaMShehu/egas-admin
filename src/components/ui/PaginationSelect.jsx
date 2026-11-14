// src/components/ui/PaginationSelect.jsx
import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

/**
 * PaginationSelect — windowed page selector.
 *
 * Renders up to `windowSize` (default 5) page buttons centred on the current page,
 * plus prev/next chevrons. Supports jump-to-page via a small input when
 * `showJump` is true and totalPages > windowSize.
 *
 * Props:
 *   page, totalPages, onChange(page), windowSize = 5, showJump = true, disabled = false
 */
const PaginationSelect = ({
  page = 1,
  totalPages = 1,
  onChange,
  windowSize = 5,
  showJump = true,
  disabled = false,
}) => {
  if (!totalPages || totalPages <= 1) return null;

  const half = Math.floor(windowSize / 2);
  let start = Math.max(1, page - half);
  let end = start + windowSize - 1;
  if (end > totalPages) {
    end = totalPages;
    start = Math.max(1, end - windowSize + 1);
  }
  const pages = [];
  for (let i = start; i <= end; i++) pages.push(i);

  const go = (p) => {
    if (disabled) return;
    const clamped = Math.min(Math.max(1, p), totalPages);
    if (clamped !== page) onChange?.(clamped);
  };

  return (
    <div className="ui-pgs">
      <button
        type="button"
        className="ui-pgs__btn"
        onClick={() => go(page - 1)}
        disabled={disabled || page <= 1}
        aria-label="Previous page"
      >
        <FaChevronLeft />
      </button>

      {pages[0] > 1 && (
        <>
          <button type="button" className="ui-pgs__btn" onClick={() => go(1)} disabled={disabled}>1</button>
          {pages[0] > 2 && <span className="ui-pgs__ellipsis">…</span>}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          className={`ui-pgs__btn ${p === page ? 'ui-pgs__btn--active' : ''}`}
          onClick={() => go(p)}
          disabled={disabled}
          aria-current={p === page ? 'page' : undefined}
        >
          {p}
        </button>
      ))}

      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && <span className="ui-pgs__ellipsis">…</span>}
          <button
            type="button"
            className="ui-pgs__btn"
            onClick={() => go(totalPages)}
            disabled={disabled}
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        type="button"
        className="ui-pgs__btn"
        onClick={() => go(page + 1)}
        disabled={disabled || page >= totalPages}
        aria-label="Next page"
      >
        <FaChevronRight />
      </button>

      {showJump && totalPages > windowSize && (
        <form
          className="ui-pgs__jump"
          onSubmit={(e) => {
            e.preventDefault();
            const n = Number(e.target.elements.pg.value);
            if (Number.isFinite(n)) go(n);
          }}
        >
          <label>
            Go to
            <input
              name="pg"
              type="number"
              min="1"
              max={totalPages}
              placeholder={String(page)}
              disabled={disabled}
            />
          </label>
        </form>
      )}
    </div>
  );
};

export default PaginationSelect;