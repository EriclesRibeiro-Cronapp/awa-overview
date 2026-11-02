import { ptBR } from '../../i18n/pt-BR';

export function PatHelp() {
  return (
    <details>
      <summary>{ptBR.config.help}</summary>
      <p>
        Crie um PAT em Azure DevOps → User settings → Personal access tokens, com escopos de leitura
        para Project and Team, Work Items, Code e Build. Revogue o token quando não for mais
        necessário.
      </p>
    </details>
  );
}
