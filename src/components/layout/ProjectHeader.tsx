
import { Button } from "@/components/ui/button";

export const ProjectHeader = () => {
  return (
    <div className="flex flex-col items-center text-center space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="text-6xl font-bold tracking-tight bg-gradient-to-r from-zinc-900 via-zinc-600 to-zinc-900 dark:from-zinc-200 dark:via-zinc-400 dark:to-zinc-200 bg-clip-text text-transparent">
          UnlockFi
        </h1>
        <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 rounded-full px-3 py-1">
          Token Vesting Platform
        </span>
      </div>
      
      <p className="max-w-2xl text-zinc-600 dark:text-zinc-300">
        Simulate and visualize token distribution models with real-time updates. 
        Create sustainable tokenomics that align with your project goals.
      </p>
    </div>
  );
};
