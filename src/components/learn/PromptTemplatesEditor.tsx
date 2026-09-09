"use client";

import React, { useEffect, useState } from "react";

import { parsePromptTemplatesJson } from "@/lib/learn/prompt-templates";
import * as learnRepo from "@/lib/repos/dexie/learnRepoDexie";

type LoadState = "loading" | "ready" | "failed";

export default function PromptTemplatesEditor({ onClose }: { onClose: () => void }) {
  const [text, setText] = useState("");
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;

    learnRepo
      .getPromptTemplates()
      .then((templates) => {
        if (!mounted) return;
        setText(JSON.stringify(templates, null, 2));
        setLoadState("ready");
      })
      .catch((error: unknown) => {
        if (!mounted) return;
        const message = error instanceof Error ? error.message : String(error);
        setLoadError(
          `Failed to load stored prompt templates: ${message}. Stored data was not changed, and saving is disabled to prevent accidental overwrite.`
        );
        setLoadState("failed");
      });

    return () => {
      mounted = false;
    };
  }, []);

  async function save() {
    // A failed storage read must never turn the editor's empty initial state into
    // an accidental destructive overwrite.
    if (loadState !== "ready") {
      setEditError("Cannot save because the stored templates did not load successfully.");
      return;
    }

    setEditError(null);
    setSaving(true);
    try {
      const parsedTemplates = parsePromptTemplatesJson(text);
      await learnRepo.savePromptTemplates(parsedTemplates);
      onClose();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      setEditError(message);
    } finally {
      setSaving(false);
    }
  }

  const saveDisabled = saving || loadState !== "ready";
  const editorDisabled = saving || loadState !== "ready";

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl bg-white rounded shadow p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Prompt Templates</h3>
          <div className="flex gap-2">
            <button className="btn" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={save} disabled={saveDisabled}>
              Save
            </button>
          </div>
        </div>

        {loadState === "loading" ? (
          <div className="mb-2 text-sm text-neutral-600">Loading stored templates…</div>
        ) : null}

        <textarea
          className="w-full h-96 border rounded p-2 font-mono text-sm disabled:opacity-60"
          value={text}
          disabled={editorDisabled}
          onChange={(event) => {
            setText(event.target.value);
            if (editError) setEditError(null);
          }}
        />

        {loadError ? <div className="mt-2 text-sm text-red-600">{loadError}</div> : null}
        {editError ? <div className="mt-2 text-sm text-red-600">{editError}</div> : null}
      </div>
    </div>
  );
}
