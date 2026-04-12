import { motion, AnimatePresence } from "framer-motion";

export const CommandNav = ({ activeId, counts }: { activeId: string, counts: Record<string, number> }) => {
  let label = "INITIALIZING...";
  if (activeId === 'hero') label = "SYSTEM ONLINE";
  if (activeId === 'projects') label = `PROJECTS [0${counts.projects || 0}]`;
  if (activeId === 'experience') label = `EXPERIENCE [0${counts.experience || 0}]`;
  if (activeId === 'skills') label = `NEURAL MAP`;

  return (
    <motion.div 
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between p-4"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      <div className="absolute inset-0 bg-void/80 backdrop-blur-md border-t border-surface_container_highest" />
      
      <div className="relative z-10 flex items-center gap-4 text-xs font-mono">
        <span className="flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-primary opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
        </span>
        <AnimatePresence mode="popLayout">
          <motion.span
            key={activeId}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            className="text-on_surface uppercase"
          >
            {label}
          </motion.span>
        </AnimatePresence>
      </div>

      <div className="relative z-10 flex items-center gap-6">
        {['projects', 'experience', 'skills'].map((id) => (
          <a
            key={id}
            href={`#${id}`}
            className={`text-xs font-mono uppercase transition-colors hover:text-primary ${
              activeId === id ? 'text-primary border-b-2 border-primary pb-1' : 'text-on_surface_variant'
            }`}
          >
            {id}
          </a>
        ))}
      </div>
    </motion.div>
  );
};
