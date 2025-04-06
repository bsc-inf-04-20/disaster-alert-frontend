'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent, CardDescription, CardTitle, CardFooter } from '@/components/ui/card'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polyline } from "react-leaflet";
import {Hospital, Shield, FireExtinguisher, ShieldIcon, Download} from 'lucide-react';
import "leaflet/dist/leaflet.css";
import * as shapefile from "shapefile";
import { GeoJSON } from "react-leaflet";
import L, { icon, Icon } from "leaflet";
import { Polygon } from "react-leaflet";
import HorizontalProgressBar from './horizontalGraph';
import LinkedEvents from './linkedEvents';
import { useGeolocated } from 'react-geolocated';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast, Toaster } from 'sonner';
import MapUpdater from './mapUpdater';
import polyline from '@mapbox/polyline';
import NavigationInstructions from './navInstructions'
import {Commet, TrophySpin} from 'react-loading-indicators';
import { CreateMarker } from '../utils/ImageProgressing';


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

function HomePageClient({events, disasters}:LinkedEventProps) {



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
    const [currentDisaster, setCurrentDisaster] = useState(Object.keys(disasters)[0])


    // keeping track of all the layers
    const [layers, setLayers] = useState({})


    // keeping track of all the layers selected to be rendered on to the map
    const [filteredLayers, setFilteredLayers]= useState<string[]>([])

    // keeping track of the data availability to update loading state
    const [loadingState, setLoadingState] = useState<boolean>(true)

    useEffect(()=>{
      if(layers){
        setLoadingState(false)
      }
    },
      [events])

    
    // requesting geo location services
    // Update your requestGeolocation function:
    const requestGeolocation = () => {
      if (navigator.geolocation) {
        // Request high accuracy specifically
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log("Position obtained:", position);
            toast.success(`Location granted: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
            setLocationEnabled(true);
            setCoords(position.coords);
            setDialogOpen(false);
          },
          (error) => {
            console.error("Geolocation error:", error);
            toast.error(`Location error: ${error.message}`);
            setLocationEnabled(false);
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

      if(filteredLayers && filteredLayers.includes(targetLayer)){
        const filteredLyrs:any[] = filteredLayers.filter((layer:any)=>layer!=targetLayer)
        setFilteredLayers(filteredLyrs)
      }
      else if(!filteredLayers.includes(targetLayer))
       setFilteredLayers(prev =>[...prev, targetLayer])
    }

    //getting the layers information, shelters and hospitals and placing them into the layers state
    useEffect(() => {
      async function loadShapefile() {
          try {
              const layers = await fetch("http://localhost:3000/features/all");
              const layersData = await layers.json();
              let array =Object.keys(layersData)
             console.log(array[0])
              setLayers(layersData);
              setFilteredLayers(Object.keys(layers))

          } catch (error) {
              console.error("Error loading shapefile:", error);
          }
      }
  
      loadShapefile();
  }, []);

      //initially grabbing all available layers into the filters
      useEffect(() => {
        console.log(`the layers are:${layers}`)
        setFilteredLayers((prev) => (prev === null ? Object.keys(layers) : prev));
      }, [layers]);


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
    const [disasterPolyCoords, setDisasterPolyCoords] = useState<any[]>([])



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
      if (
        disasters[currentDisaster]?.data[0]?.parsedGeom?.points &&
        Array.isArray(disasters[currentDisaster].data[0].parsedGeom.points)
      ) {
        const points = disasters[currentDisaster].data[0].parsedGeom.points;
        const formattedCoords = points.map(geom => [
          Number(geom.x), // Latitude
          Number(geom.y)  // Longitude
        ]);
        console.log(formattedCoords)
        setDisasterPolyCoords(formattedCoords);
      } else {
        setDisasterPolyCoords([]);
      }
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

  if(loadingState) {
    return (
      <div className="flex items-center justify-center w-full h-screen">
        <Commet color="#32cd32" size="large" text="" textColor="" />
      </div>
    );
  }

  return (
   <div>
      <Toaster
        position="top-right"
        theme='system'
      />
    {!isGeolocationPresent?
    <div className='flex justify-center items-center h-screen'>
      <div className='text-center text-2xl font-semibold items-center'>Your browser does not support Geo location</div>
    </div>:
    !locationEnabled?
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
    <DialogContent className='block'>
        <DialogTitle className='text-center'>
          Location Services
        </DialogTitle>
        <Card className='flex flex-col items-center m-2 rounded-md'>
          <CardHeader>
              <CardTitle className='text-center'>
                  Geo Location is not enabled
              </CardTitle>
              <CardDescription>
                  Geo location services are available but disabled
              </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
                onClick={()=>requestGeolocation()}
                > Enable Geo Location
            </Button>
          </CardContent>
       </Card>
    </DialogContent>
    </Dialog>:
    <Card className='rounded-none'>

              <CardHeader className='flex justify-center'>
                  <CardTitle className='flex text-xl font-extrabold justify-center'>
                      Home Page
                  </CardTitle>
                  <CardDescription className='flex justify-center'>Prepare for the next impending disaster </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col md:flex-row  justify-around gap-2">
            <div className='flex flex-col gap-2 md:w-[50%] h-screen'>    
                      <Card className="relative md:w-[100%] h-[500px]">
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
                          {filteredLayers.length > 0 &&
                              filteredLayers.map((layer) =>
                                layers[layer].data.map((feature: any, index: number) => {
                                  console.log(`is filetredLayers as array? : ${Array.isArray(filteredLayers)}, it is a ${typeof filteredLayers} and here is it ${JSON.stringify(filteredLayers)}`)
                                  const coords = feature.parsedGeom;
                                  console.log(`the coordintes are x: ${Number.parseInt (coords.y)} y: ${coords.x}`)
                                  console.log(`the icon url is : ${layers[layer].featureIconURL}`)
                                  console.log(CreateMarker("https://api.iconify.design/material-symbols-light:school-outline.svg?height=32&color=black"));
                                  return (
                                    <Marker key={index} position={[Number.parseFloat(coords.x), Number.parseFloat(coords.y)]} icon={CreateMarker(layers[layer].featureIconURL)}>
                                      {/* <Popup>
                                        <strong>{layer}</strong>
                                        <br />
                                        Name: {feature.properties.name || "Unknown"}
                                        <br />
                                        Type: {feature.properties.amenity || "Unknown"}
                                      </Popup> */}
                                    </Marker>
                                  );
                                })
                              )}
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
                          <Polygon positions={disasterPolyCoords} pathOptions={{ color: "blue" }} />
                          <Polygon positions={disasterPolyCoords} color="blue" />
                        </MapContainer>

                        {/* Overlay filter options */}
                        <div className="flex absolute top-4 left-20 z-[1000] md:hidden gap-2 flex-wrap bg-white bg-opacity-80 p-2 rounded">
                        {
                            Object.keys(layers).map((layer:any, index:number)=>{
                              return (
                                <Button 
                                key={layer}
                                onClick={()=>togglelayer(layer)}
                                className={`flex hover:text-white hover:bg-green-600 justify-center items-center text-current gap-2 p-1 pl-2 pr-2 rounded-sm ${filteredLayers.includes(layer)?'bg-green-400':'bg-white'}`} >
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
                  {disasters[currentDisaster]?.metadata.disasterName}
                </CardTitle>
              </CardHeader>  
                <div className='flex gap-2 justify-items-start flex-wrap pl-6 pr-6'>
                {
                    Object.keys(layers).map((layer:any, index:number)=>{
                      return (
                        <Button 
                        key={layer}
                        onClick={()=>togglelayer(layer)}
                        className={`flex hover:text-white hover:bg-green-600 justify-center items-center text-current gap-2 p-1 pl-2 pr-2 rounded-sm ${filteredLayers.includes(layer)?'bg-green-400':'bg-white'}`} >
                            <img src={layers[layer].featureIconURL} alt={layer} className="w-6 h-6" />
                            <span>{layer.split("_")[1]}</span>
                        </Button>
                      )
                    })
                  }
                </div>
                  <div className=' grid grid-cols-2 gap-2 m-5'>
                    <div className='font-extrabold'>
                      Disaster type
                    </div>
                    <div>
                      {disasters[currentDisaster]?.metadata.disasterType}
                    </div>
                    <div className='font-extrabold'>
                      Date
                    </div>
                    <div>
                      {new Date(disasters[currentDisaster]?.metadata.startDate).toLocaleDateString()}
                    </div>
                    <div className='font-extrabold'>
                      Impact Chance
                    </div>
                    <div>
                      {disasters[currentDisaster]?.metadata.likelihood}
                    </div>
                    <div className='font-extrabold'>
                      Intesity
                    </div>
                    <div>
                    <HorizontalProgressBar progress={disasters[currentDisaster]?.metadata.intensity}/>
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
                  <LinkedEvents events={disasters} setCurrentDisaster={setCurrentDisaster} currentEvent={disasters[currentDisaster]}/>
            </Card>   
        </CardContent>
    </Card>
     }
  </div>
  )
}

export default HomePageClient

function useMap() {
  throw new Error('Function not implemented.');
}
