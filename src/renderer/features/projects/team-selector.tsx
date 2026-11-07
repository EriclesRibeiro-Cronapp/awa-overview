import type { Team } from '@shared/contracts';
import { RadixSelect } from '../../components/radix/select';
import { ptBR } from '../../i18n/pt-BR';

interface TeamSelectorProps {
  teams: Team[];
  value: string | null;
  onChange: (teamId: string) => void;
  loading?: boolean;
  disabled?: boolean;
}

export function TeamSelector({
  teams,
  value,
  onChange,
  loading = false,
  disabled = false,
}: TeamSelectorProps) {
  return (
    <div className="selector">
      <label htmlFor="team-selector">{ptBR.projects.team}</label>
      <RadixSelect
        id="team-selector"
        value={value ?? ''}
        onChange={onChange}
        placeholder={loading ? ptBR.app.loading : ptBR.projects.selectTeam}
        ariaLabel={ptBR.projects.team}
        loading={loading}
        disabled={disabled || teams.length === 0}
        options={[
          {
            value: '',
            label: loading ? ptBR.app.loading : ptBR.projects.selectTeam,
          },
          ...teams.map((team) => ({ value: team.id, label: team.name })),
        ]}
      />
      {!loading && !disabled && teams.length === 0 ? (
        <span className="muted">{ptBR.projects.noTeams}</span>
      ) : null}
    </div>
  );
}
