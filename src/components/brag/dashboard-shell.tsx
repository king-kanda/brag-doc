"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { AreaGrid } from "./area-grid";
import { ProjectLanes } from "./project-lanes";
import { ProjectDetail } from "./project-detail";
import { useAreaStore } from "@/lib/store";
import { ScrollArea } from "@/components/ui/scroll-area";

type View =
  | { level: "home" }
  | { level: "area"; areaId: string }
  | { level: "project"; areaId: string; projectId: string };

export function DashboardShell() {
  const areas = useAreaStore((s) => s.areas);
  const [view, setView] = useState<View>({ level: "home" });

  const activeAreas = areas.filter((a) => !a.archived);
  const currentArea = view.level !== "home" ? areas.find((a) => a.id === view.areaId) : undefined;
  const currentProject =
    view.level === "project" && currentArea
      ? currentArea.projects.find((p) => p.id === view.projectId)
      : undefined;

  let content: React.ReactNode;
  let activeAreaIdForSidebar: string | null = null;

  if (view.level === "project" && currentArea && currentProject) {
    activeAreaIdForSidebar = currentArea.id;
    content = (
      <div className="mx-auto max-w-6xl px-8 py-8">
        <ProjectDetail
          area={currentArea}
          project={currentProject}
          onBack={() => setView({ level: "area", areaId: currentArea.id })}
          onProjectDeleted={() => setView({ level: "area", areaId: currentArea.id })}
        />
      </div>
    );
  } else if (view.level === "area" && currentArea) {
    activeAreaIdForSidebar = currentArea.id;
    content = (
      <ProjectLanes
        area={currentArea}
        onSelectProject={(projectId) => setView({ level: "project", areaId: currentArea.id, projectId })}
        onBack={() => setView({ level: "home" })}
      />
    );
  } else {
    content = <AreaGrid areas={activeAreas} onSelectArea={(areaId) => setView({ level: "area", areaId })} />;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar
        activeAreaId={activeAreaIdForSidebar}
        isHome={view.level === "home"}
        onSelectHome={() => setView({ level: "home" })}
        onSelectArea={(areaId) => setView({ level: "area", areaId })}
      />
      <ScrollArea className="h-screen flex-1">{content}</ScrollArea>
    </div>
  );
}
