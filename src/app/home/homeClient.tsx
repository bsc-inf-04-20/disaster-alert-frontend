'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import { MapContainer, TileLayer, Marker, Popup, } from "react-leaflet";
import {Hospital, Shield, FireExtinguisher, ShieldIcon, Download, } from 'lucide-react';
import "leaflet/dist/leaflet.css";
import * as shapefile from "shapefile";
import { GeoJSON } from "react-leaflet";
import L, { Icon } from "leaflet";
import HorizontalProgressBar from './horizontalGraph';
import LinkedEvents from './linkedEvents';

type LinkedEventProps = {
  events:Event[]
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

function HomePageClient({events}:LinkedEventProps) {


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
  

     
    // const filters = [
    //   {name:"hospitals", icon: Hospital, value: "hospitalData" },
    //   {name:"Shelter", icon: Shield , value : "schoolData"},
    //   {name:"fire station", icon: FireExtinguisher },
    //   {name:"police", icon:  ShieldIcon}
    // ]  


    //keeping track of which disaster is currently being displayed in detail
    const [currentDisaster, setCurrentDisaster] = useState<Event>(events[0])


    // keeping track of all the layers
    const [layers, setLayers] = useState<Layer[]>([])


    // keeping track of all the layers selected to be rendered on to the map
    const [filteredLayers, setFilteredLayers]= useState<Layer[]>([])

    //toggle layer adds or removes a layer to the map when a layer button is clicked    
    const togglelayer = (targetLayer:Layer) =>{

      if(filteredLayers.includes(targetLayer)){
        const filteredLyrs:Layer[] = filteredLayers.filter((layer:Layer)=>layer.name!=targetLayer.name)
        setFilteredLayers(filteredLyrs)
      }
      else
       setFilteredLayers([...layers, targetLayer])
    }

    //getting the layers information, shelters and hospitals and placing them into the layers state
    useEffect(() => {
        async function loadShapefile() {
          try {
            const healthResponse = await fetch("/hotosm_mwi_health_facilities_points_shp/hotosm_mwi_health_facilities_points_shp.shp"); // Ensure the file is accessible
            const healthArrayBuffer = await healthResponse.arrayBuffer();
            const healthGeojson = await shapefile.read(healthArrayBuffer);
            setLayers(prevLayers => [...prevLayers, { name: "health_facility", data: healthGeojson, mapIcon: healthIcon, icon:"medical.png" }]);

            const schoolsResponse  = await fetch("/hotosm_mwi_education_facilities_points_shp/hotosm_mwi_education_facilities_points_shp.shp"); // Ensure the file is accessible

            const schoolsArrayBuffer = await schoolsResponse.arrayBuffer();
            const schoolGeojson = await shapefile.read(schoolsArrayBuffer);
            setLayers(prevLayers => [...prevLayers, { name: "shelter", data: schoolGeojson, mapIcon: shieldIcon, icon:"shield.png" }]);

          } catch (error) {
            console.error("Error loading shapefile:", error);
          }
        }
    
        loadShapefile();
      }, []);

      //initially grabbing all available layers into the filters
      useEffect(()=>{

        setFilteredLayers(layers)

      }, [layers])

  return (
    <Card className='rounded-none'>
        <CardHeader className='flex justify-center'>
            <CardTitle className='flex text-xl font-extrabold justify-center'>
                Home Page
            </CardTitle>
            <CardDescription className='flex justify-center'>Prepare for the next impending disaster </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row  justify-around gap-2">
        <Card className="relative md:w-[50%] h-[500px]">
          <MapContainer
            center={[-13.254308, 34.301525]}
            zoom={6.3}
            style={{ height: "100%", width: "100%", borderRadius: "2%", borderColor: "orange" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {filteredLayers &&
                filteredLayers.map((layer: Layer) =>
                  layer.data.features.map((feature: any, index: number) => {
                    const coords = feature.geometry.coordinates;
                    return (
                      <Marker key={index} position={[coords[1], coords[0]]} icon={layer.mapIcon}>
                        <Popup>
                          <strong>{layer.name}</strong>
                          <br />
                          Name: {feature.properties.name || "Unknown"}
                          <br />
                          Type: {feature.properties.amenity || "Unknown"}
                        </Popup>
                      </Marker>
                    );
                  })
                )}
   
          </MapContainer>

          {/* Overlay filter options */}
          <div className="flex absolute top-4 left-20 z-[1000] md:hidden gap-2 flex-wrap bg-white bg-opacity-80 p-2 rounded">
          {
              layers.map((layer:Layer)=>{
                return (
                  <Button 
                  key={layer.name}
                  onClick={()=>togglelayer(layer)}
                  className={`flex hover:text-black hover:bg-green-200 justify-center items-center text-current gap-2 p-1 pl-2 pr-2 rounded-sm ${filteredLayers.includes(layer)?'bg-green-400':'bg-white'}`} >
                      <img src={layer.icon} alt={layer.name} className="w-6 h-6" />
                      <span>{layer.name}</span>
                  </Button>
                )
              })
            }
          </div>
        </Card>
  

            <Card className='md:w-[50%] bg-gray-100 p-2'>
              <CardHeader >
                <CardTitle className='flex justify-center bg-orange-300 rounded-sm p-2'>
                  {currentDisaster?.name}
                </CardTitle>
              </CardHeader>  
                <div className='flex gap-2 justify-evenly flex-wrap'>
                  {
                    layers.map((layer:Layer)=>{
                      return (
                        <Button 
                        key={layer.name}
                        onClick={()=>togglelayer(layer)}
                        className={`flex hover:text-black hover:bg-green-200 justify-center items-center text-current gap-2 p-1 pl-2 pr-2 rounded-sm ${filteredLayers.includes(layer)?'bg-green-400':'bg-white'}`} >
                            <img src={layer.icon} alt={layer.name} className="w-6 h-6" />
                            <span>{layer.name}</span>
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
                      {currentDisaster?.type}
                    </div>
                    <div className='font-extrabold'>
                      Date
                    </div>
                    <div>
                      {new Date(currentDisaster!.date).toLocaleDateString()}
                    </div>
                    <div className='font-extrabold'>
                      Impact Chance
                    </div>
                    <div>
                      {currentDisaster?.impact_chance}
                    </div>
                    <div className='font-extrabold'>
                      Intesity
                    </div>
                    <div>
                     <HorizontalProgressBar progress={currentDisaster!.intensity}/>
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
                  <LinkedEvents events={events} setCurrentDisaster={setCurrentDisaster} currentEvent={currentDisaster}/>
            </Card>   
        </CardContent>
    </Card>
  )
}

export default HomePageClient