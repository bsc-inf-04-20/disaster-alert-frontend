'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent, CardDescription, CardTitle} from '@/components/ui/card'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polyline } from "react-leaflet";
import {Download, MapPin, Phone} from 'lucide-react';
import "leaflet/dist/leaflet.css";
import { GeoJSON } from "react-leaflet";
import L from "leaflet";
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



async function getEmergencyContact(){
  try {
    const res = await fetch("http://localhost:4000/emergency-contacts", {
      cache: "no-store", // Prevents caching in SSR
    });

    if (!res.ok) {
      throw new Error("Failed to fetch emergency contacts");
    }

    const contacts= await res.json();

     return contacts
  } catch (error) {
    console.error("Error fetching emergency contacts", error);
    return null;
  }
}

// Load and parse GeoJSON file
const loadGeoJSON = async (filePath) => {
  try {
    const geoJsonData =await fetch(filePath);
    return await geoJsonData.json();
  } catch (error) {
    console.error("Error loading GeoJSON file:", error);
    return null;
  }
};

// Function to find which polygon a location is inside
const findEmergencyContacts = async (filePath, longitude, latitude) => {
  const geoJson = await loadGeoJSON(filePath)
  console.log(geoJson)
  if (!geoJson) return;

  const locationPoint = turf.point([longitude, latitude]);

  // Find matching polygon
  const matchingFeature = geoJson.features.find(feature =>
    turf.booleanPointInPolygon(locationPoint, feature.geometry)
  );

  console.log("matching feature", matchingFeature)

  if (!matchingFeature) {
    console.log("No matching region found.");
    return null;
  }

  // Extract shapeName
  const shapeName = matchingFeature.properties.shapeName;
  console.log(`Location is inside: ${shapeName}`);

  const emergencyContacts= await getEmergencyContact()

  // Search emergency contacts database for matching location
  const contact = emergencyContacts.find(ec => ec.location === shapeName);

  console.log("the contact is ", contact)

  if (contact) {
    return contact;
  } else {
    console.log(`No emergency contacts found for ${shapeName}.`);
    return [];
  }
};



type LinkedEventProps = {
  events:Event[]
  disasters:any
}

//description of an event 
type Event ={
  id: number,
  type: string,
  name: string,
  date: string,
  intensity: number,
  impact_chance: number
}


type Layer = {
  name: string;
  data: any;
  mapIcon:any
  icon : string 
};

function HomePageClient() {



    const healthIcon = L.icon({
        iconUrl: "medical.png", // Place an icon in the public/icons/ folder
        iconSize: [32, 32], // Adjust size as needed
        iconAnchor: [16, 32], // Center the icon properly
        popupAnchor: [0, -32],
      });

    const shieldIcon = L.icon({
        iconUrl: "shield.png", // Place an icon in the public/icons/ folder
        iconSize: [32, 32], // Adjust size as needed
        iconAnchor: [16, 32], // Center the icon properly
        popupAnchor: [0, -32],
      });

      const destinationIcon = L.icon({
        iconUrl: "destination.png", // Place an icon in the public/icons/ folder
        iconSize: [32, 32], // Adjust size as needed
        iconAnchor: [16, 32], // Center the icon properly
        popupAnchor: [0, -32],
      });  


      const locationIcon = L.icon({
        iconUrl: "locationIcon.png", // Place an icon in the public/icons/ folder
        iconSize: [70, 70], // Adjust size as needed
        iconAnchor: [16, 32], // Center the icon properly
        popupAnchor: [0, -32],
      });
  

     
    // const filters = [
    //   {name:"hospitals", icon: Hospital, value: "hospitalData" },
    //   {name:"Shelter", icon: Shield , value : "schoolData"},
    //   {name:"fire station", icon: FireExtinguisher },
    //   {name:"police", icon:  ShieldIcon}
    // ]  

    //tracking the open-closed state of the "get location dialog"
    const [dialogOpen, setDialogOpen] = useState(true);

    // is location available
    const [isGeolocationPresent, setIsGeoLocationPresent] = useState<boolean>()


    //tracking whether location is enabled or not
    const [locationEnabled, setLocationEnabled] = useState(true);

    //tracking the user's coords when the location is enabled
    const [coords, setCoords] =useState<GeolocationCoordinates>()


    //keeping track of which disaster is currently being displayed in detail
    const [currentDisaster, setCurrentDisaster] = useState<any | null>(null)


    // keeping track of all the layers
    const [layers, setLayers] = useState< {} | null>(null);


    // keeping track of all the layers selected to be rendered on to the map
    const [filterLayer, setFilterLayer]= useState<string | null>("")

    // keeping track of the data availability to update loading state
    const [loadingState, setLoadingState] = useState<boolean>(true)

    //keep track of location availability
    const [gettingLocation, setGettingLocation] = useState<boolean>(false)


    const [disasters, setDisasters]= useState([])

    async function getDisasters() {
      try {
        const res = await fetch(`http://localhost:3000/disasters/metadata?y=${coords.latitude}&x=${coords.longitude}&status=approved`, {
          cache: "no-store", // Prevents caching in SSR
        });
    
        if (!res.ok) {
          throw new Error("Failed to fetch disasters");
        }
    
        const disasters= await res.json();

        console.log("fisrt how of disasters",disasters)
    
        
        return disasters
      } catch (error) {
        console.error("Error fetching disasters:", error);
        return null;
      }
    }

  //after the user's current coordinates are fetched, get the disasters at the current location
    useEffect(() => {
      const fetchDisasters = async () => {
        if (coords) {
          setDisasters(await getDisasters());
        }
      };
      fetchDisasters();
      console.log("the disasters are", disasters)
    }, [coords]);

  //set the current disaster after disasters are fetched
    useEffect(()=>{
      if(disasters.length > 0){
        setCurrentDisaster(disasters[0])
      }
    },
    [disasters])

    useEffect(()=>{
      if(layers && Object.keys(layers).length > 0){
        setLoadingState(false)
      }
    },
      [layers])

    
    // requesting geo location services
    // Update your requestGeolocation function:
    const requestGeolocation = () => {


      setGettingLocation(true)

      if (navigator.geolocation) {
        // Request high accuracy specifically
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log("Position obtained:", position);
            toast.success(`Location granted: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
            setLocationEnabled(true);
            setCoords(position.coords);
            setDialogOpen(false);
            setGettingLocation(false)
            
          },
          (error) => {
            console.error("Geolocation error:", error);
            toast.error(`Location error: ${error.message}`);
            setLocationEnabled(false);
            setGettingLocation(false)
          },
          {
            enableHighAccuracy: true,  // Request GPS if available
            timeout: 10000,            // Wait up to 10 seconds
            maximumAge: 0              // Don't use cached position
          }
        );
      } else {
        toast.error("Geolocation is not supported by this browser");
        setIsGeoLocationPresent(false);
      }
    };

    //toggle layer adds or removes a layer to the map when a layer button is clicked    
    const togglelayer = (targetLayer:any) =>{

      if(filterLayer==targetLayer){
        setFilterLayer("")
      }
      else if(filterLayer!=targetLayer)
       setFilterLayer(targetLayer)
    }

    //run the function to get recommended location route when a new filter layer s selected
    useEffect(() => {
      if (filterLayer && coords) { // 2. Add conditional check
        GetRecommendedRouteWithinLayer();
      }
    }, [filterLayer, coords]);

    const [emergencyContact, setEmergencyContact] = useState<any | null>(null)

    useEffect(()=>{
      if(coords)
      findEmergencyContacts("geoBoundaries-MWI-ADM2_simplified.geojson", coords?.longitude, coords?.latitude)
      .then((contact) => {
        setEmergencyContact(contact);
      }).catch((error) => {
        toast.error("failed to fetch emergency contact")
      })
    }, [coords])

    //get the recommended go to location within the selected layer
    const GetRecommendedRouteWithinLayer=async ()=>{

      if (!coords) {
        toast.error("Location data not available");
        return;
      }
    
       try{
    
        console.log(filterLayer)
    
        //print the parametes being passed into api call
        console.log(`XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX${coords?.latitude}&y=${coords?.longitude}&disasterName=${currentDisaster}&layer=${filterLayer}`)
        
        const recommendedParams = await fetch(`http://localhost:3000/features?x=${coords?.latitude}&y=${coords?.longitude}&disasterName=${currentDisaster}&layer=${filterLayer}`)
    
        const parsedRecom = await recommendedParams.json()
    
        if(!recommendedParams.ok)
        {
          console.log(parsedRecom)
          toast.error(`failed to get route for ${filterLayer?.split("_")[1]}`)
          throw new Error(`failed to get route for ${filterLayer?.split("_")[1]}`)
        }
    
        console.log("[parsedRecom.parsedGeom.x, parsedRecom.parsedGeom.y]", parsedRecom.parsedGeom.x, parsedRecom.parsedGeom.y)
    
        setWaypoints(coords?[[coords.latitude, coords.longitude], [parsedRecom.parsedGeom.x, parsedRecom.parsedGeom.y]]:[]) 
    
       }catch(e){
        console.log(`failed to get failed to get route for ${filterLayer?.split("_")[1]}, because ${e}`)
        toast.error(`failed to get route for ${filterLayer?.split("_")[1]}`)
       }
    
    }

    //getting the layers information, shelters and hospitals and placing them into the layers state
    useEffect(() => {
      const abortController = new AbortController();

      async function loadShapefile() {
        try {
          const response = await fetch("http://localhost:3000/features/all",{
            signal: abortController.signal
        });
          if (!response.ok) throw new Error("Failed to fetch layers");
          const layersData = await response.json();
          console.log("fetched layers")
          setLayers(layersData);
        } catch (error) {
          if (!abortController.signal.aborted) {
            toast.error("Failed to fetch map features");
          }
          console.error("Error loading shapefile:", error);
          toast.error("Failed to load map data");
          setLoadingState(false); // Ensure loading state updates even on error
        }
      }
      loadShapefile();
    }, []);

      //initially grabbing all available layers into the filters


   //grabbing current location
      const { coords: geoCoords, isGeolocationAvailable, isGeolocationEnabled } = useGeolocated({ 
        positionOptions: {enableHighAccuracy: true,},
        userDecisionTimeout: 5000,
        watchPosition: true,
      },  
    );


    //tracking starting and ending points
    const [waypoints, setWaypoints] = useState<[number, number][]>([]);

    //keeping the route points
    const [route, setRoute] = useState<[number, number][]>([]);

    //tracking navigation instructions
    const [navInstructions, setNavInstructions] = useState<any[] | null> ([])

    const [navDistance, setNavDistance] = useState<number| null>()

    //disaster parameters
    const [disasterPolyCoords, setDisasterPolyCoords] = useState<GeoJSON.GeoJsonObject | null>(null)

      // Handle map clicks to set waypoints

      const GRAPHOPPER_API_KEY = "f0c392f0-13b6-4fc2-90f4-356817bfdfec"

    
      const MapClickHandler = () => {
        useMapEvents({
          click(e) {
            if (waypoints.length === 0) {
              // First click: set start and destination at once
              setWaypoints([[coords!.latitude, coords!.longitude], [e.latlng.lat, e.latlng.lng]]);
            } else {
              // Subsequent clicks: update only the destination
              setWaypoints(([start]) => [start, [e.latlng.lat, e.latlng.lng]]);
            }
          },
        });
        return null;
      };

      useEffect(()=>{
        getRoute()
      }, [waypoints])

      // Fetch route from GraphHopper
      const getRoute = async () => {

        if (waypoints.length < 2) return;

        console.log(" in the get route")
        
        const url = `https://graphhopper.com/api/1/route?point=${waypoints[0][0]},${waypoints[0][1]}&point=${waypoints[1][0]},${waypoints[1][1]}&profile=foot&locale=en&calc_points=true&key=${GRAPHOPPER_API_KEY}`;

        try {
          const response = await fetch(url);
          const preparedResponse =await response.json() 
          console.log(preparedResponse)    
          const coords = preparedResponse.paths[0].points
          console.log(coords)  
          const decodedCoords = polyline.decode(coords)
          console.log(decodedCoords)  
          const navInstructions = preparedResponse.paths[0].instructions
          const distance =preparedResponse.paths[0].distance

          console.log(`the nav instructions: ${navInstructions} the nav distance : ${distance}`)
          toast.success("route successfully generated")
          setRoute(decodedCoords); // Convert to Leaflet format
          setNavDistance(distance)
          setNavInstructions(navInstructions)
          console.log("successfully set route")
        } catch (error) {
          console.error("Error fetching route:", error);
          toast.error(`route could not be generated: ${error}`)
        }
      };

    // Fix the useEffect
    useEffect(() => {
      console.log("currentDisaster is:", currentDisaster);

      if(currentDisaster == null){
        toast.error("no disaster selected")
        return} 
      fetch(`http://localhost:3000/disasters/${currentDisaster.disasterName}/geometry`)
      .then(async (res) => {
         const geometry = await res.json()
         console.log("just called for the coords")
         setDisasterPolyCoords(geometry as GeoJSON.GeoJsonObject)
         toast.success("rendered the disaster parameters")
      })
      .catch((e) => {
        console.log(e)
        toast.error("failed to get disaster geometry")
      })

    }, [currentDisaster, disasters]);





      useEffect(() => {
        if (!isGeolocationEnabled) {
          setLocationEnabled(false);
          setCoords(geoCoords);
          setIsGeoLocationPresent(isGeolocationAvailable);
        } else {
          setLocationEnabled(true);
          setCoords(geoCoords);
          setIsGeoLocationPresent(true);
        }
      }, [isGeolocationEnabled, geoCoords, isGeolocationAvailable]);

  if(loadingState || !currentDisaster || layers==undefined || layers==null) {
    return (
      <div className="flex items-center justify-center w-full h-screen">
        <Commet color="#32cd32" size="large" text="" textColor="" />
      </div>
    );
  }

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
                  <CardDescription className='text-center text-black'>Prepare for the next impending disaster </CardDescription>
              </CardHeader>
              <div className=" w-full flex flex-col md:flex-row  justify-around gap-2">
                <div className='flex flex-col gap-2 md:w-[50%] h-screen'>    
                      <Card className="relative md:w-[100%] h-[500px]">
                        {
                            !isGeolocationPresent?
                            <div className='flex justify-center items-center h-full w-full'>
                              <div className='text-center text-2xl font-semibold items-center'>Your browser does not support Geo location</div>
                            </div>:
                            !locationEnabled?
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
                                        onClick={()=>requestGeolocation()}
                                        > Enable Geo Location
                                    </Button>
                            </CardContent>
                            </Card>:
                             gettingLocation?
                             <div className="flex items-center justify-center w-full h-full">
                                <Commet color="#32cd32" size="large" text="" textColor="" />
                              </div>:
                              <MapContainer
                                center={ coords?[coords.latitude, coords.longitude]:[-13.254308, 34.301525]}
                                zoom={coords ? 19 :6.3}
                                style={{ height: "100%", width: "100%", borderRadius: "2%", borderColor: "orange" }}
                              >
                                <MapUpdater coords={coords}/>
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <MapClickHandler />
                                  {/* {waypoints.map((pos, idx) => (
                                    <Marker key={idx} position={pos} />
                                  ))} */}
      
                                    {coords?
                                      <Marker position={[coords.latitude, coords.longitude]} icon={locationIcon}>
                                        <Popup>
                                            <strong>current location</strong>
                                            <br />
                                            lat: {coords?.latitude}
                                            <br />
                                            lon: {coords?.longitude}
                                        </Popup>
                                      </Marker>:
                                      ""  
                                  }
                                {route.length > 0 && <Polyline positions={route} color="blue" />}
                                {route.length > 0 && <Marker position={waypoints[1]} icon={destinationIcon}></Marker>}
                                {/* <Polygon positions={disasterPolyCoords} pathOptions={{ color: "blue" }} /> */}
                                {/* <Polygon positions={disasterPolyCoords} color="red" opacity={50} /> */}
                                {disasterPolyCoords && (
                                  <GeoJSON
                                    key={JSON.stringify(disasterPolyCoords)}
                                    data={disasterPolyCoords}
                                    style={{
                                      fillColor: 'transparent',
                                      weight: 2,
                                      opacity: 1,
                                      color: 'red',
                                      fillOpacity: 0.1,
                                    }}
                                  />
                                )}
                              </MapContainer>
                        }

                        {/* Overlay filter options */}
                        <div className="flex absolute top-4 left-20 z-[1000] md:hidden gap-2 flex-wrap bg-white bg-opacity-80 p-2 rounded">
                        {
                            Object.keys(layers).map((layer:any, index:number)=>{
                              return (
                                <Button 
                                key={layer}
                                onClick={()=>togglelayer(layer)}
                                className={`flex hover:text-white hover:bg-green-600 justify-center items-center text-current gap-2 p-1 pl-2 pr-2 rounded-sm ${filterLayer==layer?'bg-green-400':'bg-white'}`} >
                                    <img src={layers[layer].featureIconURL} alt={layer} className="w-6 h-6" />
                                    <span>{layer.split("_")[1]}</span>
                                </Button>
                              )
                            })
                          }
                        </div>  
                      </Card>
                      <NavigationInstructions route={route} instructions={navInstructions} userLocation={coords} />  
            </div>

            <Card className='md:w-[50%] bg-gray-100 p-2'>
              <CardHeader >
                <CardTitle className='flex justify-center bg-orange-200 rounded-sm p-2'>
                  { `${currentDisaster.disasterType} ${ReplaceUnderScoreMakeCamelCase(currentDisaster.disasterName)}`}
                </CardTitle>
              </CardHeader>  
                <Card className='p-2' >
                  <CardHeader>
                    <CardTitle className='text-center'>
                       Emergency Contacts
                    </CardTitle>
                    <CardDescription className='text-center'>
                        You seem to be in 
                        <span className='text-green-400 font-semibold'>{` ${emergencyContact.location}`}</span>. For emergencies, call:
                    </CardDescription>
                  </CardHeader>
                  <ul className='m-2'>
                    {
                      emergencyContact && emergencyContact.phones.numbers.map((phoneNumber: any, index: number) => (
                        <li key={index} className='flex gap-2 justify-center items-center'>
                          <Phone/>
                          {phoneNumber}
                        </li>
                      ))
                    }
                  </ul>
                </Card>
                <Card className='flex gap-2 justify-items-start flex-wrap pl-6 pr-6 bg-white mt-2 p-2'>
                  <span>Make your way to any of the nearest destination below:</span>
                {
                    Object.keys(layers).map((layer:any, index:number)=>{
                      return (
                        <Button 
                        key={layer}
                        onClick={()=>togglelayer(layer)}
                        className={`flex hover:text-white bg-gray-200 hover:bg-green-600 justify-center items-center text-current gap-2 p-1 pl-2 pr-2 rounded-sm ${filterLayer==layer?'bg-green-400':'bg-white'}`} >
                            <img src={layers[layer].featureIconURL} alt={layer} className="w-6 h-6" />
                            <span>{layer.split("_")[1]}</span>
                        </Button>
                      )
                    })
                  }
                </Card>
                  <div className=' grid grid-cols-2 gap-2 m-5'>
                    <div className='font-extrabold'>
                      Disaster type
                    </div>
                    <div>
                      {currentDisaster?.disasterType}
                    </div>
                    <div className='font-extrabold'>
                      Date
                    </div>
                    <div>
                      {new Date(currentDisaster?.startDate).toLocaleDateString()}
                    </div>
                    <div className='font-extrabold'>
                      Impact Chance
                    </div>
                    <div>
                      {currentDisaster?.likelihood}
                    </div>
                    <div className='font-extrabold'>
                      Intesity
                    </div>
                    <div>
                    <HorizontalProgressBar progress={currentDisaster?.intensity}/>
                    </div>
                  </div>
                  <div className='flex flex-col md:flex-row gap-2 justify-between p-5'>
                    <Button className=' gap-2 w-full md:w-auto'>
                      <Download/>
                      <span className='text-sm flex-wrap'>Download info</span>
                    </Button>
                    <Button className='flex gap-2'>
                      <Download/>
                      <span className='text-sm flex-wrap'>Safety during cyclones</span>
                    </Button>
                  </div>
                  <span className='mt-7 text-xl font-bold w-full flex justify-center'>Impending disasters</span>
                  <LinkedEvents events={disasters} setCurrentDisaster={setCurrentDisaster} currentEvent={currentDisaster}/>
              </Card>
            </div>   
        </CardContent>
    </Card>
  </Card>
  )
}

export default HomePageClient

function useMap() {
  throw new Error('Function not implemented.');
}
function e(reason: any): PromiseLike<never> {
  throw new Error('Function not implemented.');
}

