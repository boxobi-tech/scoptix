import "dotenv/config";

import { Worker } from "bullmq";
import Redis from "ioredis";
import { ScanJobStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { runScanJob } from "../lib/scan-pipeline";
import { SCAN_QUEUE_NAME } from "../lib/queue";
import { resolveAppEncryptionKey } from "../lib/app-encryption";

const url = process.env.REDIS_URL ?? "redis://127.0.0.1:6379";

/** BullMQ recommends a dedicated connection for the worker subscriber. */
const bullConnection = new Redis(url, { maxRetriesPerRequest: null });
/** Separate connection for rotator / quota Redis operations. */
const redis = new Redis(url, { maxRetriesPerRequest: null });

async function main() {
  // Ensure encryption is usable before processing jobs.
  await resolveAppEncryptionKey(prisma);

  const worker = new Worker(
    SCAN_QUEUE_NAME,
    async (job) => {
      const scanJobId = job.data.scanJobId as string;
      await runScanJob(prisma, redis, scanJobId);
    },
    { connection: bullConnection, concurrency: 1 },
  );

  worker.on("failed", async (job, err) => {
    const id = job?.data?.scanJobId as string | undefined;
    if (!id) return;

    // If the scan was cancelled by the user, don't overwrite the CANCELLED status with FAILED
    if (err instanceof Error && err.message === "Scan cancelled by user") return;

    try {
      await prisma.scanJob.update({
        where: { id },
        data: {
          status: ScanJobStatus.FAILED,
          errorMessage: err instanceof Error ? err.message : String(err),
          completedAt: new Date(),
        },
      });
    } catch {
      // Record may have been deleted (e.g. target was removed) — safe to ignore
      console.warn(`[worker] could not update scan ${id} to FAILED (record may be deleted)`);
    }
  });

  worker.on("completed", (job) => {
    console.info(`[worker] completed job ${job.id}`);
  });

  console.info(`[worker] listening on ${SCAN_QUEUE_NAME} (concurrency=1)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
