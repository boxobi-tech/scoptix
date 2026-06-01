/**
 * Extension from pathname only (ignore query/hash), per PRD §4 Tahap 3.
 */
export function pathnameExtensionFromUrl(urlText: string): string | null {
  try {
    const u = new URL(
      urlText.startsWith("http://") || urlText.startsWith("https://") ? urlText : `https://${urlText}`,
    );
    const seg = u.pathname.split("/").pop() ?? "";
    const q = seg.indexOf("?");
    const base = q >= 0 ? seg.slice(0, q) : seg;
    const dot = base.lastIndexOf(".");
    if (dot <= 0) return null;
    return base.slice(dot).toLowerCase();
  } catch {
    return null;
  }
}
