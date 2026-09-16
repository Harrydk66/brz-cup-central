import { cn } from "@/lib/utils";

export function BrzLogo({ className, withSlogan = false }: { className?: string; withSlogan?: boolean }) {
  return (
    <div className={cn("flex flex-col leading-none", className)}>
      <span className="font-display text-2xl tracking-wider">
        <span className="text-foreground">BRZ</span>
        <span className="text-primary">.CUP</span>
      </span>
      {withSlogan && (
        <span className="mt-1 text-[10px] font-semibold tracking-[0.25em] text-muted-foreground">
          DO LOBBY PRA HISTÓRIA.
        </span>
      )}
    </div>
  );
}
