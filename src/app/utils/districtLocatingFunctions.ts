export async function getShapeNames(): Promise<string[]> {
  const res = await fetch('/geoBoundaries-MWI-ADM2_simplified.geojson');
  const geoJson = await res.json();

  return geoJson.features
    .map((feature: any) => feature.properties?.shapeName)
    .filter((name: string): name is string => typeof name === 'string');
}
