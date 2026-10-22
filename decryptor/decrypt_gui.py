"""MirageKouth decryptor — interface grafica.

Mesma logica de decrypt.py (importada daqui, sem duplicar): cole o texto
cifrado que voce recebeu (ou escolha o arquivo .txt) — a decifragem
acontece sozinha, sem clicar em nada. A chave privada default ja vem
preenchida de decryptor/keys/private_key.pem.

Uso:
    python decrypt_gui.py
"""

import json
import re
import sys
from datetime import datetime
from pathlib import Path
from tkinter import filedialog

import customtkinter as ctk
from cryptography.exceptions import InvalidTag
from tkinterdnd2 import DND_FILES, TkinterDnD

from decrypt import (
    DEFAULT_PRIVATE_KEY,
    decrypt_text,
    detail_lines,
    format_timings,
    interpreter_json,
    load_private_key,
)

# Cifra fria -> texto quente: o app inteiro é essa transformação, então a
# paleta reflete isso — neutros escuros e mornos, com um único acento frio
# (o "cipher") marcando tudo que ainda não virou palavra legível.
COLORS = {
    "ink": "#14120e",
    "paper": "#1c1913",
    "hairline": "#2a251c",
    "foreground": "#efe7d8",
    "muted": "#8a8271",
    "cipher": "#48d3c2",
    "cipher_hover": "#3ab8a9",
    "error": "#c1503f",
}

PLACEHOLDER = "cole o texto cifrado que você recebeu\n(ou arraste o arquivo .txt até aqui)"
MIN_CIPHERTEXT_LEN = 12
AUTO_DECRYPT_DELAY_MS = 350
PROGRESS_STEP_MS = 20


def format_result(result: dict) -> str:
    name = result.get("name", "").strip()
    qa = result.get("qa", [])
    quem = f"de {name}" if name else "(sem nome informado)"
    lines = [f"Respostas {quem}", "=" * 40, ""]
    for i, item in enumerate(qa, start=1):
        answer = item.get("answer", "").strip() or "(em branco)"
        lines.append(f"{i:02d}. {item['question']}")
        lines.append(f"    -> {answer}")
        lines.extend(f"    - {line}" for line in detail_lines(item))
        lines.append("")
    footer = format_timings(result)
    if footer:
        lines.append(footer)
    return "\n".join(lines)


def _markdown_answer(text: str) -> str:
    """Preserva as quebras de linha da resposta em Markdown (hard breaks)."""
    lines = text.replace("\r\n", "\n").split("\n")
    return "\n".join(line.rstrip() + "  " if line.strip() else "" for line in lines).strip()


def format_result_markdown(result: dict) -> str:
    """Mesmo conteudo de format_result, porem em Markdown pronto para .md."""
    name = result.get("name", "").strip()
    qa = result.get("qa", [])
    answered = sum(1 for item in qa if item.get("answer", "").strip())

    lines = [f"# Respostas de {name}" if name else "# Respostas (sem nome informado)", ""]
    if name:
        lines.append(f"- **Respondente:** {name}")
    lines.append(f"- **Perguntas:** {len(qa)}")
    lines.append(f"- **Respondidas:** {answered}")
    lines.append(f"- **Decifrado em:** {datetime.now():%d/%m/%Y às %H:%M}")
    lines.extend(["", "---", ""])

    for i, item in enumerate(qa, start=1):
        question = " ".join(str(item.get("question", "")).split())
        answer = str(item.get("answer", "")).strip()
        lines.append(f"### {i:02d}. {question}")
        lines.append("")
        lines.append(_markdown_answer(answer) if answer else "_(em branco)_")
        lines.append("")
        details = detail_lines(item)
        if details:
            lines.extend(f"- {_markdown_answer(line)}" for line in details)
            lines.append("")

    footer = format_timings(result)
    if footer:
        lines.extend(["---", "", footer.replace("\n", "  \n"), ""])

    return "\n".join(lines).rstrip() + "\n"


def markdown_filename(result: dict) -> str:
    """Nome de arquivo sugerido, derivado do nome do respondente."""
    slug = re.sub(r"[^a-z0-9]+", "-", (result.get("name") or "").strip().lower()).strip("-")
    return f"respostas-{slug}.md" if slug else "respostas-descriptografadas.md"


class DecryptorApp(ctk.CTk, TkinterDnD.DnDWrapper):
    def __init__(self) -> None:
        super().__init__()
        self.TkdndVersion = TkinterDnD._require(self)
        ctk.set_appearance_mode("dark")

        self.title("MirageKouth — Decifrador")
        self.geometry("640x760")
        self.minsize(480, 560)
        self.configure(fg_color=COLORS["ink"])

        self.key_path = ctk.StringVar(value=str(DEFAULT_PRIVATE_KEY))
        self.decrypted_result: dict | None = None
        self._is_placeholder = True
        self._debounce_job: str | None = None
        self._progress_job: str | None = None
        self._settings_visible = False

        self._build_fonts()
        self._build_shell()
        self._show_idle()
        self.bind("<Configure>", self._on_resize)

    # ------------------------------------------------------------------
    # construção
    # ------------------------------------------------------------------
    def _build_fonts(self) -> None:
        self.font_mono = ctk.CTkFont(family="Consolas", size=13)
        self.font_mono_sm = ctk.CTkFont(family="Consolas", size=11)
        self.font_serif = ctk.CTkFont(family="Georgia", size=14)
        self.font_serif_lg = ctk.CTkFont(family="Georgia", size=27)
        self.font_ui = ctk.CTkFont(family="Segoe UI", size=12)
        self.font_ui_sm = ctk.CTkFont(family="Segoe UI", size=11)

    def _build_shell(self) -> None:
        self.outer = ctk.CTkFrame(self, fg_color="transparent")
        self.outer.pack(fill="both", expand=True, padx=28, pady=22)

        # -- barra superior: muda de conteúdo conforme o estado ------------
        self.top_row = ctk.CTkFrame(self.outer, fg_color="transparent", height=30)
        self.top_row.pack(fill="x", pady=(0, 16))
        self.top_row.pack_propagate(False)

        self.back_button = self._text_button(self.top_row, "← outro", self._show_idle)

        self.settings_button = self._text_button(self.top_row, "⚙", self._toggle_settings)
        self.settings_button.pack(side="right")
        self.save_button = self._text_button(self.top_row, "salvar…", self._save_result)
        self.md_button = ctk.CTkButton(
            self.top_row, text="Baixar .md", font=self.font_ui, command=self._export_markdown,
            fg_color="transparent", hover_color=COLORS["paper"],
            text_color=COLORS["cipher"], border_width=1, border_color=COLORS["cipher"],
            corner_radius=14, height=28, width=100,
        )
        self.copy_button = ctk.CTkButton(
            self.top_row, text="Copiar", font=self.font_ui, command=self._copy_result,
            fg_color=COLORS["cipher"], hover_color=COLORS["cipher_hover"],
            text_color=COLORS["ink"], corner_radius=14, height=28, width=84,
        )

        # -- painel de configurações (chave privada), oculto por padrão ----
        self.settings_panel = ctk.CTkFrame(self.outer, fg_color=COLORS["paper"], corner_radius=10)
        panel_inner = ctk.CTkFrame(self.settings_panel, fg_color="transparent")
        panel_inner.pack(fill="x", padx=14, pady=12)
        ctk.CTkLabel(
            panel_inner, text="chave privada (.pem)", font=self.font_mono_sm,
            text_color=COLORS["muted"],
        ).pack(anchor="w", pady=(0, 6))
        key_row = ctk.CTkFrame(panel_inner, fg_color="transparent")
        key_row.pack(fill="x")
        ctk.CTkEntry(
            key_row, textvariable=self.key_path, font=self.font_mono_sm,
            fg_color=COLORS["ink"], text_color=COLORS["foreground"],
            border_color=COLORS["hairline"],
        ).pack(side="left", fill="x", expand=True, padx=(0, 8))
        self._text_button(key_row, "escolher…", self._pick_key).pack(side="left")

        # -- corpo: input (placeholder) e resultado, um visível por vez ----
        self.body = ctk.CTkFrame(self.outer, fg_color="transparent")
        self.body.pack(fill="both", expand=True)

        self._build_input_view()
        self._build_result_view()

    def _text_button(self, parent, text, command) -> ctk.CTkButton:
        return ctk.CTkButton(
            parent, text=text, font=self.font_ui, command=command,
            fg_color="transparent", hover_color=COLORS["paper"],
            text_color=COLORS["muted"], corner_radius=8, height=28,
            width=0 if len(text) > 2 else 28,
        )

    # -- estado: colar/entrada ------------------------------------------------
    def _build_input_view(self) -> None:
        self.input_view = ctk.CTkFrame(self.body, fg_color="transparent")

        self.input_box = ctk.CTkTextbox(
            self.input_view, fg_color=COLORS["paper"], text_color=COLORS["muted"],
            font=self.font_mono, corner_radius=14, border_width=1,
            border_color=COLORS["hairline"], wrap="word",
        )
        self.input_box.pack(fill="both", expand=True)
        self.input_box.bind("<FocusIn>", self._clear_placeholder)
        self.input_box.bind("<KeyRelease>", lambda _e: self._begin_decrypt_countdown())
        self.input_box.bind("<<Paste>>", lambda _e: self.after(10, self._begin_decrypt_countdown))

        self.input_box.drop_target_register(DND_FILES)
        self.input_box.dnd_bind("<<DropEnter>>", self._on_drop_enter)
        self.input_box.dnd_bind("<<DropLeave>>", self._on_drop_leave)
        self.input_box.dnd_bind("<<Drop>>", self._on_file_drop)

        self.progress_row = ctk.CTkFrame(self.input_view, fg_color="transparent")
        self.progress_label = ctk.CTkLabel(
            self.progress_row, text="decodificando… 0%", font=self.font_mono_sm,
            text_color=COLORS["muted"], anchor="w",
        )
        self.progress_label.pack(anchor="w", pady=(0, 4))
        self.progress_bar = ctk.CTkProgressBar(
            self.progress_row, height=6, corner_radius=3,
            fg_color=COLORS["hairline"], progress_color=COLORS["cipher"],
        )
        self.progress_bar.set(0)
        self.progress_bar.pack(fill="x")

        self.footer = ctk.CTkFrame(self.input_view, fg_color="transparent")
        self.footer.pack(fill="x", pady=(10, 0))
        self._text_button(self.footer, "ou escolher um arquivo .txt", self._pick_file).pack(
            side="left", padx=0
        )
        ctk.CTkLabel(
            self.footer, text="ou arraste o arquivo aqui", font=self.font_ui_sm,
            text_color=COLORS["muted"],
        ).pack(side="left", padx=(10, 0))

        self.error_banner = ctk.CTkFrame(self.input_view, fg_color=COLORS["paper"], corner_radius=10)
        self._error_stripe = ctk.CTkFrame(self.error_banner, fg_color=COLORS["error"], width=3, corner_radius=0)
        self._error_stripe.pack(side="left", fill="y")
        self.error_label = ctk.CTkLabel(
            self.error_banner, text="", font=self.font_mono_sm, text_color=COLORS["foreground"],
            justify="left", wraplength=520,
        )
        self.error_label.pack(side="left", padx=12, pady=10, fill="x")

        self._set_placeholder()

    # -- estado: resultado -----------------------------------------------------
    def _build_result_view(self) -> None:
        self.result_view = ctk.CTkFrame(self.body, fg_color="transparent")

        self.result_name = ctk.CTkLabel(
            self.result_view, text="", font=self.font_serif_lg, text_color=COLORS["foreground"],
            anchor="w", justify="left",
        )
        self.result_name.pack(anchor="w")
        self.result_meta = ctk.CTkLabel(
            self.result_view, text="", font=self.font_mono_sm, text_color=COLORS["cipher"],
            anchor="w",
        )
        self.result_meta.pack(anchor="w", pady=(4, 16))

        self.result_scroll = ctk.CTkScrollableFrame(
            self.result_view, fg_color="transparent",
            scrollbar_button_color=COLORS["hairline"],
            scrollbar_button_hover_color=COLORS["muted"],
        )
        self.result_scroll.pack(fill="both", expand=True)

    # ------------------------------------------------------------------
    # estados
    # ------------------------------------------------------------------
    def _show_idle(self) -> None:
        self.decrypted_result = None
        self.back_button.pack_forget()
        self.copy_button.pack_forget()
        self.md_button.pack_forget()
        self.save_button.pack_forget()
        self.result_view.pack_forget()
        self.input_view.pack(fill="both", expand=True)
        self._clear_error()
        self._hide_progress_bar()
        self._set_placeholder()
        self.input_box.focus_set()

    def _show_result(self, result: dict) -> None:
        self.decrypted_result = result
        self.input_view.pack_forget()
        self.result_view.pack(fill="both", expand=True)

        self.back_button.pack(side="left")
        self.save_button.pack(side="right")
        self.md_button.pack(side="right", padx=(0, 8))
        self.copy_button.pack(side="right", padx=(0, 8))

        name = result.get("name", "").strip()
        qa = result.get("qa", [])
        answered = sum(1 for item in qa if item.get("answer", "").strip())
        self.result_name.configure(text=name or "Respostas sem nome")
        self.result_meta.configure(
            text=f"{answered} de {len(qa)} respondidas — decifrado às {datetime.now():%H:%M}"
        )

        for child in self.result_scroll.winfo_children():
            child.destroy()
        for i, item in enumerate(qa, start=1):
            self._render_qa_item(i, item)
        footer = format_timings(result)
        if footer:
            ctk.CTkLabel(
                self.result_scroll, text=footer, font=self.font_mono_sm, text_color=COLORS["muted"],
                anchor="w", justify="left",
            ).pack(anchor="w", fill="x", pady=(0, 16))

    def _render_qa_item(self, index: int, item: dict) -> None:
        answer = item.get("answer", "").strip() or "(em branco)"
        details = detail_lines(item)
        if details:
            answer += "\n\n" + "\n".join(f"→ {line}" for line in details)
        row = ctk.CTkFrame(self.result_scroll, fg_color="transparent")
        row.pack(fill="x", pady=(0, 16))
        ctk.CTkLabel(
            row, text=f"{index:02d}  {item.get('question', '')}", font=self.font_mono_sm,
            text_color=COLORS["muted"], anchor="w", justify="left", wraplength=self._content_width(),
        ).pack(anchor="w", fill="x")
        ctk.CTkLabel(
            row, text=answer, font=self.font_serif, text_color=COLORS["foreground"],
            anchor="w", justify="left", wraplength=self._content_width(),
        ).pack(anchor="w", fill="x", pady=(4, 0))
        ctk.CTkFrame(row, fg_color=COLORS["hairline"], height=1).pack(fill="x", pady=(14, 0))

    def _content_width(self) -> int:
        width = self.body.winfo_width()
        return max(width - 40, 300)

    def _on_resize(self, _event=None) -> None:
        if self.decrypted_result is None:
            return
        width = self._content_width()
        for row in self.result_scroll.winfo_children():
            for label in row.winfo_children():
                if isinstance(label, ctk.CTkLabel):
                    label.configure(wraplength=width)

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

    def _set_input_text(self, text: str) -> None:
        self.input_box.delete("1.0", "end")
        self.input_box.insert("1.0", text)
        self.input_box.configure(text_color=COLORS["foreground"])
        self._is_placeholder = False

    def _get_input_text(self) -> str:
        if self._is_placeholder:
            return ""
        return self.input_box.get("1.0", "end").strip()

    def _pick_file(self) -> None:
        path = filedialog.askopenfilename(
            title="Escolha o arquivo cifrado",
            filetypes=[("Arquivos de texto", "*.txt"), ("Todos os arquivos", "*.*")],
        )
        if path:
            self._load_file(Path(path))

    def _load_file(self, path: Path) -> None:
        try:
            content = path.read_text(encoding="utf-8").strip()
        except (OSError, UnicodeDecodeError) as exc:
            self._show_error(f"Não consegui ler o arquivo:\n{exc}")
            return
        self._set_input_text(content)
        self._begin_decrypt_countdown()

    # -- arrastar e soltar -------------------------------------------------
    def _on_drop_enter(self, _event=None) -> None:
        self.input_box.configure(border_color=COLORS["cipher"])

    def _on_drop_leave(self, _event=None) -> None:
        self.input_box.configure(border_color=COLORS["hairline"])

    def _on_file_drop(self, event) -> None:
        self.input_box.configure(border_color=COLORS["hairline"])
        paths = self.tk.splitlist(event.data)
        if not paths:
            return
        self._load_file(Path(paths[0]))

    def _pick_key(self) -> None:
        path = filedialog.askopenfilename(
            title="Escolha a chave privada",
            filetypes=[("Chave PEM", "*.pem"), ("Todos os arquivos", "*.*")],
        )
        if path:
            self.key_path.set(path)
            if not self._is_placeholder:
                self._begin_decrypt_countdown()

    def _toggle_settings(self) -> None:
        self._settings_visible = not self._settings_visible
        if self._settings_visible:
            self.settings_panel.pack(fill="x", pady=(0, 14), before=self.body)
            self.settings_button.configure(text_color=COLORS["cipher"])
        else:
            self.settings_panel.pack_forget()
            self.settings_button.configure(text_color=COLORS["muted"])

    # ------------------------------------------------------------------
    # decifragem — automática, sem botão
    # ------------------------------------------------------------------
    def _begin_decrypt_countdown(self) -> None:
        if self._debounce_job is not None:
            self.after_cancel(self._debounce_job)
        self._show_progress_bar()
        self._tick_progress(0)
        self._debounce_job = self.after(AUTO_DECRYPT_DELAY_MS, self._try_decrypt)

    def _show_progress_bar(self) -> None:
        if not self.progress_row.winfo_ismapped():
            self.progress_row.pack(fill="x", pady=(10, 0), before=self.footer)

    def _hide_progress_bar(self) -> None:
        if self._progress_job is not None:
            self.after_cancel(self._progress_job)
            self._progress_job = None
        self.progress_row.pack_forget()
        self.progress_bar.set(0)
        self.progress_label.configure(text="decodificando… 0%")

    def _tick_progress(self, elapsed_ms: int) -> None:
        fraction = min(elapsed_ms / AUTO_DECRYPT_DELAY_MS, 0.97)
        self.progress_bar.set(fraction)
        self.progress_label.configure(text=f"decodificando… {int(fraction * 100)}%")
        if fraction < 0.97:
            self._progress_job = self.after(
                PROGRESS_STEP_MS, lambda: self._tick_progress(elapsed_ms + PROGRESS_STEP_MS)
            )
        else:
            self._progress_job = None

    def _try_decrypt(self) -> None:
        self._debounce_job = None
        raw = self._get_input_text()

        if not raw:
            self._clear_error()
            self._hide_progress_bar()
            return
        if len(raw) < MIN_CIPHERTEXT_LEN:
            self._hide_progress_bar()
            return

        key_path = Path(self.key_path.get().strip())
        if not key_path.exists():
            self._show_error(
                f"Não achei a chave privada em {key_path}.\n"
                "Escolha o arquivo certo em ⚙, ou rode generate_keys.py primeiro."
            )
            self._hide_progress_bar()
            return

        try:
            private_key = load_private_key(key_path)
            result = decrypt_text(raw, private_key)
        except (ValueError, KeyError, InvalidTag):
            self._show_error(
                "Não consegui decifrar esse conteúdo — verifique se ele não foi "
                "corrompido/editado e se a chave privada é a certa."
            )
            self._hide_progress_bar()
            return
        except Exception as exc:  # nunca trava a janela por um erro inesperado
            self._show_error(f"Erro inesperado ao decifrar:\n{exc}")
            self._hide_progress_bar()
            return

        if self._progress_job is not None:
            self.after_cancel(self._progress_job)
            self._progress_job = None
        self.progress_bar.set(1.0)
        self.progress_label.configure(text="decodificando… 100%")
        self._clear_error()
        self._show_result(result)
        self._hide_progress_bar()

    def _show_error(self, message: str) -> None:
        self.error_label.configure(text=message)
        if not self.error_banner.winfo_ismapped():
            self.error_banner.pack(fill="x", pady=(10, 0))

    def _clear_error(self) -> None:
        self.error_banner.pack_forget()

    # ------------------------------------------------------------------
    # ações sobre o resultado
    # ------------------------------------------------------------------
    def _flash(self, button: ctk.CTkButton, temp_text: str, original_text: str) -> None:
        button.configure(text=temp_text)
        job = getattr(button, "_flash_job", None)
        if job is not None:
            self.after_cancel(job)
        button._flash_job = self.after(1400, lambda: button.configure(text=original_text))

    def _copy_result(self) -> None:
        if not self.decrypted_result:
            return
        text = format_result(self.decrypted_result)
        self.clipboard_clear()
        self.clipboard_append(text)
        self.update()
        self._flash(self.copy_button, "Copiado", "Copiar")

    def _export_markdown(self) -> None:
        if not self.decrypted_result:
            return
        out_path = filedialog.asksaveasfilename(
            title="Baixar respostas em Markdown",
            defaultextension=".md",
            initialfile=markdown_filename(self.decrypted_result),
            filetypes=[("Markdown", "*.md"), ("Todos os arquivos", "*.*")],
        )
        if not out_path:
            return
        self._write_file(out_path, format_result_markdown(self.decrypted_result), self.md_button, "Baixado", "Baixar .md")

    def _save_result(self) -> None:
        if not self.decrypted_result:
            return
        out_path = filedialog.asksaveasfilename(
            title="Salvar resultado descriptografado",
            defaultextension=".txt",
            initialfile="respostas-descriptografadas.txt",
            filetypes=[
                ("Texto", "*.txt"),
                ("Markdown", "*.md"),
                ("JSON", "*.json"),
                ("Todos os arquivos", "*.*"),
            ],
        )
        if not out_path:
            return

        lowered = out_path.lower()
        if lowered.endswith(".json"):
            content = json.dumps(interpreter_json(self.decrypted_result), ensure_ascii=False, indent=2)
        elif lowered.endswith(".md"):
            content = format_result_markdown(self.decrypted_result)
        else:
            content = format_result(self.decrypted_result)
        self._write_file(out_path, content, self.save_button, "salvo", "salvar…")

    def _write_file(self, out_path: str, content: str, button: ctk.CTkButton, temp_text: str, original_text: str) -> None:
        try:
            Path(out_path).write_text(content, encoding="utf-8")
        except OSError as exc:
            self._show_error(f"Erro ao salvar:\n{exc}")
            return
        self._flash(button, temp_text, original_text)


def main() -> None:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    app = DecryptorApp()
    app.mainloop()


if __name__ == "__main__":
    main()
