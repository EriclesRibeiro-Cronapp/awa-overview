# ADR-0012: Radix UI incremental

- **Status:** Aceito
- **Data:** 2026-11-06
- **Decisores:** responsável do projeto
- **Relacionados:** ADR-0001, spec 007
- **Substitui:** —

## Contexto

A interface atual usa componentes próprios para Dialog, Select, Tabs, Separator e
Scroll Area. A migração precisa preservar o design documentado, a acessibilidade e os
testes visuais, sem introduzir Tailwind ou um design system visual novo.

## Decisão

- Adotar Radix UI **incrementalmente** como camada de comportamento.
- Usar Radix Dialog, Scroll Area, Select, Separator e Tabs.
- Instalar Hover Card e Tooltip, mas sem integração visual nesta feature.
- Encapsular Radix em `src/renderer/components/radix/` mantendo a API/classes atuais.
- Não usar Tailwind, shadcn, Lucide ou biblioteca visual completa.
- Migrar primeiro Dialog, Select, Tabs e Separator; depois Scroll Area/dados.
- Snapshots visuais existentes são gate de fidelidade.

## Alternativas consideradas

| Alternativa | Prós | Contras | Por que não |
|---|---|---|---|
| shadcn/ui | Componentes prontos | Tailwind + visual próprio | Contraria fidelidade e CSS atual |
| MUI/Ant/Mantine | Muitos componentes | Design system próprio e peso | Overrides e regressão visual |
| Headless UI | Simples | Menos primitives | Cobertura insuficiente |
| React Aria | Acessibilidade forte | API mais verbosa | Radix cobre o escopo atual |
| Manter tudo custom | Zero dependências | A11y/foco/teclado frágeis | Radix é ganho concreto |

## Notas de implementação

- O Dialog usa `modal={false}` com overlay próprio, trap de Tab e restauração de
  foco manual para manter titlebar/footer acessíveis, conforme o cenário 5 da 007.
- O Select usa portal dentro de `#root` para manter o popover acima do titlebar sem
  esconder a aplicação da árvore de acessibilidade; enquanto aberto, os focáveis do
  fundo recebem `tabindex=-1` temporário, pois o listbox já prende o teclado.
- A Scroll Area esconde a barra visual e mantém o viewport focável para rolagem por
  teclado.

## Consequências

### Positivas

- Melhor foco, teclado, ARIA e restauração de foco.
- Componentes encapsulados e substituíveis.
- Migração incremental, sem reescrever todas as telas.

### Negativas e riscos

- Novas dependências e portais exigem z-index/no-drag.
- Markup diferente pode afetar testes/snapshots.
- Hover Card/Tooltip ficam para feature futura.

## Conformidade constitucional

Atende aos Princípios I, II, IV, V, VIII e X. A decisão preserva o design e a
acessibilidade; não introduz nova linguagem visual.

## Links

- Spec: `specs/007-radix-ui-adoption/spec.md`
- Plano: `specs/007-radix-ui-adoption/plan.md`
