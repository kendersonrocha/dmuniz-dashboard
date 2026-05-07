import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type ClickUpTask = {
  id: string;
  name: string;
  status: string;
  status_type: "open" | "custom" | "closed" | "done";
  space_id: string;
  space: string;
  folder: string | null;
  folder_id: string | null;
  list: string | null;
  priority: string | null;
  due_date: string | null;
  date_updated: string;
  person_detected: string | null;
  url: string;
};

export type DashboardData = {
  tasks: ClickUpTask[];
  fetched_at: string;
};

export const isDone = (t: ClickUpTask) => t.status_type === "closed" || t.status_type === "done";
export const isOpen = (t: ClickUpTask) => !isDone(t);
export const isInProgress = (t: ClickUpTask) => {
  if (isDone(t)) return false;
  const s = (t.status || "").toLowerCase();
  return s.includes("progress") || s.includes("andamento");
};
export const fmtPct = (n: number, d: number) => (d ? Math.round((n / d) * 100) + "%" : "0%");
export const fmtDateTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
