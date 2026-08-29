// Géocodage inverse (coordonnées GPS -> adresse lisible) via Nominatim / OpenStreetMap.
// Gratuit, sans clé. Usage léger uniquement (1 req/s max côté client).

export interface GeoResult {
  label: string;
  latitude: number;
  longitude: number;
}

export const reverseGeocode = async (latitude: number, longitude: number): Promise<GeoResult> => {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&accept-language=fr&zoom=14`;

  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) {
    throw new Error('Géocodage indisponible');
  }
  const data = await response.json();

  const a = data.address || {};
  const parts = [
    a.suburb || a.neighbourhood || a.quarter,
    a.city || a.town || a.village || a.municipality || a.county,
    a.state || a.region,
    a.country,
  ].filter(Boolean);

  const label = parts.length > 0 ? Array.from(new Set(parts)).join(', ') : data.display_name;

  if (!label) throw new Error('Adresse introuvable pour cette position');

  return { label, latitude, longitude };
};

export const getCurrentPosition = (): Promise<GeolocationPosition> =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("La géolocalisation n'est pas disponible sur cet appareil."));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 0,
    });
  });
