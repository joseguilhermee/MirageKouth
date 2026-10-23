---
name: KOUTH
description: Primeiro a pessoa. Depois o perfume; acolhimento e precisão em uma conversa pessoal.
colors:
  action: "#54331d"
  action-ink: "#fbf8f2"
  ink: "#31281e"
  ink-2: "#594b3d"
  ink-3: "#71614f"
  surface: "#f2eee6"
  field: "#fbf9f5"
  control: "#f8f5ef"
  line: "#d9cfc0"
  line-strong: "#a4917b"
  focus: "#78583c"
  warn: "#914020"
  cipher: "#5c6250"
  warm-suede: "#9c8166"
  terra-wash: "rgb(84 51 29 / 0.055)"
  dark-surface: "#2e1f17"
  dark-field: "#35271e"
  dark-action: "#dcc6a5"
  dark-ink: "#f2eadd"
  dark-ink-2: "#d5c6b2"
  dark-ink-3: "#bdaa92"
  dark-line: "#584635"
  dark-line-strong: "#8d755a"
  dark-focus: "#d3b286"
  dark-warn: "#f0b396"
  dark-cipher: "#c8cfb6"
  dark-control: "#38291e"
  dark-wash: "rgb(220 198 165 / 0.07)"
typography:
  display:
    fontFamily: "Noto Serif Display, Georgia, serif"
    fontSize: "52px"
    fontWeight: 300
    lineHeight: 1.15
  headline:
    fontFamily: "Noto Serif Display, Georgia, serif"
    fontSize: "40px"
    fontWeight: 400
    lineHeight: 1.14
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Noto Serif Display, Georgia, serif"
    fontSize: "22px"
    fontWeight: 500
    lineHeight: 1.375
  body:
    fontFamily: "Figtree, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.625
  field:
    fontFamily: "Figtree, sans-serif"
    fontSize: "20px"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "Figtree, sans-serif"
    fontSize: "15px"
    fontWeight: 500
    lineHeight: 1.4
  cipher:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.625
rounded:
  button: "3px"
  input: "4px"
  field: "6px"
  clip: "8px"
  overlay: "16px"
  clipboard: "24px"
  full: "9999px"
spacing:
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "20px"
  "6": "24px"
  "8": "32px"
  "10": "40px"
  "14": "56px"
  "16": "64px"
  "20": "80px"
components:
  button-primary:
    backgroundColor: "{colors.action}"
    textColor: "{colors.action-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.button}"
    padding: "13px 25px"
  button-waiting:
    backgroundColor: "transparent"
    textColor: "{colors.action}"
    rounded: "{rounded.button}"
    padding: "13px 25px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.button}"
    padding: "13px 25px"
  choice:
    backgroundColor: "{colors.control}"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.button}"
    padding: "12px 18px"
  choice-selected:
    backgroundColor: "{colors.action}"
    textColor: "{colors.action-ink}"
    rounded: "{rounded.button}"
    padding: "12px 18px"
  field:
    backgroundColor: "{colors.field}"
    textColor: "{colors.ink}"
    typography: "{typography.field}"
    rounded: "{rounded.field}"
    padding: "18px 20px"
  input:
    backgroundColor: "{colors.field}"
    textColor: "{colors.ink}"
    rounded: "{rounded.input}"
    padding: "12px 16px"
  popover:
    backgroundColor: "{colors.field}"
    textColor: "{colors.ink}"
    rounded: "{rounded.overlay}"
    padding: "20px"
    width: "22rem"
---

# Design System: KOUTH

## Overview

**Creative North Star: "Primeiro a pessoa. Depois o perfume."**

A KOUTH recebe, escuta e guarda com discrição. Papel claro, marrons de madeira e couro, serifas de contraste e espaço negativo traduzem a identidade, a exclusividade e o acolhimento da marca. A sofisticação está na contenção, na imagem original e na precisão dos controles; o ritmo respeita uma conversa longa.

A autoridade visual é o brandbook KOUTH de 2026 e a estratégia fornecidos em REFDESIGN, com transcrições e contatos em `.impeccable/brand-reference/`. Esta documentação substitui a identidade anterior de terra roxa, céu em gradiente e sol de progresso. Os nomes legados `terra`, `sun`, `sky` e `spark` no código não autorizam restaurá-la. PRODUCT.md permanece a autoridade funcional.

**Key Characteristics:**
- Papel e madeira como relações de cor, com fotografia de matéria verdadeira.
- Títulos serifados, respostas e controles em sans legível.
- Campos visivelmente editáveis, ações reconhecíveis e progresso discreto.
- Uma pergunta por vez, com respostas guardadas e editáveis.
- Claro e escuro na mesma família quente.

Base de extração: `globals.css`, `layout.tsx`, `ui.ts`, `motion.ts`, `theme.ts` e componentes finais; contatos do brandbook; capturas de recepção e pergunta a 1440px, pergunta escura a 390px e finalidade a 320px em `.impeccable/review/kouth/`. As capturas documentam esses estados, sem representar aprovação irrestrita de toda a experiência. O popover mobile foi ajustado no Header; a validação completa dos fluxos pertence ao relatório de revisão, não a esta extração visual.

## Colors

A paleta é quente, mineral e contida. O frontmatter registra os valores normativos; os nomes abaixo explicam seus usos.

### Primary
- **Saddle Leather** (`action`): ações principais, opção marcada, borda da ação pendente e marca. `brand`, `terra` e `paper-brand` são aliases contextuais no código.
- **Tinta de ação** (`action-ink`): conteúdo claro sobre a ação.

### Secondary
- **Warm Suede** (`warm-suede`): referência material do brandbook, aplicada ao clipe no escuro; não é outra cor de ação.

### Tertiary
- **Foco quente** (`focus`): contorno de teclado e campo em edição.
- **Aviso** (`warn`): preenchimento que falta, acompanhado de mensagem.
- **Cifra oliva** (`cipher`): dado cifrado real.

### Neutral
- **Smoked Oak** (`ink`): texto no claro e estrutura da prancheta.
- **Papel** (`surface`): tela clara; **papel de escrita** (`field`): campos, folha e popovers.
- **Tintas de apoio** (`ink-2`, `ink-3`): parágrafos secundários, dicas e placeholders.
- **Linhas** (`line`, `line-strong`): separação editorial e limites de controles.
- **Controle** (`control`): opção desmarcada. `terra-wash` fornece lavagem translúcida no hover e nas notas.
- **Fluted Glass** (`dark-surface`): tela escura. Os demais tokens `dark-*` registram campo marrom, tinta marfim, ação bege e foco quente. Folha e popovers também invertem.

**The Warm Inversion Rule.** No escuro e na tela final com `data-sky="night"`, usar os papéis semânticos de ação, tinta, campo e papel juntos; não fixar uma cor clara dependente do tema.

O escuro é o padrão, inclusive no HTML inicial e quando o armazenamento está indisponível. Uma escolha explícita persiste em `mirage-theme`, aplica-se antes da primeira pintura e não altera respostas ou progresso. Apagar a preferência restaura o padrão escuro. A tela final pode usar a paleta escura independentemente dessa preferência. Variáveis antigas de cena não estabelecem um gradiente.

Textura: papel original do brandbook (`web/public/brand/paper-grain.webp`), extraído da página 5, xref 73. O fundo da página e o painel de recepção usam uma camada estática atrás do conteúdo, com `pointer-events: none`, escala (720px 405px), `soft-light`, filtro neutro e opacidade (0.30) no escuro / (0.08) no claro. Campos, botões, fotografia e folha modal continuam lisos. Não há grão animado nem textura sintética gerada em CSS.

## Typography

**Display Font:** Noto Serif Display, com Georgia e serif.
**Body Font:** Figtree, com sans-serif.
**Label/Mono Font:** JetBrains Mono, com monospace, somente para cifra e arquivo.

Noto Serif Display é a adaptação web implementada, escolhida entre os testes da consultora. O brandbook indica IvyPresto, mas não foi fornecido um arquivo instalável dessa família. Quiet Sans e as fontes manuscritas do documento não estão carregadas na interface.

### Hierarchy
- **Display:** recepção leve (300), tamanho (52px), reduzido para (44px) no desktop compacto/tablet e (36px) no celular; itálico pontual na segunda frase.
- **Headline:** pergunta em peso regular, tamanho (28px / 34px / 40px), entrelinha (1.18 / 1.14), tracking (-0.025em), até (34ch).
- **Títulos de tela:** nome e final em (40px / 60px); finalidade em (38px / 60px). São variantes observadas, não uma escala única.
- **Title:** enunciados de passo (20px / 22px), peso médio; finalidades (25px), peso regular.
- **Body:** aberturas em (18px), entrelinha (1.625), medidas de aproximadamente (43ch a 52ch). Apoio em (14px a 16px).
- **Field:** Figtree regular (18px / 20px), entrelinha (1.625); placeholder (16px).
- **Label:** ações e escolhas (15px), peso médio; navegação (14px), dicas (13px), progresso (12px / 14px) com algarismos tabulares.
- **Cipher:** mono pequeno para cifra e arquivo. A transformação da resposta preserva a geometria da fonte do campo.

**The Living Text Rule.** Perguntas, opções, respostas e instruções são texto vivo e selecionável; não colocá-las em imagens nem substituí-las por slogans.

## Layout

A entrevista usa contêiner de até (1200px), com margens internas de (20px), (40px) a partir de (640px) e (64px) a partir de (1024px). O conteúdo ocupa coluna central de até (760px), sem cartão externo. O respiro superior da pergunta cresce de (40px) para (56px) e (80px).

O cabeçalho tem marca à esquerda e navegação à direita, permitindo quebra em telas estreitas. Wordmark com altura (21px / 26px). Rótulos encurtam ou viram ícones com nome acessível. Popovers mantêm margens de (20px) no celular; a partir de (640px), ancoram ao gatilho com largura (22rem).

A recepção usa duas colunas (44% / 56%), foto sticky e corpo de até (820px). Abaixo de (1024px), a foto vira faixa superior de (240px); abaixo de (640px), (180px), e o corpo usa margens internas de (24px). A imagem não se sobrepõe a campos. Essa composição pertence à recepção e não é um padrão para todas as telas.

Ritmo: título → campo (24px), passos (32px) entre si, ações (32px) após o conteúdo. Ações quebram linha com vãos de (12px / 16px). Campos crescem com a resposta. Progresso sticky no rodapé, com fundo da tela, borda superior e área segura inferior; a última ação deve continuar alcançável.

## Elevation & Depth

As telas são planas; a fotografia fornece luz e matéria. Contornos e diferenças tonais distinguem os controles. Profundidade de interface se concentra em popover e prancheta modal.

### Shadow Vocabulary
- **Popover:** difusa (0 18px 40px -12px rgba(60,30,20,0.35)).
- **Prancheta:** separação do plano (0 -20px 50px -20px rgba(42,23,18,0.5)).
- **Clipe:** sombra pequena (0 2px 4px rgba(42,23,18,0.35)).

**The Quiet Surface Rule.** Conteúdo de entrevista fica no plano da página; sombras pertencem às superfícies sobrepostas.

## Shapes

Ações e opções usam cantos discretos (3px), campos curtos (4px), respostas (6px). Pílulas permanecem nos pequenos controles de cabeçalho e contadores; não são mais a forma universal de ação. A finalidade usa seta de navegação, pois a escolha abre imediatamente seu caminho. Divisórias e contornos têm (1px).

Popover e folha usam raio (16px); estrutura da prancheta (24px) nos cantos voltados para a página; clipe (8px). Ícones são SVG de traço em `currentColor`, normalmente (16px).

Logotipo e monograma originais estão em `web/public/brand/`, aplicados como máscaras SVG com proporções preservadas. A foto `presence.webp` foi extraída do PDF fornecido. Reutilizar os arquivos e sua proveniência; não redesenhar o wordmark com uma fonte nem imitar a fotografia.

## Components

### Buttons
Retangulares e calmos: altura mínima (50px), padding (13px 25px), ou (13px 20px) no celular; texto médio (15px). Principal em `action`/`action-ink`, hover com mistura de (15%) de tinta. Fantasma com contorno `line-strong`, texto `ink-2`, hover tonal e borda de ação. A variante pendente mantém contorno de ação e continua acionável para apontar o que falta. Desabilitados reduzem opacidade. Voltar precede o avanço.

### Chips
Opções de passo: altura mínima (48px), padding (12px 18px), contorno fino e raio de botão. Marcadas usam `action`/`action-ink`; hover reforça borda. Mantêm semântica de rádio e grupo nomeado, sem seleção inicial. Não são tags decorativas.

### Cards / Containers
Perguntas ficam direto sobre a tela. Finalidades, demonstrações, registros e a entrega usam linhas. A folha de respostas é superfície sobreposta, não padrão para encaixotar cada pergunta.

### Inputs / Fields
Respostas: fundo próprio, contorno completo, altura mínima (110px), padding (18px 20px), ou (16px) no celular. Campos curtos: altura mínima (56px), padding (12px 16px). Foco muda a borda e mostra anel (2px), afastado (3px). Erro muda a borda para aviso e acompanha mensagem com espaço reservado. Foco geral usa anel (2px), afastado (4px).

### Navigation
Wordmark original e botões discretos com ícones. Os alvos do cabeçalho têm mínimo de (44px), e “Respostas” continua visível no celular. Em telas estreitas, aparência fica ao lado da marca e os controles de apoio ocupam a linha seguinte. Popovers seguem o tema, respeitam margens mobile e fecham com Esc ou clique fora. Aparência, respostas e explicações não competem com o enunciado. A privacidade distingue rascunho local e arquivo final; detalhes de algoritmos só aparecem sob demanda.

### Finalidades e progresso
Quatro linhas amplas de navegação com título serifado e seta à direita, altura mínima (78px), padding vertical (20px), divisória inferior. Cada botão entra diretamente na finalidade, sem “Continuar” nem outra confirmação. “Escolher outra opção” é ação secundária de (13px) com alvo de (44px), somente na primeira pergunta; alternar preserva os rascunhos. Presente mantém sua configuração necessária e a revisão dos dados na primeira pergunta da entrevista.

O campo aberto por uma escolha recebe foco sem o salto nativo inicial; o bloco de enunciado e resposta é centralizado na área útil, descontado o rodapé. A rolagem é suave, ou imediata com movimento reduzido, e acompanha apenas o redimensionamento inicial do teclado. Campos que surgem enquanto a pessoa digita não roubam o foco. Uma área de respiro inferior de (45svh) mantém espaço de rolagem após a primeira solicitação de foco, sem colapsar durante a digitação. Tentativa de avançar incompleta conduz ao primeiro campo pendente. Setas, Home e End navegam nos rádios sem lançar a pessoa ao campo; Enter/Espaço confirmam a opção.

Progresso por linha (2px), contagem textual e `role="progressbar"`, sem horizonte ou sol. Transição de largura (300ms), desativada com movimento reduzido. Na conclusão, o rodapé passa a fluxo normal para não cobrir instruções de entrega; durante as perguntas, permanece sticky.

### Prancheta e selo
Respostas guardadas continuam editáveis. Prancheta lateral no desktop (460px), inferior no celular até (88dvh), folha tonal e título “Suas respostas”. Revisão e edição lideram; a prévia cifrada real fica recolhida em um disclosure. O diálogo usa `showModal()` nativo para conter o foco e tornar o fundo inativo; fecha com Esc, botão ou clique fora, liberando o modal antes de devolver o foco. Editar tem alvo mínimo de (44px). O selo transforma o texto na prévia real antes de guardá-lo; não usa cifra inventada.

Curva comum `cubic-bezier(0.22, 1, 0.36, 1)`: entrada (300ms), saída (180ms), pequenos elementos (350ms), prancheta (500ms). Entradas CSS da recepção (250ms a 450ms). Selo: transformação (520ms), pausa (320ms), voo (750ms), curva própria `cubic-bezier(0.42, 0, 0.2, 1)`. Respeitar `prefers-reduced-motion`; animação não pode ser condição para concluir.

### Encerramento e presente
Antes de selar, título serifado e convite para rever. Após sucesso, a conclusão reconhece a conversa pelo nome, mostra um registro discreto com monograma e contagem, e promove baixar/copiar a ações principais. Arquivo cifrado só abre por pedido explícito; nunca interrompe a conclusão automaticamente. O próximo passo explica que a pessoa ainda precisa enviar o arquivo à KOUTH. Nova tentativa aparece em caso de erro; regenerar não compete com a entrega pronta. Presente mantém revisão e edição antes de imprimir. A identidade não altera perguntas, ramificações, validação, cifragem ou finalidade dos arquivos; regras completas em PRODUCT.md.

## Do's and Don'ts

### Do:
- **Do** usar papéis semânticos de tinta, ação, campo e papel nos dois temas.
- **Do** preservar texto vivo, campos com contorno completo e foco visível.
- **Do** usar Noto Serif Display nos títulos e Figtree em respostas e controles.
- **Do** reutilizar marca e fotografia originais com sua proveniência.
- **Do** manter progresso discreto, contagem textual e navegação estável.
- **Do** preservar os quatro caminhos, perguntas e revisão do presente conforme PRODUCT.md.
- **Do** respeitar movimento reduzido.

### Don't:
- **Don't** restaurar terra roxa, céu em gradiente ou sol de progresso por nomes legados do código.
- **Don't** colocar perguntas ou controles dentro de imagens.
- **Don't** declarar IvyPresto ou Quiet Sans como fontes carregadas.
- **Don't** inventar textura CSS, depoimentos, estatísticas ou promessas de segurança.
- **Don't** substituir o logotipo original por texto digitado.
- **Don't** usar neon de cripto ou sombra em cada pergunta.
- **Don't** mostrar respostas reais em exemplos ou cifra decorativa como dado real.
