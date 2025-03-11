"use client"
import { useEffect, useState } from "react";
import L from "leaflet";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Timer } from "lucide-react";

//showing time (in milliseconds) in hour format if greater than an hour, otherwise as minutes
function formatTime(ms) {
  const oneHour = 3600000; // 60 * 60 * 1000
  if (ms >= oneHour) {
    const hours = ms / oneHour;
    return `${hours.toFixed(1)} hr`;
  } else {
    const minutes = ms / 60000; // 60 * 1000
    console.log(`the time was ${ms} and now ${minutes}`)
    return `${Math.round(minutes)} min`;
  } 
}

// Function to calculate distance between two points (using Leaflet's distance function)
function distanceBetween(coord1, coord2) {
  return L.latLng(coord1).distanceTo(L.latLng(coord2));
}

function NavigationInstructions({ route, instructions, userLocation }) {
  
  const [currentInstructionIndex, setCurrentInstructionIndex] = useState(0);

  //when to update the instruction when nearing the next route point
  const THRESHOLD = 50; // in meters

  useEffect(() => {
    if (!userLocation || instructions.length === 0 || route.length === 0) return;

    const currentInstruction = instructions[currentInstructionIndex];

    console.log(currentInstruction)
    const instructionCoord = route[currentInstruction.interval[0]]; 

    const distanceToInstruction = distanceBetween(
      [userLocation.latitude, userLocation.longitude],
      instructionCoord
    );

    // Update the instruction when close enough to the maneuver point.
    if (distanceToInstruction < THRESHOLD && currentInstructionIndex < instructions.length - 1) {
      setCurrentInstructionIndex((prevIndex) => prevIndex + 1);
    }
  }, [userLocation, instructions, route, currentInstructionIndex]);

  const currentInstruction = instructions[currentInstructionIndex];

  return (
    <Card className="bg-orange-200 rounded-lg w-full mt-2 mb-2">
      <CardHeader className="flex items-center gap-2 justify-center p-2">
        <Timer className="w-6 h-6 text-white" />
        <span className="text-center font-bold text-xl text-white">Directions</span>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 p-4">
        <div className="flex flex-col items-center">
          <span className="font-semibold text-lg">Next Instruction:</span>
          <span className="italic text-md">{currentInstruction?.text}</span>
        </div>
        <div className="bg-gray-100 rounded-md p-3 w-full flex flex-col items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="font-semibold">In:</span>
            <span>{formatTime(currentInstruction?.time)}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-semibold">Distance:</span>
            <span>
              { currentInstruction?.distance / 1000 > 1 
                ? `${(currentInstruction?.distance / 1000).toFixed(1)} KM`
                : `${currentInstruction?.distance.toFixed(0)} M`
              }
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default NavigationInstructions;
