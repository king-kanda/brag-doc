"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StarRating } from "./star-rating";
import { useAreaStore } from "@/lib/store";
import {
  DateTagState,
  Priority,
  RagStatus,
  Workstream,
  RAG_LABEL,
  DATE_TAG_LABEL,
} from "@/lib/types";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

const EMPTY: Omit<Workstream, "id" | "updatedAt"> = {
  name: "",
  descriptor: "",
  status: "notstarted",
  priority: 3,
  blocker: null,
  details: "",
  nextSteps: "",
  targetDate: "",
  dateTag: "ontrack",
  difficulty: 3,
  enjoyment: 3,
};

export function WorkstreamEditorSheet({
  areaId,
  projectId,
  workstream,
  open,
  onOpenChange,
}: {
  areaId: string;
  projectId: string;
  workstream: Workstream | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const addWorkstream = useAreaStore((s) => s.addWorkstream);
  const updateWorkstream = useAreaStore((s) => s.updateWorkstream);
  const deleteWorkstream = useAreaStore((s) => s.deleteWorkstream);

  const [form, setForm] = useState<Omit<Workstream, "id" | "updatedAt">>(() =>
    workstream ? { ...workstream } : EMPTY
  );

  function handleSave() {
    if (!form.name.trim()) return;
    const payload = { ...form, name: form.name.trim() };
    if (workstream) {
      updateWorkstream(areaId, projectId, workstream.id, payload);
      toast.success("Workstream updated");
    } else {
      addWorkstream(areaId, projectId, payload);
      toast.success("Workstream added");
    }
    onOpenChange(false);
  }

  function handleDelete() {
    if (!workstream) return;
    deleteWorkstream(areaId, projectId, workstream.id);
    toast.success("Workstream removed");
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{workstream ? "Edit workstream" : "Add workstream"}</SheetTitle>
          <SheetDescription>
            Track status, priority, blockers, and how it went.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 px-4 pb-4">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Q3 client audit"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label>Short descriptor</Label>
            <Input
              value={form.descriptor}
              onChange={(e) => setForm((f) => ({ ...f, descriptor: e.target.value }))}
              placeholder="e.g. Delivery"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => v && setForm((f) => ({ ...f, status: v as RagStatus }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>{(v: RagStatus) => RAG_LABEL[v]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="notstarted">Not started</SelectItem>
                  <SelectItem value="progress">In progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select
                value={String(form.priority)}
                onValueChange={(v) => setForm((f) => ({ ...f, priority: Number(v) as Priority }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>{(v: string) => `P${v}`}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((p) => (
                    <SelectItem key={p} value={String(p)}>
                      P{p} {p === 1 ? "(highest)" : p === 5 ? "(lowest)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Blocker</Label>
            <Input
              value={form.blocker ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, blocker: e.target.value || null }))}
              placeholder="Leave blank if none"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Details</Label>
            <Textarea
              value={form.details}
              onChange={(e) => setForm((f) => ({ ...f, details: e.target.value }))}
              placeholder="Current state in one or two lines"
              rows={3}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Next steps</Label>
            <Textarea
              value={form.nextSteps}
              onChange={(e) => setForm((f) => ({ ...f, nextSteps: e.target.value }))}
              placeholder="The immediate next action"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Target date</Label>
              <Input
                value={form.targetDate}
                onChange={(e) => setForm((f) => ({ ...f, targetDate: e.target.value }))}
                placeholder="e.g. 28 Jul"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Date status</Label>
              <Select
                value={form.dateTag}
                onValueChange={(v) => v && setForm((f) => ({ ...f, dateTag: v as DateTagState }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>{(v: DateTagState) => DATE_TAG_LABEL[v]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ontrack">On track</SelectItem>
                  <SelectItem value="risk">At risk</SelectItem>
                  <SelectItem value="late">Blocked</SelectItem>
                  <SelectItem value="complete">Complete</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-muted/40 p-3">
            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Difficulty
              </Label>
              <StarRating
                value={form.difficulty}
                onChange={(v) => setForm((f) => ({ ...f, difficulty: v }))}
                color="text-electric"
                size="md"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Enjoyment
              </Label>
              <StarRating
                value={form.enjoyment}
                onChange={(v) => setForm((f) => ({ ...f, enjoyment: v }))}
                color="text-pink"
                size="md"
              />
            </div>
          </div>
        </div>

        <SheetFooter className="flex-row justify-between sm:justify-between">
          {workstream ? (
            <Button variant="ghost" onClick={handleDelete} className="text-coral hover:bg-coral/10 hover:text-coral">
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!form.name.trim()} className="bg-electric hover:bg-electric/90">
              Save
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
