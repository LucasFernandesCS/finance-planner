import type { TextareaHTMLAttributes } from "react";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
};

export function Textarea({ className = "", id, label, ...props }: TextareaProps) {
  const inputId = id ?? props.name ?? label;

  return (
    <label className={`field ${className}`} htmlFor={inputId}>
      <span>{label}</span>
      <textarea id={inputId} {...props} />
    </label>
  );
}
