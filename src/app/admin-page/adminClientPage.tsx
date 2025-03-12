"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast, Toaster } from 'sonner';
import { Input } from '@/components/ui/input';
import Fuse from 'fuse.js';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { DateRange } from 'react-date-range';
import { format, isWithinInterval } from 'date-fns';

// all disasters
type DisastersSum = {
        Pending:Disaster[], 
        Approved:Disaster[], 
        Declined:Disaster[]
}

//props from the parent, page.tsx
type clientprops = {
    allDisasters: [],
}

//Disaster information structure
type Disaster = {
    id: number,
    type: string,
    name: string,
    date: Date,
    intensity: number,
    impact_chance: number,
    status: string
}

function AdminClientPage({ allDisasters}: clientprops) {


    // tracking all the disasters 
    const [disasters, setDisasters] = useState<{
                                Pending:Disaster[], 
                                Approved:Disaster[], 
                                Declined:Disaster[]}>({
        Pending:[],
        Approved:[],
        Declined:[]
    })


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

    //ariables to control the visibility of date pickers
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
        Pending: allDisasters.filter((disaster: Disaster) => disaster.status === "Pending"),
        Approved: allDisasters.filter((disaster: Disaster) => disaster.status === "Approved"),
        Declined: allDisasters.filter((disaster: Disaster) => disaster.status === "Declined")
    };

    // Filter function that combines text search and date range
    const filterDisasters = (disasterType:string, searchText:string, dateRange:DateRange) => {
        let filtered = originalDisasters[disasterType];
        
        // Apply date filter if dates are set
        if (dateRange.startDate && dateRange.endDate) {
        filtered = filtered.filter(disaster => {
            const disasterDate = new Date(disaster.date);
            return isWithinInterval(disasterDate, {
            start: dateRange.startDate,
            end: dateRange.endDate
            });
        });
        }
        
        // Apply text search if provided
        if (searchText && searchText.trim() !== "") {
        const options = {
            keys: ['name', 'type', 'id'],
            threshold: 0.4,
            includeScore: true
        };
        
        const fuse = new Fuse(filtered, options);
        const result = fuse.search(searchText);
        filtered = result.map(item => item.item);
        }
        
        return filtered;
    };

    // Apply all filters
    setDisasters({
        Pending: filterDisasters('Pending', disasterSearch.pendingSearch, dateRanges.pendingRange),
        Approved: filterDisasters('Approved', disasterSearch.approvedSearch, dateRanges.approvedRange),
        Declined: filterDisasters('Declined', disasterSearch.declinedSearch, dateRanges.declinedRange)
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

        const res = await fetch(`http://localhost:4000/disasters/${disaster.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...disaster,
                status:toStatus
            }),
        }).catch(error=>{
            toast.error(`failed to change the status of ${disaster.type} ${disaster.name} to ${toStatus}`)
        })

        toast.success(`successfully changed the status of ${disaster.type} ${disaster.name} to ${toStatus}` )


        setDisasters((prevDisasters:DisastersSum)=>({
            ...prevDisasters,
            [fromStatus]: prevDisasters[fromStatus].filter((disaster:Disaster)=>disaster.id!=id),
            [toStatus]: [...prevDisasters[toStatus], {...disaster, status:toStatus}]
        }))

        
    }


    return (
        <Card className='rounded-none w-full'>
            <Toaster
            position="top-right"
            theme='system'
            />
            <CardContent className='w-full'>
                <CardHeader>
                    <CardTitle className='text-xl font-extrabold justify-start text-center'>
                        Admin's Panel
                    </CardTitle>
                </CardHeader>
                <div className='flex flex-col items-center'>
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
                                        onChange={(item) => setDateRanges(prev => ({
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
                                    disasters.Pending.length > 0? 
                                        disasters.Pending.map((pendingDisaster:Disaster)=>{
                                            return (
                                            <TableRow key={pendingDisaster.id}>
                                                <TableCell className="w-1/5 p-2 ">{pendingDisaster.id}</TableCell>
                                                <TableCell className="w-1/5 p-2 ">{pendingDisaster.name}</TableCell>
                                                <TableCell className="w-1/5 p-2">{pendingDisaster.type}</TableCell>
                                                <TableCell className="w-1/5 p-2">{new Date(pendingDisaster.date).toLocaleDateString('en-US', {year: 'numeric', month:'long', day:'numeric'})}</TableCell>
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
                                                        <SelectItem value="Pending">Pending</SelectItem>
                                                        <SelectItem value="Approved">Approved</SelectItem>
                                                        <SelectItem value="Declined">Decline</SelectItem>
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
                                        onChange={(item) => setDateRanges(prev => ({
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
                                        disasters.Approved.length > 0? 
                                            disasters.Approved.map((approvedDisaster:Disaster)=>{
                                                return (
                                                <TableRow key={approvedDisaster.id}>
                                                    <TableCell className="w-1/5 p-2 font-medium">{approvedDisaster.id}</TableCell>
                                                    <TableCell className="w-1/5 p-2 font-medium">{approvedDisaster.name}</TableCell>
                                                    <TableCell className="w-1/5 p-2">{approvedDisaster.type}</TableCell>
                                                    <TableCell className="w-1/5 p-2">{new Date(approvedDisaster.date).toLocaleDateString('en-US', {year: 'numeric', month:'long', day:'numeric'})}</TableCell>
                                                    <TableCell className="w-1/5 p-2 ">{`${approvedDisaster.intensity} %`}</TableCell>
                                                    <TableCell className="w-1/5 p-2 ">
                                                    <Select value={`${approvedDisaster.status}`}
                                                    onValueChange={(toStatus)=>changeStatus(approvedDisaster.id, toStatus , approvedDisaster)}
                                                    >
                                                        <SelectTrigger className="w-[180px]">
                                                            <SelectValue placeholder={`${approvedDisaster.status}`} />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Pending">Pending</SelectItem>
                                                            <SelectItem value="Approved">Approved</SelectItem>
                                                            <SelectItem value="Declined">Declined</SelectItem>
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
                                        onChange={(item) => setDateRanges(prev => ({
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
                                       disasters.Declined.length > 0? 
                                            disasters.Declined.map((declinedDisaster:Disaster)=>{
                                                return (
                                                <TableRow key={declinedDisaster.id}>
                                                    <TableCell className="w-1/5 p-2 font-medium">{declinedDisaster.id}</TableCell>
                                                    <TableCell className="w-1/5 p-2 font-medium">{declinedDisaster.name}</TableCell>
                                                    <TableCell className="w-1/5 p-2">{declinedDisaster.type}</TableCell>
                                                    <TableCell className="w-1/5 p-2">{new Date(declinedDisaster.date).toLocaleDateString('en-US', {year: 'numeric', month:'long', day:'numeric'})}</TableCell>
                                                    <TableCell className="w-1/5 p-2 ">{`${declinedDisaster.intensity} %`}</TableCell>
                                                    <TableCell className="w-1/5 p-2 ">
                                                    <Select value={`${declinedDisaster.status}`}
                                                    onValueChange={(toStatus)=>changeStatus(declinedDisaster.id, toStatus , declinedDisaster)}
                                                    >
                                                        <SelectTrigger className="w-[180px]">
                                                            <SelectValue placeholder={declinedDisaster.status} />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Pending">Pending</SelectItem>
                                                            <SelectItem value="Approved">Approved</SelectItem>
                                                            <SelectItem value="Declined">Declined</SelectItem>
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
            </CardContent>
        </Card>
    )
}

export default AdminClientPage
