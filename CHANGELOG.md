# Changelog

Todas as mudanças relevantes deste projeto são documentadas aqui.

## [1.0.0] - 2026-11-07

Primeira release estável do AWA Overview para Windows 10/11 x64.

### Adicionado

- Aplicação desktop Electron read-only para centralizar informações do Azure DevOps.
- Configuração de organização e PAT com armazenamento seguro via `safeStorage`.
- Overview com work items, pull requests e pipelines em até 10 itens por categoria.
- Telas de Work items, Pull requests e Pipelines com busca, filtros e acesso ao Azure DevOps.
- Janela customizada 900×700, titlebar própria e seletores de projeto/time no footer.
- Cache local cifrado, TTL, atualização manual e fallback para dados stale.
- Componentes Radix Dialog, Select, Tabs, Separator e Scroll Area com foco e teclado.
- Auditoria de acessibilidade WCAG 2.2 AA com axe.
- Testes unitários, integração, contrato, e2e e snapshots visuais.

### Segurança

- Renderer isolado com `contextIsolation`, `sandbox` e sem Node.js.
- PAT nunca retorna ao renderer, logs ou URLs.
- Consultas somente leitura no Azure DevOps.
- Remoção da configuração limpa PAT, caches e chave de criptografia.

### Notas

- Alvo desta release: Windows x64.
- Hover Card e Tooltip estão instalados, mas sem integração visual nesta versão.
- A próxima evolução visual será tratada na V2.

### Limitações conhecidas

- Instalador NSIS sem assinatura de código; a assinatura permanece planejada
  conforme ADR-0009.
- O executável usa o ícone padrão do Electron; o branding AWA permanece na
  titlebar.
- Atualização automática ainda não está habilitada.
