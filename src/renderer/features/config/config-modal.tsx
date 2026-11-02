import type { ConfigView } from '@shared/contracts';
import { Button, Input, Modal } from '../../components';
import { ptBR } from '../../i18n/pt-BR';
import { PatHelp } from './pat-help';
import { useConfigForm } from './use-config-form';

interface ConfigModalProps {
  open: boolean;
  config: ConfigView | null;
  onClose: () => void;
  onSaved: () => void;
}

export function ConfigModal({ open, config, onClose, onSaved }: ConfigModalProps) {
  const form = useConfigForm(config, onSaved);

  return (
    <Modal
      open={open}
      title={ptBR.config.title}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={form.saving}>
            Cancelar
          </Button>
          <Button type="submit" form="config-form" disabled={form.saving}>
            {form.saving ? ptBR.config.saving : ptBR.config.save}
          </Button>
        </>
      }
    >
      <form id="config-form" onSubmit={form.handleSubmit} aria-busy={form.saving} noValidate>
        {form.error ? (
          <p className="error" role="alert">
            {form.error}
          </p>
        ) : null}
        <Input
          label={ptBR.config.organization}
          name="organization"
          placeholder={ptBR.config.organizationPlaceholder}
          value={form.organization}
          onChange={(event) => form.setOrganization(event.target.value)}
          autoComplete="off"
          disabled={form.saving}
          required
        />
        <Input
          label={ptBR.config.pat}
          name="pat"
          type="password"
          placeholder={ptBR.config.patPlaceholder}
          value={form.pat}
          onChange={(event) => form.setPat(event.target.value)}
          autoComplete="off"
          spellCheck={false}
          disabled={form.saving}
          required
        />
        <PatHelp />
      </form>
    </Modal>
  );
}
