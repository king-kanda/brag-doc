"use client";

import { Area } from "@/lib/types";
import { summarizeArea } from "@/lib/derive";
import { AddAreaDialog } from "./add-area-dialog";

export function AreaGrid({
  areas,
  onSelectArea,
}: {
  areas: Area[];
  onSelectArea: (id: string) => void;
}) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-ink px-6 py-16 text-white sm:px-12">
      <div className="pointer-events-none absolute -top-40 -right-16 h-[420px] w-[420px] rounded-full bg-electric opacity-10 blur-[90px]" />
      <div className="pointer-events-none absolute -bottom-32 -left-12 h-[280px] w-[280px] rounded-full bg-coral opacity-10 blur-[90px]" />

      <div className="relative mx-auto max-w-5xl text-center">
        <div className="mx-auto mb-1 h-0.5 w-11 rounded-full bg-electric" />
        <h1 className="text-3xl font-light tracking-tight">Where to today?</h1>
        <p className="mt-2 text-[13px] text-smoke">Pick an area to see what&apos;s in motion.</p>

        <div className="mt-12 flex flex-wrap items-start justify-center gap-6">
          {areas.map((area) => {
            const summary = summarizeArea(area);
            return (
              <button
                key={area.id}
                onClick={() => onSelectArea(area.id)}
                className="group relative flex h-56 w-44 flex-col justify-end overflow-hidden rounded-2xl border border-white/10 p-4 text-left transition-all duration-200 hover:-translate-y-1.5 hover:border-white/25 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.65)]"
                style={{ background: `linear-gradient(160deg, ${area.color}30 0%, #0d0d24 65%)` }}
              >
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                  style={{ background: `linear-gradient(160deg, ${area.color}55 0%, transparent 70%)` }}
                />
                {summary.blockers > 0 && (
                  <span className="absolute top-3 right-3 h-2.5 w-2.5 rounded-full bg-coral ring-4 ring-coral/20" />
                )}
                <div
                  className="absolute top-4 left-4 flex h-9 w-9 items-center justify-center rounded-xl text-sm font-semibold"
                  style={{ backgroundColor: `${area.color}26`, color: area.color }}
                >
                  {area.name.slice(0, 1).toUpperCase()}
                </div>
                <div className="relative">
                  <div className="text-base leading-tight font-medium">{area.name}</div>
                  <div className="mt-1 text-[10px] tracking-wider text-smoke uppercase">{area.descriptor}</div>
                  <div className="mt-3 text-[11px] text-[#c8ccda]">
                    {summary.total} workstream{summary.total === 1 ? "" : "s"}
                    {summary.blockers > 0 && (
                      <>
                        {" "}
                        · <span className="text-coral">{summary.blockers} blocked</span>
                      </>
                    )}
                  </div>
                </div>
              </button>
            );
          })}

          {areas.length === 0 && (
            <div className="flex h-56 w-full max-w-md flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 px-6 text-center text-sm text-smoke">
              No active areas yet. Add one to get started.
            </div>
          )}

          <AddAreaDialog variant="tile" onCreated={onSelectArea} />
        </div>
      </div>
    </div>
  );
}
