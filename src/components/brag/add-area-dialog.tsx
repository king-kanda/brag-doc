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
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { AREA_ACCENTS } from "@/lib/types";
import { useAreaStore } from "@/lib/store";
import { toast } from "sonner";

export function AddAreaDialog({
  onCreated,
  variant = "sidebar",
}: {
  onCreated?: (id: string) => void;
  variant?: "sidebar" | "tile";
}) {
  const addArea = useAreaStore((s) => s.addArea);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [descriptor, setDescriptor] = useState("");
  const [color, setColor] = useState(AREA_ACCENTS[0]);

  function reset() {
    setName("");
    setDescriptor("");
    setColor(AREA_ACCENTS[0]);
  }

  function handleCreate() {
    if (!name.trim()) return;
    addArea({ name: name.trim(), descriptor: descriptor.trim() || "New area", color });
    toast.success(`${name.trim()} added`);
    const newId = useAreaStore.getState().activeAreaId;
    if (newId) onCreated?.(newId);
    reset();
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
      {variant === "tile" ? (
        <DialogTrigger
          render={
            <button className="flex h-56 w-44 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 text-smoke transition-colors hover:border-white/30 hover:text-white" />
          }
        >
          <Plus className="h-5 w-5" />
          <span className="text-[13px] font-normal">Add area</span>
        </DialogTrigger>
      ) : (
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
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Add a new area</DialogTitle>
          <DialogDescription>
            A new part of life or work to track — a job, a startup, a business, or anything else.
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
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!name.trim()} className="bg-electric hover:bg-electric/90">
            Create area
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
