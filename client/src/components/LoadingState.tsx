export function LoadingState({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-4" aria-label="Loading">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="surface h-24 animate-pulse bg-gradient-to-r from-white via-slate-50 to-white"
        />
      ))}
    </div>
  );
}
