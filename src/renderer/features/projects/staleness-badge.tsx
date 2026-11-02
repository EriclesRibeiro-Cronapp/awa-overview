import { ptBR } from '../../i18n/pt-BR';

export function StalenessBadge({ stale }: { stale: boolean }) {
  if (!stale) return null;
  return (
    <span className="badge-stale" role="status">
      {ptBR.projects.stale}
    </span>
  );
}
