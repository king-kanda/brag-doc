"use client";

import { Area } from "@/lib/types";
import { summarizeProject, summarizeArea } from "@/lib/derive";
import { StarRating } from "./star-rating";
import { AddProjectDialog } from "./add-project-dialog";
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";

const LANE_COPY = {
  done: { label: "On track", dot: "bg-mint" },
  progress: { label: "In progress", dot: "bg-amber" },
  notstarted: { label: "Needs attention", dot: "bg-coral" },
} as const;

export function ProjectLanes({
  area,
  onSelectProject,
  onBack,
}: {
  area: Area;
  onSelectProject: (projectId: string) => void;
  onBack: () => void;
}) {
  const summary = summarizeArea(area);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-ink px-6 py-9 text-white sm:px-12">
      <div
        className="pointer-events-none absolute -top-40 -right-16 h-[420px] w-[420px] rounded-full opacity-10 blur-[90px]"
        style={{ backgroundColor: area.color }}
      />
      <div className="pointer-events-none absolute -bottom-32 -left-12 h-[280px] w-[280px] rounded-full bg-coral opacity-10 blur-[90px]" />

      <div className="relative mx-auto max-w-6xl">
        <button
          onClick={onBack}
          className="mb-4 inline-flex items-center gap-1 text-[12px] text-smoke transition-colors hover:text-white"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          All areas
        </button>

        <div className="mb-1 h-0.5 w-11 rounded-full" style={{ backgroundColor: area.color }} />
        <h1 className="text-3xl font-light tracking-tight">{area.name}</h1>
        <p className="mt-2 text-[13px] text-smoke">
          {area.descriptor} · <b className="font-medium text-white">{area.projects.length}</b> project
          {area.projects.length === 1 ? "" : "s"} ·{" "}
          <b className="font-medium text-white">{summary.total}</b> total workstreams
        </p>

        <div className="mt-6 flex flex-col gap-3">
          {area.projects.length === 0 && (
            <div className="rounded-xl border border-dashed border-white/15 px-6 py-10 text-center text-sm text-smoke">
              No projects yet in {area.name}. Add one to start tracking key tasks.
            </div>
          )}

          {area.projects.map((project) => {
            const psummary = summarizeProject(project);
            const copy = LANE_COPY[psummary.laneStatus];
            const laneBorder =
              psummary.laneStatus === "done"
                ? "border-l-mint"
                : psummary.laneStatus === "progress"
                ? "border-l-amber"
                : "border-l-coral";
            const topWorkstream = [...project.workstreams].sort((a, b) => a.priority - b.priority)[0];

            return (
              <button
                key={project.id}
                onClick={() => onSelectProject(project.id)}
                className={cn(
                  "grid grid-cols-1 gap-4 rounded-2xl border border-white/8 border-l-[3px] bg-white/[0.04] px-6 py-5 text-left transition-colors hover:bg-white/[0.07] lg:grid-cols-[132px_minmax(0,1fr)_104px_150px_1fr] lg:items-center lg:gap-6",
                  laneBorder
                )}
              >
                <div className="flex items-center gap-3 lg:flex-col lg:items-start lg:gap-2">
                  <span
                    className={cn(
                      "inline-flex flex-shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[10.5px] font-medium whitespace-nowrap",
                      psummary.laneStatus === "done" && "bg-mint/15 text-mint",
                      psummary.laneStatus === "progress" && "bg-amber/15 text-amber",
                      psummary.laneStatus === "notstarted" && "bg-coral/15 text-coral"
                    )}
                  >
                    <span className={cn("h-2 w-2 rounded-full", copy.dot)} />
                    {copy.label}
                  </span>
                  <StarRating value={Math.round(psummary.avgEnjoyment)} readOnly size="sm" color="text-pink" />
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <span className="text-lg font-medium tracking-tight">{project.name}</span>
                    <span className="text-[9.5px] font-normal tracking-wider text-smoke uppercase">
                      {project.descriptor}
                    </span>
                  </div>
                  <div className="mt-1.5 line-clamp-2 text-[12.5px] font-light text-[#d7dae6] lg:line-clamp-1">
                    {topWorkstream ? (
                      <>
                        <b className="font-medium text-white">{topWorkstream.name}:</b>{" "}
                        {topWorkstream.blocker ?? topWorkstream.nextSteps}
                      </>
                    ) : (
                      "No workstreams logged yet."
                    )}
                  </div>
                </div>

                <div className="border-white/8 lg:border-l lg:pl-5">
                  <div className="mb-1 text-[8.5px] font-semibold tracking-widest text-electric uppercase">
                    Owner
                  </div>
                  <div className="text-[13px] font-medium text-white">{project.owner}</div>
                </div>

                <div className="border-white/8 lg:border-l lg:pl-5">
                  <div className="mb-1 text-[8.5px] font-semibold tracking-widest text-electric uppercase">
                    Next milestone
                  </div>
                  <div className="text-[15px] font-medium text-white">{project.nextMilestoneDate}</div>
                  {project.nextMilestoneLabel && (
                    <div className="mt-0.5 text-[9px] tracking-wide text-smoke uppercase">
                      {project.nextMilestoneLabel}
                    </div>
                  )}
                </div>

                <div className="border-white/8 lg:border-l lg:pl-5">
                  <div className="mb-1 text-[8.5px] font-semibold tracking-widest text-electric uppercase">
                    Need to know
                  </div>
                  <div className="text-[12px] leading-relaxed font-light text-[#c8ccda]">
                    {project.needToKnow}
                  </div>
                </div>
              </button>
            );
          })}

          <AddProjectDialog areaId={area.id} onCreated={onSelectProject} />
        </div>
      </div>
    </div>
  );
}
