import type { SelectHTMLAttributes } from "react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: Array<{ label: string; value: string }>;
};

export function Select({ className = "", id, label, options, ...props }: SelectProps) {
  const inputId = id ?? props.name ?? label;

  return (
    <label className={`field ${className}`} htmlFor={inputId}>
      <span>{label}</span>
      <select id={inputId} {...props}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
