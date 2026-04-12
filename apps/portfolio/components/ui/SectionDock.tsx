import { motion } from "framer-motion";

export const SectionDock = ({ sections, activeId }: { sections: string[], activeId: string }) => {
  return (
    <div className="hidden lg:flex fixed right-8 top-1/2 -translate-y-1/2 flex-col gap-6 z-50 mix-blend-difference items-center">
      <span className="[writing-mode:vertical-rl] text-xs font-mono text-on_surface_variant mb-4 uppercase tracking-[0.2em]">
        SCROLL_TO_EXPLORE
      </span>
      {sections.map((id) => {
        const isActive = activeId === id;
        return (
          <a
            key={id}
            href={`#${id}`}
            aria-label={`Navigate to ${id}`}
            className="relative group p-2"
          >
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-primary/20 scale-0 group-hover:scale-100 transition-transform duration-300" />
            
            <motion.div
              initial={false}
              animate={{
                width: isActive ? 6 : 4,
                height: isActive ? 6 : 4,
                backgroundColor: isActive ? "var(--color-primary)" : "var(--color-surface_container_highest)"
              }}
              className="rounded-full shadow-[0_0_0_1px_rgba(255,255,255,0.05)] relative z-10"
            />
          </a>
        );
      })}
    </div>
  );
};
