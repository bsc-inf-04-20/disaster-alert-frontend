import React from 'react'
import AdminClientPage from './adminClientPage';


    //fetching available layers


    //featching available hotlines


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


async function page() {

    const [allEvents, approvedEvents] = await Promise.all([getAllEvents(), getApprovedEvents()]) 
    

  return (

    <AdminClientPage allDisasters={allEvents}/>
  )
}

export default page