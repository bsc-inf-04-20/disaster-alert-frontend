
"use client"
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, icons, Mountain, Search, Thermometer, Waves, Wind, Zap } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MapContainer, Polygon, Polyline, TileLayer, useMap, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Fuse from 'fuse.js';
import { getAlertColor } from '../home/homeClient';
import L from 'leaflet';
import { getDisasterType } from '../utils/textFormatting';


const locationIcon= L.icon({
  iconUrl: "locationIcon.png",
  iconSize: [70, 70],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
})

type Location = {
  latitude: number;
  longitude: number;
};

const dateOptions: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: '2-digit',
  year: '2-digit',
};

const fuseOptions = {
  keys: ['name', 'typeName'],
  threshold: 0.4,
};

export default function Page() {
  const [disasters, setDisasters] = useState<any[]>([]);
  const [location, setLocation] = useState<Location | null>(null);
  const [disasterDialogOpen, setDisasterDialogOpen] = useState(false);
  const [selectedDisaster, setSelectedDisaster] = useState<any>(null);
  const [selectedDisasterPolyCoords, setSelectedDisasterPolyCoords] = useState<any[]>([]);
  const [selectedDisasterTrackCoords, setSelectedDisasterTrackCoords] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const mapRef = useRef<L.Map | null>(null);

  // Initialize geolocation
  useEffect(() => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => setLocation({ latitude: coords.latitude, longitude: coords.longitude }),
      (err) => toast.error(err.message || 'Failed to get location')
    );
  }, []);

  // Fetch disasters list
  useEffect(() => {
    if (!location) return;
    const fetchDisasters = async () => {
      try {
        const res = await fetch(
          `https://localhost:3000/disaster-discovery-tracker/disasters?latitude=${location.latitude}&longitude=${location.longitude}&includeHistory=true`
        );
        const data = await res.json();
        if (!res.ok) throw new Error('Failed to fetch disasters');
        setDisasters(data);
      } catch (err) {
        toast.error('Failed to fetch disasters');
      }
    };
    fetchDisasters();
  }, [location]);

  // Fetch selected disaster geometry
  useEffect(() => {
    if (!selectedDisaster) return;
    const fetchGeometry = async () => {
      try {
        const id = selectedDisaster.disasterId.split('-')[1];
        const res = await fetch(
          `https://localhost:3000/disaster-discovery-tracker/disasters/${id}`
        );
        const data = await res.json();
        if (!res.ok) throw new Error('Geometry fetch failed');
        setSelectedDisasterPolyCoords(data.filter((f: any) => f.geometry.type === 'Polygon'));
        setSelectedDisasterTrackCoords(data.filter((f: any) => f.geometry.type === 'LineString'));
      } catch {
        toast.error('Failed to fetch disaster geometry');
      }
    };
    fetchGeometry();
  }, [selectedDisaster]);

  // Handle map resize in dialog
  useEffect(() => {
    if (disasterDialogOpen && mapRef.current) {
      setTimeout(() => mapRef.current?.invalidateSize(), 300);
    }
  }, [disasterDialogOpen]);

  // Fuse search integration
  const filteredDisasters = (() => {
    if (!searchTerm.trim()) {
      return disasters;
    }
    const list = disasters.map(d => ({ ...d, typeName: getDisasterType(d.eventType) }));
    const fuse = new Fuse(list, fuseOptions);
    return fuse.search(searchTerm).map(r => r.item);
  })();

  return (
    <>
      <Card className="space-y-10 h-screen p-4">
        <CardHeader className="w-full bg-green-400 rounded-md mb-4 mt-4">
          <CardTitle className="text-xl font-extrabold text-center">
            History
          </CardTitle>
          <CardDescription className="text-center text-black">
            Understand the disaster history of your location
          </CardDescription>
        </CardHeader>
        <div className="relative mx-auto max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Search disasters..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 rounded-md border bg-gray-200"
          />
        </div>

        <div className="space-y-6">
          {filteredDisasters.map((d, idx) => (
            <Card key={idx} className="bg-green-300 ml-8 w-[1050px]">
              <div className="flex px-32 w-full py-2">
                <p className="text-2xl font-bold">{d.name}</p>
                <Button
                  onClick={() => { setSelectedDisaster(d); setDisasterDialogOpen(true); }}
                  className="ml-auto bg-green-400 text-white w-1/5"
                >
                  More details
                </Button>
              </div>
              <div className="flex px-32 w-full">
                <p>Event Type: {getDisasterType(d.eventType)}</p>
                <p className="ml-auto">
                  last active on: {new Date(d.latestUpdate.updateTime).toLocaleDateString('en-GB', dateOptions)}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {selectedDisaster && (
        <Dialog open={disasterDialogOpen} onOpenChange={setDisasterDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{selectedDisaster.name}</DialogTitle>
            </DialogHeader>
            <div className="h-[400px] w-full rounded-md overflow-hidden">
              <MapContainer
                center={[location?.latitude ?? -13.9626, location?.longitude ?? 33.774]}
                zoom={6}
                scrollWheelZoom
                className="h-full w-full"
                ref={mapRef as any}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {selectedDisasterTrackCoords.map((f, i) => (
                  <Polyline
                    key={i}
                    positions={f.geometry.coordinates.map((c: any) => [c[1], c[0]])}
                    pathOptions={{
                      color: getAlertColor(f.properties.alertlevel),
                      fillColor: getAlertColor(f.properties.alertlevel),
                      fillOpacity: 0.2,
                    }}
                  />
                ))}
                {selectedDisasterPolyCoords.map((f, i) => (
                  <Polygon
                    key={i}
                    positions={f.geometry.coordinates[0].map((c: any) => [c[1], c[0]])}
                    pathOptions={{
                      color: getAlertColor(f.properties.alertlevel),
                      fillColor: getAlertColor(f.properties.alertlevel),
                      fillOpacity: 0.2,
                    }}
                  />
                ))}

                {
                  location &&
                    <Marker 
                      position={[location.latitude, location.longitude]} 
                      icon={locationIcon}
                    />
                }
                <MapResizer trigger={disasterDialogOpen} />
              </MapContainer>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

interface MapResizerProps {
  trigger: boolean;
}

const MapResizer: React.FC<MapResizerProps> = ({ trigger }) => {
  const map = useMap();
  useEffect(() => {
    if (trigger) {
      setTimeout(() => map.invalidateSize(), 300);
    }
  }, [trigger, map]);
  return null;
};
