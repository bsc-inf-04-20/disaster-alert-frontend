"use client"
import { useMap } from 'react-leaflet';
import { useEffect } from 'react';

export default function MapUpdater({ coords}:{coords: GeolocationCoordinates | undefined}) {
  const map = useMap();
  
  useEffect(() => {
    if (coords) {
      map.setView([coords.latitude, coords.longitude], 8);
    }
  }, [coords, map]);
  
  return null;
}