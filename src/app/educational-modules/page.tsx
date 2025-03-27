"use client"
import { ReactNode } from "react";
import Base from "../../components/custom_componenst/Base";
import "../../app/globals.css"
import { Card } from "@/components/ui/card";
import Image from "next/image";

/*Custom type for props passed to react components*/
interface LayoutProps{
    children: ReactNode
}

            <Card className="flex w-full bg-green-500 p-4 h-10 fixed z-20 top-0 flex-row items-center">
                <p className="text-xl text-white font-bold">Disaster Alert sSystem</p>
            </Card>
/*Main component*/
export default function(){
    return(
        <Base contentHeading={
            <h1 className="text-3xl font-bold text-center text-green-600 uppercase">
                    "Disasters Happen, Will You Be Ready?!"
            </h1>
        }>
            <PageContent></PageContent>
        </Base>
    );
}

function PageContent(){
    return(
        <div className="flex flex-col p-4 w-full gap-6 text-sm">

            {/* Images section */}
            <div>
            <img src="images\istockphoto-1146891343-1024x1024.jpg" alt="educational module" className="h-full w-full object-cover rounded-md"/>
    
            </div>

        
            {/* Educational modules section */}
            <div className="bg-green-500 p-2 rounded-md text-white flex items-center justify-center">Your Educational Modules</div>
            <div className="grid grid-cols-4 grid-rows-8 gap-4">
                <ModuleCard children={"module"}></ModuleCard>
                <ModuleCard children={"module"}></ModuleCard>
                <ModuleCard children={"module"}></ModuleCard>
                <ModuleCard children={"module"}></ModuleCard>
            </div>

            {/* Progress tracking section */}
            <div className="flex flex-col p-4 bg-white gap-6 w-full text-white">
                <div className="bg-green-500 p-2">Flood module</div>
                <div className="bg-green-500 p-2">Cyclone module</div>
                <div className="bg-green-500 p-2">Hurricane module</div>
                <div className="bg-green-500 p-2">Wild fire module</div>
            </div>
        </div>
    );
}

/*This component is a template for rendering module cards.*/
function ModuleCard({children}: LayoutProps){


    
    return(
    <div className="grid grid-cols-2 grid-rows-4 bg-white rounded-md row-span-4 col-span-2 gap-2 p-2">
        <p className="row-start-1 row-end-3 col-span-2">
            {children}
        </p>
        <div className="p-2 row-start-4 col-start-1 border-2 rounded-md border-gray-200 hover:bg-green-500 hover:text-white">
            View
        </div>
        <div className="p-2 row-start-4 col-start-2 border-2 rounded-md border-gray-200 hover:bg-green-500 hover:text-white">
            Download
        </div>
    </div>
    );
}