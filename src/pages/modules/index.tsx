import { ReactNode } from "react";
import Base from "../../app/custom_components/Base";
import "../../app/globals.css"

/*Custom type for props passed to react components*/
interface LayoutProps{
    children: ReactNode
}

/*Main component*/
export default function(){
    return(
        <Base contentHeading={"disasters happen, will you be ready!"}>
            <PageContent></PageContent>
        </Base>
    );
}

/*interface ModuleProgress {
    moduleId: string;
    documentsViewed: string[]; // array of document IDs the user has viewed
    completed: boolean;
    lastAccessed?: Date;
  }
  
  interface UserProgress {
    userId: string;
    modules: ModuleProgress[];
  }*/

/*  The page content functions puts together nall the page content
which then gets renderd in the dafault function. */
function PageContent(){
    return(
        <div className="flex flex-col p-4 w-full gap-6 text-sm">

            {/* Images section */}
            <div className="h-40 w-full bg-white"></div>

            {/* Educational modules section */}
            <div className="bg-green-500 p-2 rounded-md text-white">Your educational modules</div>
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