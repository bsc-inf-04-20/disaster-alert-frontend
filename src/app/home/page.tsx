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

function HomePage() {



    const healthIcon = L.icon({
        iconUrl: "health_alt.png", // Place an icon in the public/icons/ folder
        iconSize: [32, 32], // Adjust size as needed
        iconAnchor: [16, 32], // Center the icon properly
        popupAnchor: [0, -32],
      });

     
    const filters = [
      {name:"hospitals", icon: Hospital },
      {name:"Shelter", icon: Shield },
      {name:"fire station", icon: FireExtinguisher },
      {name:"police", icon:  ShieldIcon}
    ]  


    const [layers, setLayers] = useState<String []>([])

//toggle layer adds or removes a layer to the map when a layer button is clicked    
    const togglelayer = (targetLayer:String) =>{

      if(layers.includes(targetLayer)){
        const filteredLayers:String[] = layers.filter(layer=>layer!=targetLayer)
        setLayers(filteredLayers)
      }
      else
       setLayers([...layers, targetLayer])
    }

    const [geoJsonData, setGeoJsonData] = useState(null);

    useEffect(() => {
        async function loadShapefile() {
          try {
            const response = await fetch("/hotosm_mwi_health_facilities_points_shp/hotosm_mwi_health_facilities_points_shp.shp"); // Ensure the file is accessible
            const arrayBuffer = await response.arrayBuffer();
            const geojson = await shapefile.read(arrayBuffer);
            setGeoJsonData(geojson);
          } catch (error) {
            console.error("Error loading shapefile:", error);
          }
        }
    
        loadShapefile();
      }, []);

  return (
    <Card >
        <CardHeader className='flex justify-center'>
            <CardTitle className='flex text-xl font-extrabold justify-center'>
                Home Page
            </CardTitle>
            <CardDescription className='flex justify-center'>Prepare for the next impending disaster </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row  justify-around gap-2">
          <Card className='md:w-[50%]'>
            <MapContainer center={[-13.254308, 34.301525]} zoom={6.3} style={{ height: "500px", width: "100%", borderRadius:"2%", borderColor:"orange" }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      {geoJsonData &&
                        geoJsonData.features.map((feature: any, index: number) => {
                        const coords = feature.geometry.coordinates;
                        return (
                            <Marker key={index} position={[coords[1], coords[0]]} icon={healthIcon}>
                            <Popup>
                                <strong>Health Facility</strong>
                                <br />
                                Name: {feature.properties.name || "Unknown"}
                                <br />
                                Type: {feature.properties.amenity || "Unknown"}
                            </Popup>
                            </Marker>
                        );
                        })}
              </MapContainer>
            </Card>
            <Card className='md:w-[50%] bg-gray-100 p-2'>
              <CardHeader >
                <CardTitle className='flex justify-center bg-orange-300 rounded-sm p-2'>
                  [ Disaster Name ]
                </CardTitle>
              </CardHeader>  
                <div className='flex gap-2 justify-evenly flex-wrap'>
                  {
                    filters.map((filter)=>{
                      return (
                        <Button 
                        key={filter.name}
                        onClick={()=>togglelayer(filter.name)}
                        className={`flex hover:text-white hover:bg-green-400 justify-center items-center text-current gap-2 p-1 pl-2 pr-2 rounded-sm ${layers.includes(filter.name)?'bg-green-400':'bg-white'}`} >
                            {<filter.icon />}
                            <span>{filter.name}</span>
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
                      Cyclone
                    </div>
                    <div className='font-extrabold'>
                      Date
                    </div>
                    <div>
                      {new Date().toLocaleDateString()}
                    </div>
                    <div className='font-extrabold'>
                      Impact Chance
                    </div>
                    <div>
                      45%
                    </div>
                    <div className='font-extrabold'>
                      Intesity
                    </div>
                    <div>
                     <HorizontalProgressBar progress={30}/>
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
            </Card>   
        </CardContent>
    </Card>
  )
}

export default HomePage