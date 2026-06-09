import { InputHTMLAttributes, SelectHTMLAttributes } from 'react';

interface BaseFieldProps {
  label: string;
  error?: string;
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement>, BaseFieldProps {}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement>, BaseFieldProps {
  options: Array<{ label: string; value: string }>;
}

export function Input({ label, error, id, className = '', ...props }: InputProps) {
  const fieldId = id || props.name || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <label className="field" htmlFor={fieldId}>
      <span>{label}</span>
      <input
        id={fieldId}
        className={`${error ? 'field-error' : ''} ${className}`.trim()}
        aria-invalid={!!error}
        {...props}
      />
      {error && <small>{error}</small>}
    </label>
  );
}

export function Select({ label, error, id, options, className = '', ...props }: SelectProps) {
  const fieldId = id || props.name || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <label className="field" htmlFor={fieldId}>
      <span>{label}</span>
      <select
        id={fieldId}
        className={`${error ? 'field-error' : ''} ${className}`.trim()}
        aria-invalid={!!error}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <small>{error}</small>}
    </label>
  );
}
