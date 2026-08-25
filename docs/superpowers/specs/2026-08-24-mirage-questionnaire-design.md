# MirageKouth — Questionário Criptografado (Design)

Data: 2026-08-24
Status: Aprovado pelo usuário, pronto para virar plano de implementação.

## Objetivo

Um questionário de 48 perguntas pessoais/leves, hospedado na Vercel (Next.js,
client-side puro), com visual no estilo SpaceX/Tesla e a identidade visual
MirageKouth. As respostas são cifradas no navegador da pessoa e baixadas como
um `.txt`. Esse arquivo só pode ser lido por um script Python local
("MirageKouth decryptor"), que mais tarde vai gerar arquétipos a partir das
respostas (fora de escopo desta versão — só decifrar por enquanto).

A UX precisa transmitir confiança sem soar vigilante: a pessoa deve sentir
que está gerando algo divertido (seu arquétipo) e que o processo é seguro,
nunca que "alguém específico vai devassar minhas respostas".

## Não-objetivos desta fase

- Lógica de geração de arquétipos a partir das respostas (fica para depois).
- Qualquer backend/API/banco de dados — o site é 100% estático/client-side.
- Autenticação, contas de usuário, múltiplos idiomas.
- Testes automatizados formais (projeto pessoal; validação é manual).
- Controle de versão automatizado nesta fase — sem `git init` por enquanto,
  a pedido do usuário.

## Arquitetura

Dois projetos independentes na raiz de `CryptoMIRAGE/`:

- **`web/`** — Next.js (App Router), TypeScript, deploy na Vercel. Nenhuma
  API route é necessária: toda a criptografia roda no navegador via Web
  Crypto API nativa (`window.crypto.subtle`), sem lib externa de crypto.
- **`decryptor/`** — script Python standalone (`decrypt.py` + script de
  geração de chaves), roda só na máquina do usuário.
- **`Logos/`** (já existe) — assets de marca (SVGs monocromáticos brancos:
  emblema + wordmark horizontal/vertical), usados no header e em telas de
  destaque. Como são brancos, exigem fundo escuro (combina com o visual
  pretendido).

## Par de chaves e modelo de confiança

- RSA-4096 gerado uma única vez por um script utilitário em `decryptor/`.
- Chave **pública**: embutida como constante no código de `web/` (pode ficar
  visível a qualquer um — só serve para cifrar, nunca para decifrar).
- Chave **privada**: salva localmente (ex.: `decryptor/keys/private_key.pem`),
  nunca sobe para a Vercel, entra em `.gitignore` se algum dia houver git.
- Ninguém além de quem roda `decrypt.py` com essa chave privada consegue ler
  o conteúdo do `.txt` gerado.

## Fluxo de dados

1. Pessoa acessa o site e responde as 48 perguntas, uma por tela.
2. Enquanto digita, um painel ao lado mostra a cifra real (AES-GCM) da
   resposta atual em hex/base64, atualizando em tempo real — reforço visual
   de confiança, mas usando a cifra de verdade (não é decoração fake).
3. Ao clicar **"Gerar Criptografia"**:
   - As 48 respostas viram um objeto JSON.
   - Uma chave AES-256 é gerada (única, por submissão).
   - O JSON é cifrado com AES-256-GCM (IV aleatório de 12 bytes).
   - A chave AES é envelopada com RSA-OAEP + SHA-256 (chave pública).
   - O pacote `{ encryptedKey, iv, ciphertext, authTag }` é serializado em
     base64 e baixado como `respostas-mirage.txt`.
   - Nada é enviado para nenhum servidor — o download acontece inteiramente
     no navegador.
4. O usuário (dono do projeto) recebe esse `.txt` e roda localmente:
   `python decrypt.py respostas-mirage.txt` → o script desembrulha a chave
   AES com a chave privada RSA, decifra o JSON e imprime/salva as 48
   perguntas e respostas em texto legível (JSON formatado ou `.txt` simples).
   Geração de arquétipo fica para uma iteração futura.

## Copy / tom de confiança (importante)

A mensagem explicativa (ícone de cadeado com seta/"i" no canto, abre um
tooltip ou painel pequeno) deve:

- Falar do **processo** ("suas respostas são criptografadas no seu
  navegador, com o mesmo padrão de segurança usado por bancos, antes mesmo
  de saírem da sua tela"), não da **custódia da chave**.
- Pode mencionar que as respostas criptografadas vão para o sistema
  MirageKouth para gerar o arquétipo da pessoa — isso é a proposta de valor,
  não algo a esconder.
- Evitar qualquer frase do tipo "só quem tem a chave privada consegue abrir"
  — tecnicamente verdadeiro, mas soa como "alguém está de posse de algo seu",
  o que pode deixar a pessoa na defensiva e enviesar respostas mesmo em
  perguntas triviais ("qual sua cor preferida?").
- Tom: leve, convidativo, nunca jurídico/assustador.

## UI/UX

- Fundo quase preto (`#0A0A0F` ou similar), tipografia geométrica bold em
  caixa alta para títulos, bastante espaço negativo, glow sutil — linguagem
  visual SpaceX/Tesla.
- Emblema MirageKouth fixo no header (SVG de `Logos/`, já branco — funciona
  direto sobre fundo escuro).
- Barra de progresso fina no topo (ex.: "12/48").
- Uma pergunta por tela, navegação por Enter ou clique, transições suaves
  (fade/slide). Permite voltar e editar respostas anteriores.
- Respostas podem ficar em branco (não bloqueiam avanço), com leve incentivo
  visual a preencher.
- Painel "seu texto criptografado" ao lado/abaixo do input, mostrando a
  cifra real da resposta atual se decompondo em blocos hex/base64 conforme a
  pessoa digita.
- Tela final: resumo + botão grande **"Gerar Criptografia"**, com uma
  animação de "processando" (linhas estilo terminal: "Derivando chave...",
  "Cifrando payload...", "Selando arquivo...") antes do download disparar.
- Ícone de cadeado com seta/"i" num canto discreto, abrindo o texto
  explicativo curto descrito acima.

## Erros e casos de borda

- Navegador sem suporte a Web Crypto API (raríssimo): mensagem amigável de
  fallback, sem crash.
- Download bloqueado pelo navegador: instrução simples de como permitir.
- Nenhuma validação de servidor é necessária (sem servidor).

## Decryptor (Python)

- Rudimentar por escolha do usuário: um único script, sem testes formais,
  sem CLI sofisticada — recebe o caminho do `.txt` como argumento, usa a
  chave privada de um caminho fixo/configurável, imprime e salva o JSON
  decifrado. Sem lógica de arquétipo nesta fase.

## Validação

Sem suíte de testes automatizada. Validação manual de ponta a ponta: rodar o
site localmente (`next dev`), gerar um `.txt` real respondendo o
questionário, e confirmar que `decrypt.py` consegue abrir e mostrar as
respostas corretamente.
