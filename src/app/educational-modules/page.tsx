'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { downloadPDF } from './downloadPDF';

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
export default function PageContent() {
  const [module, setModules] = useState<EducationModule[]>([]);

  useEffect(() => {
    fetch('http://localhost:3000/modules')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log('Modules from server:', data); // Log the data
        setModules(data);
      })
      .catch((err) => console.error('Error fetching modules:', err));
  }, []);

  return (
    <Card className="flex flex-col gap-6 text-sm rounded-none ml-0 mr-0 pl-0">
      <CardContent className="flex flex-col gap-4 w-full">
        <CardHeader className="w-full bg-green-400">
          <CardTitle className="w-full text-3xl text-center">Your Educational Modules</CardTitle>
          <CardDescription className="text-xl text-black text-center">
            "Disasters Happen, Will You Be Ready?!"
          </CardDescription>
        </CardHeader>

        <div className="flex justify-center gap-4 h-[50vh] w-full">
          <img
            src="images/istockphoto-1146891343-1024x1024.jpg"
            alt="educational module"
            className="h-full w-full object-cover rounded-md"
          />
        </div>

        <div className="grid grid-cols-4 gap-4">
        {module.map((mod) => (
        <ModuleCard
          key={mod.id}
          module={mod}
        />

      ))}


        </div>
      </CardContent>
    </Card>
  );
}

function ModuleCard(
  module
:
any) {
    
  return (
    <div className="grid grid-cols-2 grid-rows-4 bg-white rounded-md row-span-4 col-span-2 gap-2 p-2">
      <img
        src="/images/istockphoto-1146891343-1024x1024.jpg"
        alt={module.title}
        className="row-start-1 row-end-3 col-span-2 object-cover rounded-md"
      />
      <p className="row-start-3 row-end-4 col-span-2 font-semibold">{module.title}</p>
      <a
        href={`/educational-modules/1`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 text-center row-start-4 col-start-1 border-2 rounded-md border-gray-200 hover:bg-green-500 hover:text-white"
      >
        View
      </a>
      <Button
       onClick={downloadPDF(module)} 
        className="p-2 text-center row-start-4 col-start-2 border-2 rounded-md border-gray-200 hover:bg-green-500 hover:text-white"
      > Download PDF
      </Button>
    </div>
  );
}

