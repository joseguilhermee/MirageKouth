# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- Conhecidos do dono (amigos, funcionários, parentes, gente de trabalho) que
  recebem o link dele e respondem sozinhos, no tempo deles, pelo celular ou pelo
  computador.
- São 15 perguntas abertas sobre episódios reais da própria vida, e responder
  pode levar horas. A pessoa pode parar e voltar, porque o progresso fica salvo
  no navegador.
- No fim, ela gera um arquivo cifrado e o envia ao dono, que é o único que
  consegue abri-lo.

## Product Purpose

Recolher histórias reais da vida de uma pessoa, a cena e o que ela fez quando algo
custava, para que o dono e uma IA intérprete leiam ali os 12 arquétipos de Carol
Pearson, a partir de Jung.

Sucesso é a pessoa chegar ao fim das 15 perguntas, respondendo com histórias
concretas e sem se cansar, confiando que o que escreveu está protegido.

## Positioning

- Não é teste de múltipla escolha nem tem pontuação. O site pede episódios, e a
  leitura é interpretativa, a partir da identidade narrativa de McAdams.
- As respostas são cifradas no próprio aparelho de quem responde, e só o dono
  consegue abri-las.

## Operating Context

- **No site:** nome → finalidade. `Para mim` segue para instruções e as 15 perguntas
  `15D`; `Para presente` abre a entrevista `PRESENTE-1` sobre quem vai receber;
  `Para uma ocasião especial` abre `OCASIAO-1` sobre a situação desejada;
  `Para quem eu quero ser` abre `QUEM-1` sobre a pessoa que quer se tornar.
  Os quatro caminhos terminam em arquivo cifrado (`.txt`) para baixar ou copiar.
- **Fora do site:** a pessoa envia o arquivo ao dono, e ele decifra na própria
  máquina, com o decryptor local.
- Cada pergunta tem a principal em texto livre e depois passos curtos, um de cada
  vez (botão de escolha única ou texto curto). Alguns botões decidem o passo
  seguinte. Versão atual do conjunto: `15D`.

## Capabilities and Constraints

### Fixos: não mudam em trabalho de design

- **Perguntas, passos e botões** (`web/src/lib/questions.ts`): o texto, as
  opções, a ordem, a árvore de ramos e as regras de quando cada passo aparece
  ficam exatamente como estão.
- **Regras de preenchimento:** tudo é obrigatório. A principal exige no mínimo
  10 caracteres; cada passo que aparece exige botão marcado ou texto de no mínimo
  2 caracteres. Nenhum botão vem marcado.
- **Cifra:** RSA-OAEP-4096 + AES-256-GCM no navegador, via Web Crypto. Sem
  backend, e nada é enviado a servidor. O arquivo sai sempre cifrado do aparelho
  de quem responde.
- **Entrega:** os quatro formatos são identificados por `finalidade`; o decryptor
  apresenta os passos na ordem exibida e mantém O03 em `momento_do_dia`, fora de `answers`.
- O decryptor e a chave privada nunca vão para o git nem para a Vercel.

### Livres

- Todo o design e toda a UX: visual, tema (inclusive claro), cores (o laranja
  atual não é obrigatório), tipografia, layout, movimento, introdução, telas de
  instrução e de fim, e a forma de apresentar cada pergunta e cada passo, desde
  que as regras fixas acima continuem valendo.

### Técnico

- Stack: Next.js (versão com mudanças incompatíveis; ler
  `web/node_modules/next/dist/docs` antes de mexer), React, framer-motion,
  Tailwind. Deploy na Vercel pela CLI, sem integração com o git.
- O progresso fica no `localStorage`; a chave muda quando o conjunto de
  perguntas muda.
- O tempo gasto em cada pergunta vai no arquivo, marcado para o intérprete
  ignorar.

## Brand Commitments

- **Nome visível:** KOUTH, conforme o brandbook fornecido em outubro de 2026.
  Identificadores técnicos `mirage-*` continuam para preservar os rascunhos existentes.
- **Autoridade de marca:** `REFDESIGN/Kouth_Brandbook.pptx (1).pdf` e
  `REFDESIGN/Kouth_VF_2.docx`. Primeiro a pessoa, depois o perfume:
  identidade, exclusividade e acolhimento, com comunicação íntima e precisa.
- **Assets atuais:** logotipo vetorial e imagem sensorial originais extraídos
  do brandbook em `web/public/brand/`, com origem registrada. Os arquivos em
  `Logos/` pertencem à identidade anterior.
- **Língua:** português do Brasil, em toda a interface.
- **Créditos de método:** Jung, Carol Pearson (*The Hero Within*, 1986) e McAdams.
- O Modo Presente fala do perfume e permite ao doador revisar e editar o texto antes de imprimir.

## Evidence on Hand

- O site no ar e o código em `web/`.
- Respostas reais e perfis gerados ficam fora do repositório, no cofre Obsidian do
  dono. São dados pessoais e não podem aparecer em nenhuma tela, exemplo ou
  material.
- **Não existem:** depoimentos publicados, números de respondentes, imprensa.
  Nada disso pode ser inventado.

## Product Principles

1. **Dá para passar horas aqui.** O ritmo, o conforto de leitura e de escrita e a
   sensação de avanço importam mais que o efeito do primeiro minuto.
2. **Parecer confiável, não só ser.** A pessoa precisa sentir que o que escreve
   está protegido, e a tela só pode prometer sobre a cifra o que o código faz.
3. **A história é a resposta.** A interface pede o episódio e sai do caminho; nada
   de rótulos que resumam a pessoa por ela.
4. **Um passo de cada vez.** Nunca mais de uma pergunta nova por vez; o que já foi
   respondido continua visível e editável.
5. **Obrigatório sem ser hostil.** Bloquear em branco, mas dizer com calma o que
   falta e que "nunca aconteceu" já conta.

## Accessibility & Inclusion

- Funcionar bem no celular, do início ao fim das 15 perguntas.
- Texto longo em campos que crescem; atalho Ctrl+Enter para avançar.
- Botões com papéis de rádio e grupos com nome para leitor de tela.
- Respeitar `prefers-reduced-motion`: já tratado em `globals.css` e na
  `IntroSequence`; toda animação nova precisa respeitar também.
