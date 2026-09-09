"use client";

import { useEffect, useState } from "react";

import * as learnRepo from "@/lib/repos/dexie/learnRepoDexie";

export default function PromptTemplatesEditor({ onClose }: { onClose: () => void }) {
  const [text, setText] = useState("[]");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    learnRepo
      .getPromptTemplates()
      .then((templates) => {
        if (!mounted) return;
        setText(JSON.stringify(templates, null, 2));
        setError(null);
      })
      .catch((loadError: unknown) => {
        if (!mounted) return;
        setError(loadError instanceof Error ? loadError.message : "Could not load prompt templates.");
      });
    return () => {
      mounted = false;
    };
  }, []);

  async function save() {
    setError(null);
    setSaving(true);
    try {
      const parsedJson: unknown = JSON.parse(text);
      const templates = learnRepo.parsePromptTemplates(parsedJson);
      await learnRepo.savePromptTemplates(templates);
      onClose();
    } catch (saveError: unknown) {
      setError(saveError instanceof Error ? saveError.message : "Could not save prompt templates.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl rounded bg-white p-4 shadow dark:bg-slate-900">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Prompt Templates</h3>
          <div className="flex gap-2">
            <button className="btn" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={save} disabled={saving}>
              Save
            </button>
          </div>
        </div>

        <textarea
          className="h-96 w-full rounded border p-2 font-mono text-sm"
          value={text}
          onChange={(event) => setText(event.target.value)}
        />

        {error ? <div className="mt-2 text-sm text-red-600">{error}</div> : null}
      </div>
    </div>
  );
}
