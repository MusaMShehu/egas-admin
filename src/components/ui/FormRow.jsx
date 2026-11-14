// src/components/ui/FormRow.jsx
import React from 'react';

/**
 * FormRow — grid wrapper for FormField children.
 *
 * Props:
 *   cols     — 1 | 2 (default) | 3 | 4
 *   gap      — 'sm' | 'md' (default) | 'lg'   (overrides default spacing)
 *   children — FormField elements (or any content)
 *
 * Responsive behavior:
 *   ≤640px  →  always 1 column
 *   ≤1024px →  max 2 columns
 *   >1024px →  as specified by `cols`
 *
 * Usage:
 *   <FormRow cols={2}>
 *     <FormField label="First name" name="firstName" ... />
 *     <FormField label="Last name"  name="lastName"  ... />
 *   </FormRow>
 *
 *   <FormRow cols={1}>
 *     <FormField label="Notes" name="notes" as="textarea" rows={3} />
 *   </FormRow>
 */
const FormRow = ({
  children,
  cols = 2,
  gap = 'md',
  className = '',
  ...rest
}) => {
  const safeCols = [1, 2, 3, 4].includes(cols) ? cols : 2;

  const classes = [
    'ui-form-row',
    `ui-form-row--cols-${safeCols}`,
    `ui-form-row--gap-${gap}`,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
};

export default FormRow;