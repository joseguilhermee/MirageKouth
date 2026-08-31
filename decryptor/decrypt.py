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

DEFAULT_PRIVATE_KEY = Path(__file__).parent / "keys" / "private_key.pem"


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
        print(f"  {i:02d}. {item['question']}\n      -> {answer}\n")

    if args.out:
        args.out.write_text(
            json.dumps({"name": name, "qa": qa}, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        print(f"Salvo em: {args.out}")


if __name__ == "__main__":
    main()
