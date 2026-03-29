import { cn } from "@/lib/utils"

export function Toggle({
  checked,
  onChange,
  className,
  size = "sm",
}: {
  checked: boolean
  onChange: () => void
  className?: string
  size?: "sm" | "md"
}) {
  const dims = size === "sm"
    ? { track: "w-8 h-[18px]", thumb: "h-3.5 w-3.5", translate: "translate-x-[14px]" }
    : { track: "w-10 h-[22px]", thumb: "h-4 w-4", translate: "translate-x-[18px]" }

  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={(e) => {
        e.stopPropagation()
        onChange()
      }}
      className={cn(
        "relative inline-flex items-center rounded-full transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card",
        checked ? "bg-emerald-500" : "bg-muted",
        dims.track,
        className
      )}
    >
      <span
        className={cn(
          "inline-block rounded-full bg-white shadow-sm transition-transform duration-200",
          dims.thumb,
          checked ? dims.translate : "translate-x-[2px]"
        )}
      />
    </button>
  )
}
