import { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  icon?: ReactNode;
  variant?: ButtonVariant;
}

export default function Button({
  children,
  icon,
  variant = 'primary',
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button className={`btn btn-${variant} ${className}`.trim()} {...props}>
      {icon}
      <span>{children}</span>
    </button>
  );
}
