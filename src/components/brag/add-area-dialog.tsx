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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AREA_ACCENTS, Area } from "@/lib/types";
import { useAreaStore } from "@/lib/store";
import { WEEKDAY_OPTIONS } from "@/lib/weeks";
import { toast } from "sonner";

export function AddAreaDialog({
  onCreated,
  onDeleted,
  variant = "sidebar",
  area,
}: {
  onCreated?: (id: string) => void;
  onDeleted?: () => void;
  variant?: "sidebar" | "tile" | "edit";
  /** When provided, the dialog edits this area instead of creating a new one. */
  area?: Area;
}) {
  const addArea = useAreaStore((s) => s.addArea);
  const updateArea = useAreaStore((s) => s.updateArea);
  const deleteArea = useAreaStore((s) => s.deleteArea);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(area?.name ?? "");
  const [descriptor, setDescriptor] = useState(area?.descriptor ?? "");
  const [color, setColor] = useState(area?.color ?? AREA_ACCENTS[0]);
  const [weekStartsOn, setWeekStartsOn] = useState(area?.weekStartsOn ?? 1);

  function reset() {
    setName(area?.name ?? "");
    setDescriptor(area?.descriptor ?? "");
    setColor(area?.color ?? AREA_ACCENTS[0]);
    setWeekStartsOn(area?.weekStartsOn ?? 1);
  }

  function handleSave() {
    if (!name.trim()) return;
    if (area) {
      updateArea(area.id, { name: name.trim(), descriptor: descriptor.trim() || "New area", color, weekStartsOn });
      toast.success("Area updated");
    } else {
      addArea({ name: name.trim(), descriptor: descriptor.trim() || "New area", color, weekStartsOn });
      toast.success(`${name.trim()} added`);
      const newId = useAreaStore.getState().activeAreaId;
      if (newId) onCreated?.(newId);
    }
    setOpen(false);
  }

  function handleDelete() {
    if (!area) return;
    deleteArea(area.id);
    toast.success(`${area.name} deleted`);
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
      {variant === "tile" && (
        <DialogTrigger
          render={
            <button className="flex h-56 w-44 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 text-smoke transition-colors hover:border-white/30 hover:text-white" />
          }
        >
          <Plus className="h-5 w-5" />
          <span className="text-[13px] font-normal">Add area</span>
        </DialogTrigger>
      )}
      {variant === "sidebar" && (
        <DialogTrigger
          render={
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-[13px] font-normal text-smoke hover:bg-white/5 hover:text-white"
            />
          }
        >
          <Plus className="h-4 w-4" />
          Add area
        </DialogTrigger>
      )}
      {variant === "edit" && (
        <DialogTrigger render={<Button variant="outline" size="sm" />}>
          <Pencil className="h-3.5 w-3.5" />
          Edit area
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>{area ? "Edit area" : "Add a new area"}</DialogTitle>
          <DialogDescription>
            {area
              ? "Update the name, color, or which day this area's week starts on."
              : "A new part of life or work to track — a job, a startup, a business, or anything else."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="area-name">Name</Label>
            <Input
              id="area-name"
              placeholder="e.g. Side project"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="area-descriptor">Short descriptor</Label>
            <Input
              id="area-descriptor"
              placeholder="e.g. Freelance · design"
              value={descriptor}
              onChange={(e) => setDescriptor(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Week starts on</Label>
            <Select value={String(weekStartsOn)} onValueChange={(v) => v && setWeekStartsOn(Number(v))}>
              <SelectTrigger className="w-full">
                <SelectValue>{(v: string) => WEEKDAY_OPTIONS.find((o) => String(o.value) === v)?.label}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {WEEKDAY_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={String(o.value)}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Accent color</Label>
            <div className="flex gap-2">
              {AREA_ACCENTS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "h-7 w-7 rounded-full ring-offset-2 ring-offset-background transition",
                    color === c && "ring-2 ring-foreground"
                  )}
                  style={{ backgroundColor: c }}
                  aria-label={`Choose color ${c}`}
                />
              ))}
            </div>
          </div>
        </div>
        <DialogFooter className={area ? "sm:justify-between" : undefined}>
          {area && (
            <Button variant="ghost" onClick={handleDelete} className="text-coral hover:bg-coral/10 hover:text-coral">
              <Trash2 className="h-3.5 w-3.5" />
              Delete area
            </Button>
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!name.trim()} className="bg-electric hover:bg-electric/90">
              {area ? "Save" : "Create area"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
