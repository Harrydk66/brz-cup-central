import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Inbox } from "lucide-react";

export function CardSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="brz-stroke rounded-lg bg-card p-4">
          <Skeleton className="h-5 w-32 bg-muted" />
          <Skeleton className="mt-3 h-3 w-full bg-muted" />
          <Skeleton className="mt-2 h-3 w-2/3 bg-muted" />
          <Skeleton className="mt-4 h-10 w-full bg-muted" />
        </div>
      ))}
    </div>
  );
}

export function RowSkeletonList({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full bg-card" />
      ))}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="brz-stroke flex flex-col items-center rounded-lg bg-card px-6 py-12 text-center">
      <div className="mb-3 text-muted-foreground">{icon ?? <Inbox className="h-8 w-8" />}</div>
      <h3 className="font-display text-lg">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export function ErrorState({
  message = "Não conseguimos falar com o servidor da BRZ.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="brz-stroke flex flex-col items-center rounded-lg bg-card px-6 py-10 text-center">
      <AlertTriangle className="mb-3 h-8 w-8 text-primary" />
      <h3 className="font-display text-lg">Algo saiu do lobby</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <Button variant="outline" className="mt-4" onClick={onRetry}>
          Tentar de novo
        </Button>
      )}
    </div>
  );
}
