"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Home, Archive, ArchiveRestore, LogOut, Sparkles, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAreaStore, useAuthStore } from "@/lib/store";
import { summarizeArea } from "@/lib/derive";
import { AddAreaDialog } from "./add-area-dialog";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function Sidebar({
  activeAreaId,
  isHome,
  onSelectHome,
  onSelectArea,
}: {
  activeAreaId: string | null;
  isHome: boolean;
  onSelectHome: () => void;
  onSelectArea: (id: string) => void;
}) {
  const areas = useAreaStore((s) => s.areas);
  const archiveArea = useAreaStore((s) => s.archiveArea);
  const restoreArea = useAreaStore((s) => s.restoreArea);
  const logout = useAuthStore((s) => s.logout);
  const email = useAuthStore((s) => s.email);
  const router = useRouter();
  const [showArchived, setShowArchived] = useState(false);

  const activeAreas = areas.filter((a) => !a.archived);
  const archivedAreas = areas.filter((a) => a.archived);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <aside className="flex h-full w-64 flex-shrink-0 flex-col border-r border-white/8 bg-ink text-white">
      <div className="flex items-center gap-2.5 px-5 pt-6 pb-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-electric/15">
          <Sparkles className="h-4 w-4 text-electric" />
        </div>
        <span className="text-[15px] font-medium tracking-tight">Brag Doc</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3">
        <button
          onClick={onSelectHome}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-normal transition-colors",
            isHome ? "bg-electric/15 text-white" : "text-smoke hover:bg-white/5 hover:text-white"
          )}
        >
          <Home className="h-4 w-4" />
          Home
        </button>

        <div className="mt-5 mb-1.5 px-3 text-[10px] font-semibold tracking-widest text-smoke/70 uppercase">
          Areas
        </div>
        <div className="space-y-0.5">
          {activeAreas.map((area) => {
            const summary = summarizeArea(area);
            return (
              <div key={area.id} className="group relative">
                <button
                  onClick={() => onSelectArea(area.id)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg py-2 pr-9 pl-3 text-left text-[13px] font-normal transition-colors",
                    activeAreaId === area.id
                      ? "bg-electric/15 text-white"
                      : "text-smoke hover:bg-white/5 hover:text-white"
                  )}
                >
                  <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: area.color }} />
                  <span className="flex-1 truncate">{area.name}</span>
                  {summary.blockers > 0 && (
                    <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-coral" />
                  )}
                </button>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          archiveArea(area.id);
                        }}
                        className="absolute top-1/2 right-1.5 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-smoke opacity-0 transition-opacity hover:bg-white/10 hover:text-white group-hover:opacity-100"
                      />
                    }
                  >
                    <Archive className="h-3.5 w-3.5" />
                  </TooltipTrigger>
                  <TooltipContent side="right">Archive area</TooltipContent>
                </Tooltip>
              </div>
            );
          })}
        </div>

        <div className="mt-1">
          <AddAreaDialog onCreated={onSelectArea} />
        </div>

        {archivedAreas.length > 0 && (
          <div className="mt-5">
            <button
              onClick={() => setShowArchived((v) => !v)}
              className="flex w-full items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold tracking-widest text-smoke/70 uppercase hover:text-smoke"
            >
              <ChevronDown className={cn("h-3 w-3 transition-transform", !showArchived && "-rotate-90")} />
              Archived ({archivedAreas.length})
            </button>
            {showArchived && (
              <div className="mt-1 space-y-0.5">
                {archivedAreas.map((area) => (
                  <div
                    key={area.id}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-normal text-smoke/60"
                  >
                    <span className="h-2 w-2 flex-shrink-0 rounded-full opacity-40" style={{ backgroundColor: area.color }} />
                    <span className="flex-1 truncate line-through decoration-smoke/40">{area.name}</span>
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <button
                            onClick={() => restoreArea(area.id)}
                            className="rounded-md p-1 hover:bg-white/10 hover:text-white"
                          />
                        }
                      >
                        <ArchiveRestore className="h-3.5 w-3.5" />
                      </TooltipTrigger>
                      <TooltipContent side="right">Restore area</TooltipContent>
                    </Tooltip>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </nav>

      <div className="border-t border-white/8 px-3 py-3">
        <div className="flex items-center gap-2.5 rounded-lg px-2 py-1.5">
          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-[11px] font-medium">
            {email?.[0]?.toUpperCase() ?? "?"}
          </div>
          <span className="flex-1 truncate text-[12px] text-smoke">{email}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-smoke hover:bg-white/10 hover:text-white"
            onClick={handleLogout}
          >
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
