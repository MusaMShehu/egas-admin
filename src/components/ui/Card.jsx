// src/components/ui/Card.jsx
import React from 'react';

/**
 * Card — container primitive.
 *
 * Props:
 *   title       — header title
 *   subtitle    — header subtitle
 *   actions     — ReactNode rendered on the right of the header
 *   padding     — 'none' | 'sm' | 'md' (default) | 'lg'
 *   elevated    — adds stronger shadow
 *   clickable   — adds hover + focus affordance
 *   onClick     — if provided with clickable, makes the whole card interactive
 */
const Card = ({
  children,
  title,
  subtitle,
  actions,
  padding = 'md',
  elevated = false,
  clickable = false,
  onClick,
  className = '',
  style,
  ...rest
}) => {
  const hasHeader = title || subtitle || actions;

  const classes = [
    'ui-card',
    `ui-card--pad-${padding}`,
    elevated && 'ui-card--elevated',
    clickable && 'ui-card--clickable',
    className,
  ].filter(Boolean).join(' ');

  const handleKeyDown = (e) => {
    if (clickable && onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick(e);
    }
  };

  return (
    <div
      className={classes}
      onClick={clickable ? onClick : undefined}
      onKeyDown={handleKeyDown}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      style={style}
      {...rest}
    >
      {hasHeader && (
        <div className="ui-card__header">
          <div className="ui-card__header-text">
            {title && <h3 className="ui-card__title">{title}</h3>}
            {subtitle && <p className="ui-card__subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="ui-card__actions">{actions}</div>}
        </div>
      )}
      <div className="ui-card__body">{children}</div>
    </div>
  );
};

export default Card;