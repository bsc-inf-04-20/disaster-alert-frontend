import Image from "next/image";
import Base from "./custom_components/Base";
import Link from "next/link";

export default function Home() {
  return (
    <Base contentHeading={"stay alert, stay safe!"}>
      <HomePageContent></HomePageContent>
    </Base>
  );
}

function HomePageContent(){
  return(
    <div className="flex flex-col p-2 gap-4 text-sm">

      {/* Image section */}
      
        <div className="h-48 bg-white rounded-md">
        <img src="images\gettyimages-1334456113-170667a.jpg" alt="Disaster Alert" className="h-full w-full object-cover rounded-md" />
</div>

     

      {/* What we offer section */}
      <p className="p-2 text-base text-black opacity-90">
        This is an app alerts, educate and help navigation during disaster
        via a comprehensive alerting system, GPS and collaboration with
        institutions.
      </p>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-500 text-white p-2 rounded-md"> Live disaster tracking</div>
        <Link href="/modules">
           <div className="bg-green-500 text-white p-2 rounded-md cursor-pointer hover:bg-green-600 transition">
                Disaster preparedness modules
          </div>
        </Link>
        <div className="bg-green-500 text-white p-2 rounded-md"> Disaster Alerting</div>
        <div className="bg-green-500 text-white p-2 rounded-md"> Routes and safe zone identification</div>
      </div>

      {/* Last home content section*/}
      <div className="flex flex-row w-full gap-4">
        <div className="h-36 w-1/2 bg-white rounded-md">
        <h2 className="text-lg font-semibold text-gray-800">Contact Us</h2>
        <p className="text-sm text-gray-600">📍 Location: City Center, Block 5</p>
         <p className="text-sm text-gray-600">📞 Phone: +123 456 789</p>
         <p className="text-sm text-gray-600">✉ Email: info@disaster-alert.com</p>
        </div>
        <div className="h-36 w-1/2 bg-white rounded-md">
        <h2 className="text-lg font-semibold text-gray-800">Our History</h2>
    <p className="text-sm text-gray-600">
      Founded in 2020, our platform has been helping communities prepare 
      for disasters through real-time alerts, educational modules, and
      coordinated response systems.
    </p>
        </div>
      </div>
    </div>
  );
}