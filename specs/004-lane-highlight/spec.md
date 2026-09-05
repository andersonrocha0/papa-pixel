# Feature Specification: Destaque da Faixa de Navegação

**Feature Branch**: `004-lane-highlight`

**Created**: 2026-09-04

**Status**: Draft

**Input**: User description: "quando a cobra esta em na horizontal ou na vertical, seria lega se a linha ou coluna que ela navega naquele momento ficasse com uma cor um pouco diferente, para facilitar para o jogador saber se a cobrinha está na coluna/linha desejada."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver a faixa em que a minhoca está andando (Priority: P1)

Como jogador, quero que a linha (quando a minhoca anda na horizontal)
ou a coluna (quando anda na vertical) da cabeça fique visualmente um
pouco diferente do resto da grade, para eu perceber de imediato se
estou alinhado com a comida ou com o caminho que pretendo seguir,
sem precisar contar células.

**Why this priority**: É o comportamento pedido. Sem a faixa
destacada, a feature não existe.

**Independent Test**: Iniciar uma partida, observar a grade e
confirmar que só a linha ou a coluna da cabeça da minhoca está
sutilmente diferente das demais; o restante da grade permanece no
visual habitual.

**Acceptance Scenarios**:

1. **Given** uma partida em que a minhoca está se movendo na
   horizontal, **When** o jogador olha a grade, **Then** toda a linha
   da cabeça aparece com uma cor um pouco diferente das outras
   linhas, e nenhuma outra linha inteira está destacada.
2. **Given** uma partida em que a minhoca está se movendo na
   vertical, **When** o jogador olha a grade, **Then** toda a coluna
   da cabeça aparece com uma cor um pouco diferente das outras
   colunas, e nenhuma outra coluna inteira está destacada.
3. **Given** a faixa destacada está visível, **When** o jogador
   compara células vazias da faixa com células vazias fora dela,
   **Then** a diferença é perceptível, porém sutil o bastante para
   a minhoca e a comida continuarem claramente distintas da faixa.
4. **Given** a minhoca e a comida ocupam células da faixa destacada,
   **When** o jogador olha essas células, **Then** elas continuam
   reconhecíveis como minhoca ou comida; o destaque não as “apaga”
   nem as confunde com célula vazia.

---

### User Story 2 - A faixa acompanha a cabeça e a direção (Priority: P1)

Como jogador, quero que o destaque mude quando a minhoca avança ou
vira, para a faixa sempre representar a linha ou a coluna em que a
cabeça está navegando naquele momento — e não um rastro antigo.

**Why this priority**: Se o destaque ficar atrasado, o jogador toma
decisões com informação errada e a ajuda vira ruído.

**Independent Test**: Fazer a minhoca avançar e depois virar de
horizontal para vertical (ou o inverso) e confirmar que o destaque
sai da linha/coluna anterior e passa a marcar só a nova faixa da
cabeça.

**Acceptance Scenarios**:

1. **Given** a minhoca está na horizontal e a linha da cabeça está
   destacada, **When** a cabeça avança para outra coluna na mesma
   linha, **Then** o destaque permanece nessa mesma linha.
2. **Given** a minhoca está na vertical e a coluna da cabeça está
   destacada, **When** a cabeça avança para outra linha na mesma
   coluna, **Then** o destaque permanece nessa mesma coluna.
3. **Given** a minhoca está na horizontal com a linha destacada,
   **When** o jogador vira para cima ou para baixo e a cabeça dá o
   próximo avanço vertical, **Then** o destaque da linha some e
   passa a marcar a coluna da nova posição da cabeça.
4. **Given** a minhoca está na vertical com a coluna destacada,
   **When** o jogador vira para a esquerda ou para a direita e a
   cabeça dá o próximo avanço horizontal, **Then** o destaque da
   coluna some e passa a marcar a linha da nova posição da cabeça.
5. **Given** a cabeça atravessa a borda e reaparece do outro lado
   (wrap), **When** o jogador olha a grade, **Then** o destaque
   acompanha a nova linha ou coluna da cabeça.

---

### User Story 3 - A faixa continua útil com o jogo pausado ou recomeçado (Priority: P2)

Como jogador, quero usar a faixa para planejar a próxima jogada
enquanto o jogo está pausado, e quero que uma nova partida mostre a
faixa da posição inicial — não a da partida anterior.

**Why this priority**: A ajuda visual vale principalmente no momento
de pensar o alinhamento; o reset evita informação herdada.

**Independent Test**: Pausar e confirmar que a faixa permanece;
recomeçar ou iniciar nova partida após o fim de jogo e confirmar que
o destaque corresponde à cabeça no estado inicial.

**Acceptance Scenarios**:

1. **Given** a faixa está destacada, **When** o jogador pausa,
   **Then** o destaque permanece na mesma linha ou coluna; pausar
   não esconde nem muda a faixa.
2. **Given** o jogo está pausado, **When** o jogador retoma,
   **Then** o destaque continua acompanhando a cabeça como antes.
3. **Given** a minhoca já se moveu para outra faixa, **When** a
   partida termina ou o jogador recomeça, **Then** a nova partida
   destaca a linha ou coluna da cabeça na posição inicial, não a
   faixa da partida anterior.

---

### Edge Cases

- **Corpo em várias faixas**: depois de curvas, o corpo pode ocupar
  outras linhas e colunas. Só a faixa da cabeça (linha se horizontal,
  coluna se vertical) fica destacada; o corpo antigo não “acende”
  faixas extras.
- **Cruzeta**: o destaque é uma linha *ou* uma coluna, nunca as duas
  ao mesmo tempo. Não há cruz no encontro da cabeça.
- **Wrap nas bordas**: ao atravessar a borda, a faixa segue a cabeça
  no lado oposto; não fica uma faixa “fantasma” no lado de origem.
- **Comida na faixa**: a comida permanece reconhecível; a célula
  dela não vira só “faixa vazia destacada”.
- **Células da minhoca na faixa**: segmentos ligados continuam
  ligados; o destaque não os desliga nem os disfarça.
- **Pausa**: o destaque congela na faixa atual até o próximo avanço
  ou até uma nova partida.
- **Fim de jogo**: o destaque da última faixa da cabeça pode
  permanecer até o recomeço; a partida seguinte não herda essa
  faixa se a cabeça inicial estiver em outra.
- **Partida recém-iniciada**: o destaque já está visível antes do
  primeiro avanço, na faixa correspondente à direção e à cabeça
  iniciais.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST destacar, na grade de pixels, a faixa
  em que a cabeça da minhoca está navegando no momento.
- **FR-002**: Enquanto a minhoca se move na horizontal, o sistema
  MUST destacar a linha inteira da cabeça e MUST NOT destacar
  nenhuma outra linha inteira por causa desta feature.
- **FR-003**: Enquanto a minhoca se move na vertical, o sistema
  MUST destacar a coluna inteira da cabeça e MUST NOT destacar
  nenhuma outra coluna inteira por causa desta feature.
- **FR-004**: O destaque MUST ser sutil: células vazias da faixa
  MUST parecer um pouco diferentes das demais células vazias, sem
  parecer células ligadas (minhoca ou comida).
- **FR-005**: Células ocupadas pela minhoca ou pela comida MUST
  permanecer reconhecíveis como minhoca ou comida mesmo quando
  estão sobre a faixa destacada.
- **FR-006**: O destaque MUST atualizar quando a cabeça muda de
  linha ou de coluna, e MUST trocar de linha para coluna (ou o
  inverso) quando a direção passa de horizontal para vertical (ou
  o inverso).
- **FR-007**: O destaque MUST acompanhar a cabeça quando ela
  atravessa a borda e reaparece do outro lado.
- **FR-008**: Pausa MUST preservar o destaque corrente; retomada
  MUST continuar a atualizá-lo no próximo avanço.
- **FR-009**: Toda nova partida (fim de jogo ou recomeço) MUST
  mostrar o destaque da cabeça e da direção iniciais, sem herdar
  a faixa da partida anterior.
- **FR-010**: Direção, wrap, comida, crescimento, colisão, pausa,
  ritmo e demais regras atuais MUST permanecer iguais; esta
  feature apenas altera a aparência da faixa ativa na grade.
- **FR-011**: O destaque MUST viver nas células da grade (células
  vazias da faixa com aparência distinta); MUST NOT introduzir um
  desenho paralelo fora da metáfora de pixels da cena.
- **FR-012**: O destaque MUST estar sempre ativo durante a
  partida; o jogador MUST NOT precisar ligar ou desligar essa
  ajuda.

### Key Entities

- **Cabeça da minhoca**: célula da ponta que avança; define qual
  linha ou coluna é a faixa ativa.
- **Direção de movimento**: horizontal (esquerda/direita) ou
  vertical (cima/baixo); decide se a faixa ativa é uma linha ou
  uma coluna.
- **Faixa ativa**: a linha inteira da cabeça (movimento
  horizontal) ou a coluna inteira da cabeça (movimento vertical).
- **Célula vazia destacada**: célula desligada que pertence à
  faixa ativa e por isso aparece com cor um pouco diferente das
  outras células desligadas.
- **Grade**: matriz de células ligadas ou desligadas; o destaque
  é um estado visual extra das células desligadas da faixa ativa.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% dos momentos de uma partida em andamento ou
  pausada, o jogador consegue apontar a linha ou a coluna da
  cabeça só olhando a grade, sem contar índices e sem inspecionar
  código.
- **SC-002**: Enquanto a minhoca está na horizontal, exatamente
  uma linha inteira tem células vazias com aparência distinta; as
  demais linhas vazias permanecem no visual habitual.
- **SC-003**: Enquanto a minhoca está na vertical, exatamente uma
  coluna inteira tem células vazias com aparência distinta; as
  demais colunas vazias permanecem no visual habitual.
- **SC-004**: Depois de uma virada de horizontal para vertical (ou
  o inverso) e do avanço seguinte da cabeça, 100% dos observadores
  veem o destaque na nova faixa e nenhum destaque residual na
  faixa anterior.
- **SC-005**: Em 100% das novas partidas, o destaque corresponde à
  cabeça e à direção iniciais, independentemente da faixa da
  partida anterior.
- **SC-006**: Minhoca e comida permanecem distinguíveis da faixa
  em 100% das células que ocupam; nenhum observador as confunde
  com célula vazia destacada.
- **SC-007**: Pausa, retomada, mudança de direção, wrap, comida,
  crescimento e colisão continuam com o mesmo resultado das
  regras atuais; zero regressão nesses comportamentos.

## Assumptions

- A faixa segue só a cabeça e a direção atual, não o corpo inteiro.
  Depois de curvas, outras linhas ou colunas ocupadas pelo corpo
  não recebem destaque.
- “Um pouco diferente” significa um contraste sutil nas células
  vazias da faixa — o bastante para o jogador notar o alinhamento,
  sem competir com minhoca e comida. A cor exata fica para o
  planejamento.
- Não há cruzeta (linha e coluna ao mesmo tempo) e não há controle
  para o jogador ligar, desligar ou escolher a cor do destaque.
- O destaque já aparece no estado inicial da partida, antes do
  primeiro avanço.
- Controles, pausa, wrap, comida, crescimento, colisão, velocidade
  e indicador de velocidade permanecem como estão; o único
  comportamento novo é a aparência da faixa ativa na grade.
- Esta ajuda é permanente na partida: não é um modo opcional nem
  uma preferência persistida entre sessões.
