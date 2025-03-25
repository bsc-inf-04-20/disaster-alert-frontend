import { ReactNode } from "react";

interface LayoutProps{
    children: ReactNode
}

export default function ({children}: LayoutProps){
    return(
        <div className="flex flex-col bg-gray-100 min-h-screen w-full text-black relative gap-4 mt-10">
            {/* This is the header */}
            <div className="flex flex-row w-full min-h-10 p-2 bg-green-400 fixed top-0 text-white">
                Hello world
            </div>

            {/* This is the main content section */}
            <div className="flex-1 static">{children}</div>

            {/* This is the footer */}
            <div className="flex flex-col bg-green-400 text-white p-2 static">Footer</div>
        </div>
    );
}