export function Separator({ className = "" }: { className?: string }) {
  return <div className={`h-px w-full bg-neutral-200 ${className}`} role="separator" />;
}
