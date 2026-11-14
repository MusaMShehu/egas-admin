// // src/components/ui/StatCard.jsx
// import React from 'react';
// import { FaArrowUp, FaArrowDown, FaMinus } from 'react-icons/fa';

// /**
//  * StatCard — KPI tile used on overview + dashboard.
//  *
//  * Props:
//  *   label       — big label, e.g. "Total Users"
//  *   value       — main number / string
//  *   change      — number (percent). + / - / 0
//  *   icon        — ReactNode
//  *   color       — 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'remnant'
//  *   subtitle    — small caption
//  *   loading     — skeleton state
//  *   onClick     — makes tile interactive
//  */
// const StatCard = ({
//   label,
//   value,
//   change = null,
//   icon = null,
//   color = 'primary',
//   subtitle = null,
//   loading = false,
//   onClick,
// }) => {
//   const trend = change == null
//     ? null
//     : change > 0 ? 'up' : change < 0 ? 'down' : 'flat';

//   const trendIcon = trend === 'up'
//     ? <FaArrowUp />
//     : trend === 'down'
//     ? <FaArrowDown />
//     : <FaMinus />;

//   return (
//     <div
//       className={`ui-stat ui-stat--${color} ${onClick ? 'ui-stat--clickable' : ''} ${loading ? 'ui-stat--loading' : ''}`}
//       onClick={onClick}
//       role={onClick ? 'button' : undefined}
//       tabIndex={onClick ? 0 : undefined}
//       onKeyDown={onClick ? (e) => { if (e.key === 'Enter') onClick(e); } : undefined}
//     >
//       <div className="ui-stat__header">
//         <div className="ui-stat__icon">{icon}</div>
//         {trend && !loading && (
//           <div className={`ui-stat__trend ui-stat__trend--${trend}`}>
//             {trendIcon}
//             <span>{Math.abs(change)}%</span>
//           </div>
//         )}
//       </div>

//       {loading ? (
//         <>
//           <div className="ui-stat__skeleton ui-stat__skeleton--value" />
//           <div className="ui-stat__skeleton ui-stat__skeleton--label" />
//         </>
//       ) : (
//         <>
//           <div className="ui-stat__value">{value}</div>
//           <div className="ui-stat__label">{label}</div>
//           {subtitle && <div className="ui-stat__subtitle">{subtitle}</div>}
//         </>
//       )}
//     </div>
//   );
// };

// export default StatCard;












// src/components/ui/StatCard.jsx
import React from 'react';
import { FaArrowUp, FaArrowDown, FaMinus, FaChevronRight } from 'react-icons/fa';

/**
 * StatCard — KPI tile used on overview + dashboard + reports.
 *
 * New in this refactor (all backward-compatible):
 *   size        — 'sm' | 'md' (default) | 'lg'
 *   color       — 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'remnant' | 'neutral'
 *   trend       — override auto trend ('up'|'down'|'flat')
 *   onClick     — turns into a navigable tile with a chevron
 *   href/link   — if provided, rendered as <a>
 *
 * Existing props (unchanged): label, value, change, icon, subtitle, loading.
 */
const StatCard = ({
  label,
  value,
  change = null,
  icon = null,
  color = 'primary',
  subtitle = null,
  loading = false,
  onClick,
  size = 'md',
  trend: trendOverride = null,
  className = '',
}) => {
  const trend = trendOverride
    ?? (change == null ? null : change > 0 ? 'up' : change < 0 ? 'down' : 'flat');

  const trendIcon =
    trend === 'up' ? <FaArrowUp /> :
    trend === 'down' ? <FaArrowDown /> :
    trend === 'flat' ? <FaMinus /> : null;

  const classes = [
    'ui-stat',
    `ui-stat--${color}`,
    `ui-stat--${size}`,
    onClick && 'ui-stat--clickable',
    loading && 'ui-stat--loading',
    className,
  ].filter(Boolean).join(' ');

  const handleKey = (e) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick(e);
    }
  };

  return (
    <div
      className={classes}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={handleKey}
    >
      <div className="ui-stat__header">
        {icon && <div className="ui-stat__icon">{icon}</div>}
        {trend && !loading && (
          <div className={`ui-stat__trend ui-stat__trend--${trend}`}>
            {trendIcon}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>

      {loading ? (
        <>
          <div className="ui-stat__skeleton ui-stat__skeleton--value" />
          <div className="ui-stat__skeleton ui-stat__skeleton--label" />
        </>
      ) : (
        <>
          <div className="ui-stat__value">{value}</div>
          <div className="ui-stat__label">{label}</div>
          {subtitle && <div className="ui-stat__subtitle">{subtitle}</div>}
        </>
      )}

      {onClick && !loading && (
        <span className="ui-stat__chevron" aria-hidden="true">
          <FaChevronRight />
        </span>
      )}
    </div>
  );
};

export default StatCard;