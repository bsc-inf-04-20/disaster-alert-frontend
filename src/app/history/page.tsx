import { Card,  CardDescription,  CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import historyPage from './historyPage'
import { Search } from 'lucide-react'

async function Page (){
    return(
        <Card className='space-y-10 h-screen p-4'>
          <CardHeader className='w-full bg-green-400 rounded-md mb-4 mt-4'>
            <CardTitle className='text-xl font-extrabold justify-start text-center w-full'>
              History
            </CardTitle>
            <CardDescription className='text-center text-black'>
              Understand the disaster history of your location
            </CardDescription>
          </CardHeader>
            <div className='space-y-6 relative mx-auto w-1/8 items-center max-w-md justify-center'>
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
          type="text"
          placeholder="Search disasters... "
         //value={searchText}
         // onChange={(e) => setSearchText(e.target.value)}

          className="w-1/8 m-3 flex flex-col items-center text-center bg-gray-200 h-9 w-full rounded-md border border-input  px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
        />
      </div>

      <div className='space-y-6'>
                <Card className='bg-green-300 flex flex-col ml-8  w-[1050px]'>
                    <div className='flex  px-32 w-full py-2 '>
                        <p className='text-2xl'><strong>Cyclone Chido</strong>  </p>
                        <Button className='ml-auto  bg-green-200 text-black w-1/5'><strong>More details</strong></Button>
                    </div>
                    
                    <div className='flex  px-32 w-full '>
                        <p>Zomba</p>
                        <p className='ml-auto'>11/08/24</p>
                    </div>
                    
                </Card>
                <Card className='bg-green-300 flex flex-col ml-8  w-[1050px]'>
                    <div className='flex  px-32 w-full py-2 '>
                        <p className='text-2xl '><strong>Floods</strong>  </p>
                        <Button className='ml-auto bg-green-200 text-black w-1/5'><strong>More details</strong></Button>
                    </div>
                    
                    <div className='flex  px-32 w-full '>
                        <p>Zomba</p>
                        <p className='ml-auto'>11/08/24</p>
                    </div>  
                </Card> 
            </div>
           
        </Card>
    )
}
export default Page