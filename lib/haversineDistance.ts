function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

type Coord = {
  latitude: number;
  longitude: number;
};

/**
 * The haversineDistance function calculates the distance between two coordinates on Earth using the
 * Haversine formula.
 * @param {Coord} coord1 - The first coordinate, which includes the latitude and longitude values of a
 * location.
 * @param {Coord} coord2 - `coord2` is an object representing the second set of coordinates, with
 * properties `latitude` and `longitude`.
 * @returns The function `haversineDistance` returns the distance in kilometers between two coordinates
 * (`coord1` and `coord2`) using the Haversine formula.
 */
export function haversineDistance(coord1: Coord, coord2: Coord) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(coord2.latitude - coord1.latitude);
  const dLon = toRadians(coord2.longitude - coord1.longitude);
  const lat1 = toRadians(coord1.latitude);
  const lat2 = toRadians(coord2.latitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Returns the distance in kilometers
}
