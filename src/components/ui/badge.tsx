import { cn } from "@/lib/utils"

export function Badge({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"span"> & {
  variant?: "default" | "secondary" | "agent" | "command" | "skill" | "context"
}) {
  const variantClasses: Record<string, string> = {
    default: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    agent: "bg-agent/20 text-agent",
    command: "bg-command/20 text-command",
    skill: "bg-skill/20 text-skill",
    context: "bg-context/20 text-context",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border border-transparent px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variantClasses[variant] || variantClasses.default,
        className
      )}
      {...props}
    />
  )
}
