import { PageHeader } from "@/components/page-header";
import { TopBar } from "@/components/top-bar";
import { ScanDetailClient } from "@/components/scan-detail-client";

export default async function ScanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const shortId = id.length > 8 ? `${id.slice(0, 6)}…` : id;

  return (
    <>
      <TopBar breadcrumb={`/ scans / ${shortId}`} />
      <main className="min-h-0 flex-1 overflow-y-auto px-6 py-8">
        <PageHeader
          eyebrow="Job queue"
          title="Scan detail"
          description="Progress refreshes automatically about every 2 seconds (polling)."
        />
        <div className="mt-8 glass-panel rounded-2xl p-6">
          <ScanDetailClient id={id} />
        </div>
      </main>
    </>
  );
}
