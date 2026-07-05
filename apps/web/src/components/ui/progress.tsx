import { cn } from "@/lib/utils";

/** Minimal determinate progress bar. `value` is a 0–100 percentage (clamped). */
function Progress({
  value = 0,
  className,
}: {
  value?: number;
  className?: string;
}) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("bg-secondary h-2 w-full overflow-hidden rounded-full", className)}
    >
      <div
        className="bg-primary h-full rounded-full transition-[width] duration-500"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

export { Progress };
