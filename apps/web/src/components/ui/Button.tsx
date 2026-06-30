import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  children: ReactNode;
};

export function Button({ className = "", variant = "primary", type = "button", children, ...props }: ButtonProps) {
  return (
    <button className={`button button-${variant} ${className}`} type={type} {...props}>
      {children}
    </button>
  );
}
