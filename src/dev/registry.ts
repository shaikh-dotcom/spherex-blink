import type React from "react";

export interface DevSheet {
  id: string;
  component: React.FC;
  durationInFrames: number;
  width?: number;
  height?: number;
}

interface SheetContext {
  keys(): string[];
  (id: string): { devSheet?: DevSheet };
}

type RequireWithContext = { context(dir: string, deep: boolean, filter: RegExp): SheetContext };

const ctx = (require as unknown as RequireWithContext).context("./sheets", false, /\.tsx$/);

export const DEV_SHEETS: DevSheet[] = ctx
  .keys()
  .map((key) => ctx(key).devSheet)
  .filter((sheet): sheet is DevSheet => sheet !== undefined)
  .sort((a, b) => a.id.localeCompare(b.id));
