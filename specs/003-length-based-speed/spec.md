# Feature Specification: Velocidade da Minhoca por Comprimento

**Feature Branch**: `003-length-based-speed`

**Created**: 2026-09-04

**Status**: Draft

**Input**: User description: "quanto maior a cobra, mais rápida ela se movimenta"

## Clarifications

### Session 2026-09-04

- Q: Deve haver um indicador de velocidade visível para o jogador? → A: Sim; indicador na tela mostrando a velocidade atual da minhoca.
- Q: A aceleração pode tornar o jogo impossível de jogar? → A: Não; a velocidade máxima deve permanecer jogável.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A minhoca acelera ao crescer (Priority: P1)

Como jogador, quero que a minhoca avance mais rápido pela grade à medida
que fica mais longa, para que a partida fique progressivamente mais
desafiadora depois de cada comida.

**Why this priority**: É o comportamento pedido. Sem essa relação entre
tamanho e ritmo, a feature não existe.

**Independent Test**: Iniciar uma partida, observar o ritmo inicial de
avanço na grade, comer comida até a minhoca crescer e confirmar que os
avanços seguintes atravessam células em menos tempo do que antes.

**Acceptance Scenarios**:

1. **Given** uma partida recém-iniciada com a minhoca no comprimento
   inicial, **When** a minhoca avança sem ter comido, **Then** o ritmo
   de movimento é o ritmo inicial do jogo.
2. **Given** a minhoca está se movendo no ritmo correspondente ao
   comprimento atual, **When** a cabeça alcança a comida e o
   comprimento aumenta em um segmento, **Then** os avanços seguintes
   acontecem em um ritmo mais rápido do que antes dessa comida.
3. **Given** a minhoca comeu várias comidas e ficou visivelmente mais
   longa, **When** o jogador observa o deslocamento na grade, **Then**
   o tempo para percorrer a mesma quantidade de células é menor do que
   no comprimento inicial.
4. **Given** a minhoca acaba de crescer e o ritmo aumenta, **When** o
   jogador olha o indicador de velocidade, **Then** o valor exibido é
   maior do que o valor mostrado antes dessa comida.

---

### User Story 2 - Nova partida volta ao ritmo inicial (Priority: P2)

Como jogador, quero que uma nova partida comece sempre no ritmo
inicial, para que o desafio volte ao ponto de partida depois de um
fim de jogo ou de um recomeço explícito.

**Why this priority**: Sem reset, uma sessão anterior deixaria a
minhoca rápida demais no início da seguinte e quebraria a progressão.

**Independent Test**: Deixar a minhoca crescer até acelerar, provocar
fim de jogo ou recomeçar, e medir que o primeiro avanço da nova
partida usa o ritmo inicial.

**Acceptance Scenarios**:

1. **Given** a minhoca já cresceu e está mais rápida que no início,
   **When** a partida termina e uma nova começa, **Then** o ritmo de
   movimento volta ao ritmo inicial.
2. **Given** a minhoca já cresceu e está mais rápida que no início,
   **When** o jogador recomeça a partida, **Then** o comprimento
   inicial, o ritmo inicial e o indicador de velocidade voltam aos
   valores de início de partida.

---

### User Story 3 - O ritmo acelera, mas o jogo continua jogável (Priority: P3)

Como jogador, quero que a aceleração tenha um teto jogável e que
pausa, direção, comida e colisão continuem iguais em qualquer ritmo,
para conseguir ver cada avanço e reagir a tempo mesmo com a minhoca
longa.

**Why this priority**: Velocidade impossível de acompanhar invalida o
jogo. O teto é restrição obrigatória, não um detalhe de ajuste.

**Independent Test**: Crescer a minhoca muitas vezes, confirmar que o
ritmo para de aumentar ao atingir o máximo, e exercitar pausa, mudança
de direção, comida e colisão nesse estado.

**Acceptance Scenarios**:

1. **Given** a minhoca já atingiu o ritmo máximo permitido, **When**
   ela come mais uma comida e cresce de novo, **Then** o ritmo de
   movimento permanece no máximo (não fica ainda mais rápido).
2. **Given** a minhoca está em qualquer ritmo acima do inicial,
   **When** o jogador pausa, **Then** o avanço na grade para; **When**
   o jogador retoma, **Then** o movimento continua no mesmo ritmo de
   antes da pausa.
3. **Given** a minhoca está em qualquer ritmo acima do inicial,
   **When** o jogador muda a direção, come comida ou colide, **Then**
   as regras atuais de virada, crescimento, nova comida e fim de jogo
   continuam válidas.
4. **Given** a minhoca está no ritmo máximo, **When** o jogador
   observa a grade e usa os controles, **Then** cada avanço ainda é
   distinguível e há tempo de mudar de direção entre um avanço e o
   seguinte.

---

### User Story 4 - Ver a velocidade atual na tela (Priority: P2)

Como jogador, quero um indicador de velocidade sempre visível na tela
do jogo, para saber qual é a velocidade da minhoca sem ter de estimar
só pelo movimento na grade.

**Why this priority**: O jogador pediu leitura explícita da velocidade;
sem o indicador, a progressão fica só implícita e mais difícil de
acompanhar.

**Independent Test**: Abrir uma partida, ler o indicador no ritmo
inicial, crescer a minhoca e confirmar que o indicador sobe; recomeçar
e confirmar que o indicador volta ao valor inicial.

**Acceptance Scenarios**:

1. **Given** uma partida recém-iniciada, **When** a tela do jogo está
   visível, **Then** o indicador de velocidade está presente e mostra
   o valor correspondente ao ritmo inicial.
2. **Given** a minhoca cresce e o ritmo aumenta, **When** o avanço
   seguinte começa, **Then** o indicador passa a mostrar o novo valor
   de velocidade.
3. **Given** a minhoca já está no ritmo máximo, **When** ela come e
   cresce de novo, **Then** o indicador permanece no valor máximo
   (não sobe além do teto jogável).
4. **Given** o jogo está pausado, **When** o jogador olha a tela,
   **Then** o indicador continua visível com a velocidade corrente
   (pausa não esconde nem zera o valor).

---

### Edge Cases

- **Comprimento inicial**: enquanto a minhoca não crescer, o ritmo
  permanece exatamente o ritmo inicial; não há aceleração só por o
  tempo passar.
- **Teto jogável**: o ritmo máximo MUST permanecer acompanhável por
  um jogador típico; depois que esse teto é atingido, crescimentos
  extras aumentam só o comprimento, nunca o ritmo, e o indicador
  permanece no valor máximo.
- **Pausa no ritmo acelerado**: pausar e retomar não altera o ritmo
  corrente, o comprimento nem o valor do indicador.
- **Recomeço após aceleração**: fim de jogo ou recomeço descartam o
  ritmo acelerado; a próxima partida não herda velocidade da anterior.
- **Mudança de ritmo no instante do crescimento**: o novo ritmo vale
  a partir do avanço seguinte ao crescimento, não no meio de um
  avanço já em curso.
- **A minhoca não encolhe**: durante uma partida o ritmo nunca
  diminui, porque o comprimento nunca diminui; o indicador também
  nunca cai no meio da partida.
- **Indicador fora da grade**: o indicador vive na tela do jogo, ao
  lado dos controles já existentes, e MUST NOT ser pintado como
  células da grade de pixels.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST fazer a minhoca avançar pela grade em um
  ritmo determinado pelo comprimento atual dela.
- **FR-002**: O sistema MUST usar o ritmo inicial enquanto a minhoca
  estiver no comprimento inicial da partida.
- **FR-003**: O sistema MUST aumentar o ritmo de movimento cada vez
  que a minhoca crescer um segmento após comer.
- **FR-004**: O aumento de ritmo MUST ser o mesmo a cada segmento
  ganho, até o ritmo máximo.
- **FR-005**: O sistema MUST impor um ritmo máximo jogável;
  crescimentos além desse ponto MUST NOT deixar a minhoca mais
  rápida, e esse máximo MUST deixar cada avanço visível e permitir
  uma mudança de direção entre avanços consecutivos.
- **FR-006**: O sistema MUST restaurar o ritmo inicial sempre que uma
  nova partida começar (fim de jogo ou recomeço).
- **FR-007**: Pausa e retomada MUST preservar o ritmo corrente; MUST
  NOT acelerar nem desacelerar a minhoca.
- **FR-008**: Direção, wrap nas bordas, comida, crescimento, colisão
  com o próprio corpo e fim de jogo MUST permanecer com as regras
  atuais; o que muda é o intervalo percebido entre avanços e a
  presença do indicador de velocidade.
- **FR-009**: O sistema MUST exibir na tela um indicador de
  velocidade sempre visível, fora da grade de pixels, mostrando a
  velocidade atual da minhoca.
- **FR-010**: Ritmo inicial, tamanho do aumento por segmento e ritmo
  máximo MUST ser regras fixas e centralizadas do jogo, não escolhas
  do jogador durante a partida.
- **FR-011**: O indicador de velocidade MUST atualizar quando o ritmo
  muda (crescimento abaixo do teto) e MUST voltar ao valor inicial
  em toda nova partida; MUST NOT ser um controle que o jogador
  ajuste.
- **FR-012**: O jogador MUST também perceber a aceleração observando
  a grade de pixels (células da minhoca mudam de posição em menos
  tempo), além de ler o indicador.

### Key Entities

- **Minhoca**: sequência ordenada de células ligadas na grade; o
  comprimento (quantidade de segmentos) é a entrada da regra de ritmo.
- **Ritmo de movimento (velocidade)**: tempo percebido entre um
  avanço e o seguinte na grade; começa no ritmo inicial, sobe a cada
  crescimento e para no ritmo máximo jogável.
- **Indicador de velocidade**: leitura sempre visível na tela do
  jogo, fora da grade, que reflete a velocidade atual da minhoca.
- **Comida**: célula ligada que, ao ser alcançada pela cabeça,
  aumenta o comprimento e, portanto, pode aumentar o ritmo.
- **Partida**: sessão do jogo da minhoca; ao iniciar, comprimento,
  ritmo e indicador voltam aos valores iniciais.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Depois de a minhoca crescer pelo menos um segmento, o
  tempo médio entre dois avanços consecutivos na grade é menor do
  que o tempo médio medido no comprimento inicial da mesma partida.
- **SC-002**: Uma minhoca que cresceu pelo menos 5 segmentos percorre
  10 células em menos tempo do que a minhoca no comprimento inicial,
  em condições equivalentes (sem pausa).
- **SC-003**: Em 100% das novas partidas (após fim de jogo ou
  recomeço), os primeiros avanços usam o ritmo inicial, independentemente
  de quão rápida a minhoca estava na partida anterior.
- **SC-004**: Depois que o ritmo máximo é atingido, comer mais 3
  comidas não reduz o tempo entre avanços; o ritmo permanece estável
  no teto.
- **SC-005**: Em qualquer ritmo, o jogador consegue pausar, retomar e
  mudar de direção com o mesmo resultado das regras atuais; zero
  regressão nesses comportamentos.
- **SC-006**: No ritmo máximo, 100% dos avanços individuais
  permanecem visíveis na grade e o jogador consegue emitir uma
  mudança de direção entre um avanço e o seguinte; a partida MUST
  NOT atingir velocidade impossível de jogar.
- **SC-007**: Em 100% do tempo de uma partida (incluindo pausa), o
  jogador consegue ler a velocidade atual no indicador sem inspecionar
  código; o valor muda na mesma ocasião em que o ritmo muda e volta
  ao inicial em toda nova partida.

## Assumptions

- O ritmo aumenta em degraus iguais a cada segmento ganho (progressão
  linear), no estilo clássico de jogo da minhoca, e não de forma
  aleatória ou exponencial.
- Existe um teto de ritmo obrigatoriamente jogável: cada avanço
  continua visível e há tempo de mudar de direção entre avanços. O
  valor exato do teto e do degrau fica na configuração central do
  jogo e pode ser ajustado sem mudar estas regras.
- A minhoca começa cada partida no comprimento inicial já usado hoje;
  esta feature não altera o tamanho de partida nem a quantidade de
  comida simultânea.
- Não há seletor de dificuldade nem persistência de recorde de ritmo
  entre sessões do navegador. O indicador é somente leitura.
- A minhoca não encolhe; portanto o ritmo e o indicador nunca
  diminuem no meio de uma partida.
- Controles (teclado e botões), pausa, comida, crescimento e colisão
  permanecem como estão; o comportamento novo é o ritmo variar com
  o comprimento e o indicador refletir essa velocidade.
- O indicador fica na tela do jogo, fora da grade de pixels (junto
  aos controles já existentes), em formato simples e legível. A forma
  exata do número ou rótulo fica para o planejamento.
