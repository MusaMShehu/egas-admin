// src/components/ui/Badge.jsx
import React from 'react';

/**
 * Badge — status/label chip.
 *
 * Variants:
 *   success | warning | danger | info | neutral | primary | remnant | partial
 *
 * Sizes: sm | md
 */
const Badge = ({
  children,
  variant = 'neutral',
  size = 'md',
  icon = null,
  dot = false,
  className = '',
  ...rest
}) => (
  <span
    className={`ui-badge ui-badge--${variant} ui-badge--${size} ${className}`}
    {...rest}
  >
    {dot && <span className="ui-badge__dot" />}
    {icon && <span className="ui-badge__icon">{icon}</span>}
    {children}
  </span>
);

export default Badge;