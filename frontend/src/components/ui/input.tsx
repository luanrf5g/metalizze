import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "glass-input flex h-10 w-full min-w-0 file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border border-white/30 dark:border-white/20 bg-white/70 dark:bg-zinc-900/70 px-3 py-1 text-base shadow-xs transition-all outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-zinc-800 focus-visible:ring-zinc-800/20 focus-visible:ring-[3px] dark:focus-visible:border-white dark:focus-visible:ring-white/30",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }
