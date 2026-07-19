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

// Excalidraw's onChange fires on every scene mutation (drag, keystroke, even
// selection). Only sanitize + serialize the scene once, right before it's
// actually persisted, instead of on every single onChange call.
function sanitizeScene(elements: readonly unknown[], appState: Record<string, unknown>): SceneData {
  // `collaborators` is a runtime-only Map — JSON.stringify turns it into `{}`,
  // and Excalidraw crashes on load if it gets fed a plain object back where it
  // expects a Map (or nothing). Drop it; it's never meaningful to persist.
  const { collaborators: _collaborators, ...rest } = appState;
  void _collaborators;
  return {
    elements: elements as unknown[],
    appState: JSON.parse(JSON.stringify(rest)),
  };
}

export function WhiteboardCanvas({ boardId, initialData }: { boardId: string; initialData: unknown }) {
  const updateWhiteboardData = useAreaStore((s) => s.updateWhiteboardData);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<{ elements: readonly unknown[]; appState: Record<string, unknown> } | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (pendingRef.current) {
        updateWhiteboardData(boardId, sanitizeScene(pendingRef.current.elements, pendingRef.current.appState));
      }
    };
    // Flush-on-unmount only needs the id this instance was mounted with.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId]);

  const data = (initialData ?? {}) as SceneData;
  // Defensively strip `collaborators` on load too — boards saved before this
  // fix may already have a corrupted (non-Map) value stored in the DB.
  const { collaborators: _loadedCollaborators, ...safeAppState } = data.appState ?? {};
  void _loadedCollaborators;

  return (
    <div className="h-full w-full overflow-hidden rounded-lg border border-border">
      <Excalidraw
        initialData={{ elements: (data.elements as never) ?? [], appState: safeAppState }}
        onChange={(elements, appState) => {
          pendingRef.current = { elements, appState: appState as unknown as Record<string, unknown> };
          if (timerRef.current) clearTimeout(timerRef.current);
          timerRef.current = setTimeout(() => {
            if (!pendingRef.current) return;
            updateWhiteboardData(boardId, sanitizeScene(pendingRef.current.elements, pendingRef.current.appState));
            pendingRef.current = null;
          }, 800);
        }}
      />
    </div>
  );
}
