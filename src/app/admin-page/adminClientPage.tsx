"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
 import EmergencyHotlines from "./emergencyHotlines" 

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast, Toaster } from 'sonner';
import { Input } from '@/components/ui/input';
import Fuse from 'fuse.js';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { DateRange } from 'react-date-range';
import { format, isWithinInterval } from 'date-fns';
import { Commet } from 'react-loading-indicators';
import SpatialLayerPicker from './layersComponent';
import { Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ReplaceUnderScoreMakeCamelCase } from '../utils/textFormatting';

// all disasters
type DisastersSum = {
        PENDING:Disaster[], 
        APPROVED:Disaster[], 
        DECLINED:Disaster[]
}

//props from the parent, page.tsx
type clientprops = {
    allDisasters: [],
    emergencyHotlines:any[]
}

//Disaster information structure
type Disaster = {
    id:number;
    disasterType: string,
    disasterName: string,
    startDate: Date,
    endDate:Date,
    intensity: number,
    likelyhood: number,
    status: string
}

//Disaster information structure
type newDisasterType = {
    id: number,
    disasterType: string,
    disasterName: string,
    startDate: Date,
    endDate:Date,
    intensity: number,
    likelyhood: number,
    Status: string
}

function AdminClientPage({ allDisasters, emergencyHotlines}: clientprops) {

    const router = useRouter()


    // tracking all the disasters 
    const [disasters, setDisasters] = useState<{
                                PENDING:Disaster[], 
                                APPROVED:Disaster[], 
                                DECLINED:Disaster[]}>({
        PENDING:[],
        APPROVED:[],
        DECLINED:[]
    })

    //tracking dataloading state
   const [loadingState, setLoadingState] = useState<boolean>(true)

    useEffect(()=>{
        if(allDisasters && emergencyHotlines){
        setLoadingState(false)
        }
    },
        [allDisasters, emergencyHotlines])


    //tracking the search for the different disasters
    const [disasterSearch, setDisasterSearch] = useState<{
                                pendingSearch:string, 
                                approvedSearch:string, 
                                declinedSearch:string}>({
                    pendingSearch:"",
                    approvedSearch:"",
                    declinedSearch:""
                    })

    //tracking the date picker within each tab 
    const [dateRanges, setDateRanges] = useState({
                    pendingRange: {
                        startDate: new Date(new Date().setFullYear(new Date().getFullYear() - 10)), // Default to the last 10 years
                        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // Default to a year ahead
                        key: 'pendingSelection'
                    },
                    approvedRange: {
                        startDate: new Date(new Date().setFullYear(new Date().getFullYear() - 10)), // Default to the last 10 years
                        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // Default to a year ahead
                        key: 'approvedSelection'
                    },
                    declinedRange: {
                        startDate: new Date(new Date().setFullYear(new Date().getFullYear() - 10)), // Default to the last 10 years
                        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // Default to a year ahead
                        key: 'declinedSelection'
                    }
                    });

    //variables to control the visibility of date pickers
    const [showDatePicker, setShowDatePicker] = useState({
        pending: false,
        approved: false,
        declined: false
    });
    
    // Function to toggle date picker visibility
    const toggleDatePicker = (tab:string) => {
        setShowDatePicker((prev:any) => ({
        ...prev,
        [tab]: !prev[tab]
        }));
    };                


    // useEffect with mechanisms that filter disasters including search query and date filtering
    useEffect(() => {
    const originalDisasters = {
        PENDING: allDisasters.filter((disaster: Disaster) => disaster.status === "PENDING"),
        APPROVED: allDisasters.filter((disaster: Disaster) => disaster.status === "APPROVED"),
        DECLINED: allDisasters.filter((disaster: Disaster) => disaster.status === "DECLINED")
    };

    console.log("these are the original disasters", originalDisasters)

    // Filter function that combines text search and date range
    const filterDisasters = (disasterType:string, searchText:string, dateRange:{startDate:Date, endDate:Date, key:string}) => {

        let filtered = originalDisasters[disasterType];
              
        if (dateRange.startDate    && dateRange.endDate ) {
        filtered = filtered.filter(disaster => {
            const disasterDate = new Date(disaster.startDate);
            return isWithinInterval(disasterDate, {
            start: dateRange.startDate,
            end: dateRange.endDate
            });
        });
        }
        
        // Apply text search if provided
        if (searchText && searchText.trim() !== "") {
        const options = {
            keys: ['disasterName', 'disasterType', 'id'],
            threshold: 0.4,
            includeScore: true
        };
        
        const fuse = new Fuse(filtered, options);
        const result = fuse.search(searchText);
        filtered = result.map(item => item.item);
        }
        console.log(filtered)
        return filtered;
    };

    // Apply all filters

    console.log(allDisasters)

    setDisasters({
        PENDING: filterDisasters('PENDING', disasterSearch.pendingSearch, dateRanges.pendingRange),
        APPROVED: filterDisasters('APPROVED', disasterSearch.approvedSearch, dateRanges.approvedRange),
        DECLINED: filterDisasters('DECLINED', disasterSearch.declinedSearch, dateRanges.declinedRange)
    });
    }, [disasterSearch, dateRanges, allDisasters]);

        //ability to reset filters
    const resetFilters = (tab:string) => {
            const defaultStartDate = new Date(new Date().setFullYear(new Date().getFullYear() - 10)); // Default to the last 10 years
            const defaultEndDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1));
            
            if (tab === 'pending' || tab === 'all') {
              setDisasterSearch(prev => ({
                ...prev,
                pendingSearch: ""
              }));
              setDateRanges(prev => ({
                ...prev,
                pendingRange: {
                    startDate:defaultStartDate, // Default to the last 10 years
                    endDate: defaultEndDate,
                    key: 'pendingSelection'
                }
              }));
            }
            
            if (tab === 'approved' || tab === 'all') {
              setDisasterSearch(prev => ({
                ...prev,
                approvedSearch: ""
              }));
              setDateRanges(prev => ({
                ...prev,
                approvedRange: {
                    startDate: defaultStartDate, // Default to the last 10 years
                    endDate: defaultEndDate,
                    key: 'approvedSelection'
                }
              }));
            }
            
            if (tab === 'declined' || tab === 'all') {
              setDisasterSearch(prev => ({
                ...prev,
                declinedSearch: ""
              }));
              setDateRanges(prev => ({
                ...prev,
                declinedRange: {
                    startDate:defaultStartDate, // Default to the last 10 years
                    endDate: defaultEndDate,
                    key: 'declinedSelection'
                }
              }));
            }

            //toggling the date picker for the tab
            toggleDatePicker(tab);

            //sending an action trigger notification
            if(tab === 'all'){
                toast.success("successfully reset sll the dates")
            }
            else{
                toast.success(`successfully reset the ${tab} search`)
            }
          };
    
    

    //changing the status of a disaster
    const changeStatus = async (id: number, toStatus: string, disaster:Disaster)=>{

        const fromStatus = disaster.status;

        const res = await fetch(`http://localhost:3000/disasters/${disaster.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...disaster,
                status:toStatus
            }),
        }).catch(error=>{
            toast.error(`failed to change the status of ${disaster.disasterType} ${disaster.disasterName} to ${toStatus}`)
        })

        toast.success(`successfully changed the status of ${disaster.disasterType} ${disaster.disasterName} to ${toStatus}` )


        setDisasters((prevDisasters:DisastersSum)=>({
            ...prevDisasters,
            [fromStatus as keyof DisastersSum]: prevDisasters[fromStatus as keyof DisastersSum].filter((disaster: Disaster) => disaster.id != id),
            [toStatus as keyof DisastersSum]: [...prevDisasters[toStatus as keyof DisastersSum], {...disaster, status:toStatus}]
        }))

        
    }

    if(loadingState) {
    return (
        <div className="flex items-center justify-center w-full h-screen">
        <Commet color="#32cd32" size="large" text="" textColor="" />
        </div>
    );
    }


    return (
        <Card className='rounded-none w-full'>
            <Toaster
            position="top-right"
            theme='system'
            />
            <CardContent className='w-full '>
                <CardHeader className='w-full bg-green-400 rounded-md mb-4 mt-4'>
                    <CardTitle className='text-xl font-extrabold justify-start text-center w-full '>
                        Admin's Panel
                    </CardTitle>
                    <CardDescription className='text-black text-center'>
                        Manager Disaster Alert
                    </CardDescription>
                </CardHeader>
                <div className='flex flex-col items-center'>
                    <div className='w-full flex justify-end m-2'>
                        <Button variant="default" onClick={()=>router.push("/admin-page/disaster-upload")}>
                           <Upload/> Upload New Disaster
                        </Button>
                    </div>
                    <Tabs defaultValue="pending-disasters" className='w-full'>
                        <TabsList className='flex justify-evenly m-0'> {/* Ensuring tabs are placed horizontally */}
                            <TabsTrigger value='pending-disasters' className='w-1/3'>
                                Pending
                            </TabsTrigger>
                            <TabsTrigger value='approved-disasters' className='w-1/3'>
                                Approved
                            </TabsTrigger>
                            <TabsTrigger value='declined-disasters' className='w-1/3'>
                                Declined
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value='pending-disasters' className='flex flex-col items-center gap-2'>
                            <div className='w-2/3 m-0'>
                                <Input 
                                        type="text" 
                                        placeholder="search pending disasters..." 
                                        className='text-center font-bold bg-gray-100'
                                        value={disasterSearch.pendingSearch}
                                        onChange={(e) => setDisasterSearch(prev => ({
                                            ...prev,
                                            pendingSearch: e.target.value
                                        }))}
                                    />       
                            </div>
                            <div className='w-2/3 m-2 flex flex-col items-center'>
                                <Button 
                                    variant="outline"
                                    onClick={() => toggleDatePicker('pending')}
                                    className="mb-2 w-full"
                                >
                                    {format(dateRanges.pendingRange.startDate, 'MMM dd, yyyy')} - {format(dateRanges.pendingRange.endDate, 'MMM dd, yyyy')}
                                </Button>
                                
                                {showDatePicker.pending && (
                                    <div className="border rounded-md shadow-md z-10 bg-white">
                                    <DateRange
                                        ranges={[dateRanges.pendingRange]}
                                        onChange={(item) => setDateRanges((prev:any) => ({
                                        ...prev,
                                        pendingRange: item.pendingSelection
                                        }))}
                                        moveRangeOnFirstSelection={false}
                                        months={1}
                                        direction="horizontal"
                                    />
                                    <div className="flex justify-end gap-2 p-2">
                                        <Button 
                                        size="sm" 
                                        onClick={() => toggleDatePicker('pending')}
                                        >
                                        Apply
                                        </Button>
                                        <Button 
                                        size="sm" 
                                        onClick={() => resetFilters('pending')}
                                        >
                                        reset
                                        </Button>
                                        <Button 
                                        size="sm" 
                                        onClick={() => resetFilters('all')}
                                        >
                                        reset all
                                        </Button>
                                    </div>
                                    </div>
                                )}
                                </div>

                            <Table className='w-full'>
                                <TableCaption>Disasters pending decision.</TableCaption>
                                <TableHeader>
                                    <TableRow className='w-full'>
                                        <TableHead className="w-1/5 p-2">Id</TableHead>
                                        <TableHead className="w-1/5 p-2">Name</TableHead>
                                        <TableHead className="w-1/5 p-2">Type</TableHead>
                                        <TableHead className="w-1/5 p-2">Date</TableHead>
                                        <TableHead className="w-1/5 p-2">Intensity</TableHead>
                                        <TableHead className="w-1/5 p-2">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {  
                                    disasters.PENDING.length > 0? 
                                        disasters.PENDING.map((pendingDisaster:Disaster)=>{
                                            return (
                                            <TableRow key={pendingDisaster.id}>
                                                <TableCell className="w-1/5 p-2 ">{pendingDisaster.id}</TableCell>
                                                <TableCell className="w-1/5 p-2 ">{ReplaceUnderScoreMakeCamelCase(pendingDisaster.disasterName)}</TableCell>
                                                <TableCell className="w-1/5 p-2">{pendingDisaster.disasterType}</TableCell>
                                                <TableCell className="w-1/5 p-2">{new Date(pendingDisaster.startDate).toLocaleDateString('en-US', {year: 'numeric', month:'long', day:'numeric'})}</TableCell>
                                                <TableCell className="w-1/5 p-2 ">{`${pendingDisaster.intensity} %`}</TableCell>
                                                <TableCell className="w-1/5 p-2 ">
                                                <Select 
                                                value={`${pendingDisaster.status}`}
                                                onValueChange={(toStatus)=>changeStatus(pendingDisaster.id, toStatus , pendingDisaster)}
                                                >
                                                    <SelectTrigger className="w-[180px]">
                                                        <SelectValue placeholder="status"/>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="PENDING">Pending</SelectItem>
                                                        <SelectItem value="APPROVED">Approved</SelectItem>
                                                        <SelectItem value="DECLINED">Decline</SelectItem>
                                                    </SelectContent>
                                                    </Select>
                                                </TableCell>
                                            </TableRow>
                                            )
                                        }):
                                        <TableRow className='flex justify-center'>
                                            <TableCell className=" p-2 font-medium text-center content-center flex justify-center text-gray-700">No pending disasters</TableCell>
                                        </TableRow>
                                    }
                                </TableBody>
                            </Table>
                        </TabsContent>
                        <TabsContent value='approved-disasters' className='flex flex-col items-center m-0 '>
                            <div className='w-2/3 m-0'>
                                <Input 
                                    type="text" 
                                    placeholder="search approved disasters..." 
                                    className='text-center font-bold bg-gray-100'
                                    value={disasterSearch.approvedSearch} 
                                    onChange={(e) => setDisasterSearch(prev => ({
                                        ...prev,
                                        approvedSearch: e.target.value
                                    }))}
                                />
                            </div>
                            <div className='w-2/3 m-2 flex flex-col items-center'>
                                <Button 
                                    variant="outline"
                                    onClick={() => toggleDatePicker('approved')}
                                    className="mb-2 w-full"
                                >
                                    {format(dateRanges.approvedRange.startDate, 'MMM dd, yyyy')} - {format(dateRanges.approvedRange.endDate, 'MMM dd, yyyy')}
                                </Button>
                                
                                {showDatePicker.approved && (
                                    <div className="border rounded-md shadow-md z-10 bg-white">
                                    <DateRange
                                        ranges={[dateRanges.approvedRange]}
                                        onChange={(item) => setDateRanges((prev:any) => ({
                                        ...prev,
                                        approvedRange: item.approvedSelection
                                        }))}
                                        moveRangeOnFirstSelection={false}
                                        months={1}
                                        direction="horizontal"
                                    />
                                        <div className="flex justify-end gap-2 p-2">
                                            <Button 
                                            size="sm" 
                                            onClick={() => toggleDatePicker('approved')}
                                            >
                                            Apply
                                            </Button>
                                            <Button 
                                            size="sm" 
                                            onClick={() => resetFilters('approved')}
                                            >
                                            reset
                                            </Button>
                                            <Button 
                                            size="sm" 
                                            onClick={() => resetFilters('all')}
                                            >
                                            reset all
                                            </Button>
                                        </div>
                                    </div>
                                )}
                                </div>
                            <Table className='w-full'>
                                    <TableCaption>Approved disasters.</TableCaption>
                                    <TableHeader>
                                        <TableRow className='w-full'>
                                            <TableHead className="w-1/5 p-2">Id</TableHead>
                                            <TableHead className="w-1/5 p-2">Name</TableHead>
                                            <TableHead className="w-1/5 p-2">Type</TableHead>
                                            <TableHead className="w-1/5 p-2">Date</TableHead>
                                            <TableHead className="w-1/5 p-2">Intensity</TableHead>
                                            <TableHead className="w-1/5 p-2">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {  
                                        disasters.APPROVED.length > 0? 
                                            disasters.APPROVED.map((approvedDisaster:Disaster)=>{
                                                return (
                                                <TableRow key={approvedDisaster.id}>
                                                    <TableCell className="w-1/5 p-2 font-medium">{approvedDisaster.id}</TableCell>
                                                    <TableCell className="w-1/5 p-2 font-medium">{ReplaceUnderScoreMakeCamelCase(approvedDisaster.disasterName)}</TableCell>
                                                    <TableCell className="w-1/5 p-2">{approvedDisaster.disasterType}</TableCell>
                                                    <TableCell className="w-1/5 p-2">{new Date(approvedDisaster.startDate).toLocaleDateString('en-US', {year: 'numeric', month:'long', day:'numeric'})}</TableCell>
                                                    <TableCell className="w-1/5 p-2 ">{`${approvedDisaster.intensity} %`}</TableCell>
                                                    <TableCell className="w-1/5 p-2 ">
                                                    <Select value={`${approvedDisaster.status}`}
                                                    onValueChange={(toStatus)=>changeStatus(approvedDisaster.id, toStatus , approvedDisaster)}
                                                    >
                                                        <SelectTrigger className="w-[180px]">
                                                            <SelectValue placeholder={`${approvedDisaster.status}`} />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="PENDING">Pending</SelectItem>
                                                            <SelectItem value="APPROVED">Approved</SelectItem>
                                                            <SelectItem value="DECLINED">Declined</SelectItem>
                                                        </SelectContent>
                                                        </Select>
                                                    </TableCell>
                                                </TableRow>
                                                )
                                            }):
                                            <TableRow className='flex justify-center'>
                                                <TableCell className=" p-2 font-medium text-center content-center flex justify-center text-gray-700">No pending disasters</TableCell>
                                            </TableRow>
                                        }
                                    </TableBody>
                                </Table>
                        </TabsContent>
                        <TabsContent value='declined-disasters' className='flex flex-col items-center m-0 '>
                            <div className='w-2/3 m-0'>
                            <Input 
                                type="text" 
                                placeholder="search declined disasters..." 
                                className='text-center font-bold bg-gray-100'
                                value={disasterSearch.declinedSearch}
                                onChange={(e) => setDisasterSearch(prev => ({
                                    ...prev,
                                    declinedSearch: e.target.value
                                }))}
                            />
                            </div>
                            <div className='w-2/3 m-2 flex flex-col items-center'>
                                <Button 
                                    variant="outline"
                                    onClick={() => toggleDatePicker('declined')}
                                    className="mb-2 w-full"
                                >
                                    {format(dateRanges.declinedRange.startDate, 'MMM dd, yyyy')} - {format(dateRanges.declinedRange.endDate, 'MMM dd, yyyy')}
                                </Button>
                                
                                {showDatePicker.declined && (
                                    <div className="border rounded-md shadow-md z-10 bg-white">
                                    <DateRange
                                        ranges={[dateRanges.declinedRange]}
                                        onChange={(item) => setDateRanges((prev:any) => ({
                                        ...prev,
                                        declinedRange: item.declinedSelection
                                        }))}
                                        moveRangeOnFirstSelection={false}
                                        months={1}
                                        direction="horizontal"
                                    />
                                        <div className="flex justify-end gap-2 p-2">
                                            <Button 
                                            size="sm" 
                                            onClick={() => toggleDatePicker('declined')}
                                            >
                                            Apply
                                            </Button>
                                            <Button 
                                            size="sm" 
                                            onClick={() => resetFilters('declined')}
                                            >
                                            reset
                                            </Button>
                                            <Button 
                                            size="sm" 
                                            onClick={() => resetFilters('all')}
                                            >
                                            reset all
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <Table className='w-full'>
                                    <TableCaption>Declined disasters.</TableCaption>
                                    <TableHeader>
                                        <TableRow className='w-full'>
                                            <TableHead className="w-1/5 p-2">Id</TableHead>
                                            <TableHead className="w-1/5 p-2">Name</TableHead>
                                            <TableHead className="w-1/5 p-2">Type</TableHead>
                                            <TableHead className="w-1/5 p-2">Date</TableHead>
                                            <TableHead className="w-1/5 p-2">Intensity</TableHead>
                                            <TableHead className="w-1/5 p-2">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {  
                                       disasters.DECLINED.length > 0? 
                                            disasters.DECLINED.map((declinedDisaster:Disaster)=>{
                                                return (
                                                <TableRow key={declinedDisaster.id}>
                                                    <TableCell className="w-1/5 p-2 font-medium">{declinedDisaster.id}</TableCell>
                                                    <TableCell className="w-1/5 p-2 font-medium">{ReplaceUnderScoreMakeCamelCase(declinedDisaster.disasterName)}</TableCell>
                                                    <TableCell className="w-1/5 p-2">{declinedDisaster.disasterType}</TableCell>
                                                    <TableCell className="w-1/5 p-2">{new Date(declinedDisaster.startDate).toLocaleDateString('en-US', {year: 'numeric', month:'long', day:'numeric'})}</TableCell>
                                                    <TableCell className="w-1/5 p-2 ">{`${declinedDisaster.intensity} %`}</TableCell>
                                                    <TableCell className="w-1/5 p-2 ">
                                                    <Select value={`${declinedDisaster.status}`}
                                                    onValueChange={(toStatus)=>changeStatus(declinedDisaster.id, toStatus , declinedDisaster)}
                                                    >
                                                        <SelectTrigger className="w-[180px]">
                                                            <SelectValue placeholder={declinedDisaster.status} />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="PENDING">Pending</SelectItem>
                                                            <SelectItem value="APPROVED">Approved</SelectItem>
                                                            <SelectItem value="DECLINED">Declined</SelectItem>
                                                        </SelectContent>
                                                        </Select>
                                                    </TableCell>
                                                </TableRow>
                                                )
                                            }):
                                            <TableRow className='flex justify-center'>
                                                <TableCell className=" p-2 font-medium text-center content-center flex justify-center text-gray-700">No pending disasters</TableCell>
                                            </TableRow>
                                        }
                                    </TableBody>
                            </Table>
                        </TabsContent>
                    </Tabs>
                </div>
                <div className=' flex flex-col md:grid md:grid-cols-2 items-center md:items-start gap-2'>
                    <EmergencyHotlines emergencyHotlines={emergencyHotlines}/>
                    <SpatialLayerPicker/>
                </div>
            </CardContent>
        </Card>
    )
}

export default AdminClientPage
