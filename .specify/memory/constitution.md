<!--
Sync Impact Report
- Version change: (none / template) → 1.0.0
- Modified principles: (placeholders) → I–V below (first ratification)
- Added sections: Restrições Técnicas; Fluxo de Evolução; Governance (concretized)
- Removed sections: none (template slots filled)
- Templates requiring updates:
  - .specify/templates/plan-template.md ✅ updated (Constitution Check gates)
  - .specify/templates/spec-template.md ✅ updated (pixel-grid constraint note)
  - .specify/templates/tasks-template.md ✅ updated (Angular path conventions)
  - .specify/templates/commands/*.md ⚠ n/a (directory absent)
  - README.md ✅ updated (project purpose aligned with constitution)
- Follow-up TODOs: none
-->

# PapaPixel Constitution

## Core Principles

### I. Grade de Pixels como Abstração Primária

Tudo que o jogador vê no campo de jogo MUST ser expresso como células
ligadas ou desligadas em uma grade retangular. Novas mecânicas de jogo
MUST pintar estado nessa matriz on/off; MUST NOT introduzir renderização
paralela (canvas livre, sprites HTML, SVG de entidades) sem emenda
explícita a esta constituição.

**Rationale**: O PapaPixel existe para estudar jogos digitais a partir da
metáfora mais simples — pixels que acendem e apagam.

### II. Separação Cena × Pixel

`PixelComponent` (ou sucessor) MUST permanecer um componente de
apresentação: recebe se está ligado e renderiza. Estado do jogo, loop de
movimento, colisão, comida e entrada do jogador MUST viver na cena
(`SceneComponent`) ou em serviços claramente derivados dela — nunca
dentro do pixel.

**Rationale**: Ensina responsabilidade única e composição: a grade é a
tela; a cena é o motor.

### III. Clareza para Estudo (NON-NEGOTIABLE)

O código MUST priorizar legibilidade e intenção explícita. Nomes de
direção, posição e regras de jogo MUST ser compreensíveis sem mapa mental
extra. Otimização prematura, metaprogramação e abstrações “genéricas de
engine” são proibidas até haver necessidade de aprendizado justificada.

Quando o fluxo não for óbvio, um comentário curto MUST explicar o
*porquê*, não o *o quê*.

**Rationale**: Este é um projeto de estudo; o código é material didático.

### IV. Configuração Centralizada e Regras Explícitas

Dimensões da grade, velocidade inicial e demais parâmetros de jogo MUST
residir em um ponto de configuração central (ex.: `SceneSettings`).
Comportamentos como wrap nas bordas, detecção de colisão e crescimento
ao comer MUST ser regras nomeadas e localizáveis — não literais mágicos
espalhados pelo movimento.

Mudanças de regra de jogo MUST ser verificáveis por observação da grade
ou por testes unitários do domínio.

**Rationale**: Facilita experimentar (ex.: grade maior, minhoca mais
rápida) sem reescrever a lógica.

### V. Simplicidade e Escopo Educacional

O projeto MUST permanecer uma SPA Angular client-side focada no motor de
pixels e no jogo da minhoca. MUST NOT adicionar backend, autenticação,
persistência remota ou dependências pesadas sem justificativa de
aprendizado documentada no plano da feature.

Prefira a solução mais simples que preserve os princípios I–IV.
Complexidade extra MUST ser justificada na seção Complexity Tracking do
plano.

**Rationale**: Escopo estreito mantém o experimento ensinável e
navegável.

## Restrições Técnicas

- **Stack**: Angular + TypeScript no browser; build e serve via Angular CLI.
- **Domínio visual**: grade configurável (hoje 20×50) de pixels on/off.
- **Entrada**: teclado e/ou controles na UI que alteram direção e pausa.
- **Testes**: Jasmine/Karma para componentes e, quando houver lógica
  pura extraída, testes unitários do domínio da minhoca.
- **Fora de escopo por padrão**: multiplayer, placares online, assets
  gráficos ricos, motor 3D.

## Fluxo de Evolução

1. Especificar a feature (`/speckit-specify`) em termos de comportamento
   na grade e da experiência do jogador.
2. Planejar (`/speckit-plan`) passando pelo Constitution Check abaixo.
3. Quebrar em tarefas (`/speckit-tasks`) preferindo incrementos jogáveis.
4. Implementar mantendo Pixel burro e Scene (ou serviços) como autoridade.
5. Validar manualmente na grade e com testes quando a lógica for
   extraída/refatorada.

Cada incremento SHOULD deixar o jogo jogável ou demonstrar um pedaço
claro da metáfora pixel (ligar/desligar, movimento, comida, colisão).

## Governance

Esta constituição prevalece sobre hábitos ad hoc e sobre conveniência
momentânea. Emendas MUST:

1. Atualizar este arquivo com versão semântica e data ISO (`YYYY-MM-DD`).
2. Registrar o impacto em templates Speckit e no README quando princípios
   mudarem o fluxo de trabalho.
3. Justificar remoções ou redefinições incompatíveis (MAJOR).

**Versionamento**:

- **MAJOR**: remoção/redefinição incompatível de princípio.
- **MINOR**: novo princípio ou expansão material de orientação.
- **PATCH**: esclarecimentos, tipografia, refinamentos sem mudança de
  significado.

Pull requests e revisões de agent MUST verificar conformidade com I–V.
Violações só seguem se listadas e justificadas em Complexity Tracking.

Orientação de runtime do projeto: `README.md`.

**Version**: 1.0.0 | **Ratified**: 2026-09-04 | **Last Amended**: 2026-09-04
