import { PER_KEY_MONTHLY, effectiveIntervalSec } from "../lib/quota-constants";

function main() {
  const activeKeys = Number(process.argv[2] ?? "1");

  console.log(`activeKeys=${activeKeys}`);
  console.log(`effectiveIntervalSec=${effectiveIntervalSec(activeKeys)} sec`);
  console.log(`=> 1 request every ${effectiveIntervalSec(activeKeys)}s`);
  console.log(`=> ~${Math.floor(60 / effectiveIntervalSec(activeKeys))} req/min globally`);
  console.log(`=> per-key daily cap: 500 req, monthly cap: ${PER_KEY_MONTHLY} req`);
}

main();
