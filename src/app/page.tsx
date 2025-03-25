import Image from "next/image";
import Base from "./custom_components/Base";

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
        <img src={undefined} alt="" />
      </div>

      {/* What we offer section */}
      <p className="p-2 text-base text-black opacity-90">
        This is an app alerts, educate and help navigation during disaster
        via a comprehensive alerting system, GPS and collaboration with
        institutions.
      </p>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-500 text-white p-2 rounded-md"> Live disaster tracking</div>
        <div className="bg-green-500 text-white p-2 rounded-md"> Disaster preparedness modules</div>
        <div className="bg-green-500 text-white p-2 rounded-md"> Disaster Alerting</div>
        <div className="bg-green-500 text-white p-2 rounded-md"> Routes and safe zone identification</div>
      </div>

      {/* Last home content section*/}
      <div className="flex flex-row w-full gap-4">
        <div className="h-36 w-1/2 bg-white rounded-md"></div>
        <div className="h-36 w-1/2 bg-white rounded-md"></div>
      </div>
    </div>
  );
}