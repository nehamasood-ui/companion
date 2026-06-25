import {
  Coffee,
  Palette,
  Footprints,
  Sunset,
  UtensilsCrossed,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { ActivityType } from "@/lib/types";

const ICONS: Record<ActivityType, LucideIcon> = {
  coffee: Coffee,
  art: Palette,
  walk: Footprints,
  sunset: Sunset,
  food: UtensilsCrossed,
  custom: Sparkles,
};

export function activityIcon(type: ActivityType): LucideIcon {
  return ICONS[type] ?? Sparkles;
}

export function ActivityIcon({
  type,
  className,
}: {
  type: ActivityType;
  className?: string;
}) {
  const Icon = activityIcon(type);
  return <Icon className={className} strokeWidth={1.75} />;
}
