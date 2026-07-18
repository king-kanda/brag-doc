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
import { Pencil } from "lucide-react";
import { useAreaStore } from "@/lib/store";
import { Project } from "@/lib/types";
import { toast } from "sonner";

export function EditWeekDialog({ areaId, project }: { areaId: string; project: Project }) {
  const updateProjectMeta = useAreaStore((s) => s.updateProjectMeta);
  const [open, setOpen] = useState(false);
  const [descriptor, setDescriptor] = useState(project.descriptor);
  const [owner, setOwner] = useState(project.owner);
  const [nextMilestoneDate, setNextMilestoneDate] = useState(project.nextMilestoneDate);
  const [nextMilestoneLabel, setNextMilestoneLabel] = useState(project.nextMilestoneLabel);
  const [needToKnow, setNeedToKnow] = useState(project.needToKnow);

  function reset() {
    setDescriptor(project.descriptor);
    setOwner(project.owner);
    setNextMilestoneDate(project.nextMilestoneDate);
    setNextMilestoneLabel(project.nextMilestoneLabel);
    setNeedToKnow(project.needToKnow);
  }

  function handleSave() {
    updateProjectMeta(areaId, project.id, {
      descriptor: descriptor.trim(),
      owner: owner.trim() || "You",
      nextMilestoneDate: nextMilestoneDate.trim(),
      nextMilestoneLabel: nextMilestoneLabel.trim(),
      needToKnow: needToKnow.trim(),
    });
    toast.success("Week updated");
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <Pencil className="h-3.5 w-3.5" />
        Edit week
      </DialogTrigger>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Edit this week</DialogTitle>
          <DialogDescription>Owner, next milestone, and what leadership needs to know.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="week-descriptor">Focus for the week</Label>
            <Input
              id="week-descriptor"
              placeholder="e.g. Ship the onboarding rewrite"
              value={descriptor}
              onChange={(e) => setDescriptor(e.target.value)}
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="week-owner">Owner</Label>
              <Input id="week-owner" value={owner} onChange={(e) => setOwner(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="week-milestone-date">Next milestone date</Label>
              <Input
                id="week-milestone-date"
                placeholder="e.g. 28 Jul"
                value={nextMilestoneDate}
                onChange={(e) => setNextMilestoneDate(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="week-milestone-label">Next milestone</Label>
            <Input
              id="week-milestone-label"
              placeholder="e.g. Beta ships to first users"
              value={nextMilestoneLabel}
              onChange={(e) => setNextMilestoneLabel(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="week-need-to-know">Need to know</Label>
            <Input
              id="week-need-to-know"
              placeholder="The decision or input needed, and by when"
              value={needToKnow}
              onChange={(e) => setNeedToKnow(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-electric hover:bg-electric/90">
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
