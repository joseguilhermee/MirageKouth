"""Gera o par de chaves RSA-4096 usado pelo MirageKouth.

Roda uma unica vez. A chave PRIVADA fica em decryptor/keys/private_key.pem
(nunca deve ser compartilhada nem subir para o site). A chave PUBLICA fica
em decryptor/keys/public_key.pem e tambem eh impressa em formato PEM/base64
para colar direto no codigo do site (web/lib/publicKey.ts).
"""

from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from pathlib import Path

KEYS_DIR = Path(__file__).parent / "keys"
PRIVATE_KEY_PATH = KEYS_DIR / "private_key.pem"
PUBLIC_KEY_PATH = KEYS_DIR / "public_key.pem"


def main() -> None:
    KEYS_DIR.mkdir(exist_ok=True)

    if PRIVATE_KEY_PATH.exists():
        print(f"Ja existe uma chave privada em {PRIVATE_KEY_PATH}.")
        print("Apague o arquivo manualmente se quiser gerar um novo par.")
        return

    private_key = rsa.generate_private_key(public_exponent=65537, key_size=4096)
    public_key = private_key.public_key()

    private_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption(),
    )
    public_pem = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo,
    )

    PRIVATE_KEY_PATH.write_bytes(private_pem)
    PUBLIC_KEY_PATH.write_bytes(public_pem)

    print(f"Chave privada salva em: {PRIVATE_KEY_PATH}")
    print(f"Chave publica salva em: {PUBLIC_KEY_PATH}")
    print()
    print("Cole o conteudo abaixo em web/lib/publicKey.ts:")
    print()
    print(public_pem.decode("utf-8"))


if __name__ == "__main__":
    main()
