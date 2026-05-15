import type { SelectHTMLAttributes } from 'react';

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: Array<{ label: string; value: string }>;
};

export function Select({ label, options, style, ...props }: SelectProps) {
  return (
    <label style={{ display: 'grid', gap: 6, fontSize: 13, color: '#344054' }}>
      <span>{label}</span>
      <select
        style={{
          minHeight: 36,
          border: '1px solid #c8d0dc',
          borderRadius: 6,
          padding: '0 10px',
          fontSize: 14,
          background: '#ffffff',
          ...style,
        }}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
