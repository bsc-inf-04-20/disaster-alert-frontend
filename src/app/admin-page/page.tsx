import React from 'react'
import AdminClientPage from './adminClientPage';


    //featching all disasters
    async function getAllEvents() {
        try {
          const res = await fetch("http://localhost:4000/disasters", {
            cache: "no-store", // Prevents caching in SSR
          });
      
          if (!res.ok) {
            throw new Error("Failed to fetch all disasters");
          }

           return await res.json();

        } catch (error) {
          console.error("Error fetching all disasters:", error);
          return null;
        }
      }
    


    //featching approved disasters
    async function getApprovedEvents() {
        try {
          const res = await fetch("http://localhost:4000/disasters", {
            cache: "no-store", // Prevents caching in SSR
          });
      
          if (!res.ok) {
            throw new Error("Failed to fetch approved disasters");
          }
      
          const events= await res.json();
      
           return events.filter((event: any) => event.status === "Approved")
        } catch (error) {
          console.error("Error fetching approved disasters:", error);
          return null;
        }
      }


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

    const [allEvents, emergencyHotlines] = await Promise.all([getAllEvents(), getEmergencyContants()]) 
    

  return (

    <AdminClientPage allDisasters={allEvents} emergencyHotlines={emergencyHotlines}/>
  )
}

export default page