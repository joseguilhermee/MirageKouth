"""MirageKouth decryptor — interface grafica.

Mesma logica de decrypt.py (importada daqui, sem duplicar): cole o texto
cifrado que voce recebeu (ou carregue o arquivo .txt) e clique em
"Descriptografar" — a chave privada default ja vem preenchida de
decryptor/keys/private_key.pem.

Uso:
    python decrypt_gui.py
"""

import json
import sys
from pathlib import Path
from tkinter import filedialog, messagebox

import customtkinter as ctk
from cryptography.exceptions import InvalidTag

from decrypt import DEFAULT_PRIVATE_KEY, decrypt_text, load_private_key

# Paleta "deserto ao entardecer" — a mesma do site (web/src/app/globals.css).
COLORS = {
    "background": "#0c0906",
    "surface": "#17120c",
    "surface_2": "#211a11",
    "foreground": "#f4ecdd",
    "muted": "#a8967d",
    "border": "#2c2318",
    "accent": "#e08a3e",
    "accent_2": "#c85a3f",
    "cipher": "#3fd8b8",
    "error": "#d1453b",
}

PLACEHOLDER = "Cole aqui o texto cifrado que você recebeu…"


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


class DecryptorApp(ctk.CTk):
    def __init__(self) -> None:
        super().__init__()
        ctk.set_appearance_mode("dark")

        self.title("MirageKouth — Decifrador")
        self.geometry("720x760")
        self.minsize(560, 620)
        self.configure(fg_color=COLORS["background"])

        self.key_path = ctk.StringVar(value=str(DEFAULT_PRIVATE_KEY))
        self.decrypted_result: dict | None = None
        self.advanced_visible = False
        self._is_placeholder = True

        self._build_fonts()
        self._build_layout()
        self._set_placeholder()

    # ------------------------------------------------------------------
    # layout
    # ------------------------------------------------------------------
    def _build_fonts(self) -> None:
        self.font_label = ctk.CTkFont(family="Segoe UI", size=11, weight="bold")
        self.font_title = ctk.CTkFont(family="Segoe UI", size=26, weight="bold")
        self.font_body = ctk.CTkFont(family="Segoe UI", size=13)
        self.font_mono = ctk.CTkFont(family="Consolas", size=12)
        self.font_button = ctk.CTkFont(family="Segoe UI", size=13, weight="bold")

    def _build_layout(self) -> None:
        outer = ctk.CTkFrame(self, fg_color="transparent")
        outer.pack(fill="both", expand=True, padx=28, pady=24)

        # -- cabeçalho --------------------------------------------------
        ctk.CTkLabel(
            outer,
            text="D E C I F R A R   R E S P O S T A S",
            font=self.font_label,
            text_color=COLORS["accent"],
        ).pack(anchor="w")
        ctk.CTkLabel(
            outer,
            text="Decifre o arquivo ou texto que você recebeu",
            font=self.font_title,
            text_color=COLORS["foreground"],
        ).pack(anchor="w", pady=(4, 4))
        ctk.CTkLabel(
            outer,
            text=(
                "Cole o texto cifrado, ou carregue o arquivo .txt — a chave "
                "privada default já vem configurada."
            ),
            font=self.font_body,
            text_color=COLORS["muted"],
            justify="left",
        ).pack(anchor="w", pady=(0, 18))

        # -- entrada ------------------------------------------------------
        input_card = ctk.CTkFrame(
            outer, fg_color=COLORS["surface"], corner_radius=14,
            border_width=1, border_color=COLORS["border"],
        )
        input_card.pack(fill="both", expand=False, pady=(0, 14))
        inner = ctk.CTkFrame(input_card, fg_color="transparent")
        inner.pack(fill="both", expand=True, padx=16, pady=16)

        ctk.CTkLabel(
            inner, text="Conteúdo cifrado", font=self.font_label,
            text_color=COLORS["muted"],
        ).pack(anchor="w", pady=(0, 8))

        self.input_box = ctk.CTkTextbox(
            inner, height=140, fg_color=COLORS["surface_2"],
            text_color=COLORS["foreground"], font=self.font_mono,
            corner_radius=10, border_width=1, border_color=COLORS["border"],
            wrap="word",
        )
        self.input_box.pack(fill="both", expand=True)
        self.input_box.bind("<FocusIn>", self._clear_placeholder)
        self.input_box.bind("<FocusOut>", self._restore_placeholder_if_empty)
        self.input_box.bind("<KeyRelease>", lambda _e: self._update_decrypt_button())

        input_buttons = ctk.CTkFrame(inner, fg_color="transparent")
        input_buttons.pack(fill="x", pady=(10, 0))
        self._ghost_button(input_buttons, "Colar da área de transferência", self._paste_clipboard).pack(
            side="left"
        )
        self._ghost_button(input_buttons, "Escolher arquivo…", self._pick_file).pack(
            side="left", padx=(8, 0)
        )
        self._ghost_button(input_buttons, "Limpar", self._clear_input).pack(
            side="left", padx=(8, 0)
        )

        # -- avançado (chave privada) -------------------------------------
        self.advanced_toggle = self._ghost_button(
            outer, "Avançado ▸ chave privada", self._toggle_advanced
        )
        self.advanced_toggle.pack(anchor="w", pady=(0, 6))

        self.advanced_frame = ctk.CTkFrame(outer, fg_color="transparent")
        key_row = ctk.CTkFrame(self.advanced_frame, fg_color="transparent")
        key_row.pack(fill="x")
        ctk.CTkLabel(
            key_row, text="Chave privada (.pem):", font=self.font_body,
            text_color=COLORS["muted"],
        ).pack(side="left")
        ctk.CTkEntry(
            key_row, textvariable=self.key_path, font=self.font_body,
            fg_color=COLORS["surface_2"], text_color=COLORS["foreground"],
            border_color=COLORS["border"],
        ).pack(side="left", fill="x", expand=True, padx=8)
        self._ghost_button(key_row, "Escolher…", self._pick_key).pack(side="left")

        # -- ação -----------------------------------------------------------
        action_row = ctk.CTkFrame(outer, fg_color="transparent")
        action_row.pack(fill="x", pady=(6, 10))
        self.decrypt_button = ctk.CTkButton(
            action_row, text="Descriptografar", font=self.font_button,
            fg_color=COLORS["accent"], hover_color=COLORS["accent_2"],
            text_color=COLORS["background"], corner_radius=20,
            height=42, command=self._decrypt,
        )
        self.decrypt_button.pack(side="left")

        self.status_label = ctk.CTkLabel(
            action_row, text="", font=self.font_body, text_color=COLORS["muted"],
        )
        self.status_label.pack(side="left", padx=(14, 0))

        # -- resultado --------------------------------------------------
        ctk.CTkLabel(
            outer, text="Resultado", font=self.font_label, text_color=COLORS["muted"],
        ).pack(anchor="w", pady=(4, 8))

        self.output_box = ctk.CTkTextbox(
            outer, fg_color=COLORS["surface_2"], text_color=COLORS["foreground"],
            font=self.font_mono, corner_radius=10, border_width=1,
            border_color=COLORS["border"], wrap="word",
        )
        self.output_box.pack(fill="both", expand=True)
        self.output_box.configure(state="disabled")

        result_buttons = ctk.CTkFrame(outer, fg_color="transparent")
        result_buttons.pack(fill="x", pady=(10, 0))
        self.copy_button = self._ghost_button(
            result_buttons, "Copiar resultado", self._copy_result
        )
        self.copy_button.pack(side="left")
        self.save_button = self._ghost_button(
            result_buttons, "Salvar como arquivo…", self._save_result
        )
        self.save_button.pack(side="left", padx=(8, 0))
        self.copy_button.configure(state="disabled")
        self.save_button.configure(state="disabled")

        self._update_decrypt_button()

    def _ghost_button(self, parent, text, command) -> ctk.CTkButton:
        return ctk.CTkButton(
            parent, text=text, font=self.font_body, command=command,
            fg_color="transparent", hover_color=COLORS["surface_2"],
            text_color=COLORS["foreground"], border_width=1,
            border_color=COLORS["border"], corner_radius=16, height=32,
        )

    # ------------------------------------------------------------------
    # placeholder / entrada
    # ------------------------------------------------------------------
    def _set_placeholder(self) -> None:
        self.input_box.delete("1.0", "end")
        self.input_box.insert("1.0", PLACEHOLDER)
        self.input_box.configure(text_color=COLORS["muted"])
        self._is_placeholder = True

    def _clear_placeholder(self, _event=None) -> None:
        if self._is_placeholder:
            self.input_box.delete("1.0", "end")
            self.input_box.configure(text_color=COLORS["foreground"])
            self._is_placeholder = False

    def _restore_placeholder_if_empty(self, _event=None) -> None:
        if not self.input_box.get("1.0", "end").strip():
            self._set_placeholder()
        self._update_decrypt_button()

    def _set_input_text(self, text: str) -> None:
        self.input_box.delete("1.0", "end")
        self.input_box.insert("1.0", text)
        self.input_box.configure(text_color=COLORS["foreground"])
        self._is_placeholder = False
        self._update_decrypt_button()

    def _get_input_text(self) -> str:
        if self._is_placeholder:
            return ""
        return self.input_box.get("1.0", "end").strip()

    def _update_decrypt_button(self) -> None:
        has_text = bool(self._get_input_text())
        self.decrypt_button.configure(state="normal" if has_text else "disabled")

    def _paste_clipboard(self) -> None:
        try:
            text = self.clipboard_get()
        except Exception:
            self.status_label.configure(
                text="A área de transferência está vazia.", text_color=COLORS["muted"]
            )
            return
        if not text.strip():
            self.status_label.configure(
                text="A área de transferência está vazia.", text_color=COLORS["muted"]
            )
            return
        self._set_input_text(text.strip())
        self.status_label.configure(text="Colado.", text_color=COLORS["muted"])

    def _pick_file(self) -> None:
        path = filedialog.askopenfilename(
            title="Escolha o arquivo cifrado",
            filetypes=[("Arquivos de texto", "*.txt"), ("Todos os arquivos", "*.*")],
        )
        if not path:
            return
        try:
            content = Path(path).read_text(encoding="utf-8").strip()
        except Exception as exc:
            messagebox.showerror("Erro ao ler arquivo", str(exc))
            return
        self._set_input_text(content)
        self.status_label.configure(
            text=f"Carregado de {Path(path).name}.", text_color=COLORS["muted"]
        )

    def _clear_input(self) -> None:
        self._set_placeholder()
        self._update_decrypt_button()
        self.status_label.configure(text="", text_color=COLORS["muted"])

    def _pick_key(self) -> None:
        path = filedialog.askopenfilename(
            title="Escolha a chave privada",
            filetypes=[("Chave PEM", "*.pem"), ("Todos os arquivos", "*.*")],
        )
        if path:
            self.key_path.set(path)

    def _toggle_advanced(self) -> None:
        self.advanced_visible = not self.advanced_visible
        if self.advanced_visible:
            self.advanced_frame.pack(fill="x", pady=(0, 14), after=self.advanced_toggle)
            self.advanced_toggle.configure(text="Avançado ▾ chave privada")
        else:
            self.advanced_frame.pack_forget()
            self.advanced_toggle.configure(text="Avançado ▸ chave privada")

    # ------------------------------------------------------------------
    # decifragem
    # ------------------------------------------------------------------
    def _write_output(self, text: str) -> None:
        self.output_box.configure(state="normal")
        self.output_box.delete("1.0", "end")
        self.output_box.insert("1.0", text)
        self.output_box.configure(state="disabled")

    def _decrypt(self) -> None:
        raw = self._get_input_text()
        key_path = Path(self.key_path.get().strip())

        if not raw:
            return
        if not key_path.exists():
            messagebox.showerror(
                "Chave não encontrada",
                f"Não achei a chave privada em {key_path}.\nRode generate_keys.py primeiro.",
            )
            return

        self.copy_button.configure(state="disabled")
        self.save_button.configure(state="disabled")
        self.decrypted_result = None

        try:
            private_key = load_private_key(key_path)
            result = decrypt_text(raw, private_key)
        except (ValueError, KeyError, InvalidTag):
            self.status_label.configure(
                text="Falha ao decifrar — conteúdo corrompido ou chave errada.",
                text_color=COLORS["error"],
            )
            self._write_output(
                "Não foi possível decifrar esse conteúdo.\n\n"
                "Verifique se ele não foi corrompido/editado e se a chave privada "
                "corresponde à chave pública usada no site."
            )
            return
        except Exception as exc:  # erro inesperado — mostra e não trava a janela
            self.status_label.configure(text="Erro inesperado.", text_color=COLORS["error"])
            self._write_output(f"Erro inesperado ao decifrar:\n{exc}")
            return

        self.decrypted_result = result
        name = result.get("name", "").strip()
        qa = result.get("qa", [])
        answered = sum(1 for item in qa if item.get("answer", "").strip())
        quem = f"de {name}" if name else "(sem nome informado)"

        self._write_output(format_result(result))
        self.status_label.configure(
            text=f"Decifrado {quem} — {answered}/{len(qa)} respondidas.",
            text_color=COLORS["accent"],
        )
        self.copy_button.configure(state="normal")
        self.save_button.configure(state="normal")

    def _copy_result(self) -> None:
        if not self.decrypted_result:
            return
        text = format_result(self.decrypted_result)
        self.clipboard_clear()
        self.clipboard_append(text)
        self.update()
        self.status_label.configure(text="Resultado copiado.", text_color=COLORS["muted"])

    def _save_result(self) -> None:
        if not self.decrypted_result:
            return
        out_path = filedialog.asksaveasfilename(
            title="Salvar resultado descriptografado",
            defaultextension=".txt",
            initialfile="respostas-descriptografadas.txt",
            filetypes=[("Texto", "*.txt"), ("JSON", "*.json"), ("Todos os arquivos", "*.*")],
        )
        if not out_path:
            return

        content = (
            json.dumps(self.decrypted_result, ensure_ascii=False, indent=2)
            if out_path.lower().endswith(".json")
            else format_result(self.decrypted_result)
        )
        Path(out_path).write_text(content, encoding="utf-8")
        self.status_label.configure(
            text=f"Salvo em {out_path}", text_color=COLORS["accent"],
        )
        messagebox.showinfo("Salvo", f"Arquivo descriptografado salvo em:\n{out_path}")


def main() -> None:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    app = DecryptorApp()
    app.mainloop()


if __name__ == "__main__":
    main()
