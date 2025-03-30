import HomePageClient from "./homeClient";

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
    const res = await fetch("http://localhost:3000/disasters", {
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

  return <HomePageClient events={events} disasters={disasters} />;
};

export default HomePageServer;
