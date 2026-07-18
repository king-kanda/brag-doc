"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useAreaStore } from "@/lib/store";
import { Project } from "@/lib/types";
import { toast } from "sonner";

export function AddProjectDialog({
  areaId,
  project,
  onCreated,
  onDeleted,
}: {
  areaId: string;
  project?: Project;
  onCreated?: (id: string) => void;
  onDeleted?: () => void;
}) {
  const addProject = useAreaStore((s) => s.addProject);
  const updateProject = useAreaStore((s) => s.updateProject);
  const deleteProject = useAreaStore((s) => s.deleteProject);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(project?.name ?? "");
  const [descriptor, setDescriptor] = useState(project?.descriptor ?? "");
  const [owner, setOwner] = useState(project?.owner ?? "You");
  const [nextMilestoneDate, setNextMilestoneDate] = useState(project?.nextMilestoneDate ?? "");
  const [nextMilestoneLabel, setNextMilestoneLabel] = useState(project?.nextMilestoneLabel ?? "");
  const [needToKnow, setNeedToKnow] = useState(project?.needToKnow ?? "");

  function reset() {
    setName(project?.name ?? "");
    setDescriptor(project?.descriptor ?? "");
    setOwner(project?.owner ?? "You");
    setNextMilestoneDate(project?.nextMilestoneDate ?? "");
    setNextMilestoneLabel(project?.nextMilestoneLabel ?? "");
    setNeedToKnow(project?.needToKnow ?? "");
  }

  function handleSave() {
    if (!name.trim()) return;
    const payload = {
      name: name.trim(),
      descriptor: descriptor.trim() || "New project",
      owner: owner.trim() || "You",
      nextMilestoneDate: nextMilestoneDate.trim() || "TBD",
      nextMilestoneLabel: nextMilestoneLabel.trim(),
      needToKnow: needToKnow.trim() || "Nothing to flag right now.",
    };
    if (project) {
      updateProject(areaId, project.id, payload);
      toast.success("Project updated");
    } else {
      const newId = addProject(areaId, payload);
      toast.success(`${name.trim()} added`);
      onCreated?.(newId);
    }
    setOpen(false);
  }

  function handleDelete() {
    if (!project) return;
    deleteProject(areaId, project.id);
    toast.success(`${project.name} removed`);
    setOpen(false);
    onDeleted?.();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      {project ? (
        <DialogTrigger
          render={
            <Button variant="outline" size="sm">
              <Pencil className="h-3.5 w-3.5" />
              Edit project
            </Button>
          }
        />
      ) : (
        <DialogTrigger
          render={
            <button className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 px-6 py-4 text-[13px] text-smoke transition-colors hover:border-white/30 hover:text-white" />
          }
        >
          <Plus className="h-4 w-4" />
          Add project
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>{project ? "Edit project" : "Add a new project"}</DialogTitle>
          <DialogDescription>A key task or initiative within this area.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="project-name">Name</Label>
            <Input
              id="project-name"
              placeholder="e.g. Client onboarding"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="project-descriptor">Short descriptor</Label>
            <Input
              id="project-descriptor"
              placeholder="e.g. Delivery"
              value={descriptor}
              onChange={(e) => setDescriptor(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="project-owner">Owner</Label>
              <Input id="project-owner" value={owner} onChange={(e) => setOwner(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="project-milestone-date">Next milestone date</Label>
              <Input
                id="project-milestone-date"
                placeholder="e.g. 28 Jul"
                value={nextMilestoneDate}
                onChange={(e) => setNextMilestoneDate(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="project-milestone-label">Next milestone</Label>
            <Input
              id="project-milestone-label"
              placeholder="e.g. Beta ships to first users"
              value={nextMilestoneLabel}
              onChange={(e) => setNextMilestoneLabel(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="project-need-to-know">Need to know</Label>
            <Input
              id="project-need-to-know"
              placeholder="The decision or input needed, and by when"
              value={needToKnow}
              onChange={(e) => setNeedToKnow(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter className={project ? "sm:justify-between" : undefined}>
          {project && (
            <Button variant="ghost" onClick={handleDelete} className="text-coral hover:bg-coral/10 hover:text-coral">
              <Trash2 className="h-3.5 w-3.5" />
              Delete project
            </Button>
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!name.trim()} className="bg-electric hover:bg-electric/90">
              {project ? "Save" : "Create project"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
