import net from "node:net";

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "metadata.google.internal",
  "metadata",
  "169.254.169.254",
]);

export function assertUrlSafeForServerFetch(rawUrl: string) {
  let u: URL;
  try {
    u = new URL(rawUrl.trim());
  } catch {
    throw new Error("Invalid URL for deep fetch");
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") {
    throw new Error("Only http(s) URLs allowed for deep fetch");
  }
  const host = u.hostname.toLowerCase();
  if (BLOCKED_HOSTNAMES.has(host)) throw new Error("Blocked host");
  if (host.endsWith(".localhost") || host.endsWith(".local")) {
    throw new Error("Blocked host suffix");
  }
  if (net.isIPv4(host)) {
    if (isPrivateOrReservedIpv4(host)) throw new Error("Blocked IPv4");
  }
  if (net.isIPv6(host)) {
    if (isPrivateOrReservedIpv6(host)) throw new Error("Blocked IPv6");
  }
}

function isPrivateOrReservedIpv4(ip: string): boolean {
  const parts = ip.split(".").map((x) => parseInt(x, 10));
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) return true;
  const [a, b] = parts;
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 0) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  return false;
}

function isPrivateOrReservedIpv6(ip: string): boolean {
  const lower = ip.toLowerCase();
  if (lower === "::1") return true;
  if (lower.startsWith("fe80:")) return true;
  if (lower.startsWith("fc") || lower.startsWith("fd")) return true;
  return false;
}
