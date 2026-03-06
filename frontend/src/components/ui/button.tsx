import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl text-sm font-medium whitespace-nowrap transition-all duration-300 outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 hover:cursor-pointer active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-b from-blue-500 to-indigo-600 text-white shadow-[inset_0_1px_rgba(255,255,255,0.4),0_2px_8px_rgba(37,99,235,0.4)] hover:shadow-[inset_0_1px_rgba(255,255,255,0.5),0_4px_12px_rgba(37,99,235,0.5)] border border-blue-600/50",
        destructive:
          "bg-gradient-to-b from-red-500 to-red-600 text-white shadow-[inset_0_1px_rgba(255,255,255,0.3),0_2px_8px_rgba(239,68,68,0.4)] border border-red-600/50 hover:shadow-[0_4px_12px_rgba(239,68,68,0.5)]",
        outline:
          "glass-panel text-zinc-900 border-white/50 shadow-sm hover:bg-white/60 dark:text-white dark:border-white/20 dark:hover:bg-white/10",
        secondary:
          "bg-white/50 backdrop-blur-md text-zinc-900 border border-white/60 shadow-sm hover:bg-white/70 dark:bg-zinc-800/50 dark:text-white dark:border-white/10",
        ghost:
          "hover:bg-black/5 text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white",
        link: "text-blue-600 underline-offset-4 hover:underline dark:text-blue-400",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
