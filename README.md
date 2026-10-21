# MirageKouth

Questionário de 15 perguntas abertas com visual estilo SpaceX/Tesla. A pessoa
informa o nome e responde; tudo é cifrado no navegador (RSA-4096 +
AES-256-GCM, via Web Crypto API nativa) e baixado como um `.txt`. Só o
script Python local, com a chave privada, consegue abrir esse arquivo.

Ver design completo em `docs/superpowers/specs/2026-08-24-mirage-questionnaire-design.md`.

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

O `web/` é um app Next.js padrão, sem variáveis de ambiente nem backend —
basta apontar a Vercel para a pasta `web/` como raiz do projeto.
