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
import Fuse from 'fuse.js'

type DisastersSum = {
        Pending:Disaster[], 
        Approved:Disaster[], 
        Declined:Disaster[]
}

type clientprops = {
    allDisasters: [],
}

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


           
    //updating the disasters based on search and on initial render
    useEffect(() => {
        const originalDisasters = {
            Pending: allDisasters.filter((disaster: Disaster) => disaster.status === "Pending"),
            Approved: allDisasters.filter((disaster: Disaster) => disaster.status === "Approved"),
            Declined: allDisasters.filter((disaster: Disaster) => disaster.status === "Declined")
        };

        // Apply search filtering if needed
        setDisasters({
            Pending: disasterSearch.pendingSearch 
                ? fuzzySearch('Pending', disasterSearch.pendingSearch) 
                : originalDisasters.Pending,
            Approved: disasterSearch.approvedSearch 
                ? fuzzySearch('Approved', disasterSearch.approvedSearch) 
                : originalDisasters.Approved,
            Declined: disasterSearch.declinedSearch 
                ? fuzzySearch('Declined', disasterSearch.declinedSearch) 
                : originalDisasters.Declined
        });
    }, [disasterSearch, allDisasters]);
    

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

    const fuzzySearch = (disasterType:string, searchText:string) => {
        if (!searchText || searchText.trim() === "") {
            return disasters[disasterType];
        }
        
        const options = {
            keys: [
                'name',
                'type',
                'id'
            ],
            threshold: 0.7,
            includeScore: true
        };
        
        const fuse = new Fuse(disasters[disasterType], options);
        const result = fuse.search(searchText);
        
        // Return the item from each result
        return result.map(item => item.item);
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
