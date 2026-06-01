import { Queue } from "bullmq";
import { getRedis } from "@/lib/redis";

export const SCAN_QUEUE_NAME = "recon-scan";

export function getScanQueue() {
  const connection = getRedis();
  return new Queue(SCAN_QUEUE_NAME, { connection });
}
