import HomePageClient from "./homeClient";

async function getEvents() {
  try {
    const res = await fetch("http://localhost:4000/disasters", {
      cache: "no-store", // Prevents caching in SSR
    });

    if (!res.ok) {
      throw new Error("Failed to fetch disasters");
    }

    return await res.json();
  } catch (error) {
    console.error("Error fetching disasters:", error);
    return null;
  }
}

const HomePageServer = async () => {
  const events = await getEvents();

  return <HomePageClient events={events} />;
};

export default HomePageServer;
