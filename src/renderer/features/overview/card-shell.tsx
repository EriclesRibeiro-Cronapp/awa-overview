import type { ReactNode } from 'react';
import { Icon } from '../../components';
import { RadixScrollArea } from '../../components/radix/scroll-area';
import { RadixSeparator } from '../../components/radix/separator';
import { ptBR } from '../../i18n/pt-BR';

interface CardShellProps {
  id: string;
  title: string;
  icon: string;
  children: ReactNode;
}

export function CardShell({ id, title, icon, children }: CardShellProps) {
  return (
    <section className="overview-card" aria-labelledby={`overview-card-${id}`}>
      <header className="card-header">
        <Icon name={icon} size={24} />
        <h2 id={`overview-card-${id}`} className="card-title">
          {title}
        </h2>
        <Icon name="spam-line" size={16} label={ptBR.overview.info} />
      </header>
      <RadixSeparator className="card-divider" />
      <RadixScrollArea className="card-body">{children}</RadixScrollArea>
    </section>
  );
}

export function CardMessage({ children, role }: { children: ReactNode; role?: 'status' | 'alert' }) {
  return (
    <p className={role === 'alert' ? 'error-text' : 'muted'} role={role}>
      {children}
    </p>
  );
}
