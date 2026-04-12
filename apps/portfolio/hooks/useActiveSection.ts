import { useState, useEffect } from 'react';

export function useActiveSection(sectionIds: string[], threshold: number = 0.5) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // Determine thresholds dynamically based on element heights if needed, 
    // but 0.5 works natively well for sections min h-screen 
    const options = {
      root: null,
      rootMargin: '0px',
      threshold,
    };

    const observer = new IntersectionObserver((entries) => {
      // Find the entry that is highest on the screen but adequately visible.
      // Easiest is just iterating through intersecting ones for the latest intersecting threshold hit.
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
        }
      });
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
