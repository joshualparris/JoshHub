export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({
    ok: true,
    service: "JoshMemory continuity status",
    updated: "2026-09-15",
    sharedStorage: {
      type: "private-github-append-only",
      repository: "joshualparris/JoshDashboard4",
      root: "joshmemory-cloud/v1",
      workstationRequired: false,
    },
    authority: {
      code: "canonical GitHub repository and live checkout",
      memory: "historical continuity/context to verify",
      rule: "live Git/API/machine evidence overrides stored handoffs when they disagree",
    },
    sharedRecordTypes: [
      "session handoffs",
      "durable project facts",
      "accountability references",
    ],
    privatePayloadsExposedHere: false,
    source: "https://github.com/joshualparris/JoshMemory",
    history:
      "https://github.com/joshualparris/JoshMemory/blob/main/docs/CLOUD_CONTINUITY_HISTORY.md",
  });
}
