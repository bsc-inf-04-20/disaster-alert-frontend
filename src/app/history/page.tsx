"use client"
import { Card,  CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import History from './page'
import { Search } from 'lucide-react'
import { useEffect, useState } from 'react';
import { toast } from 'sonner'

type Disaster = {
  id: string;
  name: string;
  type: string;
  status: string;
  date: string;
  location: string;
};

     //adding location component
    export default function Page() {
        const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
        const [error,setError]=useState<string | null>(null);
        const [disasters, setDisasters] = useState<Disaster[]>([]);
        useEffect(() => {
            if (!navigator.geolocation) {
                toast.error("Geolocation is not supported by this browser");
                setError("Geolocation not supported");
                return;
            }
              navigator.geolocation.getCurrentPosition(
                (position) => {0
                  setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                  });
                },
                (error) => {
                    const message = error.message || "Failed to get location";
                    setError(message);
                    toast.error(message);
          }  );
            
            } ,  []);

            //fetching approved disasters
            
            useEffect(() => {
              if (!location) return;
                const fetchDisasters = async () => {
                  try {
                    const res = await fetch(`http://localhost:3000/disasters/metadata?x=${location.latitude}&y=${location.longitude}&status=approved`);
                    console.log(`http://localhost:3000/disasters/metadata?x=${location.latitude}&y=${location.longitude}&status=approved`) 
                    const data: Disaster[] = await res.json();
                     console.log("Fetched data:", data);

                     if (!Array.isArray(data)) {
                      console.error("Unexpected response:", data);
                      toast.error("Unexpected data format from server");
                      return;
                     }
            
                    const currentDate = new Date();
                    const filtered = data.filter(d =>
                      d.status === 'approved' && new Date(d.date) < currentDate
                    );
            
                    setDisasters(filtered);
                  } catch (err) {
                    toast.error("Failed to fetch disasters");
                    console.error(err);
                  }
                };
            
                fetchDisasters();
              }, [location]);
                
          
    return(
        <div className='space-y-10'>
            <div className='items-center flex'>
                <header className="w-full text-white p-10 ">
                <p className='flex text-3xl font-extrabold justify-center text-center text-black'>History </p>  
                </header>
                </div>
            <div className='space-y-6 relative mx-auto w-1/8 items-center max-w-md justify-center'>
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
          type="text"
          placeholder="Search disasters... "
         

       className="w-1/8 m-3 flex flex-col items-center text-center bg-gray-200 h-9 w-full rounded-md border border-input  px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
        />
      </div>

      <div className="space-y-6">
        {disasters.length === 0 ? (
          <p className="text-center text-gray-500">No approved past disasters available.</p>
        ) : (
          disasters.map((disaster) => (
            <Card
              key={disaster.id}
              className="bg-green-300 flex flex-col ml-8 w-[1050px]"
            >
              <div className="flex px-32 w-full py-2">
                <p className="text-2xl">
                  <strong>{disaster.name}</strong>
                </p>
                <Button className="ml-auto bg-green-200 w-1/5">
                  <strong>More details</strong>
                </Button>
              </div>

              <div className="flex px-32 w-full">
                <p>{disaster.location}</p>
                <p className="ml-auto">{new Date(disaster.date).toLocaleDateString()}</p>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
    )
}

