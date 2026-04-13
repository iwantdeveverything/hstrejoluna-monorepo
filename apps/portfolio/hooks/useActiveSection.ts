import { useState, useEffect } from "react";

export function useActiveSection<T extends string>(
  sectionIds: readonly T[],
  threshold: number = 0.5
) {
  const [activeId, setActiveId] = useState<T | "">("");

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: "0px",
      threshold,
    };

    const observer = new IntersectionObserver((entries) => {
      const nextEntry = entries
        .filter((entry) => entry.isIntersecting)
        .sort(
          (a, b) => a.boundingClientRect.top - b.boundingClientRect.top
        )
        .at(0);

      if (nextEntry) {
        setActiveId(nextEntry.target.id as T);
      }
    }, options);

    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => {
      sectionIds.forEach((id) => {
        const element = document.getElementById(id);
        if (element) observer.unobserve(element);
      });
    };
  }, [sectionIds, threshold]);

  return activeId;
}
