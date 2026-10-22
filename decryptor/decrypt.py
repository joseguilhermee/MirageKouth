"""MirageKouth decryptor.

Le um .txt gerado pelo site (envelope RSA-OAEP-4096 + AES-256-GCM em
base64), decifra com a chave privada local e imprime/salva as respostas
em JSON legivel.

Uso:
    python decrypt.py caminho/para/respostas-mirage.txt
    python decrypt.py caminho/para/respostas-mirage.txt --out saida.json
    python decrypt.py caminho/para/respostas-mirage.txt --key outra_chave.pem

Geracao de arquetipos a partir das respostas fica para uma proxima etapa.
"""

import argparse
import base64
import json
import sys
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from cryptography.exceptions import InvalidTag
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives.ciphers.aead import AESGCM


def _app_dir() -> Path:
    """Pasta base do app: a do script em dev, ou a extraída pelo PyInstaller
    quando rodando como .exe empacotado (onefile)."""
    if getattr(sys, "frozen", False):
        return Path(getattr(sys, "_MEIPASS", Path(sys.executable).parent))
    return Path(__file__).parent


DEFAULT_PRIVATE_KEY = _app_dir() / "keys" / "private_key.pem"


def load_private_key(path: Path):
    if not path.exists():
        sys.exit(
            f"Chave privada nao encontrada em {path}.\n"
            "Rode generate_keys.py primeiro, ou aponte --key para o arquivo certo."
        )
    return serialization.load_pem_private_key(path.read_bytes(), password=None)


def decrypt_text(raw: str, private_key) -> dict:
    """Retorna {"name": str, "qa": [{"question", "answer"}, ...]} a partir do
    conteudo cifrado (base64) já em memória, sem depender de um arquivo."""
    envelope = json.loads(base64.b64decode(raw.strip()))

    encrypted_key = base64.b64decode(envelope["encryptedKey"])
    iv = base64.b64decode(envelope["iv"])
    ciphertext = base64.b64decode(envelope["ciphertext"])

    aes_key = private_key.decrypt(
        encrypted_key,
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None,
        ),
    )

    plaintext = json.loads(AESGCM(aes_key).decrypt(iv, ciphertext, None))
    # Compatibilidade com o formato antigo (lista pura, sem nome).
    if isinstance(plaintext, list):
        return {"name": "", "qa": plaintext}
    return plaintext


def detail_lines(item: dict) -> list[str]:
    """Botoes marcados e campo extra de uma pergunta, uma linha cada.

    Arquivos antigos nao tem esses campos: retorna lista vazia."""
    # 15D em diante: passos na ordem em que apareceram, "pergunta: resposta".
    if "passos" in item:
        return [
            f"{(p.get('pergunta') or '').strip()}: {(p.get('resposta') or '').strip() or '(em branco)'}"
            for p in item.get("passos") or []
        ]
    lines = []
    for choice in item.get("choices") or []:
        answer = (choice.get("answer") or "").strip() or "(sem marcação)"
        prompt = (choice.get("prompt") or "").strip()
        if not prompt:
            prompt = " / ".join(choice.get("options") or [])
        lines.append(f"{prompt}: {answer}")
        specify = (choice.get("specify") or "").strip()
        if specify:
            lines.append(f"   especificou: {specify}")
    extra = item.get("extra")
    if extra:
        answer = (extra.get("answer") or "").strip() or "(em branco)"
        lines.append(f"Extra — {extra.get('prompt', '')}: {answer}")
    return lines


TIMINGS_NOTICE ="(Interpretador: ignore estes dados)"


# Arquivos do site antes de 21/10/2026 nao traziam id nem versao: com 15
# perguntas, a ordem de exibicao era esta (a Q15 aparece em 5o lugar).
FALLBACK_IDS_15B = [
    "Q01", "Q02", "Q03", "Q04", "Q15", "Q05", "Q06", "Q07",
    "Q08", "Q09", "Q10", "Q11", "Q12", "Q13", "Q14",
]


def _fmt_seconds(seconds) -> str:
    minutes, secs = divmod(int(seconds), 60)
    return f"{minutes:02d}:{secs:02d}s"


def interpreter_json(result: dict) -> dict:
    """Formato entregue ao interpretador: respondente, versao, answers[] e,
    por ultimo, os tempos marcados para serem ignorados."""
    qa = result.get("qa", [])
    fallback = FALLBACK_IDS_15B if len(qa) == len(FALLBACK_IDS_15B) else None
    answers = []
    for i, item in enumerate(qa):
        qid = item.get("id") or (fallback[i] if fallback else f"Q{i + 1:02d}")
        if "passos" in item:
            answers.append({
                "id": qid,
                "text": (item.get("answer") or "").strip(),
                "passos": [
                    {
                        "tipo": p.get("tipo", ""),
                        "pergunta": (p.get("pergunta") or "").strip(),
                        "resposta": (p.get("resposta") or "").strip(),
                    }
                    for p in item.get("passos") or []
                ],
            })
            continue
        choices = item.get("choices") or []
        keys = ["B"] if len(choices) == 1 else [f"B{c}" for c in range(1, len(choices) + 1)]
        botoes = {k: (ch.get("answer") or "").strip() for k, ch in zip(keys, choices)}
        especifique = {
            k: (ch.get("specify") or "").strip()
            for k, ch in zip(keys, choices)
            if (ch.get("specify") or "").strip()
        }
        extra = item.get("extra") or {}
        entry = {
            "id": qid,
            "text": (item.get("answer") or "").strip(),
            "botoes": botoes,
        }
        # So aparece quando a pessoa especificou algo, para nao poluir o JSON.
        if especifique:
            entry["especifique"] = especifique
        entry["extra"] = (extra.get("answer") or "").strip()
        answers.append(entry)

    out = {
        "respondente": (result.get("name") or "").strip(),
        "versao": result.get("version") or ("15B" if fallback else ""),
        "answers": answers,
    }
    timings = result.get("timings")
    if timings:
        tempos = {"aviso": TIMINGS_NOTICE}
        for entry, seconds in zip(answers, timings):
            tempos[entry["id"]] = _fmt_seconds(seconds)
        out["tempos"] = tempos
    return out


def format_timings(result: dict) -> str:
    """Rodape com o tempo gasto em cada pergunta; vazio se o arquivo nao tem tempos."""
    timings = result.get("timings")
    if not timings:
        return ""
    lines = [f"Tempo por pergunta {TIMINGS_NOTICE}"]
    for i, seconds in enumerate(timings, start=1):
        minutes, secs = divmod(int(seconds), 60)
        lines.append(f"Q{i}: {minutes:02d}:{secs:02d}s")
    return "\n".join(lines)


def decrypt_file(input_path: Path, private_key) -> dict:
    """Retorna {"name": str, "qa": [{"question", "answer"}, ...]}."""
    return decrypt_text(input_path.read_text(encoding="utf-8"), private_key)


def main() -> None:
    parser = argparse.ArgumentParser(description="Decifra um arquivo do MirageKouth.")
    parser.add_argument("arquivo", type=Path, help="Caminho do .txt cifrado")
    parser.add_argument("--key", type=Path, default=DEFAULT_PRIVATE_KEY, help="Chave privada PEM")
    parser.add_argument("--out", type=Path, default=None, help="Salvar resultado em JSON")
    args = parser.parse_args()

    private_key = load_private_key(args.key)

    if not args.arquivo.exists():
        sys.exit(f"Arquivo nao encontrado: {args.arquivo}")

    try:
        result = decrypt_file(args.arquivo, private_key)
    except (ValueError, KeyError, InvalidTag):
        sys.exit(
            "Nao foi possivel decifrar esse arquivo. Verifique se ele nao foi "
            "corrompido/editado e se a chave privada corresponde a chave "
            "publica usada no site."
        )

    name = result.get("name", "").strip()
    qa = result.get("qa", [])
    answered = sum(1 for item in qa if item.get("answer", "").strip())

    quem = f" de {name}" if name else " (sem nome informado)"
    print(f"\n{len(qa)} perguntas decifradas com sucesso{quem} ({answered} respondidas):\n")
    for i, item in enumerate(qa, start=1):
        answer = item.get("answer", "").strip() or "(em branco)"
        print(f"  {i:02d}. {item['question']}\n      -> {answer}")
        for line in detail_lines(item):
            print(f"      - {line}")
        print()

    footer = format_timings(result)
    if footer:
        print(footer + "\n")

    if args.out:
        args.out.write_text(
            json.dumps(interpreter_json(result), ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        print(f"Salvo em: {args.out}")


if __name__ == "__main__":
    main()
