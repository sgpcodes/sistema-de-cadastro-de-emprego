import { ReactNode } from 'react';
import { X } from 'lucide-react';
import Button from './Button';

interface ModalProps {
  children: ReactNode;
  isOpen: boolean;
  title: string;
  onClose: () => void;
  actions?: ReactNode;
}

export default function Modal({ children, isOpen, title, onClose, actions }: ModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <header>
          <h2 id="modal-title">{title}</h2>
          <Button type="button" variant="ghost" onClick={onClose} aria-label="Fechar modal">
            <X size={18} />
          </Button>
        </header>
        <div className="modal-body">{children}</div>
        {actions && <footer>{actions}</footer>}
      </section>
    </div>
  );
}
