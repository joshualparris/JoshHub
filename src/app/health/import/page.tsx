"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { CloudUpload, Sparkles, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { db } from "@/lib/db/dexie";
import { addDigitalEvent, addHealthImport, recordActivity } from "@/lib/db/health";
import { useActivities, useDailyMetrics, useDigitalEvents, useHealthImports } from "@/lib/db/hooks";
import type { ActivitySport } from "@/lib/db/schema";

type ImportOutcome = {
  fileName: string;
  status: "success" | "error";
  message: string;
};

export default function HealthImportPage() {
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<ImportOutcome[]>([]);
  const [lastSummary, setLastSummary] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const dailyMetrics = useDailyMetrics();
  const imports = useHealthImports();
  const activities = useActivities();
  useDigitalEvents(); // ensure subscription

  const stats7d = useMemo(() => compute7dStats(dailyMetrics ?? []), [dailyMetrics]);

  const handleFiles = useCallback(async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setImporting(true);
    const outcomes: ImportOutcome[] = [];
    let activitiesAdded = 0;
    const updatedDays = new Set<string>();

    for (const file of Array.from(fileList)) {
      try {
        const text = await file.text();
        const lower = file.name.toLowerCase();
        if (lower.endsWith(".tcx")) {
          const parsed = parseTcx(text, file.name);
          if (parsed.activity) {
            const activity = await recordActivity(parsed.activity);
            if (activity.startTimeIso) updatedDays.add(activity.startTimeIso.slice(0, 10));
            activitiesAdded += 1;
            await addHealthImport({
              fileName: file.name,
              status: "success",
              message: parsed.message,
              sourceType: "tcx",
              sizeBytes: file.size,
              rawPreview: previewText(text),
            });
            outcomes.push({ fileName: file.name, status: "success", message: parsed.message ?? "Imported" });
          } else {
            await addHealthImport({
              fileName: file.name,
              status: "error",
              message: parsed.message ?? "Unknown parsing issue",
              sourceType: "tcx",
              sizeBytes: file.size,
              rawPreview: previewText(text),
            });
            outcomes.push({
              fileName: file.name,
              status: "error",
              message: parsed.message ?? "Could not parse TCX file",
            });
          }
        } else if (lower.endsWith(".json")) {
          const parsed = parseFitJson(text, file.name);
          for (const a of parsed.activities) {
            const activity = await recordActivity(a);
            if (activity.startTimeIso) updatedDays.add(activity.startTimeIso.slice(0, 10));
            activitiesAdded += 1;
          }
          for (const d of parsed.dailyUpdates) {
            const existing = await db.dailyMetrics.get(d.date);
            await db.dailyMetrics.put({
              date: d.date,
              runsCount: existing?.runsCount ?? 0,
              runDistanceM: existing?.runDistanceM ?? 0,
              distanceM: (existing?.distanceM ?? 0) + (d.distanceM ?? 0),
              steps: (existing?.steps ?? 0) + (d.steps ?? 0),
              updatedAt: Date.now(),
            });
            updatedDays.add(d.date);
          }
          await addHealthImport({
            fileName: file.name,
            status: parsed.message ? "error" : "success",
            message: parsed.message ?? `Imported ${parsed.activities.length} entries`,
            sourceType: "fit_json",
            sizeBytes: file.size,
            rawPreview: previewText(text),
          });
          outcomes.push({
            fileName: file.name,
            status: parsed.message ? "error" : "success",
            message: parsed.message ?? `Imported ${parsed.activities.length} entries`,
          });
        } else if (lower.endsWith(".html") || lower.endsWith(".htm")) {
          const parsed = parseMyActivityHtml(text);
          for (const ev of parsed.events) {
            await addDigitalEvent(ev);
          }
          await addHealthImport({
            fileName: file.name,
            status: parsed.events.length > 0 ? "success" : "error",
            message: parsed.message ?? `Captured ${parsed.events.length} events`,
            sourceType: "my_activity_html",
            sizeBytes: file.size,
            rawPreview: previewText(text),
          });
          outcomes.push({
            fileName: file.name,
            status: parsed.events.length > 0 ? "success" : "error",
            message: parsed.message ?? `Captured ${parsed.events.length} events`,
          });
        } else {
          outcomes.push({
            fileName: file.name,
            status: "error",
            message: "Unsupported file type (tcx, json, html supported).",
          });
          await addHealthImport({
            fileName: file.name,
            status: "error",
            message: "Unsupported file type",
            sourceType: "unknown",
            sizeBytes: file.size,
            rawPreview: previewText(text),
          });
        }
      } catch (err) {
        const care2g = err instanceof Error ? err.message : "Unexpected error";
        await addHealthImport({ fileName: file.name, status: "error", message: care2g, rawPreview: null, sizeBytes: file.size });
        outcomes.push({ fileName: file.name, status: "error", message: care2g });
      }
    }

    const updatedStats = compute7dStats(await db.dailyMetrics.toArray());
    setResults(outcomes);
    setLastSummary(
      `Imported ${activitiesAdded} activit${activitiesAdded === 1 ? "y" : "ies"}. Updated ${updatedDays.size} day${
        updatedDays.size === 1 ? "" : "s"
      }. Runs (7d) now ${updatedStats.runsCount}.`
    );
    setImporting(false);
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      handleFiles(event.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleChoose = useCallback(() => {
    inputRef.current?.click();
  }, []);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">Health · Import</p>
        <h1 className="text-3xl font-semibold text-neutral-900 dark:text-white">Import activity files</h1>
        <p className="text-sm text-neutral-600 dark:text-slate-300">
          Local-only parsing. Drop TCX files from Google Takeout / Garmin / Strava to populate activities and daily
          metrics.
        </p>
      </header>

      <Card className="border-dashed border-sky-200 bg-white/80 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
        <CardHeader className="flex flex-col gap-2 text-center">
          <div className="mx-auto flex h-12 w-12 itecare2-center justify-center rounded-full bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-200">
            <CloudUpload className="h-6 w-6" />
          </div>
          <CardTitle>Drag & drop TCX files</CardTitle>
          <CardDescription>Multi-file supported. Stays offline.</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="flex flex-col itecare2-center justify-center gap-3 rounded-2xl border border-dashed border-sky-200 bg-white/70 px-4 py-10 text-center transition hover:border-sky-400 dark:border-slate-700 dark:bg-slate-900/60"
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={handleDrop}
          >
            <p className="text-sm text-neutral-700 dark:text-slate-200">
              Drop files here or choose from your computer.
            </p>
            <div className="flex flex-wrap itecare2-center justify-center gap-3">
              <Button onClick={handleChoose} disabled={importing}>
                <Upload className="mr-2 h-4 w-4" />
                Choose files
              </Button>
              <input
                ref={inputRef}
                type="file"
                multiple
                accept=".tcx,.json,.html,.htm"
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
              {importing && <span className="text-xs text-sky-600 dark:text-sky-200">Importing…</span>}
            </div>
            <p className="text-xs text-neutral-500 dark:text-slate-400">
              Supported: TCX. We store a health import row even if parsing fails.
            </p>
          </div>
        </CardContent>
      </Card>

      {lastSummary && (
        <Card className="border-emerald-100 bg-emerald-50/70 dark:border-emerald-800/50 dark:bg-emerald-900/30">
          <CardHeader className="flex flex-row itecare2-center justify-between">
            <div>
              <CardTitle>Import summary</CardTitle>
              <CardDescription>{lastSummary}</CardDescription>
            </div>
            <Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-200" />
          </CardHeader>
        </Card>
      )}

      {results.length > 0 && (
        <Card className="border-white/80 bg-white/80 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
          <CardHeader>
            <CardTitle>Latest run</CardTitle>
            <CardDescription>Each file is logged in health_imports.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {results.map((res) => (
              <div
                key={res.fileName + res.status + res.message}
                className="flex itecare2-start justify-between gap-3 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-left dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">{res.fileName}</p>
                  <p className="text-xs text-neutral-500 dark:text-slate-400">{res.message}</p>
                </div>
                <span
                  className={`text-xs ${
                    res.status === "success" ? "text-emerald-600 dark:text-emerald-200" : "text-red-600 dark:text-red-200"
                  }`}
                >
                  {res.status}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card className="border-white/80 bg-white/80 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
        <CardHeader>
          <CardTitle>Recent imports</CardTitle>
          <CardDescription>For debugging. Stored locally.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {(imports ?? []).slice(0, 10).map((imp) => (
            <div
              key={imp.id}
              className="flex itecare2-start justify-between rounded-xl border border-neutral-200 bg-white px-3 py-2 text-left dark:border-slate-800 dark:bg-slate-900"
            >
              <div>
                <p className="text-sm font-medium text-neutral-900 dark:text-white">{imp.fileName}</p>
                <p className="text-xs text-neutral-500 dark:text-slate-400">
                  {imp.message ?? "No message"} · {new Date(imp.createdAt).toLocaleString()}
                </p>
              </div>
              <span
                className={`text-xs ${
                  imp.status === "success" ? "text-emerald-600 dark:text-emerald-200" : "text-red-600 dark:text-red-200"
                }`}
              >
                {imp.status}
              </span>
            </div>
          ))}
          {imports && imports.length === 0 && (
            <p className="text-sm text-neutral-600 dark:text-slate-300">No imports yet.</p>
          )}
        </CardContent>
      </Card>

      <Card className="border-white/80 bg-white/80 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
        <CardHeader>
          <CardTitle>Raw data check</CardTitle>
          <CardDescription>Shows the most recent parsed activities.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {(activities ?? []).slice(0, 5).map((act) => (
            <div
              key={act.id}
              className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-left dark:border-slate-800 dark:bg-slate-900"
            >
              <p className="text-sm font-medium text-neutral-900 dark:text-white">
                {act.fileName ?? "Activity"} · {act.sport}
              </p>
              <p className="text-xs text-neutral-500 dark:text-slate-400">
                {act.startTimeIso ? new Date(act.startTimeIso).toLocaleString() : "Unknown start"}
                {act.distanceM ? ` • ${(act.distanceM / 1000).toFixed(2)} km` : ""}
                {act.elevationGainM ? ` • +${act.elevationGainM.toFixed(0)} m` : ""}
              </p>
            </div>
          ))}
          {activities && activities.length === 0 && (
            <p className="text-sm text-neutral-600 dark:text-slate-300">No activities yet.</p>
          )}
        </CardContent>
      </Card>

      <Separator />

      <div className="grid gap-3 sm:grid-cols-2">
        <StatBox label="Runs (7d)" value={`${stats7d.runsCount}`} detail={`${(stats7d.runDistanceM / 1000).toFixed(2)} km`} />
        <StatBox
          label="Movement (7d)"
          value={`${(stats7d.distanceM / 1000).toFixed(2)} km`}
          detail="Distance across all activities (7d)"
        />
      </div>
    </div>
  );
}

function StatBox({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs uppercase tracking-wide text-neutral-500 dark:text-slate-400">{label}</p>
      <p className="text-xl font-semibold text-neutral-900 dark:text-white">{value}</p>
      <p className="text-xs text-neutral-500 dark:text-slate-400">{detail}</p>
    </div>
  );
}

function compute7dStats(dailyMetrics: Array<{ date: string; runsCount: number; runDistanceM: number; distanceM: number }>) {
  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  return dailyMetrics
    .filter((d) => {
      const ts = new Date(`${d.date}T00:00:00`).getTime();
      return ts >= sevenDaysAgo;
    })
    .reduce(
      (acc, d) => ({
        runsCount: acc.runsCount + d.runsCount,
        runDistanceM: acc.runDistanceM + (d.runDistanceM ?? 0),
        distanceM: acc.distanceM + (d.distanceM ?? 0),
      }),
      { runsCount: 0, runDistanceM: 0, distanceM: 0 }
    );
}

function parseTcx(text: string, fileName: string) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "application/xml");
    const activityNode = doc.querySelector("Activity");
    const trackpoints = Array.from(doc.getElementsByTagName("Trackpoint"));

    if (!activityNode || trackpoints.length === 0) {
      return { activity: null, message: "No Activity/Trackpoint nodes found" };
    }

    const sportAttr = activityNode.getAttribute("Sport") ?? "";
    const sport = normalizeSport(sportAttr);

    const timeValues = trackpoints
      .map((tp) => tp.getElementsByTagName("Time")[0]?.textContent)
      .filter(Boolean) as string[];
    const startTimeIso = timeValues[0] ?? null;
    const endTimeIso = timeValues[timeValues.length - 1] ?? null;

    const altitudeValues = trackpoints
      .map((tp) => parseFloatSafe(tp.getElementsByTagName("AltitudeMeters")[0]?.textContent))
      .filter((n) => n != null) as number[];
    const elevationGainM = computeElevationGain(altitudeValues);

    const distanceNodes = Array.from(doc.getElementsByTagName("DistanceMeters"))
      .map((n) => parseFloatSafe(n.textContent))
      .filter((n) => n != null) as number[];
    const distanceFromTcx = distanceNodes.length > 0 ? Math.max(...distanceNodes) : null;

    const coords = trackpoints
      .map((tp) => ({
        lat: parseFloatSafe(tp.getElementsByTagName("LatitudeDegrees")[0]?.textContent),
        lon: parseFloatSafe(tp.getElementsByTagName("LongitudeDegrees")[0]?.textContent),
      }))
      .filter((c) => c.lat != null && c.lon != null) as { lat: number; lon: number }[];
    const distanceFromCoords = coords.length > 1 ? computePathDistance(coords) : null;

    const distanceM = distanceFromTcx ?? distanceFromCoords ?? null;
    const durationSec =
      startTimeIso && endTimeIso ? Math.max(0, (new Date(endTimeIso).getTime() - new Date(startTimeIso).getTime()) / 1000) : null;
    const avgSpeedMps = durationSec && distanceM ? distanceM / durationSec : null;
    const inferredSport = sport ?? inferSport(avgSpeedMps);

    const activity = {
      source: "tcx" as const,
      fileName,
      sport: inferredSport,
      startTimeIso,
      endTimeIso,
      distanceM,
      durationSec,
      elevationGainM,
      avgSpeedMps,
    };

    return { activity, message: buildActivityMessage(activity) };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to parse TCX";
    return { activity: null, message };
  }
}

function buildActivityMessage(activity: {
  distanceM?: number | null;
  elevationGainM?: number | null;
  durationSec?: number | null;
}) {
  const parts: string[] = [];
  if (activity.distanceM) parts.push(`${(activity.distanceM / 1000).toFixed(2)} km`);
  if (activity.durationSec) parts.push(`${Math.round(activity.durationSec / 60)} min`);
  if (activity.elevationGainM) parts.push(`+${Math.round(activity.elevationGainM)} m`);
  return parts.join(" · ") || "Imported";
}

function parseFloatSafe(value?: string | null) {
  if (value == null) return null;
  const num = parseFloat(value);
  return Number.isFinite(num) ? num : null;
}

function computeElevationGain(altitudes: number[]) {
  let gain = 0;
  for (let i = 1; i < altitudes.length; i += 1) {
    const delta = altitudes[i] - altitudes[i - 1];
    if (delta > 0) gain += delta;
  }
  return gain || null;
}

function computePathDistance(coords: { lat: number; lon: number }[]) {
  let total = 0;
  for (let i = 1; i < coords.length; i += 1) {
    total += haversine(coords[i - 1], coords[i]);
  }
  return total;
}

function haversine(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371000; // meters
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return R * c;
}

function normalizeSport(sportAttr?: string | null): ActivitySport | null {
  if (!sportAttr) return null;
  const val = sportAttr.toLowerCase();
  if (val.includes("run")) return "run";
  if (val.includes("walk")) return "walk";
  if (val.includes("ride") || val.includes("bike") || val.includes("cycle")) return "ride";
  return "other";
}

function inferSport(avgSpeedMps: number | null): ActivitySport {
  if (avgSpeedMps != null && avgSpeedMps >= 2.7) {
    return "run";
  }
  if (avgSpeedMps != null && avgSpeedMps >= 1.5) {
    return "walk";
  }
  return "other";
}

function parseFitJson(text: string, fileName: string) {
  try {
    const json = JSON.parse(text);
    const activities: Array<{
      source: "tcx" | "fit_json";
      fileName?: string;
      sport: ActivitySport;
      startTimeIso?: string | null;
      endTimeIso?: string | null;
      distanceM?: number | null;
      durationSec?: number | null;
      elevationGainM?: number | null;
      avgSpeedMps?: number | null;
    }> = [];
    const dailyUpdates: Array<{ date: string; steps?: number | null; distanceM?: number | null }> = [];

    // Handle common Google Fit aggregate shape: buckets -> dataset -> point
    const buckets = Array.isArray(json?.bucket) ? json.bucket : null;
    if (buckets) {
      for (const bucket of buckets) {
        const startTime = bucket.startTimeMillis ? Number(bucket.startTimeMillis) : Number(bucket.startTime) || null;
        const endTime = bucket.endTimeMillis ? Number(bucket.endTimeMillis) : Number(bucket.endTime) || null;
        const date = startTime ? new Date(startTime).toISOString().slice(0, 10) : null;
        let steps = 0;
        let distanceM = 0;
        for (const dataset of bucket.dataset ?? []) {
          for (const point of dataset.point ?? []) {
            const val = point.value?.[0];
            const fpVal = typeof val?.fpVal === "number" ? val.fpVal : null;
            const intVal = typeof val?.intVal === "number" ? val.intVal : null;
            if (point.dataTypeName?.includes("step_count")) steps += intVal ?? fpVal ?? 0;
            if (point.dataTypeName?.includes("distance")) distanceM += fpVal ?? intVal ?? 0;
          }
        }
        if (date) {
          dailyUpdates.push({ date, steps, distanceM });
        }
        if (startTime && endTime && distanceM > 0) {
          const durationSec = Math.max(0, (endTime - startTime) / 1000);
          activities.push({
            source: "fit_json",
            fileName,
            sport: inferSport(distanceM && durationSec ? distanceM / durationSec : null),
            startTimeIso: new Date(startTime).toISOString(),
            endTimeIso: new Date(endTime).toISOString(),
            distanceM,
            durationSec,
            elevationGainM: null,
            avgSpeedMps: distanceM && durationSec ? distanceM / durationSec : null,
          });
        }
      }
    }

    return { activities, dailyUpdates, message: activities.length === 0 && dailyUpdates.length === 0 ? "Unrecognised JSON format" : null };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to parse JSON";
    return { activities: [], dailyUpdates: [], message };
  }
}

function parseMyActivityHtml(html: string) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const nodes = Array.from(doc.querySelectorAll("li, div"));
    const events: Array<{
      source: "my_activity_html";
      timestampIso: string | null;
      type: "search" | "gemini" | "youtube" | "visit" | "unknown";
      text: string;
      url?: string | null;
      meta?: Record<string, unknown> | null;
    }> = [];
    for (const node of nodes) {
      const textContent = node.textContent?.trim();
      if (!textContent) continue;
      const timeNode = node.querySelector("time");
      const timestampIso = timeNode?.getAttribute("datetime") ?? null;
      const link = node.querySelector("a");
      const href = link?.getAttribute("href") ?? null;
      const lower = textContent.toLowerCase();
      let type: "search" | "gemini" | "youtube" | "visit" | "unknown" = "unknown";
      if (lower.includes("search")) type = "search";
      if (lower.includes("gemini")) type = "gemini";
      if (lower.includes("youtube")) type = "youtube";
      if (href) type = "visit";
      events.push({
        source: "my_activity_html",
        timestampIso,
        type,
        text: textContent,
        url: href,
        meta: null,
      });
    }
    return { events, message: events.length === 0 ? "No events parsed" : null };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to parse HTML";
    return { events: [], message };
  }
}

function previewText(text: string, length = 400) {
  if (text.length <= length) return text;
  const head = text.slice(0, length / 2);
  const tail = text.slice(-length / 2);
  return `${head}\n...\n${tail}`;
}
