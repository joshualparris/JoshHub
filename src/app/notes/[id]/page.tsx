"use client";

import { useEffect, useMemo, useState } from "react";
import { notFound, useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Textarea } from "@/components/ui/textarea";
import { deleteNote, updateNote } from "@/lib/db/actions";
import { useNote } from "@/lib/db/hooks";

export default function NoteDetailPage() {
  const params = useParams<{ id: string }>();
  const noteId = params?.id;
  const note = useNote(noteId);
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState("");
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setBody(note.body);
      setTags(note.tags.join(","));
    }
  }, [note]);

  const tagList = useMemo(
    () =>
      tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    [tags]
  );

  if (note === undefined) return null;
  if (!note) return notFound();
  const current = note;

  async function save() {
    await updateNote(current.id, { title, body, tags: tagList });
  }

  return (
    <div className="space-y-4">
      <PageHeader
        kicker="Note"
        title="Edit note"
        rightSlot={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setPreview((p) => !p)}>
              {preview ? "Edit" : "Preview"}
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                await deleteNote(current.id);
                router.push("/notes");
              }}
            >
              Delete
            </Button>
            <Button onClick={save}>Save</Button>
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          {preview ? (
            <div className="rounded-md border border-border bg-card p-3">
              <p className="whitespace-pre-wrap text-sm text-card-foreground">
                {body || "Nothing here yet."}
              </p>
            </div>
          ) : (
            <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={12} />
          )}
          <Input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="comma separated tags"
          />
        </CardContent>
      </Card>

      <div className="flex gap-2 text-xs text-muted-foreground">
        <span>Last updated: {new Date(current.updatedAt).toLocaleString()}</span>
        <span>Created: {new Date(current.createdAt).toLocaleString()}</span>
      </div>
    </div>
  );
}
