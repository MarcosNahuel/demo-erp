import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary-600 text-white",
        secondary:
          "border-transparent bg-dark-700 text-dark-200",
        destructive:
          "border-transparent bg-danger text-white",
        success:
          "border-transparent bg-success text-white",
        warning:
          "border-transparent bg-warning text-dark-900",
        outline: "text-foreground border-dark-600",
        critical:
          "border-transparent bg-red-500/20 text-red-400 border border-red-500/30",
        alert:
          "border-transparent bg-orange-500/20 text-orange-400 border border-orange-500/30",
        low:
          "border-transparent bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
        normal:
          "border-transparent bg-green-500/20 text-green-400 border border-green-500/30",
        overstock:
          "border-transparent bg-blue-500/20 text-blue-400 border border-blue-500/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
