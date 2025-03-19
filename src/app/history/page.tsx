import { Card, CardHeader } from '@/components/ui/card'
import historyPage from './historyPage'

async function page (){
    return(
        <div className='space-y-10'>
            <div className='items-center flex'>
                <header className="w-full bg-green-500 text-white p-10 ">
                <p className='flex text-3xl font-extrabold justify-center text-center text-black'>History </p>  
                </header>
            </div> 
            <div className='space-y-6'>
                <Card className='bg-green-300 flex flex-col ml-8  w-[1050px]'>
                    <div className='flex  px-32 w-full py-2 '>
                        <p className='text-2xl'><strong>Floods</strong>  </p>
                        <p className='ml-auto'>Details</p>
                    </div>
                    
                    <div className='flex  px-32 w-full '>
                        <p>BLantyre, Machinjiri</p>
                        <p className='ml-auto'>11/08/24</p>
                    </div>
                    
                </Card>
                <Card className='bg-green-300 flex flex-col ml-8  w-[1050px]'>
                    <div className='flex  px-32 w-full py-2 '>
                        <p className='text-2xl'><strong>Floods</strong>  </p>
                        <p className='ml-auto'>Details</p>
                    </div>
                    
                    <div className='flex  px-32 w-full '>
                        <p>BLantyre, Machinjiri</p>
                        <p className='ml-auto'>11/08/24</p>
                    </div>  
                </Card> 
            </div>
           
        </div>
    )
}
export default page