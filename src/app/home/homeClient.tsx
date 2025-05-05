'use client'

import React, { useEffect, useState, useCallback, useReducer } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent, CardDescription, CardTitle} from '@/components/ui/card'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polyline } from "react-leaflet";
import {CloudRainWind, Download, MapPin, Phone, RotateCcw} from 'lucide-react';
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


const getAlertColor = (level:any) => {
  switch(level) {
    case 'Red': return '#ff0000';
    case 'Orange': return '#ff9900';
    case 'Green': return '#00cc00';
    default: return '#999999';
  }
};

// Constants
const GRAPHOPPER_API_KEY = "f0c392f0-13b6-4fc2-90f4-356817bfdfec";
const API_BASE_URL = "http://localhost:3000";
const EMERGENCY_CONTACTS_URL = "http://localhost:4000/emergency-contacts";

// Data fetching custom hook with state management
const useDataFetcher = (url, initialData = null, dependencies = []) => {
  const [state, setState] = useState({
    data: initialData,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      if (!url) return;
      
      try {
        setState(prev => ({ ...prev, isLoading: true }));
        const response = await fetch(url);
        
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
          toast.error(`Failed to fetch data: ${error.message}`);
        }
      }
    };

    fetchData();
    
    return () => {
      isMounted = false;
    };
  }, dependencies);

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

  //pop up that shows when the user clicks on the disaster track
  const [trackPopupInfo, setTrackPopupInfo] = useState(null);

  // Data fetching with custom hooks for better organization
  const { data: layers, isLoading: layersLoading, error: layersError } = 
    useDataFetcher(`${API_BASE_URL}/features/all`, {});

  // Fetch disasters only when coordinates are available 
  const { data: disasters, isLoading: disastersLoading, error: disastersError } = 
    useDataFetcher(
      locationState.coords ? 
      `http://localhost:3000/disaster-discovery-tracker/disasters?longitude=140.52&latitude=-11.60&includeHistory=false` : 
      null,
      [],
      [locationState.coords]
    );

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
      const url = `https://graphhopper.com/api/1/route?point=${waypoints[0][0]},${waypoints[0][1]}&point=${waypoints[1][0]},${waypoints[1][1]}&profile=foot&locale=en&calc_points=true&key=${GRAPHOPPER_API_KEY}`;
      
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

  // Set current disaster when disasters change
  useEffect(() => {
    if (disasters && disasters.length > 0 && !currentDisaster) {
      setCurrentDisaster(disasters[0]);
    }
  }, [disasters, currentDisaster]);

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

  // Loading state determination - more comprehensive and prevents false loading states
  const isLoading = layersLoading || disastersLoading || locationState.isLoading || 
                   (disasters && disasters.length > 0 && !currentDisaster);

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
   <Card>
      <Toaster
        position="top-right"
        theme='system'
      />
      <Card className='rounded-none'>
        <CardContent className='w-full'>
          <CardHeader className='w-full bg-green-400 rounded-md mb-4 mt-4'>
            <CardTitle className='text-xl font-extrabold justify-start text-center w-full'>
              Home Page
            </CardTitle>
            <CardDescription className='text-center text-black'>
              Prepare for the next impending disaster
            </CardDescription>
          </CardHeader>
          
          <div className="w-full flex flex-col md:flex-row justify-around gap-2">
            <div className='flex flex-col gap-2 md:w-[50%] h-screen'>    
              <Card className="relative md:w-[100%] h-[500px]">
                {
                  !locationState.isAvailable ? (
                    <div className='flex justify-center items-center h-full w-full'>
                      <div className='text-center text-2xl font-semibold items-center'>
                        Your browser does not support Geo location
                      </div>
                    </div>
                  ) : !locationState.isEnabled ? (
                    <Card className='h-full w-full flex justify-center items-center'>
                      <CardContent className='block'>
                        <CardHeader>
                          <CardTitle className='text-center'>
                            Geo Location is not enabled
                          </CardTitle>
                          <CardDescription>
                            Geo location services are available but disabled
                          </CardDescription>
                        </CardHeader>
                        <Button
                          className='flex justify-self-center'
                          onClick={requestGeolocation}
                        >
                          Enable Geo Location
                        </Button>
                      </CardContent>
                    </Card>
                  ) : locationState.isLoading ? (
                    <div className="flex items-center justify-center w-full h-full">
                      <Commet color="#32cd32" size="large" text="" textColor="" />
                    </div>
                  ) : (
                    <MapContainer
                      center={locationState.coords ? 
                        [locationState.coords.latitude, locationState.coords.longitude] : 
                        [-13.254308, 34.301525]
                      }
                      zoom={locationState.coords ? 19 : 6.3}
                      style={{ height: "100%", width: "100%", borderRadius: "2%", borderColor: "orange" }}
                    >
                      <MapUpdater coords={locationState.coords} />
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      {/* <MapClickHandler /> */}
                      
                      {locationState.coords && (
                        <Marker 
                          position={[locationState.coords.latitude, locationState.coords.longitude]} 
                          icon={icons.location}
                        >
                          <Popup>
                            <strong>Current location</strong>
                            <br />
                            lat: {locationState.coords.latitude.toFixed(6)}
                            <br />
                            lon: {locationState.coords.longitude.toFixed(6)}
                          </Popup>
                        </Marker>
                      )}
                      
                      {route.length > 0 && <Polyline positions={route} color="blue" />}
                      {route.length > 0 && waypoints[1] && (
                        <Marker position={waypoints[1]} icon={icons.destination} >
                          <Popup>
                            <strong>Destination</strong>
                            <br />
                              name: {destinationProps?.name??"N/A"}
                            <br />
                              amenity: {destinationProps?.amenity??"N/A"}
                          </Popup>
                        </Marker>
                      )}
                      
                      {disasterPolyCoords &&
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

                      {disasterTrackCoords &&
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
                                setCurrentDisaster(feature.properties.disasterId); // You had this in the click handler too
                              },
                            }}
                          />
                          {trackPopupInfo && trackPopupInfo.properties.eventid === feature.properties.eventid && (
                            <Popup position={trackPopupInfo.position} closeOnClick={true}>
                              <div className='flex flex-col gap-2 justify-center items-center'>
                                <h3 className='text-red-400'>{`${trackPopupInfo?.properties?.severitydata?.severity??"N?A"} ${trackPopupInfo?.properties?.severitydata?.severityunit??"N?A"}`}</h3>
                                <CloudRainWind color='red'/>
                                {/* Add other properties you want to display */}
                              </div>
                            </Popup>
                          )}
                        </React.Fragment>
                        ))}
                        
                    </MapContainer>
                  )
                }

                {/* Overlay filter options */}
                <div className="flex absolute top-4 left-20 z-[1000] md:hidden gap-2 flex-wrap bg-white bg-opacity-80 p-2 rounded">
                  {layers && Object.keys(layers).map((layer) => (
                    <Button 
                      key={layer}
                      onClick={() => toggleLayer(layer)}
                      className={`flex hover:text-white hover:bg-green-600 justify-center items-center text-current gap-2 p-1 pl-2 pr-2 rounded-sm ${filterLayer === layer ? 'bg-green-400' : 'bg-white'}`}
                    >
                      <img src={layers[layer].featureIconURL} alt={layer} className="w-6 h-6" />
                      <span>{layer.split("_")[1]}</span>
                    </Button>
                  ))}
                </div>  
              </Card>
              
              {
                navInstructions &&
                <NavigationInstructions 
                route={route} 
                instructions={navInstructions} 
                userLocation={locationState.coords} 
                distance = {navDistance}
              />  
              }
            </div>

            <Card className='md:w-[50%] bg-gray-100 p-2'>
              <CardHeader>
                <CardTitle className='flex justify-center bg-orange-200 rounded-sm p-2'>
                  {currentDisaster && currentDisaster.name}
                </CardTitle>
              </CardHeader>  
              
              <Card className='p-2'>
                <CardHeader>
                  <CardTitle className='text-center'>
                    Emergency Contacts
                  </CardTitle>
                  <CardDescription className='text-center'>
                    You seem to be in 
                    <span className='text-green-400 font-semibold'>
                      {emergencyContact && ` ${emergencyContact.location}`}
                    </span>. For emergencies, call:
                  </CardDescription>
                </CardHeader>
                
                {emergencyContact && emergencyContact.phones && (
                  <ul className='m-2'>
                    {emergencyContact.phones.numbers.map((phoneNumber, index) => (
                      <li key={index} className='flex gap-2 justify-center items-center'>
                        <Phone />
                        {phoneNumber}
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
              
              <Card className='flex gap-2 justify-items-start flex-wrap pl-6 pr-6 bg-white mt-2 p-2'>
                <span>Make your way to any of the nearest destination below:</span>
                {layers && Object.keys(layers).map((layer) => (
                  <Button 
                    key={layer}
                    onClick={() => toggleLayer(layer)}
                    className={`flex hover:text-white bg-gray-200 hover:bg-green-600 justify-center items-center text-current gap-2 p-1 pl-2 pr-2 rounded-sm ${filterLayer === layer ? 'bg-green-400' : 'bg-white'}`}
                  >
                    <img src={layers[layer].featureIconURL} alt={layer} className="w-6 h-6" />
                    <span>{layer.split("_")[1]}</span>
                  </Button>
                ))}
              </Card>
              
              {currentDisaster && (
                <div className='grid grid-cols-2 gap-2 m-5'>
                  <div className='font-extrabold'>
                    Disaster type
                  </div>
                  <div>
                    {currentDisaster.eventType}
                  </div>
                  <div className='font-extrabold'>
                    Date
                  </div>
                  <div>
                    {new Date(currentDisaster.startDate).toLocaleDateString()}
                  </div>
                  {/* <div className='font-extrabold'>
                    Impact Chance
                  </div>
                  <div>
                    {currentDisaster.likelihood}
                  </div> */}
                  <div className='font-extrabold'>
                    Intensity
                  </div>
                  <div>
                    {/* <HorizontalProgressBar progress={currentDisaster.intensity} /> */}
                    {`${currentDisaster.latestUpdate.severity} ${currentDisaster.latestUpdate.severityUnit}` }
                  </div>
                </div>
              )}
              
              <div className='flex flex-col md:flex-row gap-2 justify-between p-5'>
                <Button className='gap-2 w-full md:w-auto'>
                  <Download />
                  <span className='text-sm flex-wrap'>Download info</span>
                </Button>
                <Button className='flex gap-2'>
                  <Download />
                  <span className='text-sm flex-wrap'>Safety during cyclones</span>
                </Button>
              </div>
              
              <span className='mt-7 text-xl font-bold w-full flex justify-center'>
                Impending disasters
              </span>
              
              <LinkedEvents 
                events={disasters?disasters: []} 
                setCurrentDisaster={setCurrentDisaster} 
                currentEvent={currentDisaster? currentDisaster: null }
              />
            </Card>
          </div>   
        </CardContent>
      </Card>
   </Card>
  );
}

export default HomePageClient;