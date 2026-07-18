"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { AreaGrid } from "./area-grid";
import { AreaWeekView } from "./area-week-view";
import { useAreaStore } from "@/lib/store";
import { ScrollArea } from "@/components/ui/scroll-area";

type View = { level: "home" } | { level: "area"; areaId: string };

export function DashboardShell() {
  const areas = useAreaStore((s) => s.areas);
  const [view, setView] = useState<View>({ level: "home" });

  const activeAreas = areas.filter((a) => !a.archived);
  const currentArea = view.level === "area" ? areas.find((a) => a.id === view.areaId) : undefined;
  const showHome = view.level === "home" || !currentArea;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar
        activeAreaId={currentArea?.id ?? null}
        isHome={showHome}
        onSelectHome={() => setView({ level: "home" })}
        onSelectArea={(areaId) => setView({ level: "area", areaId })}
      />
      <ScrollArea className="h-screen flex-1">
        {showHome ? (
          <AreaGrid areas={activeAreas} onSelectArea={(areaId) => setView({ level: "area", areaId })} />
        ) : (
          <div className="mx-auto max-w-6xl px-8 py-8">
            <AreaWeekView
              key={currentArea.id}
              area={currentArea}
              onBack={() => setView({ level: "home" })}
              onAreaDeleted={() => setView({ level: "home" })}
            />
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
