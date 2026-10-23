# KOUTH

O site oferece o questionário pessoal `15D`, o Modo Presente `PRESENTE-1` e o
Modo Ocasião Especial `OCASIAO-1` e Para quem eu quero ser `QUEM-1`.
Depois do nome, a pessoa escolhe a finalidade; no presente, quem responde é
quem dá o perfume. Tudo é cifrado no navegador (RSA-4096 +
AES-256-GCM, via Web Crypto API nativa) e baixado como um `.txt`. Só o
script Python local, com a chave privada, consegue abrir esse arquivo.

Ver a identidade atual em `DESIGN.md`. A especificação funcional original
está em `docs/superpowers/specs/2026-08-24-mirage-questionnaire-design.md`.

**Antes de publicar:** edite `web/src/lib/siteConfig.ts` — é o texto que
diz à pessoa, depois do download, para quem enviar o arquivo. Sem isso o
fluxo termina no download sem instrução de próximo passo.

## Estrutura

- `web/` — site Next.js (deploy na Vercel). 100% client-side, sem backend.
- `decryptor/` — scripts Python que rodam localmente e decifram os
  arquivos recebidos. Guardam a chave privada
  (`decryptor/keys/private_key.pem`) — **nunca compartilhe esse arquivo
  nem suba para a Vercel**.
- `Logos/` — assets de marca originais (SVG).

## Rodando o site localmente

```bash
cd web
npm install
npm run dev
```

Abre em http://localhost:3000.

## Gerando um novo par de chaves (só se ainda não existir)

```bash
cd decryptor
pip install -r requirements.txt
python generate_keys.py
```

Isso cria `decryptor/keys/private_key.pem` e `public_key.pem`, e imprime a
chave pública pronta pra colar em `web/src/lib/publicKey.ts`. **Se você já
tem um par gerado, não rode de novo** — geraria um par novo e todo `.txt`
já enviado com a chave pública antiga deixaria de poder ser aberto.

## Decifrando um arquivo recebido

Por linha de comando:

```bash
cd decryptor
python decrypt.py caminho/para/respostas-mirage.txt
```

Opções:

- `--out saida.json` — salva o resultado em JSON.
- `--key outra_chave.pem` — usa outra chave privada.

A saída traz o nome da pessoa e cada pergunta junto com a resposta (ou
"(em branco)"). Gerar arquétipos a partir dessas respostas é uma etapa
futura, ainda não implementada.

No Modo Presente, o JSON decifrado inclui `finalidade`, `presente` e as respostas
`P01`–`P13`. A análise e a escolha do perfume ainda acontecem fora do site.
No Modo Ocasião Especial, O03 fica reservado no campo `momento_do_dia` e não
entra em `answers`; as demais perguntas são exportadas como `O01`–`O11`.
No modo Para quem eu quero ser, o arquivo usa `finalidade: quem_quero_ser`,
versão `QUEM-1` e exporta as perguntas `Y01`–`Y14`. O horizonte escolhido em Y01
aparece no texto de Y09.
Depois de receber o rascunho escrito na voz do doador, ele pode colar, editar
e imprimir a versão atual em `/presente/revisar`. A página não envia
esse texto a um servidor.

Ou pela interface gráfica (mesma lógica, sem terminal) — dá **dois cliques**
em `decryptor/Abrir Decifrador.bat`, ou rode:

```bash
cd decryptor
python decrypt_gui.py
```

Escolha o `.txt` recebido (a chave privada já vem preenchida), clique em
"Descriptografar" e escolha na hora onde salvar o arquivo decifrado
(`.txt` legível ou `.json`).

## Deploy na Vercel

Antes de publicar, com o site local rodando em `http://localhost:3100`, execute em `web/`:

```bash
npm run lint
npm run test:input
npm run test:flows
npm run test:brand
npm run test:delivery
npm run test:appearance
npm run test:ux
```

Os testes usam Microsoft Edge e respostas fictícias. `test:input` cobre a
digitação depois da animação, uma animação sem evento de conclusão e a edição
pela prancheta durante a transição. `test:flows` preenche os quatro modos com
animações ativas, em tamanhos de celular e computador; verifica voltar,
retomar, trocar ramos e cifrar/decifrar os arquivos (requer o decryptor local).
`MIRAGE_E2E_URL` permite conferir outra URL. `MIRAGE_E2E_MODES` e
`MIRAGE_E2E_WIDTH` selecionam modos e largura para uma verificação específica.

A identidade atual segue o brandbook KOUTH e o documento de estratégia em
`REFDESIGN/`, com o sistema visual registrado em `DESIGN.md`. `test:brand`
confere as perguntas por hash e captura a experiência em 320, 390 e 1440 px,
incluindo os dois temas, campos editáveis e painéis informativos abertos.
As capturas usam Edge com toque e celular emulados; não substituem uma
verificação em aparelho físico.

`test:delivery` verifica a conclusão com dados fictícios: foco no modal,
falha de cifra e nova tentativa, cópia real, download, visualização voluntária
do arquivo e retorno para editar. A conclusão não abre o arquivo cifrado
automaticamente; baixar e copiar ficam em primeiro plano.

`test:ux` confere a entrada em um clique nas quatro finalidades, troca de
caminho sem perder o rascunho, foco e centralização de campos novos e pendentes,
viewport reduzido e navegação dos rádios por teclado. `MIRAGE_E2E_MOTION` aceita
`reduce` ou `no-preference`; as capturas registram o viewport real, não apenas a
página inteira.

O `web/` é um app Next.js padrão, sem variáveis de ambiente nem backend —
basta apontar a Vercel para a pasta `web/` como raiz do projeto.
