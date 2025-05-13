

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { notFound } from "next/navigation";

export default async function ModulePage({ params }: { params: { slug: string } }) {
    const res = await fetch(`http://localhost:4000/modules/${params.slug}`, {
      cache: 'no-store',
    });
  
    if (!res.ok) return notFound();
  
    const module = await res.json();
    //const filename = module.filePath.split('/').pop();
  
    return (
      <div className="p-6 space-y-6 items-center justify-center">
        <div className="bg-green-300 flex flex-col ml-6 items-center w-[1050px]">
        <h1 className="text-2xl font-bold mb-4 text 2xl ">{module.disasterType}</h1>
         <p className="text-white mb-6 text-2xl"> {module.description}</p>
        
        {/* <iframe
          src={`http://localhost:3000/education/file/${filename}`}
          width="100%"
          height="800px"
          className="border"
        /> */}
        </div>
        <Card className="bg-gray-100 items-center w-[1000px] justify-center ml-12">
            <p ml-auto>{module.sections.map((section:any)=>{
                return( 
                <div>
                    <h3 className=" text-green-400 ">{section.heading}</h3>
                    <p className="items-center ">{section.content}</p>
                </div>)
            })}</p>
        </Card>
        <div>
            <Button className="ml-auto  bg-green-200 text-black w-1/5">Download</Button>
        </div>
      </div>
    );
  }
  