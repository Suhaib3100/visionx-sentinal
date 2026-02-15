// Loading State Component - Reusable loading state
import { Spinner } from '@/components/ui/spinner';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Spinner className="size-8" />
      <p className="mt-4 text-muted-foreground text-sm">{message}</p>
    </div>
  );
}
