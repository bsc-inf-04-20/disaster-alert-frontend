"use client"
import { useEffect, useState } from "react";
import L from "leaflet";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Timer, Navigation, ChevronRight, Map } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

// Format time (in milliseconds) as hours or minutes with better precision
function formatTime(ms) {
  if (!ms) return "0 min";
  
  const oneHour = 3600000; // 60 * 60 * 1000
  if (ms >= oneHour) {
    const hours = ms / oneHour;
    return `${hours.toFixed(1)} hr`;
  } else {
    const minutes = ms / 60000; // 60 * 1000
    return `${Math.max(1, Math.round(minutes))} min`; // Ensure at least 1 minute is shown
  }
}

// Calculate distance between two points (using Leaflet's distance function)
function distanceBetween(coord1, coord2) {
  return L.latLng(coord1).distanceTo(L.latLng(coord2));
}

// Format distance in meters or kilometers with appropriate units
function formatDistance(meters) {
  if (!meters) return "0 m";
  
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  } else {
    return `${Math.round(meters)} m`;
  }
}

export default function NavigationInstructions({ route, instructions, userLocation, distance }) {
  const [currentInstructionIndex, setCurrentInstructionIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  
  // Threshold for when to update the instruction when nearing the next route point
  const THRESHOLD = 50; // in meters

  useEffect(() => {
    if (!userLocation || !instructions?.length || !route?.length) return;
    
    const currentInstruction = instructions[currentInstructionIndex];
    if (!currentInstruction) return;
    
    const instructionCoord = route[currentInstruction.interval[0]];
    if (!instructionCoord) return;
    
    const distanceToInstruction = distanceBetween(
      [userLocation.latitude, userLocation.longitude],
      instructionCoord
    );
    
    // Calculate progress as percentage
    const totalInstructions = instructions.length;
    const progressPercent = ((currentInstructionIndex) / (totalInstructions - 1)) * 100;
    setProgress(progressPercent);
    
    // Update the instruction when close enough to the maneuver point
    if (distanceToInstruction < THRESHOLD && currentInstructionIndex < instructions.length - 1) {
      setCurrentInstructionIndex(prevIndex => prevIndex + 1);
    }
  }, [userLocation, instructions, route, currentInstructionIndex]);

  // Safely get current instruction or return a default value
  const currentInstruction = instructions?.[currentInstructionIndex] || { 
    text: "Loading directions...",
    time: 0,
    distance: 0
  };
  
  // Show upcoming instruction if available
  const nextInstruction = instructions?.[currentInstructionIndex + 1];

  // Choose direction icon based on instruction text
  const getDirectionIcon = (text) => {
    if (!text) return <Navigation className="w-6 h-6" />;
    
    const lowerText = text.toLowerCase();
    if (lowerText.includes("right")) {
      return <Navigation className="w-6 h-6 transform rotate-90" />;
    } else if (lowerText.includes("left")) {
      return <Navigation className="w-6 h-6 transform -rotate-90" />;
    } else if (lowerText.includes("straight") || lowerText.includes("continue")) {
      return <Navigation className="w-6 h-6" />;
    } else {
      return <Map className="w-6 h-6" />;
    }
  };

  return (
    <Card
      className="
        box-border           /* ensure padding & border are included in width/height calculations */ 
        w-full 
        sm:max-w-md          /* at small screens and up, constrain to a medium max-width */ 
        md:max-w-lg          /* larger max-width on medium screens */ 
        mx-auto              /* center horizontally within parent */ 
        mt-2 mb-2 
        bg-gradient-to-br from-green-400 to-green-600 
        rounded-xl 
        shadow-lg 
        overflow-hidden
      "
    >
      {/* Progress bar at the top */}
      <div className="h-1 bg-gray-200">
        <div
          className="h-full bg-white transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
  
      <CardHeader className="flex items-center justify-between p-3 text-white">
        <div className="flex items-center gap-2 flex-shrink-0">
          <Timer className="w-5 h-5" />
          <span className="font-medium">{formatDistance(distance)}</span>
        </div>
        <h2 className="text-xl font-bold flex-1 text-center">Navigation</h2>
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className="text-sm">{formatTime(currentInstruction?.time)}</span>
        </div>
      </CardHeader>
  
      <CardContent className="box-border bg-white p-4 rounded-t-xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentInstructionIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-4"
          >
            {/* Current instruction */}
            <div className="flex items-center gap-3 bg-green-50 p-4 rounded-lg shadow-sm box-border">
              <div className="flex-shrink-0 p-3 bg-green-400 text-white rounded-full">
                {getDirectionIcon(currentInstruction?.text)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-800 text-lg truncate">
                  {currentInstruction?.text || "Loading..."}
                </h3>
                <p className="text-gray-500 text-sm">
                  {formatDistance(currentInstruction?.distance)} • {formatTime(currentInstruction?.time)}
                </p>
              </div>
            </div>
  
            {/* Next instruction preview if available */}
            {nextInstruction && (
              <div className="flex items-center gap-3 mt-2 opacity-70">
                <div className="flex-shrink-0 p-2 bg-green-200 text-green-600 rounded-full">
                  <ChevronRight className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-600 truncate">Then</h4>
                  <p className="text-gray-500 text-sm truncate">
                    {nextInstruction.text}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
  
}