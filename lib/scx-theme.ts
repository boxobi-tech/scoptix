/** Scoptix (scx) theme localStorage keys — CSS/DOM theme API stays unchanged. */

export const SCX_STORAGE_THEME = "scx-theme";
export const SCX_STORAGE_ACCENT_HUE = "scx-accent-hue";

/** Legacy keys from Recon Intelligence branding — migrated on read. */
export const SCX_LEGACY_STORAGE_THEME = "recon-theme";
export const SCX_LEGACY_STORAGE_ACCENT_HUE = "recon-accent-hue";

export type ThemeMode = "scoptix" | "dark" | "light-mist";

/** Teal accent (~#4dc4b2) — default for dark / light-mist. */
export const SCX_DEFAULT_ACCENT_HUE = 168;

/** Green accent (~#16a34a) — default for Scoptix mockup when none stored. */
export const SCX_DEFAULT_ACCENT_HUE_SCOPTIX = 142;

export function defaultAccentHueForTheme(theme: ThemeMode): number {
  return theme === "scoptix" ? SCX_DEFAULT_ACCENT_HUE_SCOPTIX : SCX_DEFAULT_ACCENT_HUE;
}

export function readStoredThemeMode(): ThemeMode {
  try {
    const current = localStorage.getItem(SCX_STORAGE_THEME);
    if (current === "scoptix" || current === "light-mist" || current === "dark") return current;

    const legacy = localStorage.getItem(SCX_LEGACY_STORAGE_THEME);
    if (legacy === "scoptix" || legacy === "light-mist" || legacy === "dark") {
      localStorage.setItem(SCX_STORAGE_THEME, legacy);
      localStorage.removeItem(SCX_LEGACY_STORAGE_THEME);
      return legacy as ThemeMode;
    }
  } catch {
    // ignore
  }
  return "scoptix";
}

export function readStoredAccentHue(theme: ThemeMode = "scoptix"): number {
  const fallback = defaultAccentHueForTheme(theme);
  try {
    const current = localStorage.getItem(SCX_STORAGE_ACCENT_HUE);
    if (current != null) {
      const n = Number(current);
      if (Number.isFinite(n)) return Math.max(0, Math.min(360, Math.round(n)));
    }

    const legacy = localStorage.getItem(SCX_LEGACY_STORAGE_ACCENT_HUE);
    if (legacy != null) {
      const n = Number(legacy);
      if (Number.isFinite(n)) {
        const hue = Math.max(0, Math.min(360, Math.round(n)));
        localStorage.setItem(SCX_STORAGE_ACCENT_HUE, String(hue));
        localStorage.removeItem(SCX_LEGACY_STORAGE_ACCENT_HUE);
        return hue;
      }
    }
  } catch {
    // ignore
  }
  return fallback;
}
