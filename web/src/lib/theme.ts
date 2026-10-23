export type Theme = "light" | "dark";
export const THEME_KEY = "mirage-theme";
const CHANGE_EVENT = "mirage-theme-change";

export function currentTheme(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function applyTheme(theme: Theme) {
  const changed = currentTheme() !== theme;
  // Change canvas, browser chrome and ink together.
  if (changed) document.documentElement.dataset.themeChanging = "true";
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "dark" ? "#2e1f17" : "#f2eee6");
  if (changed) {
    window.dispatchEvent(new Event(CHANGE_EVENT));
    requestAnimationFrame(() => requestAnimationFrame(() => {
      delete document.documentElement.dataset.themeChanging;
    }));
  }
}

export function chooseTheme(theme: Theme) {
  try { localStorage.setItem(THEME_KEY, theme); } catch { /* The current visit still works. */ }
  applyTheme(theme);
}

export function subscribeTheme(callback: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key !== THEME_KEY && event.key !== null) return;
    applyTheme(event.newValue === "light" ? "light" : "dark");
  };
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", onStorage);
  applyTheme(currentTheme());
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", onStorage);
  };
}

// Runs before paint. Dark is the default; an explicit saved choice takes priority.
export const THEME_BOOTSTRAP = `(function(){var t='dark';try{var s=localStorage.getItem('${THEME_KEY}');if(s==='light'||s==='dark')t=s;}catch(e){}document.documentElement.dataset.theme=t;var m=document.querySelector('meta[name="theme-color"]');if(m)m.content=t==='dark'?'#2e1f17':'#f2eee6';})();`;
