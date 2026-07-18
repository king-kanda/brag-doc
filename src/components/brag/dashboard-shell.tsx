"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "./sidebar";
import { AreaGrid } from "./area-grid";
import { AreaWeekView } from "./area-week-view";
import { useAreaStore } from "@/lib/store";
import { ScrollArea } from "@/components/ui/scroll-area";

type View = { level: "home" } | { level: "area"; areaId: string };

export function DashboardShell() {
  const areas = useAreaStore((s) => s.areas);
  const loaded = useAreaStore((s) => s.loaded);
  const hydrate = useAreaStore((s) => s.hydrate);
  const [view, setView] = useState<View>({ level: "home" });

  useEffect(() => {
    hydrate();
    // Load once on mount; `hydrate` is a stable store action reference.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeAreas = areas.filter((a) => !a.archived);
  const currentArea = view.level === "area" ? areas.find((a) => a.id === view.areaId) : undefined;
  const showHome = view.level === "home" || !currentArea;

  if (!loaded) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background text-sm text-muted-foreground">
        Loading your data…
      </div>
    );
  }

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
