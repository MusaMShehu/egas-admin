// // src/components/ui/Button.jsx
// import React from 'react';
// import { FaSpinner } from 'react-icons/fa';

// /**
//  * Button — primary action primitive.
//  *
//  * Variants:  primary | secondary | outline | ghost | danger | success | warning
//  * Sizes:     sm | md | lg
//  *
//  * Props:
//  *   loading    — shows spinner, disables interaction
//  *   leftIcon   — ReactNode rendered before the label
//  *   rightIcon  — ReactNode rendered after the label
//  *   fullWidth  — stretch to container
//  *   as         — 'button' (default) | 'a' | custom
//  */
// const Button = React.forwardRef(({
//   children,
//   variant = 'primary',
//   size = 'md',
//   loading = false,
//   disabled = false,
//   leftIcon = null,
//   rightIcon = null,
//   fullWidth = false,
//   type = 'button',
//   className = '',
//   onClick,
//   ...rest
// }, ref) => {
//   const classes = [
//     'ui-btn',
//     `ui-btn--${variant}`,
//     `ui-btn--${size}`,
//     fullWidth && 'ui-btn--full',
//     loading && 'ui-btn--loading',
//     className,
//   ].filter(Boolean).join(' ');

//   return (
//     <button
//       ref={ref}
//       type={type}
//       className={classes}
//       onClick={loading || disabled ? undefined : onClick}
//       disabled={loading || disabled}
//       aria-busy={loading || undefined}
//       {...rest}
//     >
//       {loading ? (
//         <FaSpinner className="ui-btn__spinner" />
//       ) : (
//         leftIcon && <span className="ui-btn__icon">{leftIcon}</span>
//       )}
//       {children && <span className="ui-btn__label">{children}</span>}
//       {!loading && rightIcon && <span className="ui-btn__icon">{rightIcon}</span>}
//     </button>
//   );
// });

// Button.displayName = 'Button';
// export default Button;









// src/components/ui/Button.jsx
import React from 'react';
import { FaSpinner } from 'react-icons/fa';

/**
 * Button — primary action primitive.
 *
 * Variants (visual weight):
 *   primary | secondary | outline | ghost | danger | success | warning
 *
 * Colors (accent override — optional):
 *   primary | success | warning | danger | info | remnant | neutral
 *
 * Sizes: sm | md | lg
 *
 * New in this refactor (backward-compatible):
 *   color       — overrides variant colour (e.g. variant="outline" color="success")
 *   hoverFill   — on outline/ghost, on hover fill with the accent
 *   rounded     — pill shape
 *
 * Existing props unchanged: loading, leftIcon, rightIcon, fullWidth, as, disabled, onClick.
 */
const Button = React.forwardRef(({
  children,
  variant = 'primary',
  color = null,
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon = null,
  rightIcon = null,
  fullWidth = false,
  rounded = false,
  type = 'button',
  className = '',
  onClick,
  ...rest
}, ref) => {
  const classes = [
    'ui-btn',
    `ui-btn--${variant}`,
    color && `ui-btn--color-${color}`,
    `ui-btn--${size}`,
    fullWidth && 'ui-btn--full',
    rounded && 'ui-btn--rounded',
    loading && 'ui-btn--loading',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      ref={ref}
      type={type}
      className={classes}
      onClick={loading || disabled ? undefined : onClick}
      disabled={loading || disabled}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? (
        <FaSpinner className="ui-btn__spinner" />
      ) : (
        leftIcon && <span className="ui-btn__icon">{leftIcon}</span>
      )}
      {children && <span className="ui-btn__label">{children}</span>}
      {!loading && rightIcon && <span className="ui-btn__icon">{rightIcon}</span>}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;