// src/components/ui/FormField.jsx
import React from 'react';

/**
 * FormField — label + input/select/textarea + error + help text.
 *
 * Usage:
 *   <FormField label="Email" name="email" type="email" required
 *              value={email} onChange={handleChange} error={errors.email} />
 *
 *   <FormField label="Category" name="category" as="select" value={cat}
 *              onChange={handleChange}>
 *     <option value="gas">Gas</option>
 *     <option value="accessory">Accessory</option>
 *   </FormField>
 */
const FormField = React.forwardRef(({
  label,
  name,
  type = 'text',
  as = 'input',
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  disabled = false,
  readOnly = false,
  error,
  help,
  rows,
  min,
  max,
  step,
  maxLength,
  autoComplete,
  children, // for `as="select"`
  leftIcon,
  rightSlot,
  className = '',
  ...rest
}, ref) => {
  const id = `field-${name}`;
  const FieldTag = as === 'textarea' ? 'textarea' : as === 'select' ? 'select' : 'input';
  const hasError = Boolean(error);

  return (
    <div className={`ui-field ${hasError ? 'ui-field--error' : ''} ${className}`}>
      {label && (
        <label htmlFor={id} className="ui-field__label">
          {label}
          {required && <span className="ui-field__required" aria-hidden>*</span>}
        </label>
      )}

      <div className={`ui-field__control ${leftIcon ? 'ui-field__control--with-icon' : ''}`}>
        {leftIcon && <span className="ui-field__icon">{leftIcon}</span>}
        <FieldTag
          ref={ref}
          id={id}
          name={name}
          type={FieldTag === 'input' ? type : undefined}
          value={value ?? ''}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          rows={FieldTag === 'textarea' ? rows ?? 3 : undefined}
          min={min}
          max={max}
          step={step}
          maxLength={maxLength}
          autoComplete={autoComplete}
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? `${id}-error` : help ? `${id}-help` : undefined}
          {...rest}
        >
          {children}
        </FieldTag>
        {rightSlot && <span className="ui-field__right">{rightSlot}</span>}
      </div>

      {hasError && (
        <p id={`${id}-error`} className="ui-field__error">{error}</p>
      )}
      {!hasError && help && (
        <p id={`${id}-help`} className="ui-field__help">{help}</p>
      )}
    </div>
  );
});

FormField.displayName = 'FormField';
export default FormField;