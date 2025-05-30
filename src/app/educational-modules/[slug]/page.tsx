"use client"
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { notFound } from "next/navigation";
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { useState } from "react";
import { downloadPDF } from "../downloadPDF";
import { pauseSpeech, resumeSpeech, stopSpeech, TextToSpeech } from "../textTOSpeech"
import { Pause, Play } from "lucide-react";
import { getDisasterType } from "@/app/utils/textFormatting";

type EducationModule = {
  id: number;
  title: string;
  disasterType: string;
  description: string;
  sections: {
    heading: string;
    content: string;
  }[];
};

export default function ModulePage({ params }: { params: { slug: string } }) {
  const [module, setModule] = useState<EducationModule | null>(null);
  const [loading, setLoading] = useState(true);

  const [isPaused, setIsPaused] = useState(false);

   const handlePlay = () => {
    if (!module) return;
    const text = module.sections.map(section => section.content).join(' ');
    TextToSpeech(text);
    setIsPaused(false);
  };

  const handlePauseResume = () => {
    if (isPaused) {
      resumeSpeech();
      setIsPaused(false);
    } else {
      pauseSpeech();
      setIsPaused(true);
    }
  };

  const handleStop = () => {
    stopSpeech();
    setIsPaused(false);
  };

  // Fetch the module data when component mounts
  useState(() => {
    const fetchModule = async () => {
      try {
        const res = await fetch(`https://localhost:3000/modules/${params.slug}`, {
          cache: 'no-store',
        });
        
        if (!res.ok) {
          throw new Error('Module not found');
        }
        
        const data = await res.json();

        const module = data

        console.log('Fetched module:', module); // Log the fetched module
        setModule(module);
      } catch (error) {
        console.error('Failed to fetch module:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchModule();
  },
   [params.slug]);

  // Handle loading state
  if (loading) {
    return <div className="p-6">Loading module...</div>;
  }
  
  // Handle not found state
  if (!module) {
    return notFound();
  }

  return (
    <div className="flex flex-col p-6 space-y-6 items-center">
      <div className="bg-green-300 flex flex-col ml-6 items-center w-full max-w-[1050px] p-6 rounded-lg">
        <h2 className="text-3xl font-semibold mb-4"> {getDisasterType(module.disasterType)}</h2>
        <p className=" mb-6  font-semibold text-xl">{module.description}</p>
      </div>
      <div className=" flex items-left gap-3">
        <Button className="ml-auto bg-green-400 text-white" onClick={handlePlay}>Read aloud</Button>
      <Button className="ml-auto bg-green-400 text-white"onClick={handlePauseResume}>{isPaused ? <Play /> : <Pause/>}</Button>
      <Button className="ml-auto bg-green-400 text-white"onClick={handleStop}>Stop</Button>
      </div>
      <Card className="bg-gray-100 w-full max-w-[1000px] p-6 mx-auto">
        {module.sections.map((section, index) => (
          <div key={index} className="mb-6">
            <h3 className="text-xl font-bold text-green-600 mb-2">{section.heading}</h3>
            <p className="text-gray-800">{section.content}</p>
          </div>
        ))}
      </Card>
      
      <div className="flex justify-end">
        <Button 
          onClick={()=>downloadPDF(module)} 
          className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded"
        >
          Download PDF
        </Button>
      </div>
    </div>
  );
}