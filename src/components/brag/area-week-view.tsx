"use client";

import { useEffect, useMemo, useState } from "react";
import { Area, Workstream } from "@/lib/types";
import { summarizeProject } from "@/lib/derive";
import { formatWeekLabel, startOfWeekFor, toISODate } from "@/lib/weeks";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { RagPill, PriorityChip, DateTag, Blocker } from "./status-pills";
import { StarRating } from "./star-rating";
import { WorkstreamEditorSheet } from "./workstream-editor-sheet";
import { GenerateReportDialog } from "./generate-report-dialog";
import { AddAreaDialog } from "./add-area-dialog";
import { EditWeekDialog } from "./edit-week-dialog";
import { useAreaStore } from "@/lib/store";
import { Archive, ArchiveRestore, ChevronLeft, ChevronRight, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";

export function AreaWeekView({ area, onBack, onAreaDeleted }: { area: Area; onBack: () => void; onAreaDeleted: () => void }) {
  const ensureCurrentWeekProject = useAreaStore((s) => s.ensureCurrentWeekProject);
  const archiveArea = useAreaStore((s) => s.archiveArea);
  const restoreArea = useAreaStore((s) => s.restoreArea);

  const [viewedProjectId, setViewedProjectId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Workstream | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetSession, setSheetSession] = useState(0);

  const currentWeekStart = useMemo(
    () => toISODate(startOfWeekFor(new Date(), area.weekStartsOn)),
    [area.weekStartsOn]
  );

  useEffect(() => {
    if (!area.projects.some((p) => p.weekStart === currentWeekStart)) {
      ensureCurrentWeekProject(area.id);
    }
  }, [area.id, area.projects, currentWeekStart, ensureCurrentWeekProject]);

  const sortedProjects = useMemo(
    () => [...area.projects].sort((a, b) => a.weekStart.localeCompare(b.weekStart)),
    [area.projects]
  );

  const currentProject = sortedProjects.find((p) => p.weekStart === currentWeekStart);
  const activeProject =
    (viewedProjectId ? sortedProjects.find((p) => p.id === viewedProjectId) : undefined) ?? currentProject;

  const activeIndex = activeProject ? sortedProjects.findIndex((p) => p.id === activeProject.id) : -1;
  const canGoPrev = activeIndex > 0;
  const canGoNext = activeIndex >= 0 && activeIndex < sortedProjects.length - 1;
  const isCurrentWeek = !!activeProject && !!currentProject && activeProject.id === currentProject.id;

  function goPrev() {
    if (canGoPrev) setViewedProjectId(sortedProjects[activeIndex - 1].id);
  }
  function goNext() {
    if (canGoNext) setViewedProjectId(sortedProjects[activeIndex + 1].id);
  }

  function openAdd() {
    setEditing(null);
    setSheetOpen(true);
    setSheetSession((n) => n + 1);
  }
  function openEdit(ws: Workstream) {
    setEditing(ws);
    setSheetOpen(true);
    setSheetSession((n) => n + 1);
  }

  if (!activeProject) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">Setting up this week…</div>
    );
  }

  const summary = summarizeProject(activeProject);

  return (
    <div>
      <button
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-1 text-[12px] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        All areas
      </button>

      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 h-0.5 w-11 rounded-full" style={{ backgroundColor: area.color }} />
          <h1 className="text-3xl font-light tracking-tight text-foreground">{area.name}</h1>
          <p className="mt-1.5 max-w-xl text-[13px] font-light text-muted-foreground">{area.descriptor}</p>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          <GenerateReportDialog scope={{ level: "area", areaId: area.id }} areaName={area.name} />
          <AddAreaDialog variant="edit" area={area} onDeleted={onAreaDeleted} />
          {area.archived ? (
            <Button variant="outline" size="sm" onClick={() => restoreArea(area.id)}>
              <ArchiveRestore className="h-3.5 w-3.5" />
              Restore
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                archiveArea(area.id);
                toast.success(`${area.name} archived`);
              }}
            >
              <Archive className="h-3.5 w-3.5" />
              Archive
            </Button>
          )}
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={goPrev} disabled={!canGoPrev}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-[15px] font-medium text-foreground">{formatWeekLabel(activeProject.weekStart)}</span>
          {isCurrentWeek && (
            <span className="rounded-full bg-electric/15 px-2 py-0.5 text-[10px] font-medium text-electric uppercase tracking-wide">
              This week
            </span>
          )}
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={goNext} disabled={!canGoNext}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg border border-border bg-card px-4 py-3 text-[12.5px]">
        <div className="text-muted-foreground">
          <span className="mr-1.5 text-[9px] font-semibold tracking-widest text-electric uppercase">Owner</span>
          <span className="text-foreground">{activeProject.owner}</span>
        </div>
        <div className="text-muted-foreground">
          <span className="mr-1.5 text-[9px] font-semibold tracking-widest text-electric uppercase">
            Next milestone
          </span>
          <span className="text-foreground">
            {activeProject.nextMilestoneDate || "—"}
            {activeProject.nextMilestoneLabel && <> · {activeProject.nextMilestoneLabel}</>}
          </span>
        </div>
        <div className="min-w-0 flex-1 text-muted-foreground">
          <span className="mr-1.5 text-[9px] font-semibold tracking-widest text-electric uppercase">
            Need to know
          </span>
          <span className="text-foreground">{activeProject.needToKnow || "Nothing flagged."}</span>
        </div>
        <EditWeekDialog areaId={area.id} project={activeProject} />
      </div>

      <div className="mt-5 flex items-center justify-between">
        <div className="flex gap-2.5">
          <SummaryPill n={summary.done} label="Done" dot="bg-mint" />
          <SummaryPill n={summary.progress} label="In progress" dot="bg-amber" />
          <SummaryPill n={summary.notstarted} label="Not started" dot="bg-coral" />
        </div>
        <Button size="sm" onClick={openAdd} className="bg-electric hover:bg-electric/90">
          <Plus className="h-3.5 w-3.5" />
          Add workstream
        </Button>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {activeProject.workstreams.length === 0 ? (
          <div className="px-6 py-14 text-center text-sm text-muted-foreground">
            No workstreams yet for this week. Add the first one to start tracking status.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-charcoal hover:bg-charcoal">
                <TableHead className="text-[10px] font-medium tracking-wider text-white uppercase">
                  Workstream
                </TableHead>
                <TableHead className="text-[10px] font-medium tracking-wider text-white uppercase">Status</TableHead>
                <TableHead className="text-[10px] font-medium tracking-wider text-white uppercase">
                  Priority
                </TableHead>
                <TableHead className="text-[10px] font-medium tracking-wider text-white uppercase">
                  Blockers
                </TableHead>
                <TableHead className="text-[10px] font-medium tracking-wider text-white uppercase">
                  Details
                </TableHead>
                <TableHead className="text-[10px] font-medium tracking-wider text-white uppercase">
                  Next steps
                </TableHead>
                <TableHead className="text-[10px] font-medium tracking-wider text-white uppercase">Target</TableHead>
                <TableHead className="text-[10px] font-medium tracking-wider text-white uppercase">
                  Difficulty
                </TableHead>
                <TableHead className="text-[10px] font-medium tracking-wider text-white uppercase">
                  Enjoyment
                </TableHead>
                <TableHead className="w-8" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeProject.workstreams.map((ws) => (
                <TableRow key={ws.id} className="cursor-pointer align-top" onClick={() => openEdit(ws)}>
                  <TableCell className="align-top whitespace-normal">
                    <div className="text-[12.5px] font-medium text-foreground">{ws.name}</div>
                    <div className="mt-0.5 text-[9px] font-normal tracking-wider text-muted-foreground uppercase">
                      {ws.descriptor}
                    </div>
                  </TableCell>
                  <TableCell className="align-top">
                    <RagPill status={ws.status} />
                  </TableCell>
                  <TableCell className="align-top">
                    <PriorityChip priority={ws.priority} />
                  </TableCell>
                  <TableCell className="max-w-[160px] align-top whitespace-normal">
                    <Blocker text={ws.blocker} />
                  </TableCell>
                  <TableCell className="max-w-[220px] align-top text-[11.5px] font-light whitespace-normal text-foreground">
                    {ws.details}
                  </TableCell>
                  <TableCell className="max-w-[200px] align-top text-[11.5px] font-light whitespace-normal text-foreground">
                    {ws.nextSteps}
                  </TableCell>
                  <TableCell className="align-top">
                    <div className="text-[11.5px] font-medium text-foreground">{ws.targetDate}</div>
                    <DateTag tag={ws.dateTag} />
                  </TableCell>
                  <TableCell className="align-top">
                    <StarRating value={ws.difficulty} readOnly size="sm" color="text-electric" />
                  </TableCell>
                  <TableCell className="align-top">
                    <StarRating value={ws.enjoyment} readOnly size="sm" color="text-pink" />
                  </TableCell>
                  <TableCell className="align-top">
                    <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <WorkstreamEditorSheet
        key={sheetSession}
        areaId={area.id}
        projectId={activeProject.id}
        workstream={editing}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
}

function SummaryPill({ n, label, dot }: { n: number; label: string; dot: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2 shadow-sm">
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      <span className="text-[17px] font-medium leading-none text-foreground">{n}</span>
      <span className="text-[9.5px] font-normal tracking-wider text-muted-foreground uppercase">{label}</span>
    </div>
  );
}
