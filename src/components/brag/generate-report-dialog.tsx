"use client";

import { useMemo, useState } from "react";
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
import { ChevronLeft, ChevronRight, Copy, Download, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAreaStore } from "@/lib/store";
import {
  PeriodPreset,
  ReportScope,
  buildMarkdownReport,
  computePeriod,
  customPeriod,
  filterEvents,
  shiftAnchor,
} from "@/lib/reports";
import { toast } from "sonner";

const PRESETS: { value: PeriodPreset; label: string }[] = [
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "quarter", label: "Quarter" },
  { value: "year", label: "Year" },
  { value: "custom", label: "Custom" },
];

function toInputDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function GenerateReportDialog({
  scope,
  areaName,
  projectName,
  triggerClassName,
}: {
  scope: ReportScope;
  areaName: string;
  projectName?: string;
  /** Override trigger button styling — e.g. for use on a dark background. */
  triggerClassName?: string;
}) {
  const events = useAreaStore((s) => s.events);
  const [open, setOpen] = useState(false);
  const [preset, setPreset] = useState<PeriodPreset>("month");
  const [anchor, setAnchor] = useState(() => new Date());

  const defaultTo = new Date();
  const defaultFrom = new Date();
  defaultFrom.setDate(defaultFrom.getDate() - 30);
  const [customFrom, setCustomFrom] = useState(() => toInputDate(defaultFrom));
  const [customTo, setCustomTo] = useState(() => toInputDate(defaultTo));

  const period = useMemo(() => {
    if (preset === "custom") {
      const from = new Date(customFrom + "T00:00:00");
      const to = new Date(customTo + "T00:00:00");
      return customPeriod(from, to);
    }
    return computePeriod(preset, anchor);
  }, [preset, anchor, customFrom, customTo]);

  const filtered = useMemo(() => filterEvents(events, scope, period), [events, scope, period]);

  const markdown = useMemo(
    () => buildMarkdownReport({ scope, areaName, projectName, period, events: filtered }),
    [scope, areaName, projectName, period, filtered]
  );

  const title = scope.level === "project" ? projectName ?? "Project" : areaName;

  function handleCopy() {
    navigator.clipboard
      .writeText(markdown)
      .then(() => toast.success("Report copied as markdown"))
      .catch(() => toast.error("Couldn't copy to clipboard — try Download instead"));
  }

  function handleDownload() {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slugify(title)}-report-${slugify(period.label)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" className={triggerClassName} />}>
        <FileText className="h-3.5 w-3.5" />
        Generate report
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Generate report — {title}</DialogTitle>
          <DialogDescription>
            {scope.level === "area"
              ? "Rolls up status changes across every project in this area."
              : "Status changes for this project only."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-lg border border-border p-0.5">
              {PRESETS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPreset(p.value)}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-[12px] font-medium transition-colors",
                    preset === p.value
                      ? "bg-electric text-white"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {preset !== "custom" ? (
              <div className="flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setAnchor((a) => shiftAnchor(preset, a, -1))}
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <span className="min-w-[130px] text-center text-[12.5px] font-medium text-foreground">
                  {period.label}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setAnchor((a) => shiftAnchor(preset, a, 1))}
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="report-from" className="text-[11px] text-muted-foreground">
                    From
                  </Label>
                  <Input
                    id="report-from"
                    type="date"
                    value={customFrom}
                    onChange={(e) => setCustomFrom(e.target.value)}
                    className="h-7 w-[140px] text-[12px]"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="report-to" className="text-[11px] text-muted-foreground">
                    To
                  </Label>
                  <Input
                    id="report-to"
                    type="date"
                    value={customTo}
                    onChange={(e) => setCustomTo(e.target.value)}
                    className="h-7 w-[140px] text-[12px]"
                  />
                </div>
              </div>
            )}
          </div>

          <pre className="max-h-80 overflow-y-auto rounded-lg border border-border bg-muted/40 p-4 text-[12px] leading-relaxed whitespace-pre-wrap text-foreground">
            {markdown}
          </pre>
        </div>

        <DialogFooter className="sm:justify-between">
          <div className="text-[11px] text-muted-foreground">
            {filtered.length} event{filtered.length === 1 ? "" : "s"} in range
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCopy}>
              <Copy className="h-3.5 w-3.5" />
              Copy Markdown
            </Button>
            <Button onClick={handleDownload} className="bg-electric hover:bg-electric/90">
              <Download className="h-3.5 w-3.5" />
              Download .md
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
