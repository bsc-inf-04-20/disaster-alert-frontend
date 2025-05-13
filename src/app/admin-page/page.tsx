import React from 'react'
import AdminClientPage from './adminClientPage';

export const dynamic = 'force-dynamic';





        //featching emergency contacts
        async function getEmergencyContants() {
          try {
            const res = await fetch("http://localhost:4000/emergency-contacts", {
              cache: "no-store", // Prevents caching in SSR
            });
        
            if (!res.ok) {
              throw new Error("Failed to fetch emergency contacts");
            }
        
            const contacts= await res.json();
        
             return contacts
          } catch (error) {
            console.error("Error fetching emergency contacts", error);
            return null;
          }
        }  


async function page() {

    const [emergencyHotlines] = await Promise.all([getEmergencyContants()]) 
    

  return (

    <AdminClientPage emergencyHotlines={emergencyHotlines}/>
  )
}

export default page