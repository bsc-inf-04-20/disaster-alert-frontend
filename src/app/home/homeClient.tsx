'use client'

import React, { useEffect, useState, useCallback, useReducer } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent, CardDescription, CardTitle} from '@/components/ui/card'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polyline } from "react-leaflet";
import {Activity, AlertCircle, AlertOctagon, AlertTriangle, Calendar, Clipboard, CloudRainWind, Download, Edit, Hand, HomeIcon, MapIcon, MapPin, Navigation, Phone, RotateCcw, Shield, ShieldAlert, TestTube, Trash2, UserCircle} from 'lucide-react';
import "leaflet/dist/leaflet.css";
import { GeoJSON, Polygon } from "react-leaflet";
import L, from "leaflet";
import HorizontalProgressBar from './horizontalGraph';
import LinkedEvents from './linkedEvents';
import { useGeolocated } from 'react-geolocated';
import { toast, Toaster } from 'sonner';
import MapUpdater from './mapUpdater';
import polyline from '@mapbox/polyline';
import NavigationInstructions from './navInstructions'
import {Commet} from 'react-loading-indicators';
import { ReplaceUnderScoreMakeCamelCase } from '../utils/textFormatting';
import * as turf from "@turf/turf";
import { getIconUrl } from '../utils/ImageProgressing';
import { useRouter } from 'next/navigation';
import { Switch } from '@/components/ui/switch';
import { downloadPDF } from '../educational-modules/downloadPDF';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getShapeNames } from '../utils/districtLocatingFunctions';


const getAlertColor = (level:any) => {
  switch(level) {
    case 'Red': return '#ff0000';
    case 'Orange': return '#ff9900';
    case 'Green': return '#00cc00';
    default: return '#999999';
  }
};

// Constants
const API_BASE_URL = "https://localhost:3000";
const EMERGENCY_CONTACTS_URL = "http://localhost:4000/emergency-contacts";

const useDataFetcher = (url, initialData = null, dependencies = []) => {
  const [state, setState] = useState({
    data: initialData,
    isLoading: false, // Start with false, only set true when actually fetching
    error: null
  });

  useEffect(() => {
    if (!url) {
      // If no URL, immediately set to not loading with initial data
      setState({
        data: initialData,
        isLoading: false,
        error: null
      });
      return;
    }

    let isMounted = true;
    
    const fetchData = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        const response = await fetch(url, {credentials: 'include'});
        
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (isMounted) {
          setState({
            data: result,
            isLoading: false,
            error: null
          });
        }
      } catch (error) {
        console.error(`Error fetching from ${url}:`, error);
        if (isMounted) {
          setState({
            data: initialData,
            isLoading: false,
            error: error.message
          });
        }
      }
    };

    fetchData();
    
    return () => {
      isMounted = false;
    };
  }, [url, ...dependencies]);

  return state;
};

// Load and parse GeoJSON file - converted to a custom hook
const useGeoJSON = (filePath) => {
  const { data, isLoading, error } = useDataFetcher(filePath);
  return { geoJson: data, isLoading, error };
};

// Cache for disaster geometries to prevent redundant fetches
const geometryCache = new Map();

function HomePageClient() {
  // Icons (moved outside of component re-renders)
  const icons = {
    health: L.icon({
      iconUrl: "medical.png",
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    }),
    shield: L.icon({
      iconUrl: "shield.png",
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    }),
    destination: L.icon({
      iconUrl: "destination.png",
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    }),
    location: L.icon({
      iconUrl: "locationIcon.png",
      iconSize: [70, 70],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    })
  };

  // Consolidated location state with reducer pattern
  const [locationState, setLocationState] = useState({
    isEnabled: false,
    isAvailable: false,
    coords: null,
    isLoading: false
  });

  const router = useRouter();

  // App state management
  const [dialogOpen, setDialogOpen] = useState(true);
  const [currentDisaster, setCurrentDisaster] = useState(null);
  const [filterLayer, setFilterLayer] = useState("");
  const [waypoints, setWaypoints] = useState([]);
  const [ destinationProps , setDestinationProps] = useState({})
  const [route, setRoute] = useState([]);
  const [navInstructions, setNavInstructions] = useState(null);
  const [navDistance, setNavDistance] = useState(null);
  const [disasterPolyCoords, setDisasterPolyCoords] = useState([]);
  const [disasterTrackCoords, setDisasterTrackCoords] = useState([]);
  const [layersVisible, setLayersVisible] = useState(true);
  const [districtNames, setDistrictNames] = useState<string[]>()
  const [selectedDistrict, setSelectedDistrict] = useState<string>("")

useEffect(() => {
  const fetchDistricts = async () => {
    try {
      const districts = await getShapeNames();
      setDistrictNames(districts);
    } catch (error) {
      console.error("Failed to load district names:", error);
    }
  };

  fetchDistricts();
}, []);

  // Determine which data source should be active
  const shouldUseDistrict = selectedDistrict !== "";
  const shouldUseLocation = !shouldUseDistrict && locationState.coords;

  // District-based fetch (only when district is selected)
  const {
    data: disastersByDistrict,
    isLoading: loadingByDistrict,
    error: errorByDistrict
  } = useDataFetcher(
    shouldUseDistrict 
      ? `https://localhost:3000/disaster-discovery-tracker/disasters/districts/${selectedDistrict}`
      : null,
    [],
    [selectedDistrict, shouldUseDistrict]
  );


const {
    data: disastersByLocation,
    isLoading: loadingByLocation,
    error: errorByLocation
  } = useDataFetcher(
    shouldUseLocation
      ? `https://localhost:3000/disaster-discovery-tracker/disasters?longitude=${locationState.coords.longitude}&latitude=${locationState.coords.latitude}&includeHistory=true`
      : null,
    [],
    [locationState.coords, shouldUseLocation]
  );



  const fetchModule = async () => {
      try {
        const res = await fetch(`https://localhost:3000/modules/types/${currentDisaster.eventType}`, {
          cache: 'no-store',
        });
        
        if (!res.ok) {
          throw new Error('Module not found');
        }
        
        const data = await res.json();

        downloadPDF(data.module)
       
      }
      catch (error) {
        console.error('Failed to fetch module:', error);
        toast.error(`Error: ${error}`)
      } 
    };

  //pop up that shows when the user clicks on the disaster track
  const [trackPopupInfo, setTrackPopupInfo] = useState(null);


  async function generateTrialDisaster() {
    try {
      const response = await fetch(
        "https://localhost:3000/disaster-discovery-tracker/disasters/test",
        { method: "POST",
          credentials: 'include'
         }
      );
  
      if (!response.ok) {
        // Handle HTTP errors
        throw new Error("Network response was not ok: " + response.statusText);
      }
  
      const data = await response.json();
      // Only toast success after we have a good response
      toast.success("Successfully generated trial disaster! Refresh to see changes.");
      return data;
    } catch (error) {
      console.error("Fetch operation failed:", error);
      toast.error("Failed to generate trial disaster");
      // rethrow if you want callers to handle it too
      throw error;
    }
  }

  async function removeTrialDisaster() {
    
    try {
      const response = await fetch(
        "https://localhost:3000/disaster-discovery-tracker/disasters/test",
        { method: "DELETE" ,
          credentials: 'include'
        },
      );
  
      if (!response.ok) {
        // Handle HTTP errors
        throw new Error("Network response was not ok: " + response.statusText);
      }
  
      const data = await response.json();
      // Only toast success after we have a good response
      toast.success("Successfully deleted trial disasters! Refresh to see changes.");
      return data;
    } catch (error) {
      console.error("Fetch operation failed:", error);
      toast.error("Failed to delete trial disasters");
      // rethrow if you want callers to handle it too
      throw error;
    }
  }

  // Data fetching with custom hooks for better organization
  const { data: layers, isLoading: layersLoading, error: layersError } = 
    useDataFetcher(`${API_BASE_URL}/features/all`, {});


  // Use Geolocation hook - optimized to reduce rerenders
  const { coords: geoCoords, isGeolocationAvailable, isGeolocationEnabled } = useGeolocated({ 
    positionOptions: { enableHighAccuracy: true },
    userDecisionTimeout: 5000,
    watchPosition: true,
  });

  // Fetch emergency contact based on location
  const [emergencyContact, setEmergencyContact] = useState(null);

  // Find emergency contacts based on location - memoized to prevent unnecessary recalculations
  const findEmergencyContacts = useCallback(async (filePath, longitude, latitude) => {
    try {
      const geoJsonResponse = await fetch(filePath);
      const geoJson = await geoJsonResponse.json();
      
      if (!geoJson) return null;
  
      const locationPoint = turf.point([longitude, latitude]);
      
      // Find matching polygon
      const matchingFeature = geoJson.features.find(feature =>
        turf.booleanPointInPolygon(locationPoint, feature.geometry)
      );
  
      if (!matchingFeature) {
        console.log("No matching region found.");
        return null;
      }
  
      // Extract shapeName
      const shapeName = matchingFeature.properties.shapeName;
  
      // Fetch emergency contacts
      const contactsResponse = await fetch(EMERGENCY_CONTACTS_URL);
      
      if (!contactsResponse.ok) {
        throw new Error("Failed to fetch emergency contacts");
      }
      
      const emergencyContacts = await contactsResponse.json();
      
      // Search emergency contacts database for matching location
      const contact = emergencyContacts.find(ec => ec.location === shapeName);
  
      if (contact) {
        return contact;
      } else {
        console.log(`No emergency contacts found for ${shapeName}.`);
        return [];
      }
    } catch (error) {
      console.error("Error finding emergency contacts:", error);
      toast.error("Failed to fetch emergency contact information");
      return null;
    }
  }, []);

  // Request geolocation with improved error handling
  const requestGeolocation = useCallback(() => {
    setLocationState(prev => ({...prev, isLoading: true}));
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("Position obtained");
          toast.success(`Location granted: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
          setLocationState({
            isEnabled: true,
            isAvailable: true,
            coords: position.coords,
            isLoading: false
          });
          setDialogOpen(false);
        },
        (error) => {
          console.error("Geolocation error:", error);
          toast.error(`Location error: ${error.message}`);
          setLocationState(prev => ({
            ...prev, 
            isEnabled: false,
            isLoading: false
          }));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      toast.error("Geolocation is not supported by this browser");
      setLocationState(prev => ({
        ...prev,
        isAvailable: false,
        isLoading: false
      }));
    }
  }, []);

  // Toggle layer selection with memoization to prevent re-renders
  const toggleLayer = useCallback((targetLayer) => {
    setFilterLayer(current => current === targetLayer ? "" : targetLayer);
  }, []);

  // Fetch route based on waypoints - memoized to prevent unnecessary recalculations
  const getRoute = useCallback(async () => {
    if (waypoints.length < 2) return;
    
    try {
      const url = `https://graphhopper.com/api/1/route?point=${waypoints[0][0]},${waypoints[0][1]}&point=${waypoints[1][0]},${waypoints[1][1]}&profile=foot&locale=en&calc_points=true&key=${process.env.NEXT_PUBLIC_GRAPHOPPER_API_KEY}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch route: ${response.status}`);
      }
      
      const preparedResponse = await response.json();
      const coords = preparedResponse.paths[0].points;
      const decodedCoords = polyline.decode(coords);
      const instructions = preparedResponse.paths[0].instructions;
      const distance = preparedResponse.paths[0].distance;
      
      toast.success("Route successfully generated");
      setRoute(decodedCoords);
      setNavDistance(distance);
      setNavInstructions(instructions);
    } catch (error) {
      console.error("Error fetching route:", error);
      toast.error(`Route could not be generated: ${error.message}`);
    }
  }, [waypoints]);

  // Get recommended route within selected layer - memoized
  const getRecommendedRouteWithinLayer = useCallback(async () => {

    console.log(`getting recommedended route for ${filterLayer}, using api call to ${API_BASE_URL}/features?x=${locationState.coords.latitude}&y=${locationState.coords.longitude}&disasterName=${null}&layer=${filterLayer}`);

    if (!locationState.coords || !filterLayer) {
      return;
    }
    
    try {
      const recommendedParams = await fetch(
        `${API_BASE_URL}/features?x=${locationState.coords.latitude}&y=${locationState.coords.longitude}&disasterName=${currentDisaster?.disasterName?? "N/A"}&layer=${filterLayer}`
      );

      console.log("Recommended params response:", recommendedParams);
      
      if (!recommendedParams.ok) {
        const errorData = await recommendedParams.json();
        console.error(errorData);
        toast.error(`Failed to get route for ${filterLayer.split("_")[1]}`);
        return;
      }
      console.log(`setting way way for ${filterLayer}`);
      const parsedRecom = await recommendedParams.json();

      const nameAndType= parsedRecom.properrties

      setDestinationProps(parsedRecom.properties)

      setWaypoints(locationState.coords ? 
        [[locationState.coords.latitude, locationState.coords.longitude], 
         [parsedRecom.parsedGeom.x, parsedRecom.parsedGeom.y]] : 
        []
      );
    } catch (error) {
      console.error(`Failed to get route for ${filterLayer.split("_")[1]}:`, error);
      toast.error(`Failed to get route for ${filterLayer.split("_")[1]}`);
    }
  }, [locationState.coords, filterLayer, currentDisaster]);

  // Get disaster geometry with caching to prevent redundant fetches
  const fetchDisasterGeometry = useCallback(async (disasterId:string) => {
    if (!disasterId) return null;
    
    // Check cache first
    if (geometryCache.has(disasterId)) {
      return geometryCache.get(disasterId);
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/disaster-discovery-tracker/disasters/${disasterId.split("-")[1]}/`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch disaster geometry: ${response.status}`);
      }
      
      const geometry = await response.json();


      console
      
      // Update cache
      geometryCache.set(disasterId, geometry);
      
      return geometry;
    } catch (error) {
      console.error("Error fetching disaster geometry:", error);
      toast.error("Failed to get disaster geometry");
      return null;
    }
  }, []);

  // Handle map clicks with memoization to prevent re-renders
  const MapClickHandler = useCallback(() => {
    useMapEvents({
      click(e) {
        if (!locationState.coords) return;
        
        if (waypoints.length === 0) {
          // First click: set start and destination at once
          setWaypoints([[locationState.coords.latitude, locationState.coords.longitude], [e.latlng.lat, e.latlng.lng]]);
        } else {
          // Subsequent clicks: update only the destination
          setWaypoints(([start]) => [start, [e.latlng.lat, e.latlng.lng]]);
        }
      },
    });
    return null;
  }, [locationState.coords, waypoints.length]);

  // Update location state from geolocated hook
  useEffect(() => {
    if (geoCoords) {
      setLocationState(prev => ({
        isAvailable: isGeolocationAvailable,
        isEnabled: isGeolocationEnabled,
        coords: geoCoords,
        isLoading: false
      }));
    }
  }, [geoCoords, isGeolocationAvailable, isGeolocationEnabled]);

  // Fetch emergency contacts when coordinates change
  useEffect(() => {
    if (locationState.coords) {
      findEmergencyContacts(
        "geoBoundaries-MWI-ADM2_simplified.geojson", 
        locationState.coords.longitude, 
        locationState.coords.latitude
      )
      .then(contact => {
        setEmergencyContact(contact);
      })
      .catch(error => {
        console.error("Failed to fetch emergency contact:", error);
        toast.error("Failed to fetch emergency contact");
      });
    }
  }, [locationState.coords, findEmergencyContacts]);

  // Get recommended route when filter layer changes
  useEffect(() => {
    if (filterLayer && locationState.coords) {
      getRecommendedRouteWithinLayer();
    }
  }, [filterLayer, locationState.coords, getRecommendedRouteWithinLayer]);

  // Fetch route when waypoints change
  useEffect(() => {
    if (waypoints.length === 2) {
      getRoute();
    }
  }, [waypoints, getRoute]);

  // Fetch disaster geometry when current disaster changes
  useEffect(() => {
    if (currentDisaster) {
      fetchDisasterGeometry(currentDisaster.disasterId)
        .then(geometry => {
          if (geometry) {
            console.log("Disaster geometry fetched:", geometry);
            
            const polygons = geometry.filter(feature => feature.geometry.type === "Polygon" )
            const lineStrings = geometry.filter(feature => feature.geometry.type === "LineString" )
            console.log("Disaster polygons filtered:", polygons);
            
            setDisasterPolyCoords(polygons);
            setDisasterTrackCoords(lineStrings);
            // setDisasterLineCoords
            toast.success("Rendered the disaster parameters");
          }
        })
        .catch(error => {
          console.error("Error fetching disaster geometry:", error);
        });
    }
  }, [currentDisaster, fetchDisasterGeometry]);

  useEffect(() => {
    if (disasterPolyCoords) {
      console.log("--------------------------------------------------------------------"+JSON.stringify (disasterPolyCoords[0]?.geometry?.coordinates));
    }
  }, [disasterPolyCoords]);

// Clean data source selection
const disasters = shouldUseDistrict ? disastersByDistrict : disastersByLocation;
const disastersLoading = shouldUseDistrict ? loadingByDistrict : loadingByLocation;
const disastersError = shouldUseDistrict ? errorByDistrict : errorByLocation;

// Improved loading state - only show loading when actually fetching
const isLoading = layersLoading || locationState.isLoading || disastersLoading;

// Enhanced current disaster setting with better logic
useEffect(() => {
  if (disasters && disasters.length > 0) {
    // If no current disaster or current disaster not in new list, set first one
    if (!currentDisaster || !disasters.find(d => d.disasterId === currentDisaster.disasterId)) {
      console.log(`Setting current disaster from ${disasters.length} disasters`);
      setCurrentDisaster(disasters[0]);
    }
  } else if (disasters && disasters.length === 0) {
    // If disasters array is empty, clear current disaster
    setCurrentDisaster(null);
  }
  // If disasters is null/undefined, don't change currentDisaster (still loading or error)
}, [disasters]);

// Optional: Add effect to clear current disaster when switching modes
useEffect(() => {
  // Clear current disaster when switching between district and location mode
  setCurrentDisaster(null);
}, [selectedDistrict]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-screen">
        <Commet color="#32cd32" size="large" text="" textColor="" />
      </div>
    );
  }

  // Error state handling
  if (layersError || disastersError) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-screen gap-4">
        <h2 className="text-2xl font-bold text-red-500">Error Loading Data</h2>
        <p>{layersError || disastersError}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  // Rest of your rendering code would continue here, with the same JSX structure
  return (
    <div className='min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-6 lg:p-8'>
      <Toaster
        position="top-right"
        theme='system'
      />
      <div className='max-w-6xl mx-auto'>
        {/* Page Header - Modernized with subtle shadow and rounded corners */}
        <div className="bg-gradient-to-r from-green-400 to-green-500 rounded-2xl shadow-lg mb-6 p-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
              <HomeIcon className="h-8 w-8" />
              <span className="tracking-wide">HOME</span>
            </h1>
            <p className="text-green-50 mt-2 text-sm md:text-base flex items-center gap-2">
              <ShieldAlert size={16} />
              Prepare for the next disaster with our app
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button 
            className='flex gap-2 bg-white text-green-600 hover:bg-green-50 hover:shadow-md shadow transition-all duration-200 rounded-xl'
            onClick={() =>generateTrialDisaster()}
            >
              <Clipboard />
              Generate Simulated Disaster
             </Button>
            <Button 
            className='flex gap-2 bg-white text-green-600 hover:bg-green-50 hover:shadow-md shadow transition-all duration-200 rounded-xl'
            onClick={() =>removeTrialDisaster()}
            >
              <Trash2 />
              Remove Simulated Disaster
             </Button>  
            <Button 
              onClick={() => router.push("/profile")}
              className="bg-white text-green-600 hover:bg-green-50 hover:shadow-md shadow transition-all duration-200 flex items-center gap-2 rounded-xl"
            >
              <Hand size={16} />
              {`Hello, ${JSON.parse(window.localStorage.getItem('user'))?.firstName ?? "There"}`}
            </Button>
          </div>
        </div>
          
        <div className="w-full flex flex-col md:flex-row gap-6">
          {/* Left column - Map and navigation */}
          <div className='flex flex-col gap-4 md:w-1/2 h-screen'>    
            <Card className="relative h-[500px] rounded-xl overflow-hidden border border-gray-200 shadow-md">
              {
                !locationState.isAvailable ? (
                  <div className='flex justify-center items-center h-full w-full'>
                    <div className='text-center flex flex-col items-center gap-4'>
                      <AlertTriangle size={48} className="text-amber-500" />
                      <span className='text-2xl font-semibold'>Your browser does not support Geo location</span>
                    </div>
                  </div>
                ) : !locationState.isEnabled ? (
                  <Card className='h-full w-full flex justify-center items-center bg-white/50 backdrop-blur-sm'>
                    <CardContent className='block text-center'>
                      <CardHeader>
                        <MapPin size={48} className="mx-auto text-green-400 mb-2" />
                        <CardTitle className='text-center'>
                          Geo Location is not enabled
                        </CardTitle>
                        <CardDescription>
                          Geo location services are available but disabled
                        </CardDescription>
                      </CardHeader>
                      <Button
                        className='flex mx-auto mt-4 bg-green-400 hover:bg-green-500'
                        onClick={requestGeolocation}
                      >
                        Enable Geo Location
                      </Button>
                    </CardContent>
                  </Card>
                ) : locationState.isLoading ? (
                  <div className="flex items-center justify-center w-full h-full bg-white/50 backdrop-blur-sm">
                    <Commet color="#32cd32" size="large" text="" textColor="" />
                  </div>
                ) : (
                  <MapContainer
                    center={locationState.coords ? 
                      [locationState.coords.latitude, locationState.coords.longitude] : 
                      [-13.254308, 34.301525]
                    }
                    zoom={locationState.coords ? 19 : 6.3}
                    style={{ height: "100%", width: "100%", borderRadius: "0.75rem", borderColor: "transparent" }}
                    className="z-10"
                  >
                    <MapUpdater coords={locationState.coords} />
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    
                    {locationState.coords && (
                      <Marker 
                        position={[locationState.coords.latitude, locationState.coords.longitude]} 
                        icon={icons.location}
                      >
                        <Popup className="rounded-lg shadow-lg">
                          <strong className="text-green-600">Current location</strong>
                          <br />
                          <div className="flex items-center gap-1 text-gray-600">
                            <span>lat:</span> <span className="font-mono">{locationState.coords.latitude.toFixed(6)}</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-600">
                            <span>lon:</span> <span className="font-mono">{locationState.coords.longitude.toFixed(6)}</span>
                          </div>
                        </Popup>
                      </Marker>
                    )}
                    
                    {route.length > 0 && <Polyline positions={route} color="#22c55e" weight={5} opacity={0.7} />}
                    {route.length > 0 && waypoints[1] && (
                      <Marker position={waypoints[1]} icon={icons.destination} >
                        <Popup className="rounded-lg shadow-lg">
                          <strong className="text-green-600">Destination</strong>
                          <br />
                          <div className="flex items-center gap-1 text-gray-600">
                            <span>name:</span> <span>{destinationProps?.name ?? "N/A"}</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-600">
                            <span>amenity:</span> <span>{destinationProps?.amenity ?? "N/A"}</span>
                          </div>
                        </Popup>
                      </Marker>
                    )}
                    
                    {currentDisaster && layersVisible && disasterPolyCoords &&
                      disasterPolyCoords.map((feature, key) => (
                        <Polygon
                          key={key}
                          positions={feature.geometry.coordinates[0].map((coord) => [coord[1], coord[0]])} 
                          stroke={true}
                          color={getAlertColor(feature.properties.alertlevel)}
                          fill={true}
                          fillColor={getAlertColor(feature.properties.alertlevel)}
                          fillOpacity={0.2}      
                        />
                      ))}
  
                    {currentDisaster && layersVisible && disasterTrackCoords &&
                      disasterTrackCoords.map((feature, index) => (
                        <React.Fragment key={index}>
                          <Polyline
                            key={index}
                            positions={feature.geometry.coordinates.map((coord) => [coord[1], coord[0]])} 
                            stroke={true}
                            color={getAlertColor(feature.properties.alertlevel)}
                            fill={true}
                            fillColor={getAlertColor(feature.properties.alertlevel)}
                            fillOpacity={0.2}
                            eventHandlers={{
                              click: (e) => {
                                console.log("Disaster track clicked:", feature.properties);
                                setTrackPopupInfo({
                                  position: e.latlng,
                                  properties: feature.properties,
                                });
                                // setCurrentDisaster(feature.properties.disasterId);
                              },
                            }}
                          />
                          {trackPopupInfo && trackPopupInfo.properties.eventid === feature.properties.eventid && (
                            <Popup position={trackPopupInfo.position} closeOnClick={true} className="rounded-lg shadow-lg">
                              <div className='flex flex-col gap-2 justify-center items-center'>
                                <h3 className='text-red-500 font-semibold'>{`${trackPopupInfo?.properties?.severitydata?.severity ?? "N/A"} ${trackPopupInfo?.properties?.severitydata?.severityunit ?? "N/A"}`}</h3>
                                <CloudRainWind color='red'/>
                              </div>
                            </Popup>
                          )}
                        </React.Fragment>
                      ))}
                  </MapContainer>
                )
              }
  
              {/* Overlay filter options - Moved to top right with improved styling */}
              <div className="flex absolute top-4 right-4 z-[1000] md:hidden gap-2 flex-wrap bg-white bg-opacity-90 p-3 rounded-lg shadow-md">
                {layers && Object.keys(layers).map((layer) => (
                  <Button 
                    key={layer}
                    onClick={() => toggleLayer(layer)}
                    className={`flex hover:text-white hover:bg-green-500 justify-center items-center text-current gap-2 p-2 rounded-lg transition-all ${filterLayer === layer ? 'bg-green-400 text-white' : 'bg-white'}`}
                    size="sm"
                  >
                    <img src={layers[layer].featureIconURL} alt={layer} className="w-5 h-5" />
                    <span className="text-xs font-medium">{layer.split("_")[1]}</span>
                  </Button>
                ))}
              </div>  
            </Card>
            
            {/* Navigation instructions card */}
            {navInstructions && (
              <Card className="overflow-hidden border border-gray-200 shadow-md rounded-xl">
                <CardHeader className="bg-green-50 py-3 px-4">
                  <CardTitle className="text-sm font-medium text-green-800">Navigation Instructions</CardTitle>
                </CardHeader>
                <NavigationInstructions 
                  route={route} 
                  instructions={navInstructions} 
                  userLocation={locationState.coords} 
                  distance={navDistance}
                />  
              </Card>
            )}
          </div>
  
          {/* Right column - Disaster info and options */}
          <div className="md:w-1/2 flex flex-col gap-4">
            <Card className='bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden'>
              <CardHeader className="border-b border-gray-100 pb-4">
                {currentDisaster ? (
                  <CardTitle className='text-center bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-3 font-bold text-green-800'>
                    {currentDisaster.name}
                  </CardTitle>
                ) : (
                  <CardTitle className='text-center bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-3 font-bold text-green-800'>
                    Disaster Information
                  </CardTitle>
                )}
                <div className='mt-4 flex items-center justify-between px-2'>
                  <span className='text-sm text-gray-600 flex items-center gap-2'>
                    <MapIcon size={16} className="text-green-500" /> 
                    Show Map Boundaries
                  </span>
                  <Switch 
                    className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-300"
                    id="email" 
                    checked={layersVisible}
                    onCheckedChange={(checked:boolean) => {
                      setLayersVisible(!layersVisible)
                    }}
                  />
                </div>
              </CardHeader>  
              
              {/* Emergency contacts card */}
              <div className="px-4 py-2">
                <Card className='rounded-xl border border-gray-100 shadow-sm overflow-hidden'>
                  <CardHeader className="bg-green-50 py-3">
                    <CardTitle className='text-center text-base text-green-800'>
                      <Phone className="inline-block mr-2 h-4 w-4" /> Emergency Contacts
                    </CardTitle>
                    <CardDescription className='text-center text-sm'>
                      You seem to be in 
                      <span className='text-green-500 font-semibold'>
                        {emergencyContact && ` ${emergencyContact.location}`}
                      </span>. For emergencies, call:
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="py-3">
                    {emergencyContact && emergencyContact.phones && (
                      <ul className='space-y-2'>
                        {emergencyContact.phones.numbers.map((phoneNumber, index) => (
                          <li key={index} className='flex gap-2 justify-center items-center p-2 bg-gray-50 rounded-lg'>
                            <Phone size={16} className="text-green-500" />
                            <span className="font-medium">{phoneNumber}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {/* Nearby destinations card */}
              <div className="px-4 py-2">
                <Card className='rounded-xl border border-gray-100 shadow-sm overflow-hidden'>
                  <CardHeader className="bg-green-50 py-3">
                    <CardTitle className='text-center text-base text-green-800'>
                      <Navigation className="inline-block mr-2 h-4 w-4" /> Nearby Safe Destinations
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="py-3">
                    <p className="text-sm text-gray-600 mb-3">Make your way to any of these nearby destinations:</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {layers && Object.keys(layers).map((layer) => (
                        <Button 
                          key={layer}
                          onClick={() => toggleLayer(layer)}
                          variant="outline"
                          className={`flex hover:text-white hover:bg-green-500 transition-all justify-center items-center gap-2 p-2 rounded-lg border ${filterLayer === layer ? 'bg-green-400 text-white border-green-500' : 'bg-white border-gray-200'}`}
                          size="sm"
                        >
                          <img src={layers[layer].featureIconURL} alt={layer} className="w-5 h-5" />
                          <span className="text-xs font-medium">{layer.split("_")[1]}</span>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Disaster details */}
              {currentDisaster && (
                <div className="px-4 py-2">
                  <Card className='rounded-xl border border-gray-100 shadow-sm overflow-hidden'>
                    <CardHeader className="bg-green-50 py-3">
                      <CardTitle className='text-center text-base text-green-800'>
                        <AlertCircle className="inline-block mr-2 h-4 w-4" /> Disaster Details
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent className="py-3">
                      <div className='grid grid-cols-2 gap-3'>
                        <div className='font-medium text-gray-700 flex items-center'>
                          <AlertTriangle size={16} className="mr-2 text-amber-500" />
                          Disaster type
                        </div>
                        <div className='text-gray-900 font-semibold'>
                          {currentDisaster.eventType}
                        </div>
                        
                        <div className='font-medium text-gray-700 flex items-center'>
                          <Calendar size={16} className="mr-2 text-green-500" />
                          Date
                        </div>
                        <div className='text-gray-900 font-semibold'>
                          {new Date(currentDisaster.startDate).toLocaleDateString()}
                        </div>
                        
                        <div className='font-medium text-gray-700 flex items-center'>
                          <Activity size={16} className="mr-2 text-red-500" />
                          Intensity
                        </div>
                        <div className='text-gray-900 font-semibold'>
                          {`${currentDisaster.latestUpdate.severity} ${currentDisaster.latestUpdate.severityUnit}` }
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
              
              {/* Action buttons */}
              <div className='flex flex-col gap-3 w-full p-4 items-center justify-center'>
                <Button 
                onClick={()=>fetchModule()}
                className='flex gap-2 w-full sm:w-1/2 bg-green-400 hover:bg-green-500 rounded-lg'>
                  <Shield size={16} />
                  <span className='text-sm'> Learn Safety during cyclones</span>
                </Button>
              </div>
              
              {/* Impending disasters */}
              <div className="mt-2 mb-4">
                {
                  disasters &&
                  <>
                    <h3 className='text-lg font-bold w-full flex justify-center items-center gap-2 text-green-800'>
                    <AlertOctagon size={18} className="text-amber-500" />
                    Impending disasters
                    </h3>
                    <div className="px-4 mt-2">
                      <LinkedEvents 
                        events={disasters ? disasters : []} 
                        setCurrentDisaster={setCurrentDisaster} 
                        currentEvent={currentDisaster ? currentDisaster : null}
                      />
                    </div>
                  </>
                }
                {
                  districtNames && 
                  <div className="flex flex-col items-center justify-center m-4 w-full">
                  <span className='text-sm text-gray-400 mb-3'>Explore disasters affecting particular districts</span>
                  <Select 
                    value={selectedDistrict || "use-location"} 
                    onValueChange={(value) => setSelectedDistrict(value === "use-location" ? "" : value)}
                  >
                    <SelectTrigger className="w-[300px]">
                      <SelectValue placeholder="Select a district" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem 
                      className='flex justify-center'
                      value="use-location"  
                      >Use My Location</SelectItem>
                      {districtNames?.map((district) => (
                        <SelectItem 
                        className='flex justify-center '
                        key={district} 
                        value={district}>
                          {district}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                }
              </div>
            </Card>
          </div>
        </div>   
      </div>
    </div>
  );
}

export default HomePageClient;