import type { InputHTMLAttributes } from 'react';

type ToggleProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: string;
};

export function Toggle({ label, ...props }: ToggleProps) {
  return (
    <label className="toggle">
      <input type="checkbox" {...props} />
      <span>{label}</span>
    </label>
  );
}
