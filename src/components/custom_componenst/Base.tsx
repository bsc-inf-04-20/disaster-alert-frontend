import { ReactNode } from "react";
import { Card } from "../ui/card";
// import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
// import { AppSidebar } from "./AppSideBar";


interface LayoutProps{
    children: ReactNode,
    contentHeading: ReactNode
}

export default function ({children, contentHeading}: LayoutProps){
    return(
        <div className="flex flex-col bg-gray-100 min-h-screen w-full text-black relative gap-4 md:items-center font-inter mt-10">

            {/* Page Heading */}

            {/* Page Footer */}
            {/* <SidebarProvider> */}
                {/* <AppSidebar/> */}
                <div className="flex flex-col gap 2 w-full">
                    <div className="flex flex-row w-full items-center p-2">
                        {/* <SidebarTrigger className=""></SidebarTrigger> */}
                        <div className="text-sm text-black opacity-90">{contentHeading}</div>
                    </div>
                    <div className="flex-1 static md:w-1/2">{children}</div>
                </div>
            {/* </SidebarProvider> */}

            {/* Page footer */}
            <div className="flex flex-col bg-green-500 text-white p-2 static w-full"></div>
        </div>
    );
}