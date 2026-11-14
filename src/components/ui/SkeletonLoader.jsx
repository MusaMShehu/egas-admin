// src/components/ui/SkeletonLoader.jsx
import React from 'react';

/**
 * SkeletonLoader — pulse placeholders.
 *
 * Usage:
 *   <SkeletonLoader lines={3} />
 *   <SkeletonLoader type="card" />
 *   <SkeletonLoader type="table" rows={5} columns={4} />
 */
const SkeletonLoader = ({ type = 'lines', lines = 3, rows = 5, columns = 4, width = '100%', height = 16 }) => {
  if (type === 'card') {
    return <div className="ui-skeleton ui-skeleton--card" style={{ width, height: 120 }} />;
  }
  if (type === 'avatar') {
    return <div className="ui-skeleton ui-skeleton--avatar" style={{ width: 40, height: 40 }} />;
  }
  if (type === 'table') {
    return (
      <div className="ui-skeleton-table">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="ui-skeleton-table__row">
            {Array.from({ length: columns }).map((__, c) => (
              <div key={c} className="ui-skeleton ui-skeleton--cell" />
            ))}
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="ui-skeleton-lines">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="ui-skeleton"
          style={{ width: i === lines - 1 ? '60%' : '100%', height }}
        />
      ))}
    </div>
  );
};

export default SkeletonLoader;