import { useState, useCallback } from "react";

export type SectionId = "insights" | "chart" | "marketCards" | "nextSession";

export interface DashboardSection {
  id: SectionId;
  label: string;
  enabled: boolean;
}

const STORAGE_KEY = "dashboard_layout";

const DEFAULT_SECTIONS: DashboardSection[] = [
  { id: "insights", label: "Insights Panel", enabled: true },
  { id: "chart", label: "Session Chart", enabled: true },
  { id: "marketCards", label: "Market Cards", enabled: true },
  { id: "nextSession", label: "Next Session", enabled: true },
];

function load(): DashboardSection[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed: DashboardSection[] = JSON.parse(stored);
      // Merge with defaults to handle new sections
      return DEFAULT_SECTIONS.map((def) => {
        const saved = parsed.find((s) => s.id === def.id);
        return saved ? { ...def, enabled: saved.enabled } : def;
      });
    }
  } catch {}
  return DEFAULT_SECTIONS.map((s) => ({ ...s }));
}

function save(sections: DashboardSection[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sections));
}

export function useDashboardLayout() {
  const [sections, setSections] = useState<DashboardSection[]>(load);

  const toggleSection = useCallback((id: SectionId) => {
    setSections((prev) => {
      const next = prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s));
      save(next);
      return next;
    });
  }, []);

  const moveSection = useCallback((fromIndex: number, toIndex: number) => {
    setSections((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      save(next);
      return next;
    });
  }, []);

  const resetLayout = useCallback(() => {
    const defaults = DEFAULT_SECTIONS.map((s) => ({ ...s }));
    setSections(defaults);
    save(defaults);
  }, []);

  const isVisible = useCallback(
    (id: SectionId) => sections.find((s) => s.id === id)?.enabled ?? true,
    [sections]
  );

  return { sections, toggleSection, moveSection, resetLayout, isVisible };
}
