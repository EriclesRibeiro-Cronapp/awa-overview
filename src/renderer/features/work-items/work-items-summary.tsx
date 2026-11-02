import type { WorkItemsSummary as Summary } from '@shared/contracts';
import { ptBR } from '../../i18n/pt-BR';

const numberFormatter = new Intl.NumberFormat('pt-BR');

export function WorkItemsSummary({ summary }: { summary: Summary }) {
  return (
    <section className="work-items-summary" aria-label={ptBR.workItems.title}>
      <SummaryItem label={ptBR.workItems.summaryTotal} value={summary.total} />
      <SummaryItem label={ptBR.workItems.summaryBacklog} value={summary.backlog} />
      <SummaryItem label={ptBR.workItems.summaryInProgress} value={summary.inProgress} />
      <SummaryItem label={ptBR.workItems.summaryDone} value={summary.done} />
    </section>
  );
}

function SummaryItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="work-items-summary-item">
      <span className="work-items-summary-label">{label}</span>
      <span className="work-items-summary-value">{numberFormatter.format(value)}</span>
    </div>
  );
}
