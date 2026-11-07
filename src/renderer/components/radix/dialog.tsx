import * as Dialog from '@radix-ui/react-dialog';
import { useEffect, useId, useRef, type ReactNode } from 'react';

export interface RadixDialogProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

export function RadixDialog({ open, title, onClose, children, footer }: RadixDialogProps) {
  const titleId = useId();
  const previousFocus = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    previousFocus.current ??= document.activeElement as HTMLElement | null;
  }, [open]);

  useEffect(() => {
    if (open) return;
    const target = previousFocus.current;
    previousFocus.current = null;
    if (target?.isConnected) target.focus();
  }, [open]);

  useEffect(
    () => () => {
      const target = previousFocus.current;
      previousFocus.current = null;
      if (target?.isConnected) target.focus();
    },
    [],
  );

  useEffect(() => {
    if (open) return;
    const remember = (event: Event) => {
      const target =
        event.target instanceof Element
          ? event.target.closest<HTMLElement>(
              'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
            )
          : null;
      const active =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      previousFocus.current = target ?? active;
    };
    document.addEventListener('pointerdown', remember, true);
    document.addEventListener('keydown', remember, true);
    return () => {
      document.removeEventListener('pointerdown', remember, true);
      document.removeEventListener('keydown', remember, true);
    };
  }, [open]);

  return (
    <Dialog.Root modal={false} open={open} onOpenChange={(next) => !next && onClose()}>
      <Dialog.Portal>
        <div
          className="modal-overlay"
          role="presentation"
          onPointerDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        />
        <Dialog.Content
          ref={contentRef}
          className="modal modal-content"
          aria-labelledby={titleId}
          aria-describedby={undefined}
          onKeyDown={(event) => {
            if (event.key !== 'Tab' || !contentRef.current) return;
            const focusable = Array.from(
              contentRef.current.querySelectorAll<HTMLElement>(
                'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
              ),
            );
            if (focusable.length === 0) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) {
              event.preventDefault();
              last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
              event.preventDefault();
              first.focus();
            }
          }}
        >
          <div className="modal-header">
            <Dialog.Title asChild>
              <h2 id={titleId}>{title}</h2>
            </Dialog.Title>
            <Dialog.Close asChild>
              <button type="button" className="icon-btn" aria-label="Fechar">
                ×
              </button>
            </Dialog.Close>
          </div>
          <div className="modal-body">{children}</div>
          {footer ? <div className="modal-footer">{footer}</div> : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
