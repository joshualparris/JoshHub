"use client";

import { PageHeader } from "@/components/ui/page-header";
import { CSVImportPreview } from "@/components/inventory/csv-import";
import { InfoIcon } from "lucide-react";

export default function ProjectImportPage() {
  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        kicker="Inventory"
        title="Import Project Audit"
        subtitle="Merge disk audit data from GitHub Copilot with your JoshHub inventory."
        tone="onDark"
      />

      <div className="rounded-lg border p-4 bg-muted/20">
        <div className="flex itecare2-center gap-2 mb-2">
          <InfoIcon className="h-4 w-4" />
          <h4 className="font-semibold">Read-Only Preview</h4>
        </div>
        <p className="text-sm">
          This tool runs entirely in your browser. It does not modify any files on your disk. 
          Use the preview to identify mismatches and conflicts before manually updating your project data.
        </p>
      </div>

      <CSVImportPreview />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-bold">Matching Logic</h3>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
            <li><strong>Exact Name:</strong> Case-insensitive match on the project name.</li>
            <li><strong>Local Path:</strong> Exact match on the absolute file path.</li>
            <li><strong>Repository:</strong> Exact match on the git repository URL.</li>
            <li><strong>Conflicts:</strong> Highlighted when the audit data differs from your current verified inventory.</li>
          </ul>
        </div>
        <div className="space-y-4">
          <h3 className="text-lg font-bold">Next Steps</h3>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
            <li>Review the conflicts highlighted in red.</li>
            <li>Identify "Source of Truth" projects for duplicates found in the audit.</li>
            <li>Export the merged result to help update <code>src/data/apps.ts</code>.</li>
            <li>Use the Cleanup Dashboard to prioritize projects for archiving.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
