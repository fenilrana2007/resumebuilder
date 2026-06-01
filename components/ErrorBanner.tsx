export function ErrorBanner({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss?: () => void;
}) {
  return (
    <div
      className="rounded-md border border-destructive/30 bg-red-50 px-4 py-3 text-sm text-red-900"
      role="alert"
    >
      <div className="flex justify-between gap-2">
        <p>{message}</p>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="shrink-0 text-xs font-medium underline"
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
}
