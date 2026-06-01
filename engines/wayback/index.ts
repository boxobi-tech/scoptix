import axios from "axios";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function fetchWaybackUrls(domain: string): Promise<string[]> {
  const cdxUrl = `https://web.archive.org/cdx/search/cdx?url=${domain}/*&collapse=urlkey&output=text&fl=original`;
  console.log(`[wayback] Fetching: ${cdxUrl}`);

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await axios.get(cdxUrl, {
        timeout: 300_000,
        responseType: "text",
        transformResponse: [(data: string) => data],
        validateStatus: () => true,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        headers: { "User-Agent": UA },
      });

      console.log(`[wayback] Response status=${res.status}, type=${typeof res.data}, length=${String(res.data).length} (attempt ${attempt})`);

      if (res.status === 200 && typeof res.data === "string" && res.data.length > 0) {
        const urls = res.data.split("\n").map((line: string) => line.trim()).filter((line: string) => line.length > 0);
        console.log(`[wayback] Parsed ${urls.length} URLs for ${domain}`);
        return urls;
      }

      if (res.status === 503 && attempt < MAX_RETRIES) {
        console.warn(`[wayback] 503 for ${domain}, retrying in ${RETRY_DELAY_MS / 1000}s... (attempt ${attempt}/${MAX_RETRIES})`);
        await sleep(RETRY_DELAY_MS);
        continue;
      }

      console.warn(`[wayback] No results for ${domain} (status=${res.status})`);
      return [];
    } catch (err) {
      if (attempt < MAX_RETRIES) {
        console.warn(`[wayback] Error for ${domain}, retrying... (attempt ${attempt}/${MAX_RETRIES})`, err);
        await sleep(RETRY_DELAY_MS);
        continue;
      }
      console.error(`[wayback] Failed to fetch for ${domain} after ${MAX_RETRIES} attempts:`, err);
      return [];
    }
  }

  return [];
}
