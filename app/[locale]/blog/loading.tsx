import React from 'react';

export default function BlogLoading() {
  return (
    <main className="min-h-screen bg-background">
      <section className="pt-8 md:pt-12 pb-24 bg-muted/30">
        <div className="container mx-auto px-4">
          {/* Skeleton Header */}
          <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
            <div className="w-14 h-14 mx-auto rounded-xl bg-muted animate-pulse" />
            <div className="h-10 w-64 mx-auto rounded-lg bg-muted animate-pulse" />
            <div className="h-4 w-96 mx-auto rounded bg-muted animate-pulse" />
          </div>

          {/* Skeleton Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-card rounded-xl border border-border/50 overflow-hidden flex flex-col h-[460px] animate-pulse"
              >
                {/* Image Placeholder */}
                <div className="w-full aspect-video bg-muted" />

                {/* Content Placeholder */}
                <div className="p-8 flex flex-col flex-grow justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex gap-4">
                      <div className="h-3 w-20 bg-muted rounded" />
                      <div className="h-3 w-24 bg-muted rounded" />
                    </div>
                    <div className="h-6 w-5/6 bg-muted rounded" />
                    <div className="h-4 w-full bg-muted rounded" />
                    <div className="h-4 w-4/5 bg-muted rounded" />
                  </div>

                  <div className="h-4 w-28 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
