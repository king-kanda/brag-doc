import { cn } from "@/lib/utils";
import { RagStatus, DateTagState, Priority, RAG_LABEL, DATE_TAG_LABEL } from "@/lib/types";

export function RagPill({ status, size = "sm" }: { status: RagStatus; size?: "sm" | "lg" }) {
  const styles: Record<RagStatus, string> = {
    done: "bg-mint/10 text-[#0a9b78] dark:bg-mint/15 dark:text-mint",
    progress: "bg-amber/10 text-[#b9791a] dark:bg-amber/15 dark:text-amber",
    notstarted: "bg-coral/10 text-[#d4534f] dark:bg-coral/15 dark:text-coral",
  };
  const dotStyles: Record<RagStatus, string> = {
    done: "bg-mint",
    progress: "bg-amber",
    notstarted: "bg-coral",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap",
        size === "sm" ? "px-2.5 py-1 text-[11px]" : "px-3.5 py-1.5 text-xs",
        styles[status]
      )}
    >
      <span className={cn("rounded-full flex-shrink-0", size === "sm" ? "w-2 h-2" : "w-2.5 h-2.5", dotStyles[status])} />
      {RAG_LABEL[status]}
    </span>
  );
}

export function PriorityChip({ priority }: { priority: Priority }) {
  const styles: Record<Priority, string> = {
    1: "bg-electric text-white",
    2: "bg-electric/70 text-white",
    3: "bg-electric/40 text-[#3b2f8f] dark:text-white",
    4: "bg-electric/25 text-[#5446b0] dark:text-white",
    5: "bg-electric/15 text-electric",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center w-7 h-7 rounded-lg text-sm font-semibold flex-shrink-0",
        styles[priority]
      )}
    >
      {priority}
    </span>
  );
}

export function DateTag({ tag }: { tag: DateTagState }) {
  const styles: Record<DateTagState, string> = {
    ontrack: "bg-mint/15 text-[#0a9b78] dark:text-mint",
    risk: "bg-amber/15 text-[#b9791a] dark:text-amber",
    late: "bg-coral/15 text-[#d4534f] dark:text-coral",
    complete: "bg-muted text-muted-foreground",
  };
  return (
    <span
      className={cn(
        "inline-block mt-1 text-[9px] font-medium tracking-wider uppercase px-1.5 py-0.5 rounded",
        styles[tag]
      )}
    >
      {DATE_TAG_LABEL[tag]}
    </span>
  );
}

export function Blocker({ text }: { text: string | null }) {
  if (!text) {
    return <span className="text-smoke italic text-[11.5px]">None</span>;
  }
  return (
    <span className="text-[#c0392b] text-[11.5px]">
      <span aria-hidden>⚠ </span>
      {text}
    </span>
  );
}
