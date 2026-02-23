import type { ComponentType } from "react"
import {
  IconBook2,
  IconFlame,
  IconCrown,
  IconTrophy,
  IconLock,
} from "@tabler/icons-react"

type IconProps = { size?: number; className?: string; stroke?: number }
type IconComponent = ComponentType<IconProps>

const ACHIEVEMENT_ICONS: Record<string, IconComponent> = {
  book: IconBook2,
  fire: IconFlame,
  crown: IconCrown,
}

function normalizeIconKey(icon?: string | null): string {
  if (!icon) return "book"

  const value = icon.trim().toLowerCase()
  if (value === "📚") return "book"
  if (value === "🔥") return "fire"
  if (value === "👑") return "crown"

  if (value.includes("book")) return "book"
  if (value.includes("fire") || value.includes("flame")) return "fire"
  if (value.includes("crown")) return "crown"

  return value
}

export function renderAchievementIcon(
  icon?: string | null,
  unlocked = true,
  size = 28,
  className = "",
) {
  if (!unlocked) return <IconLock size={size} className={className} stroke={1.8} />

  const key = normalizeIconKey(icon)
  const Icon = ACHIEVEMENT_ICONS[key] || IconTrophy
  return <Icon size={size} className={className} stroke={1.8} />
}
