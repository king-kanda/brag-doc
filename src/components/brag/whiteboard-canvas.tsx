"use client";

import dynamic from "next/dynamic";
import "@excalidraw/excalidraw/index.css";
import { useEffect, useRef } from "react";
import { useAreaStore } from "@/lib/store";

const Excalidraw = dynamic(() => import("@excalidraw/excalidraw").then((mod) => mod.Excalidraw), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Loading canvas…</div>
  ),
});

interface SceneData {
  elements?: unknown[];
  appState?: Record<string, unknown>;
}

export function WhiteboardCanvas({ boardId, initialData }: { boardId: string; initialData: unknown }) {
  const updateWhiteboardData = useAreaStore((s) => s.updateWhiteboardData);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<SceneData | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (pendingRef.current) updateWhiteboardData(boardId, pendingRef.current);
    };
    // Flush-on-unmount only needs the id this instance was mounted with.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId]);

  const data = (initialData ?? {}) as SceneData;

  return (
    <div className="h-full w-full overflow-hidden rounded-lg border border-border">
      <Excalidraw
        initialData={{ elements: (data.elements as never) ?? [], appState: data.appState ?? {} }}
        onChange={(elements, appState) => {
          // Embedded image data (files) is intentionally not persisted for now —
          // drop it to keep saved scenes small; strip non-serializable runtime
          // fields (e.g. the collaborators Map) via a JSON round-trip.
          const scene: SceneData = {
            elements: elements as unknown[],
            appState: JSON.parse(JSON.stringify(appState)),
          };
          pendingRef.current = scene;
          if (timerRef.current) clearTimeout(timerRef.current);
          timerRef.current = setTimeout(() => {
            updateWhiteboardData(boardId, scene);
            pendingRef.current = null;
          }, 800);
        }}
      />
    </div>
  );
}
