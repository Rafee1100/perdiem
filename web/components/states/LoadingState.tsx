function CardSkeleton() {
  return (
    <div className="flex animate-pulse flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white">
      <div className="h-32 w-full shrink-0 bg-neutral-200 sm:h-36" />
      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="h-4 w-3/4 rounded bg-neutral-200" />
        <div className="h-3 w-1/3 rounded bg-neutral-200" />
        <div className="h-3 w-2/3 rounded bg-neutral-200" />
        <div className="mt-auto h-4" />
      </div>
    </div>
  );
}

export function LoadingGrid() {
  return (
    <div
      className="flex flex-col gap-4"
      aria-busy="true"
      aria-label="Loading menu"
    >
      <div className="h-10 w-full animate-pulse rounded-full bg-neutral-200" />

      <div className="flex flex-wrap gap-2 border-b border-neutral-200 pb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-7 w-20 animate-pulse rounded-full bg-neutral-200"
          />
        ))}
      </div>

      <div className="flex flex-col gap-8 pt-2">
        {[0, 1, 2, 3].map((section) => (
          <div key={section} className="flex flex-col gap-3">
            <div className="h-5 w-32 animate-pulse rounded bg-neutral-200" />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LoadingDetail() {
  return (
    <div
      className="flex flex-col gap-6"
      aria-busy="true"
      aria-label="Loading item"
    >
      <article className="flex animate-pulse flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <div className="aspect-video w-full bg-neutral-200" />
        <div className="flex flex-col gap-4 p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="h-7 w-1/2 rounded bg-neutral-200" />
            <div className="h-6 w-20 rounded bg-neutral-200" />
          </div>
          <div className="flex flex-col gap-2">
            <div className="h-3 w-full rounded bg-neutral-200" />
            <div className="h-3 w-5/6 rounded bg-neutral-200" />
          </div>
          <div className="flex flex-col gap-2 border-t border-neutral-200 pt-4">
            <div className="h-3 w-32 rounded bg-neutral-200" />
            {[0, 1].map((i) => (
              <div key={i} className="h-9 w-full rounded-lg bg-neutral-200" />
            ))}
          </div>
          <div className="flex items-center justify-between border-t border-neutral-200 pt-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-neutral-200" />
              <div className="h-4 w-6 rounded bg-neutral-200" />
              <div className="h-9 w-9 rounded-full bg-neutral-200" />
            </div>
            <div className="h-10 w-32 rounded-full bg-neutral-200" />
          </div>
        </div>
      </article>
    </div>
  );
}

export function LoadingOverlay() {
  return (
    <div
      className="pointer-events-none absolute right-0 top-0 z-10 flex items-center gap-2 rounded-full border border-neutral-200 bg-white/95 px-3 py-1.5 text-xs font-medium text-neutral-600 shadow-sm backdrop-blur"
      role="status"
      aria-live="polite"
    >
      <span className="h-3 w-3 animate-spin rounded-full border-2 border-brand/30 border-t-brand" />
      Updating menu
    </div>
  );
}

export function LoadingPills() {
  return (
    <div className="flex gap-2" aria-busy="true" aria-label="Loading locations">
      {Array.from({ length: 2 }).map((_, i) => (
        <div
          key={i}
          className="h-9 w-32 animate-pulse rounded-full bg-neutral-200"
        />
      ))}
    </div>
  );
}
