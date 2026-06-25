import type { Place } from "./types";

export interface Point {
  x: number;
  y: number;
}

/**
 * Projects a set of lat/lng places into an SVG coordinate space.
 *
 * We don't need true cartographic accuracy for the ambient map — we just need
 * the relative arrangement of the pins to read correctly. We fit the bounding
 * box of the points into the viewport with padding, and flip the y-axis so
 * north renders up.
 */
export function projectPlaces(
  places: Place[],
  width: number,
  height: number,
  padding = 40,
): Point[] {
  if (places.length === 0) return [];

  const lats = places.map((p) => p.lat);
  const lngs = places.map((p) => p.lng);

  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const spanLat = maxLat - minLat || 1;
  const spanLng = maxLng - minLng || 1;

  // Preserve aspect roughly by using the larger span as the scale basis.
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;

  return places.map((p) => {
    const nx = (p.lng - minLng) / spanLng;
    const ny = (p.lat - minLat) / spanLat;
    return {
      x: padding + nx * innerW,
      // Flip y so higher latitude is higher on screen.
      y: padding + (1 - ny) * innerH,
    };
  });
}
