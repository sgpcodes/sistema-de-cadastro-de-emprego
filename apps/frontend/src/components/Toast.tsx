import { CheckCircle2, Info, XCircle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
}

const icons = {
  success: <CheckCircle2 size={18} />,
  error: <XCircle size={18} />,
  info: <Info size={18} />
};

export default function Toast({ message, type = 'info' }: ToastProps) {
  return (
    <div className={`toast toast-${type}`} role="status" aria-live="polite">
      {icons[type]}
      <span>{message}</span>
    </div>
  );
}
