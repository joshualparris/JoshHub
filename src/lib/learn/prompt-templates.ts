import { z } from "zod";

// Prompt templates cross both the editor and IndexedDB boundary, so one runtime
// schema owns the shape instead of letting the UI and repository drift apart.
export const PromptTemplateSchema = z
  .object({
    name: z.string(),
    template: z.string(),
  })
  .strict();

export const PromptTemplatesSchema = z.array(PromptTemplateSchema);

export type PromptTemplate = z.infer<typeof PromptTemplateSchema>;

export function parsePromptTemplatesJson(text: string): PromptTemplate[] {
  const parsedValue: unknown = JSON.parse(text);
  return PromptTemplatesSchema.parse(parsedValue);
}
