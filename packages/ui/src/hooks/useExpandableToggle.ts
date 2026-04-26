"use client";

import { useState, useCallback } from "react";

export function useExpandableToggle(initialId: string | null = null) {
  const [expandedId, setExpandedId] = useState<string | null>(initialId);

  const toggle = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const isExpanded = useCallback(
    (id: string) => expandedId === id,
    [expandedId]
  );

  const collapse = useCallback(() => {
    setExpandedId(null);
  }, []);

  return { expandedId, isExpanded, toggle, collapse } as const;
}
