"use client"
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { notFound } from "next/navigation";
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { useState } from "react";

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
  }, [params.slug]);

  // Handle loading state
  if (loading) {
    return <div className="p-6">Loading module...</div>;
  }
  
  // Handle not found state
  if (!module) {
    return notFound();
  }

  const downloadPDF = async () => {
    try {
      const pdfDoc = await PDFDocument.create();
      const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
      const timesBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
      
      // Add first page
      let page = pdfDoc.addPage([600, 800]);
      let yPosition = 750;
      
      // Title
      page.drawText(module.title, {
        x: 50,
        y: yPosition,
        font: timesBoldFont,
        size: 24,
        color: rgb(0, 0, 0)
      });
      yPosition -= 40;
      
      // Disaster Type
      page.drawText(`Disaster Type: ${module.disasterType}`, {
        x: 50,
        y: yPosition,
        font: timesBoldFont,
        size: 16,
        color: rgb(0, 0, 0)
      });
      yPosition -= 30;
      
      // Description - Handle text wrapping
      const description = module.description;
      const wrappedDescription = wrapText(description, 60); // Wrap at 60 chars
      
      wrappedDescription.forEach(line => {
        page.drawText(line, {
          x: 50,
          y: yPosition,
          font: timesRomanFont,
          size: 12,
          color: rgb(0, 0, 0)
        });
        yPosition -= 20;
      });
      
      yPosition -= 20; // Add some space
      
      // Add sections
      for (const section of module.sections) {
        // Check if we need a new page
        if (yPosition < 100) {
          page = pdfDoc.addPage([600, 800]);
          yPosition = 750;
        }
        
        // Section heading
        page.drawText(section.heading, {
          x: 50,
          y: yPosition,
          font: timesBoldFont,
          size: 16,
          color: rgb(0, 0, 0)
        });
        yPosition -= 30;
        
        // Section content with text wrapping
        const content = section.content;
        const wrappedContent = wrapText(content, 70);
        
        wrappedContent.forEach(line => {
          // Check if we need a new page
          if (yPosition < 100) {
            page = pdfDoc.addPage([600, 800]);
            yPosition = 750;
          }
          
          page.drawText(line, {
            x: 50,
            y: yPosition,
            font: timesRomanFont,
            size: 12,
            color: rgb(0, 0, 0)
          });
          yPosition -= 20;
        });
        
        yPosition -= 30; // Add space between sections
      }
      
      // Save the PDF
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${module.title.replace(/\s+/g, '-')}.pdf`;
      link.click();
      
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };
  
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
        <p className="text-white mb-6  font-semibold text-2xl">{module.description}</p>
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
          onClick={downloadPDF} 
          className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded"
        >
          Download PDF
        </Button>
      </div>
    </div>
  );
}