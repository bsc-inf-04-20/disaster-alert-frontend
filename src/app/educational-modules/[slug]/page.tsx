"use client"
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { notFound } from "next/navigation";
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { useState } from "react";
import { downloadPDF } from "../downloadPDF";

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

  // Fetch the module data when component mounts
  useState(() => {
    const fetchModule = async () => {
      try {
        const res = await fetch(`http://localhost:4000/modules/${params.slug}`, {
          cache: 'no-store',
        });
        
        if (!res.ok) {
          throw new Error('Module not found');
        }
        
        const data = await res.json();
        setModule(data);
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


  
  // Helper function to wrap text
  function wrapText(text: string, maxCharsPerLine: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    
    words.forEach(word => {
      // Check if adding this word would exceed the max line length
      if ((currentLine + ' ' + word).length > maxCharsPerLine && currentLine !== '') {
        lines.push(currentLine);
        currentLine = word;
      } else {
        // Add space only if not the first word in a line
        currentLine += (currentLine ? ' ' : '') + word;
      }
    });
    
    // Don't forget the last line
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines;
  }

  return (
    <div className="flex flex-col p-6 space-y-6 items-center">
      <div className="bg-green-300 flex flex-col ml-6 items-center w-full max-w-[1050px] p-6 rounded-lg">
        <h2 className="text-3xl font-semibold mb-4"> {module.disasterType}</h2>
        <p className=" mb-6  font-semibold text-xl">{module.description}</p>
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
          onClick={downloadPDF(module)} 
          className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded"
        >
          Download PDF
        </Button>
      </div>
    </div>
  );
}