'use client';

import { JSX, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { downloadPDF } from './downloadPDF';
import { useRouter } from 'next/navigation';

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
    fetch('https://localhost:3000/modules', {
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => setModules(data))
      .catch((err) => console.error('Error fetching modules:', err));
  }, []);

  return (
    <div className="w-full px-4 py-6">
      <div className="w-full max-w-6xl mx-auto">
        {/* Header */}
        <div className="rounded-lg shadow-md bg-gradient-to-r from-green-400 to-green-500 text-white p-6 mb-6 text-center">
          <h1 className="text-3xl font-bold">Your Educational Modules</h1>
          <p className="text-lg mt-2">"Disasters Happen, Will You Be Ready?!"</p>
        </div>

        {/* Banner Image */}
        <div className="relative mb-6 rounded-xl overflow-hidden h-[40vh]">
          <img
            src="/bgimages/glowingGlobe.jpg"
            alt="Educational Module"
            className="w-full h-full object-cover"
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center text-white text-center px-4">
            <h2 className="text-2xl sm:text-3xl font-semibold">Preparedness Begins With Knowledge</h2>
            <p className="text-md sm:text-lg mt-2 max-w-xl">
              Learn how to respond to floods, fires, earthquakes, and more — one module at a time.
            </p>
          </div>
        </div>

        {/* Modules Grid */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {module.map((mod) => (
            <ModuleCard key={mod.id} module={mod} />
          ))}
        </div>
      </div>
    </div>
  );
}


function ModuleCard({ module }: { module: EducationModule }): JSX.Element {
  const router = useRouter();

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
      {/* Image */}
      <img
        src="/bgimages/glowingGlobe.jpg"
        alt={module.title}
        className="w-full h-40 object-cover"
      />

      {/* Content */}
      <div className="flex-1 p-4 flex flex-col justify-between">
        <p className="text-lg font-semibold text-gray-800 mb-4">{module.title}</p>

        {/* Buttons */}
        <div className="flex gap-2 mt-auto">
          <button
            onClick={() => router.push(`/educational-modules/${module.id}`)}
            className="flex-1 border border-green-500 text-green-600 hover:bg-green-500 hover:text-white rounded-md px-4 py-2 text-sm transition-all"
          >
            View
          </button>
          <Button
            onClick={() => downloadPDF(module.content)}
            className="flex-1 bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white text-sm rounded-md px-4 py-2"
          >
            Download
          </Button>
        </div>
      </div>
    </div>
  );
}


