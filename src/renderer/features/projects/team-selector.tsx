import type { Team } from '@shared/contracts';
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
      <select
        id="team-selector"
        className="select"
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled || loading || teams.length === 0}
      >
        <option value="">{loading ? ptBR.app.loading : ptBR.projects.selectTeam}</option>
        {teams.map((team) => (
          <option key={team.id} value={team.id}>
            {team.name}
          </option>
        ))}
      </select>
      {!loading && !disabled && teams.length === 0 ? (
        <span className="muted">{ptBR.projects.noTeams}</span>
      ) : null}
    </div>
  );
}
