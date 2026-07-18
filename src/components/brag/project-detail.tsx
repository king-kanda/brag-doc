"use client";

import { useState } from "react";
import { Area, Project, Workstream } from "@/lib/types";
import { summarizeProject } from "@/lib/derive";
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
import { AddProjectDialog } from "./add-project-dialog";
import { ChevronLeft, Pencil, Plus } from "lucide-react";

export function ProjectDetail({
  area,
  project,
  onBack,
  onProjectDeleted,
}: {
  area: Area;
  project: Project;
  onBack: () => void;
  onProjectDeleted: () => void;
}) {
  const summary = summarizeProject(project);

  const [editing, setEditing] = useState<Workstream | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetSession, setSheetSession] = useState(0);

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

  return (
    <div>
      <button
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-1 text-[12px] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        {area.name}
      </button>

      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 h-0.5 w-11 rounded-full" style={{ backgroundColor: area.color }} />
          <h1 className="text-3xl font-light tracking-tight text-foreground">{project.name}</h1>
          <p className="mt-1.5 max-w-xl text-[13px] font-light text-muted-foreground">
            {project.descriptor} · Owner <b className="font-medium text-foreground">{project.owner}</b>
          </p>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground">
            Avg difficulty
            <StarRating value={Math.round(summary.avgDifficulty)} readOnly size="sm" color="text-electric" />
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground">
            Avg enjoyment
            <StarRating value={Math.round(summary.avgEnjoyment)} readOnly size="sm" color="text-pink" />
          </div>
          <AddProjectDialog areaId={area.id} project={project} onDeleted={onProjectDeleted} />
        </div>
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
        {project.workstreams.length === 0 ? (
          <div className="px-6 py-14 text-center text-sm text-muted-foreground">
            No workstreams yet in {project.name}. Add the first one to start tracking status.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-charcoal hover:bg-charcoal">
                <TableHead className="text-[10px] font-medium tracking-wider text-white uppercase">
                  Workstream
                </TableHead>
                <TableHead className="text-[10px] font-medium tracking-wider text-white uppercase">
                  Status
                </TableHead>
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
                <TableHead className="text-[10px] font-medium tracking-wider text-white uppercase">
                  Target
                </TableHead>
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
              {project.workstreams.map((ws) => (
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
        projectId={project.id}
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
