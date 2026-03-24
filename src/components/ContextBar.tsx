import { motion } from "framer-motion";
import { contexts, type Context } from "@/data/mockData";

interface ContextBarProps {
  activeContext: string;
  onContextChange: (id: string) => void;
  availableContexts: string[];
  hideSecure?: boolean;
}

const ContextBar = ({ activeContext, onContextChange, availableContexts, hideSecure }: ContextBarProps) => {
  const visibleContexts = contexts.filter(
    (ctx) => ctx.id === 'all' || availableContexts.includes(ctx.id)
  ).filter(ctx => !hideSecure || !ctx.secure);

  return (
    <div className="flex gap-2 px-4 py-2.5 overflow-x-auto scrollbar-hide bg-card/80 backdrop-blur-md border-b border-border">
      {visibleContexts.map((ctx) => (
        <button
          key={ctx.id}
          onClick={() => onContextChange(ctx.id)}
          className="relative px-4 py-1.5 rounded-full text-context-tab whitespace-nowrap transition-all duration-200"
          style={{
            backgroundColor: activeContext === ctx.id ? 'hsl(var(--foreground))' : 'hsl(var(--secondary))',
            color: activeContext === ctx.id ? 'hsl(var(--background))' : 'hsl(var(--muted-foreground))',
            boxShadow: activeContext === ctx.id ? 'var(--shadow-elevated)' : 'none',
          }}
        >
          {activeContext === ctx.id && (
            <motion.div
              layoutId="context-pill"
              className="absolute inset-0 rounded-full"
              style={{ backgroundColor: 'hsl(var(--foreground))' }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-1.5">
            {ctx.id !== 'all' && (
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: ctx.color }}
              />
            )}
            {ctx.label}
          </span>
        </button>
      ))}
    </div>
  );
};

export default ContextBar;
