import { Suspense } from "react";
import { PageHeader } from "@/components/page-header";
import { TopBar } from "@/components/top-bar";
import { SettingsClient } from "@/components/settings-client";

function SettingsFallback() {
  return (
    <div className="mt-8 rounded-2xl border border-line bg-black/20 px-5 py-8 text-[13px] text-muted">
      Loading settings…
    </div>
  );
}

export default function SettingsPage() {
  return (
    <>
      <TopBar breadcrumb="/ settings" />
      <main className="min-h-0 flex-1 overflow-y-auto px-6 py-8">
        <PageHeader eyebrow="Configuration" title="Settings" />
        <div className="mt-8">
          <Suspense fallback={<SettingsFallback />}>
            <SettingsClient />
          </Suspense>
        </div>
      </main>
    </>
  );
}
