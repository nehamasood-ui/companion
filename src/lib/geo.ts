import type { Place } from "./types";

export interface Point {
  x: number;
  y: number;
}

export interface FitBounds {
  minX: number;
  minY: number;
  width: number;
  height: number;
}

/**
 * Projects lat/lng into SVG space with uniform scale so pins are not
 * stretched. Points are centered in the viewport with padding.
 */
export function projectPlaces(
  places: Place[],
  width: number,
  height: number,
  padding = 36,
): Point[] {
  if (places.length === 0) return [];

  const lats = places.map((p) => p.lat);
  const lngs = places.map((p) => p.lng);

  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const spanLat = maxLat - minLat || 0.008;
  const spanLng = maxLng - minLng || 0.008;

  const innerW = width - padding * 2;
  const innerH = height - padding * 2;
  const scale = Math.min(innerW / spanLng, innerH / spanLat);

  const usedW = spanLng * scale;
  const usedH = spanLat * scale;
  const offsetX = padding + (innerW - usedW) / 2;
  const offsetY = padding + (innerH - usedH) / 2;

  return places.map((p) => {
    const nx = (p.lng - minLng) / spanLng;
    const ny = (p.lat - minLat) / spanLat;
    return {
      x: offsetX + nx * usedW,
      y: offsetY + (1 - ny) * usedH,
    };
  });
}

/** Tight viewBox around projected pins — removes excess empty map area. */
export function fitBounds(points: Point[], pad = 28): FitBounds {
  if (points.length === 0) {
    return { minX: 0, minY: 0, width: 520, height: 380 };
  }
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs) - pad;
  const minY = Math.min(...ys) - pad;
  const maxX = Math.max(...xs) + pad;
  const maxY = Math.max(...ys) + pad;
  return {
    minX,
    minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

export function viewBoxString(bounds: FitBounds): string {
  return `${bounds.minX} ${bounds.minY} ${bounds.width} ${bounds.height}`;
}
