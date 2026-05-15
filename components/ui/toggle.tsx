import type { InputHTMLAttributes } from 'react';

type ToggleProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: string;
};

export function Toggle({ label, ...props }: ToggleProps) {
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#344054' }}>
      <input type="checkbox" {...props} />
      <span>{label}</span>
    </label>
  );
}
