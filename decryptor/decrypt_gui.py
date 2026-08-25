"""MirageKouth decryptor — interface grafica simples.

Mesma logica de decrypt.py (importada daqui, sem duplicar): escolhe o
arquivo .txt recebido, clica em "Descriptografar" e escolhe na hora onde
salvar o arquivo já decifrado (a chave privada default já vem preenchida
de decryptor/keys/private_key.pem).

Uso:
    python decrypt_gui.py
"""

import json
import sys
import tkinter as tk
from pathlib import Path
from tkinter import filedialog, messagebox, scrolledtext, ttk

from cryptography.exceptions import InvalidTag

from decrypt import DEFAULT_PRIVATE_KEY, decrypt_file, load_private_key


def format_result(result: dict) -> str:
    name = result.get("name", "").strip()
    qa = result.get("qa", [])
    quem = f"de {name}" if name else "(sem nome informado)"
    lines = [f"Respostas {quem}", "=" * 40, ""]
    for i, item in enumerate(qa, start=1):
        answer = item.get("answer", "").strip() or "(em branco)"
        lines.append(f"{i:02d}. {item['question']}")
        lines.append(f"    -> {answer}")
        lines.append("")
    return "\n".join(lines)


class DecryptorApp(tk.Tk):
    def __init__(self) -> None:
        super().__init__()
        self.title("MirageKouth — Decifrador")
        self.geometry("640x560")
        self.minsize(480, 400)

        self.file_path = tk.StringVar()
        self.key_path = tk.StringVar(value=str(DEFAULT_PRIVATE_KEY))
        self.file_path.trace_add("write", lambda *_: self._update_decrypt_button())

        self._build_layout()
        self._update_decrypt_button()

    def _build_layout(self) -> None:
        pad = {"padx": 12, "pady": 8}

        intro = ttk.Label(
            self,
            text="Escolha o arquivo .txt que você recebeu e clique em Descriptografar.",
            foreground="#555",
        )
        intro.pack(fill="x", padx=12, pady=(12, 0))

        file_frame = ttk.Frame(self)
        file_frame.pack(fill="x", **pad)
        ttk.Label(file_frame, text="Arquivo cifrado (.txt):").pack(anchor="w")
        row = ttk.Frame(file_frame)
        row.pack(fill="x")
        ttk.Entry(row, textvariable=self.file_path, state="readonly").pack(
            side="left", fill="x", expand=True
        )
        ttk.Button(row, text="Escolher arquivo…", command=self._pick_file).pack(
            side="left", padx=(6, 0)
        )

        action_frame = ttk.Frame(self)
        action_frame.pack(fill="x", **pad)
        self.decrypt_button = ttk.Button(
            action_frame, text="Descriptografar", command=self._decrypt_and_save
        )
        self.decrypt_button.pack(side="left")

        advanced = ttk.LabelFrame(self, text="Avançado")
        advanced.pack(fill="x", padx=12, pady=(0, 8))
        row2 = ttk.Frame(advanced)
        row2.pack(fill="x", padx=8, pady=6)
        ttk.Label(row2, text="Chave privada (.pem):").pack(side="left")
        ttk.Entry(row2, textvariable=self.key_path).pack(
            side="left", fill="x", expand=True, padx=6
        )
        ttk.Button(row2, text="Escolher…", command=self._pick_key).pack(side="left")

        self.status_label = ttk.Label(self, text="", foreground="#555")
        self.status_label.pack(fill="x", padx=12)

        self.output = scrolledtext.ScrolledText(self, wrap="word")
        self.output.pack(fill="both", expand=True, padx=12, pady=(6, 12))
        self.output.configure(state="disabled")

    def _update_decrypt_button(self) -> None:
        has_file = bool(self.file_path.get().strip())
        self.decrypt_button.configure(state="normal" if has_file else "disabled")

    def _pick_file(self) -> None:
        path = filedialog.askopenfilename(
            title="Escolha o arquivo cifrado",
            filetypes=[("Arquivos de texto", "*.txt"), ("Todos os arquivos", "*.*")],
        )
        if path:
            self.file_path.set(path)
            self.status_label.configure(text="", foreground="#555")

    def _pick_key(self) -> None:
        path = filedialog.askopenfilename(
            title="Escolha a chave privada",
            filetypes=[("Chave PEM", "*.pem"), ("Todos os arquivos", "*.*")],
        )
        if path:
            self.key_path.set(path)

    def _write_output(self, text: str) -> None:
        self.output.configure(state="normal")
        self.output.delete("1.0", "end")
        self.output.insert("1.0", text)
        self.output.configure(state="disabled")

    def _decrypt_and_save(self) -> None:
        file_path = Path(self.file_path.get().strip())
        key_path = Path(self.key_path.get().strip())

        if not file_path.exists():
            messagebox.showerror("Arquivo não encontrado", f"Não achei: {file_path}")
            return
        if not key_path.exists():
            messagebox.showerror(
                "Chave não encontrada",
                f"Não achei a chave privada em {key_path}.\nRode generate_keys.py primeiro.",
            )
            return

        try:
            private_key = load_private_key(key_path)
            result = decrypt_file(file_path, private_key)
        except (ValueError, KeyError, InvalidTag):
            self.status_label.configure(
                text="Falha ao decifrar — arquivo corrompido ou chave errada.",
                foreground="#b3261e",
            )
            self._write_output(
                "Não foi possível decifrar esse arquivo.\n\n"
                "Verifique se ele não foi corrompido/editado e se a chave privada "
                "corresponde à chave pública usada no site."
            )
            return
        except Exception as exc:  # erro inesperado — mostra e não trava a janela
            self.status_label.configure(text="Erro inesperado.", foreground="#b3261e")
            self._write_output(f"Erro inesperado ao decifrar:\n{exc}")
            return

        # Decifrou com sucesso — já pergunta onde salvar o arquivo decifrado.
        out_path = filedialog.asksaveasfilename(
            title="Salvar arquivo descriptografado",
            defaultextension=".txt",
            initialfile="respostas-descriptografadas.txt",
            filetypes=[("Texto", "*.txt"), ("JSON", "*.json"), ("Todos os arquivos", "*.*")],
        )

        name = result.get("name", "").strip()
        qa = result.get("qa", [])
        answered = sum(1 for item in qa if item.get("answer", "").strip())
        quem = f"de {name}" if name else "(sem nome informado)"

        readable = format_result(result)
        self._write_output(readable)

        if not out_path:
            self.status_label.configure(
                text=f"Decifrado {quem} — {answered}/{len(qa)} respondidas (não salvo).",
                foreground="#8a6d00",
            )
            return

        content = (
            json.dumps(result, ensure_ascii=False, indent=2)
            if out_path.lower().endswith(".json")
            else readable
        )
        Path(out_path).write_text(content, encoding="utf-8")

        self.status_label.configure(
            text=f"Decifrado {quem} — {answered}/{len(qa)} respondidas. Salvo em {out_path}",
            foreground="#1a7f37",
        )
        messagebox.showinfo("Salvo", f"Arquivo descriptografado salvo em:\n{out_path}")


def main() -> None:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    app = DecryptorApp()
    app.mainloop()


if __name__ == "__main__":
    main()
