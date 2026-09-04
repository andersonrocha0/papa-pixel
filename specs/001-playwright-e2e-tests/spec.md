# Feature Specification: Playwright E2E Validation

**Feature Branch**: `001-playwright-e2e-tests`

**Created**: 2026-09-04

**Status**: Draft

**Input**: User description: "vamos criar testes com o playwright para validar o funcionamento atual do projeto"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Confirmar que o jogo carrega e a grade aparece (Priority: P1)

Como pessoa que mantém o PapaPixel, quero uma verificação automática de
que, ao abrir o jogo, a grade de pixels é exibida com a minhoca e a
comida já pintadas, para saber rapidamente se o estado inicial ainda
funciona.

**Why this priority**: Sem carga e grade visíveis, nenhum outro
comportamento do jogo pode ser confiado.

**Independent Test**: Abrir o jogo e observar a grade com células
ligadas (minhoca e comida) e desligadas — sem precisar mover ou pausar.

**Acceptance Scenarios**:

1. **Given** o jogo ainda não foi aberto, **When** a página do jogo é
   carregada, **Then** uma grade retangular de pixels fica visível.
2. **Given** o jogo acabou de carregar, **When** o estado inicial é
   inspecionado, **Then** existem pixels ligados representando a minhoca
   e pelo menos um pixel ligado representando a comida.
3. **Given** o jogo acabou de carregar, **When** nenhum controle é
   usado, **Then** a minhoca se move sozinha ao longo do tempo (a
   posição dos pixels ligados da minhoca muda).

---

### User Story 2 - Validar pausa e mudança de direção (Priority: P2)

Como mantenedor, quero verificar automaticamente que pausar/retomar e
mudar a direção (teclado ou botões) alteram o comportamento esperado da
minhoca, para proteger os controles que o jogador usa hoje.

**Why this priority**: Controles e pausa são o núcleo da interação
atual; quebrá-los torna o jogo inutilizável.

**Independent Test**: Com o jogo carregado, pausar, retomar e mudar
direção, observando se o movimento para/continua e se a trajetória
responde ao comando.

**Acceptance Scenarios**:

1. **Given** a minhoca está se movendo, **When** o jogador pausa (botão
   ou tecla de espaço), **Then** a minhoca para de avançar enquanto a
   pausa estiver ativa.
2. **Given** o jogo está pausado, **When** o jogador retoma, **Then** a
   minhoca volta a se mover.
3. **Given** a minhoca está se movendo, **When** o jogador escolhe uma
   nova direção (setas ou botões equivalentes), **Then** a minhoca passa
   a avançar nessa direção (observável na grade).
4. **Given** o jogo está pausado, **When** o jogador tenta mudar a
   direção por tecla (exceto espaço), **Then** a mudança não altera o
   movimento até a retomada (comportamento atual preservado).

---

### User Story 3 - Validar comida, crescimento e fim de jogo (Priority: P3)

Como mantenedor, quero checagens automáticas das regras de comida,
crescimento e colisão consigo mesma, para garantir que o loop completo
do jogo da minhoca continua coerente com o comportamento atual.

**Why this priority**: Completa a cobertura das regras atuais, mas
depende da grade e do movimento já estáveis (P1/P2).

**Independent Test**: Observar presença de comida, crescimento após
comer e reinício após colisão da minhoca consigo mesma.

**Acceptance Scenarios**:

1. **Given** o jogo está em andamento, **When** a comida está presente,
   **Then** ela aparece como pixel(s) ligado(s) distinto(s) na grade.
2. **Given** a cabeça da minhoca alcança a célula da comida, **When** o
   movimento de “comer” ocorre, **Then** a minhoca fica mais longa e
   uma nova comida aparece em alguma célula da grade.
3. **Given** a minhoca colide consigo mesma, **When** a falha é
   detectada, **Then** o jogador é avisado do fim de jogo e a partida
   reinicia no estado inicial jogável.

---

### Edge Cases

- Movimento que atravessa a borda da grade (wrap): a minhoca reaparece
  do outro lado sem “sumir” da grade.
- Comida gerada em posição aleatória: as verificações MUST aceitar
  qualquer célula válida da grade, sem assumir coordenadas fixas.
- Diálogo ou aviso de “You lost!”: o fluxo automatizado MUST tratar o
  aviso sem travar a suíte e confirmar o reinício em seguida.
- Execução sem servidor de desenvolvimento disponível: a suíte MUST
  falhar de forma clara (não “passar em silêncio”).

## Requirements *(mandatory)*

### Functional Requirements

<!--
  PapaPixel constraint (Constitution I): gameplay assertions describe
  on/off grid and player-facing rules—not alternate render pipelines.
-->

- **FR-001**: O projeto MUST oferecer uma suíte automatizada de
  verificação no navegador que exercita o jogo como um jogador o vê
  (grade on/off e controles).
- **FR-002**: A suíte MUST validar o carregamento inicial: grade
  visível, minhoca pintada e comida presente.
- **FR-003**: A suíte MUST validar movimento automático da minhoca ao
  longo do tempo sem intervenção.
- **FR-004**: A suíte MUST validar pausar e retomar o jogo.
- **FR-005**: A suíte MUST validar mudança de direção via teclado e via
  botões equivalentes na interface.
- **FR-006**: A suíte MUST validar que comer comida aumenta o comprimento
  da minhoca e reposiciona a comida na grade.
- **FR-007**: A suíte MUST validar o fim de jogo por colisão consigo
  mesma, o aviso ao jogador e o reinício jogável.
- **FR-008**: A suíte MUST poder ser executada por um comando documentado
  no projeto (ex.: script npm), a partir de um ambiente local com o
  aplicativo servido.
- **FR-009**: Relatórios de falha MUST indicar qual cenário quebrou
  (carregamento, pausa, direção, comida ou colisão), de forma legível
  para estudo.
- **FR-010**: A suíte MUST NOT alterar as regras de jogo atuais; ela
  apenas observa e confirma o comportamento já existente.
- **FR-011**: A ferramenta de automação de navegador adotada para esta
  feature MUST ser Playwright (pedido explícito do mantenedor; justifica
  aprendizado de E2E no escopo educacional — Constitution V).

### Key Entities

- **Grade de pixels**: matriz retangular de células ligadas ou
  desligadas; única representação visual do campo.
- **Minhoca**: sequência de células ligadas que se move; comprimento
  aumenta ao comer.
- **Comida**: célula ligada alvo; reposicionada após ser comida.
- **Controle de pausa**: estado que interrompe ou retoma o avanço.
- **Direção**: intenção de movimento do jogador (cima, baixo, frente,
  trás).
- **Cenário de verificação**: caso automatizado que observa um fluxo
  jogável e registra passou/falhou.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos cenários P1 (carga + grade + movimento inicial)
  passam em uma execução limpa do comportamento atual.
- **SC-002**: Pelo menos um cenário automatizado cobre pausa/retomada e
  pelo menos um cobre mudança de direção (teclado ou botão).
- **SC-003**: Pelo menos um cenário automatizado cobre comer/crescer e
  pelo menos um cobre colisão consigo mesma com reinício.
- **SC-004**: Um mantenedor consegue executar a suíte completa com um
  único comando documentado e obter resultado pass/fail em menos de 5
  minutos em máquina local típica de desenvolvimento.
- **SC-005**: Quando um cenário falha, a mensagem ou relatório permite
  identificar o fluxo quebrado sem inspecionar código-fonte.
- **SC-006**: Nenhuma regra de jogo (wrap, comida, colisão, controles)
  é alterada apenas para “fazer o teste passar”; o jogo permanece
  jogável manualmente como hoje.

## Assumptions

- O “funcionamento atual” é o da minhoca já implementada: grade on/off,
  movimento automático, wrap nas bordas, comida, crescimento, pausa
  (espaço/botão), direção (setas/botões) e reinício após colisão com
  aviso “You lost!”.
- Playwright é a ferramenta escolhida (pedido do usuário) e é aceitável
  no escopo de estudo, com justificativa no plano (Constitution V).
- Escopo desta feature é cobertura E2E do comportamento existente — não
  inclui novos modos de jogo, placar, multiplayer ou refatoração ampla
  do motor, salvo o mínimo necessário para tornar o comportamento
  observável nos testes.
- Testes unitários Jasmine/Karma existentes permanecem; esta feature
  adiciona a camada de navegador, não os substitui.
- Execução local com app servido é o alvo principal; integração contínua
  (CI) fica fora do MVP, a menos que o plano a inclua sem aumentar
  complexidade injustificada.
- Posição da comida é aleatória; asserções verificam presença e efeitos,
  não coordenadas fixas.
- Idioma dos avisos ao jogador permanece o atual (ex.: “You lost!”).
