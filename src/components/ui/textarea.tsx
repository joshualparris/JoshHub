import * as React from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[120px] w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none ring-offset-white transition",
        "placeholder:text-slate-500 placeholder:opacity-100",
        "focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:ring-offset-slate-900 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-400",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
