import { Button } from '../../components';
import { ptBR } from '../../i18n/pt-BR';

export function FirstRun({ onConfigure }: { onConfigure: () => void }) {
  return (
    <section className="status-card">
      <h2>{ptBR.config.requiredTitle}</h2>
      <p>{ptBR.config.requiredBody}</p>
      <Button onClick={onConfigure}>{ptBR.config.save}</Button>
    </section>
  );
}
