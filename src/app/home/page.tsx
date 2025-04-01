import HomePageClient from "./homeClient";



function sortByNearestDate(objects:any[]) {
  return objects.sort((a:any, b:any) => {
    const dateA = new Date(a.startDate);
    const dateB = new Date(b.startDate);
    const today = new Date();

    // Calculate absolute difference from today's date
    const diffA = Math.abs(dateA.getTime() - today.getTime());
    const diffB = Math.abs(dateB.getTime() - today.getTime());

    return diffA - diffB; // Sort by nearest date to today
  });
}



async function getEvents() {
  try {
    const res = await fetch("http://localhost:4000/disasters", {
      cache: "no-store", // Prevents caching in SSR
    });

    if (!res.ok) {
      throw new Error("Failed to fetch disasters");
    }

    const events= await res.json();

     return events.filter((event: any) => event.status === "Approved")
  } catch (error) {
    console.error("Error fetching disasters:", error);
    return null;
  }
}

async function getDisasters() {
  try {
    const res = await fetch("http://localhost:3000/disasters/metadata", {
      cache: "no-store", // Prevents caching in SSR
    });

    if (!res.ok) {
      throw new Error("Failed to fetch disasters");
    }

    const disasters= await res.json();

     return disasters
  } catch (error) {
    console.error("Error fetching disasters:", error);
    return null;
  }
}

const HomePageServer = async () => {

  const [events, disasters] = await Promise.all([getEvents(), getDisasters()])

  return <HomePageClient events={sortByNearestDate(events)} disasters={disasters} />;
};

export default HomePageServer;
