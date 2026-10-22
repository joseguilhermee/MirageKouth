---
name: MirageKouth
description: Tarde na terra roxa. O céu do norte do Paraná anda do dia ao anoitecer conforme as perguntas passam, e a terra roxa é o chão e a cor de toda ação.
colors:
  terra: "#7a2e1e"
  terra-ink: "#fbf3ea"
  terra-wash: "color-mix(in oklab, #7a2e1e 7%, transparent)"
  terra-deep: "#5e2317"
  sun: "#e59a4c"
  focus: "#3e6a86"
  cipher: "#2f5670"
  warn: "#8f4407"
  ink: "#2a1b17"
  ink-2: "#4f3c33"
  ink-3: "#604a3f"
  line: "#cdb8a6"
  line-strong: "#a98d7a"
  paper: "#fbf6ef"
  paper-line: "#e6d6c6"
  scrim: "rgb(42 23 18 / 0.3)"
  sky-afternoon-top: "#d6e6ef"
  sky-afternoon-mid: "#e4ece9"
  sky-afternoon-low: "#eef0e6"
  sky-golden-top: "#dfe1ea"
  sky-golden-mid: "#eedfd6"
  sky-golden-low: "#f3d8c4"
  sky-dusk-top: "#d9cad8"
  sky-dusk-mid: "#e9cdc8"
  sky-dusk-low: "#efc2ae"
  sky-night-top: "#2a1a22"
  sky-night-mid: "#34202a"
  sky-night-low: "#4a2b25"
  action-night: "#f6e9dd"
  action-ink-night: "#2a1712"
  brand-night: "#f1c9a3"
  sun-night: "#f0b26c"
  focus-night: "#a9c7da"
  cipher-night: "#a9c7da"
  warn-night: "#f3b37a"
  ink-night: "#f6e9dd"
  ink-2-night: "#dcc6b6"
  ink-3-night: "#b89d8c"
  line-night: "#6a4a42"
  line-strong-night: "#9a7466"
typography:
  display:
    fontFamily: "Bricolage Grotesque, sans-serif"
    fontSize: "60px"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.015em"
  headline:
    fontFamily: "Bricolage Grotesque, sans-serif"
    fontSize: "40px"
    fontWeight: 600
    lineHeight: 1.14
    letterSpacing: "-0.015em"
  title:
    fontFamily: "Bricolage Grotesque, sans-serif"
    fontSize: "22px"
    fontWeight: 500
    lineHeight: 1.375
  title-sm:
    fontFamily: "Bricolage Grotesque, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: 1.4
  field:
    fontFamily: "Figtree, sans-serif"
    fontSize: "20px"
    fontWeight: 400
    lineHeight: 1.625
  body-lg:
    fontFamily: "Figtree, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.625
  body:
    fontFamily: "Figtree, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Figtree, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.5
  cipher:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "12.5px"
    fontWeight: 400
    lineHeight: 1.625
rounded:
  key: "6px"
  panel: "16px"
  board: "24px"
  full: "999px"
spacing:
  gutter-sm: "20px"
  gutter-md: "40px"
  gutter-lg: "64px"
  column: "760px"
  container: "1200px"
  drawer: "460px"
components:
  button-primary:
    backgroundColor: "{colors.terra}"
    textColor: "{colors.terra-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.full}"
    padding: "14px 28px"
  button-primary-waiting:
    backgroundColor: "transparent"
    textColor: "{colors.terra}"
    typography: "{typography.body}"
    rounded: "{rounded.full}"
    padding: "14px 28px"
  button-primary-night:
    backgroundColor: "{colors.action-night}"
    textColor: "{colors.action-ink-night}"
    rounded: "{rounded.full}"
    padding: "14px 28px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink-2}"
    typography: "{typography.body}"
    rounded: "{rounded.full}"
    padding: "14px 20px"
  button-round:
    backgroundColor: "{colors.terra}"
    textColor: "{colors.terra-ink}"
    rounded: "{rounded.full}"
    size: "56px"
  option-pill:
    backgroundColor: "rgb(255 255 255 / 0.35)"
    textColor: "{colors.ink-2}"
    typography: "{typography.body}"
    rounded: "{rounded.full}"
    padding: "10px 16px"
  option-pill-on:
    backgroundColor: "{colors.terra}"
    textColor: "{colors.terra-ink}"
    rounded: "{rounded.full}"
    padding: "10px 16px"
  field:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.field}"
    padding: "12px 0"
  nav-info-button:
    backgroundColor: "transparent"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.full}"
    padding: "8px 12px"
  prancheta-badge:
    backgroundColor: "{colors.terra}"
    textColor: "{colors.terra-ink}"
    rounded: "{rounded.full}"
    padding: "2px 6px"
    width: "24px"
  prancheta-board:
    backgroundColor: "{colors.terra-deep}"
    rounded: "{rounded.board}"
    width: "{spacing.drawer}"
  prancheta-sheet:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "24px 20px"
  popover:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "20px"
  horizon:
    backgroundColor: "{colors.terra}"
    textColor: "{colors.terra-ink}"
    height: "60px"
  sun-marker:
    backgroundColor: "{colors.sun}"
    rounded: "{rounded.full}"
    size: "20px"
  delivery-note:
    backgroundColor: "{colors.terra-wash}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "16px 20px"
---

# Design System: MirageKouth

## Overview

**Creative North Star: "Tarde na terra roxa"**

Responder é atravessar uma tarde. O fundo da página não é uma cor: é o céu em três faixas (alto, meio, horizonte), que anda do azul de tarde clara à hora dourada e ao rosa-lilás do fim de tarde a cada pergunta, e só anoitece na hora de selar o arquivo. A terra roxa é o chão (a faixa fixa no pé da tela) e a cor de toda ação. Não existe cinza neutro: todo tom secundário, de texto ou de linha, é marrom puxado da própria terra.

A densidade é de leitura longa, não de painel. Uma única coluna central de até 760px carrega a pergunta grande, o campo amplo e os passos, um de cada vez. O que já foi respondido não ocupa a página: vai para a prancheta, uma placa de terra roxa escura com uma folha de papel claro presa no clipe, que se abre da barra do topo e mostra cada resposta como ela vai sair do aparelho, já cifrada. A hierarquia vem da escala do grotesco, não de caixas, cores de fundo ou sombras. A firmeza é modernista e o tom é de intimidade: superfícies chapadas, linhas finas de 1px, cantos inteiramente redondos nos controles.

O sistema recusa duas coisas de forma explícita: o formulário branco com botão azul e o escuro com neon de "cripto". O mono aparece só onde há dado de verdade (a cifra), nunca como enfeite de segurança.

**Key Characteristics:**
- O céu é o fundo e é estado: a cor do fundo diz quanto da tarde já passou.
- A terra roxa é a única cor de ação; de dia, ação e terra são a mesma cor.
- À noite, a tinta clareia e a ação vira o creme da luz que sobrou.
- Linhas de 1px no lugar de caixas; campos de escrita só com a linha de base.
- Controles em pílula (raio total); nada de cantos médios genéricos.
- A resposta completa vira cifra no lugar e voa para a prancheta: o selo é visto, não prometido.
- Movimento de base único: desaceleração "expo out", entrada mais lenta que a saída.

## Colors

Uma paleta terrosa de função estrita: céu que muda, terra que age, tinta marrom que lê, papel claro para o que é guardado, e dois azuis de céu reservados para foco e cifra.

### Primary
- **Terra Roxa** (`terra`): botões principais, opção marcada, a faixa do horizonte, o contador da prancheta, os botões redondos da abertura, avatar de iniciais, pontos cheios do medidor. De dia é também `action` e `brand` (wordmark, palavras destacadas nos títulos, ícones de confirmação, número e "Editar" na folha da prancheta).
- **Creme da Terra** (`terra-ink`): texto e marcos sobre a terra roxa.
- **Véu de Terra** (`terra-wash`): 7% da terra sobre transparente. Hover dos botões de texto e o único painel de conteúdo da página, a nota de "Próximo passo" no fim.
- **Terra Funda** (`terra-deep`): a placa da prancheta, de dia e de noite; é também o valor de `terra` no anoitecer.

### Secondary
- **Sol da Tarde** (`sun`): só o marcador do sol no horizonte e a cor da seleção de texto (45% sobre transparente). Em nenhum outro lugar.

### Tertiary
- **Azul de Céu Firme** (`focus`): anel de foco de teclado (2px, afastado 3px).
- **Azul da Cifra** (`cipher`): só texto cifrado: a resposta virando cifra no selo, as prévias e o arquivo selado na prancheta.
- **Terra Queimada** (`warn`): aviso calmo do que falta (texto, linha de base do campo bloqueado, enunciado do passo pendente). Não é vermelho de erro.

### Neutral
- **Tinta** (`ink`): texto principal, títulos, texto digitado.
- **Tinta Média** (`ink-2`): texto de apoio, parágrafos secundários, botão fantasma, opção desmarcada, botões da barra. Medida a 7:1 ou mais contra o céu mais escuro do dia.
- **Tinta Clara** (`ink-3`): placeholders, dicas de teclado, contadores. 4,5:1 ou mais contra o céu mais escuro do dia.
- **Linha** (`line`): divisórias de 1px entre linhas de lista, pontos vazios do medidor, o corpo do clipe da prancheta.
- **Linha Firme** (`line-strong`): contorno de botão fantasma, de opção desmarcada e de tecla, linha de base do campo em repouso, polegar da barra de rolagem, mola do clipe.
- **Papel** (`paper`, com divisória `paper-line`): a folha da prancheta e o painel dos popovers. Papel claro fixo, que não muda no anoitecer.
- **Véu** (`scrim`): o escurecimento da página atrás da prancheta aberta.
- **Céu** (`sky-*`): três paradas de dia (`afternoon`, `golden`, `dusk`) interpoladas linearmente por progresso de 0 a 1, e `night` só para a tela de selar. Transição de 1,6s entre perguntas.

### Named Rules
**The Earth Acts Rule.** Toda ação é terra roxa. Botão principal, opção marcada, o contador da prancheta e o horizonte usam `terra`/`action`; nenhuma outra cor de fundo sinaliza "clique aqui".

**The No Neutral Gray Rule.** Nenhum cinza neutro. Todo tom secundário de texto, linha ou contorno vem da família marrom da terra (`ink-2`, `ink-3`, `line`, `line-strong`, `paper-line`). O único branco é translúcido (35 a 40%) sobre o céu, nas opções e nas teclas.

**The One Sun Rule.** O laranja do sol aparece em um só objeto: o marcador da pergunta atual (mais a seleção de texto). Ele nunca vira cor de botão, de link ou de destaque.

**The Nightfall Inversion Rule.** No anoitecer (`data-sky="night"`), a terra escurece mas continua terra (`terra-deep`), a tinta vira creme e a ação vira a luz clara (`action-night` com `action-ink-night`). Componentes que ficam sobre o céu usam `action`/`brand`, nunca `terra` direto.

**The Paper Stays Paper Rule.** O que é folha (prancheta, popover) é papel claro com tinta escura nos dois céus. A folha não inverte no anoitecer; só o céu em volta muda.

## Typography

**Display Font:** Bricolage Grotesque (eixo `opsz`), com sans-serif
**Body Font:** Figtree, com sans-serif
**Label/Mono Font:** JetBrains Mono, só para a cifra

**Character:** um grotesco firme e um pouco excêntrico para tudo o que é pergunta ou título, sobre um sans redondo e calmo para escrever e ler por horas. O mono é dado, não decoração.

### Hierarchy
- **Display** (600, 40px no celular, 60px a partir de `sm`, 1.05, -0.015em): títulos de tela (nome, instruções, retomar, fim). Medida curta (16ch no fim). Uma palavra pode vir em `brand`.
- **Headline** (600, 28px / 34px / 40px, 1.18 a 1.14, -0.015em): a pergunta principal, até 34ch. Também as frases da abertura (28px a 44px, centradas).
- **Title** (500, 20px no celular, 22px a partir de `sm`, 1.375): o enunciado de cada passo. Muda para `warn` quando é o passo que falta.
- **Title pequeno** (600, 15px a 20px): título da prancheta, "Como prefere entregar?", nome nas fichas da abertura, título dos popovers, contador no horizonte (16px a 18px, números tabulares). O número de cada resposta na folha vai em Bricolage semibold na cor da terra.
- **Campo** (Figtree 400, 18px no celular, 20px a partir de `sm`, 1.625): texto digitado nas histórias. O nome na tela inicial é a exceção: digitado em Bricolage, 24px a 30px.
- **Body grande** (Figtree 400, 18px, 1.625): parágrafos de abertura de tela, 46ch a 58ch.
- **Body** (Figtree 400, 15px): botões (600), opções, avisos, popovers. Itens da prancheta e textos de apoio em 14px.
- **Label** (Figtree 400, 13px): dicas de teclado, "Editar". O contador da prancheta em 12px semibold tabular. Nunca em caixa alta.
- **Cifra** (JetBrains Mono 400, 12px a 12.5px, 1.625): prévias na folha (até 3 linhas) e o arquivo selado. No selo, a cifra herda a fonte do próprio campo, porque a resposta vira cifra no lugar.

### Named Rules
**The Mono Is Data Rule.** JetBrains Mono só aparece em conteúdo cifrado e no nome do arquivo gerado. Nunca em títulos, botões ou rótulos de interface.

**The Scale Carries Hierarchy Rule.** A hierarquia é por tamanho e peso do Bricolage, não por cor de fundo, caixa ou rótulo acima do título. Títulos não ganham sobretítulos.

## Layout

Contêiner central de até 1200px com margens laterais de 20px no celular, 40px a partir de `sm` e 64px a partir de `lg`. A barra do topo e o horizonte usam esse contêiner; o conteúdo é uma única coluna de até 760px, centrada nele.

Na barra do topo, o wordmark vai à esquerda (10px de altura no celular, 13px a partir de `sm`). À direita ficam a prancheta, a partir da primeira pergunta, e os dois botões de explicação. No celular, os rótulos encurtam ou viram só ícone e o espaçamento aperta para caber numa linha.

A pergunta começa sempre na mesma linha de base (80px de respiro no topo em `lg`, 56px em `sm`, 40px no celular), qualquer que seja a pergunta. Ritmo vertical: título → campo 24px; passos separados por 32px; ações 32px abaixo do último passo; em telas de abertura, parágrafo → campo/ações 40px. Botões em linha com 12px a 16px de vão, quebrando linha no celular.

O horizonte é `sticky` no pé da tela, com um espaçador de 40px a 56px antes para nunca cobrir o último botão. A prancheta entra pela direita como painel de altura total e 460px de largura a partir de `sm`; no celular sobe de baixo, até 88% da altura.

### Named Rules
**The Fixed Furniture Rule.** Toda pergunta tem a mesma mobília no mesmo lugar: barra do topo com a prancheta, pergunta na coluna central, horizonte no pé. O conteúdo muda; a mobília não se move. O que já foi respondido mora na prancheta, não ao lado da pergunta.

## Elevation & Depth

O sistema é chapado. A profundidade vem do céu em gradiente vertical (as três faixas) e da faixa de terra no pé, que funciona como chão. O conteúdo da página não tem sombra nem fundo próprio; fica direto no céu, separado por linhas de 1px. Só o que flutua sobre a página (popover e prancheta) ganha sombra, sempre difusa e puxada para o marrom.

### Shadow Vocabulary
- **Popover** (`box-shadow: 0 18px 40px -12px rgba(60,30,20,0.35)`): painéis de explicação da barra do topo.
- **Placa** (`box-shadow: 0 -20px 50px -20px rgba(42,23,18,0.5)`): a placa da prancheta sobre o véu.
- **Clipe** (`box-shadow: 0 2px 4px rgba(42,23,18,0.35)`): o clipe preso no topo da placa, o único objeto "físico" pequeno do sistema.

### Named Rules
**The Flat Sky Rule.** Nada repousa sobre o céu com sombra. Sombra é só para o que flutua sobre a página (popover, prancheta); sem glow, sem brilho, sem sombra dura deslocada.

## Shapes

Duas formas, e só duas, na página: a pílula (raio total) para tudo o que se aperta (botões, opções, botões de texto da barra, contador, o sol, os marcos, o botão redondo de 56px da abertura, avatares) e a linha reta de 1px para tudo o que organiza (divisórias de lista, linha de base de 2px dos campos). As superfícies que flutuam têm raios próprios: a placa da prancheta 24px (só do lado de dentro da tela: canto superior no celular, lado esquerdo no computador), a folha e o popover 16px, o clipe 8px. Teclas desenhadas usam 6px. A barra de rolagem é fina (8px), polegar em pílula da cor `line-strong`, sem setas.

Ícones são SVG de traço (1,6 a 2px, pontas redondas, 16px a 24px), em `currentColor`. A marca entra como máscara SVG e herda a cor do lugar (`brand`).

## Components

### Buttons
Firmes, redondos, de uma cor só.
- **Shape:** pílula (`rounded.full`).
- **Primary:** fundo `action`, texto `action-ink`, 15px semibold, 14px por 28px. Hover clareia (brilho 110%), clique escurece (95%).
- **Primary "ainda falta":** quando a pergunta não está completa, o mesmo botão vira contorno de 1,5px em `action` com texto `action`, e continua clicável para mostrar o que falta. Hover ganha `terra-wash`.
- **Ghost:** contorno de 1px em `line-strong`, texto `ink-2`, 14px por 20px. Hover passa o contorno para `action` e o texto para `ink`. Desabilitado a 35%.
- **Ordem:** fantasma ("Voltar") à esquerda, principal à direita.
- **Redondo da abertura:** círculo de 56px em `action` com seta SVG em `action-ink`.

### Chips (opções de passo)
- **Style:** pílula, 10px por 16px, 15px, contorno 1px `line-strong` sobre branco a 35%, texto `ink-2`.
- **State:** marcada vira fundo e contorno `action` com texto `action-ink`. Hover desmarcado puxa contorno para `action`. Papel de rádio dentro de um grupo nomeado; nenhuma vem marcada.

### Cards / Containers
- **Corner Style:** sem cartões na página. Listas (registro de cifra, fichas da abertura, itens da prancheta) são linhas com divisória de 1px e 10px a 20px de respiro vertical.
- **Background:** o próprio céu.
- **Shadow Strategy:** nenhuma na página (ver Elevation & Depth).
- **Painel contido:** só a nota de "Próximo passo" (fundo `terra-wash`, raio 16px, 16px por 20px).

### Inputs / Fields
- **Style:** sem caixa. Fundo transparente, só a linha de base de 2px em `line-strong`, 12px de respiro vertical, texto `ink` em 18px a 20px, placeholder `ink-3`. O campo cresce com o texto.
- **Focus:** a linha de base vira `terra`. O anel de foco global é suprimido em campos porque a linha já marca o foco.
- **Error:** linha de base e aviso em `warn`, aviso abaixo em 15px com espaço reservado (sem pulo de layout).

### Navigation
- **Barra do topo:** wordmark em `brand` à esquerda; à direita, botões de texto em pílula (14px, `ink-2`, ícone SVG de 16px). Hover: `terra-wash` e `ink`.
- **Popover:** até 22rem de largura, raio 16px, papel, 15px, título em Bricolage semibold na cor da terra, sombra de popover. Fecha com Esc ou clique fora.

### A Prancheta (assinatura)
O lugar onde as respostas ficam guardadas.
- **Botão:** na barra do topo, ícone de prancheta em SVG, rótulo "Prancheta" a partir de `sm` e um contador em pílula `action` (12px semibold, tabular, largura mínima de 24px). A cada resposta que chega, o contador dá um pulo (escala 1,35 → 1 em 450ms). É também o alvo do voo do selo.
- **Placa:** `terra-deep`, 460px a partir de `sm` (entra pela direita) ou de largura total até 88% da altura no celular (sobe de baixo), 500ms na curva padrão, sobre o véu `scrim` (300ms). Um clipe de `line` com mola de `line-strong` prende a folha no topo.
- **Folha:** `paper`, raio 16px, tinta `ink`. Cabeçalho com título, uma linha de apoio de 14px e um fechar redondo, separado por `paper-line`. Cada resposta completa é uma linha: número em Bricolage na cor da terra, a pergunta (até 2 linhas, 14px), "Editar" em 13px na cor da terra com sublinhado no hover, e a prévia da cifra em mono `cipher` (até 3 linhas). Depois de selar, a folha mostra o conteúdo real do arquivo em mono 12px.
- **Comportamento:** diálogo modal; o foco vai para o fechar ao abrir e volta para o botão ao fechar; Esc fecha.

### O Selo (assinatura)
Ao avançar uma pergunta completa, a resposta vira a própria prévia da cifra no lugar onde foi escrita, letra por letra, da esquerda para a direita (520ms, começando devagar e acelerando). Espaços e quebras de linha ficam, para o bloco manter a forma do texto; a parte cifrada fica em `cipher` e o resto em `ink`. Em seguida, o bloco voa e encolhe até o botão da prancheta (500ms, `cubic-bezier(0.65, 0, 0.35, 1)`), terminando a 15% de opacidade com 1,5px de desfoque, e o contador pula. A cifra mostrada é a prévia real da resposta, a mesma que a folha exibe. Com `prefers-reduced-motion`, o selo não acontece e a pergunta só avança.

### O Horizonte (assinatura)
A faixa de terra roxa presa no pé da tela. Uma régua de 12px com um marco de 2px por pergunta (alto e a 90% quando respondida, baixo e a 35% quando não), o sol de 20px em `sun` com anel de 2px em `terra` sentado na pergunta atual, e uma linha abaixo com o contador em Bricolage tabular ("06 / 15") e "Faltam N perguntas". O sol anda em 1,4s com a curva padrão; ao terminar, desce atrás da linha e some. Junto com o céu, é o indicador de progresso; não existe outra barra de progresso.

### Movimento
Curva de base `cubic-bezier(0.22, 1, 0.36, 1)`. Entrada de tela 450ms subindo 10px; saída 220ms subindo 6px; elementos pequenos 350ms; prancheta 500ms; céu 1,6s; sol 1,4s. A única curva diferente é a do voo do selo (`cubic-bezier(0.65, 0, 0.35, 1)`), porque ele sai e chega em vez de só pousar. Com `prefers-reduced-motion`, o céu, o sol e o selo não animam e a abertura é pulada.

## Do's and Don'ts

### Do:
- **Do** usar `action`/`action-ink` (não `terra` direto) em todo botão principal, opção marcada e contador que fica sobre o céu, para que funcionem de dia e no anoitecer.
- **Do** separar conteúdo com linhas de 1px em `line` e deixar campos só com a linha de base de 2px.
- **Do** manter os controles em pílula: botão principal 14px por 28px, fantasma 14px por 20px, opção 10px por 16px, todos em 15px.
- **Do** tirar todo tom secundário da família marrom (`ink-2`, `ink-3`, `line`, `line-strong`).
- **Do** mostrar o que já foi respondido na prancheta, como prévia cifrada, em vez de acumular na página.
- **Do** desenhar ícones e teclas em SVG de traço com `currentColor`, nunca com caracteres de seta ou símbolos de fonte.
- **Do** usar a curva `cubic-bezier(0.22, 1, 0.36, 1)` com entrada mais lenta que a saída, e respeitar `prefers-reduced-motion` em toda animação nova.

### Don't:
- **Don't** usar fundo branco chapado com botão azul, nem fundo escuro com neon de "cripto".
- **Don't** usar cinza neutro em texto, linha ou contorno.
- **Don't** usar o laranja do sol fora do marcador do horizonte e da seleção de texto.
- **Don't** colocar conteúdo da página em cartões com sombra; sombra é só para o que flutua (popover, prancheta).
- **Don't** usar glow, brilho ou degradê decorativo; o único degradê é o céu, e ele carrega estado.
- **Don't** mostrar cifra inventada: toda cifra na tela é a prévia real da resposta ou o arquivo real.
- **Don't** usar JetBrains Mono fora da cifra e do nome do arquivo.
- **Don't** pôr sobretítulo ou rótulo em caixa alta acima de títulos; a escala do Bricolage faz a hierarquia.
