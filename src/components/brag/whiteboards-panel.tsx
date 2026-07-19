"use client";

import { useState } from "react";
import { useAreaStore } from "@/lib/store";
import { Whiteboard } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WhiteboardCanvas } from "./whiteboard-canvas";
import { ChevronLeft, Pencil, PenTool, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export function WhiteboardsPanel({
  areaId,
  workstreamId = null,
}: {
  areaId: string;
  workstreamId?: string | null;
}) {
  const whiteboards = useAreaStore((s) => s.whiteboards);
  const addWhiteboard = useAreaStore((s) => s.addWhiteboard);
  const renameWhiteboard = useAreaStore((s) => s.renameWhiteboard);
  const deleteWhiteboard = useAreaStore((s) => s.deleteWhiteboard);

  const [openId, setOpenId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const boards = whiteboards
    .filter((b) => b.areaId === areaId && b.workstreamId === workstreamId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  const openBoard = boards.find((b) => b.id === openId);

  function handleCreate() {
    const name = `Board ${boards.length + 1}`;
    const newId = addWhiteboard(areaId, workstreamId, name);
    setOpenId(newId);
  }

  function startRename(board: Whiteboard) {
    setRenamingId(board.id);
    setRenameValue(board.name);
  }

  function commitRename(id: string) {
    if (renameValue.trim()) renameWhiteboard(id, renameValue.trim());
    setRenamingId(null);
  }

  function handleDelete(board: Whiteboard) {
    deleteWhiteboard(board.id);
    toast.success(`${board.name} deleted`);
    if (openId === board.id) setOpenId(null);
  }

  if (openBoard) {
    return (
      <div className="flex h-[560px] flex-col gap-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setOpenId(null)}
            className="inline-flex items-center gap-1 text-[12px] text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            All whiteboards
          </button>
          <span className="text-[13px] font-medium text-foreground">{openBoard.name}</span>
          <span className="w-[90px]" />
        </div>
        <WhiteboardCanvas key={openBoard.id} boardId={openBoard.id} initialData={openBoard.data} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-[12.5px] text-muted-foreground">
          {boards.length} saved whiteboard{boards.length === 1 ? "" : "s"}
        </p>
        <Button size="sm" onClick={handleCreate} className="bg-electric hover:bg-electric/90">
          <Plus className="h-3.5 w-3.5" />
          New whiteboard
        </Button>
      </div>

      {boards.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-border px-6 py-14 text-center text-sm text-muted-foreground">
          No whiteboards yet. Create one to start sketching.
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {boards.map((board) => (
            <div
              key={board.id}
              className="group relative flex h-28 flex-col justify-between rounded-xl border border-border bg-card p-3 shadow-sm transition-colors hover:bg-muted/40"
            >
              <button
                onClick={() => setOpenId(board.id)}
                className="flex flex-1 flex-col items-start justify-center gap-1.5 text-left"
              >
                <PenTool className="h-4 w-4 text-electric" />
                {renamingId === board.id ? (
                  <Input
                    autoFocus
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onBlur={() => commitRename(board.id)}
                    onKeyDown={(e) => e.key === "Enter" && commitRename(board.id)}
                    className="h-6 text-[12px]"
                  />
                ) : (
                  <span className="line-clamp-1 text-[12.5px] font-medium text-foreground">{board.name}</span>
                )}
              </button>
              <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => startRename(board)}
                  className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <Pencil className="h-3 w-3" />
                </button>
                <button
                  onClick={() => handleDelete(board)}
                  className="rounded-md p-1 text-muted-foreground hover:bg-coral/10 hover:text-coral"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
