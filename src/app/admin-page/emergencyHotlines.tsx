"use client"

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Toaster } from 'sonner'
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X, Settings, Settings2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

type EmergencyHotlinesProps = {
    emergencyHotlines: any[]
}

const EmergencyHotlines = ({ emergencyHotlines }: EmergencyHotlinesProps) => {
    const [regions, setRegions] = useState<string[]>([])
    const [selectedRegion, setSelectedRegion] = useState<string>("")
    const [locationsDropDownList, setLocationsDropDownList] = useState<any[]>([])
    const [selectedLocation, setSelectedLocation] = useState<string>("")
    const [contactsToRender, setContactsToRender] = useState<any[]>([])

    useEffect(() => {
        const uniqueRegions = [...new Set(emergencyHotlines.map(location => location.region))];
        setRegions(uniqueRegions)
    }, [emergencyHotlines])

    // Update the locations dropdown list when the selected region changes
    useEffect(() => {
        if (selectedRegion) {
            setLocationsDropDownList([...emergencyHotlines.filter((location: any) => location.region === selectedRegion)])
            setSelectedLocation("") // Reset location when region changes
            setContactsToRender([])
        }
    }, [selectedRegion, emergencyHotlines])

    // Update location contacts to render when location is selected
    useEffect(() => {
        if (selectedLocation && selectedRegion) {
            const filteredContacts = emergencyHotlines.filter(
                contact => contact.location === selectedLocation && contact.region === selectedRegion
            )
            setContactsToRender(filteredContacts)
        }
    }, [selectedLocation, selectedRegion, emergencyHotlines])

    return (
        <div>
            <Toaster />
            <Card className='bg-gray-100 m-6 w-fit'>
                <CardContent>
                    <CardHeader>
                        <CardTitle className='flex justify-center'>
                            Emergency Hotlines
                        </CardTitle>
                        <CardDescription className='flex justify-center'>
                            Updated on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </CardDescription>
                    </CardHeader>
                    <div className='flex flex-col items-center gap-2'>
                        <div className='flex justify-center gap-2'>
                            <Select
                                value={selectedRegion}
                                onValueChange={(value) => setSelectedRegion(value)}
                            >
                                <SelectTrigger className="w-[200px] bg-white">
                                    <SelectValue placeholder="Select a region" />
                                </SelectTrigger>
                                <SelectContent>
                                    {regions && regions.map((region: string) => (
                                        <SelectItem key={region} value={region}>
                                            {region.toLowerCase()}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select
                                value={selectedLocation}
                                onValueChange={(value) => setSelectedLocation(value)}
                                disabled={!selectedRegion}
                            >
                                <SelectTrigger className="w-[200px] bg-white">
                                    <SelectValue placeholder="Select a location" />
                                </SelectTrigger>
                                <SelectContent>
                                    {locationsDropDownList && locationsDropDownList.map((location: any) => (
                                        <SelectItem key={location.id} value={location.location}>
                                            {location.location}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        
                        {selectedLocation && selectedRegion && (
                            <div className="mt-4 j">
                                <span className='text-center block mb-2'>
                                </span>
                                <ul className="space-y-2">
                                    {contactsToRender.length > 0 && contactsToRender[0].phones.numbers.map((phoneNumber: string, index: number) => (
                                        <div 
                                            key={index} 
                                            className='flex justify-center items-center gap-6 border-0 border-b-2 border-gray-300 p-1'
                                            >
                                            <span className='text-green-600 font-extrabold'>{phoneNumber}</span>
                                            <Button variant="ghost" size="sm" className='bg-red-500 hover:bg-red-900 p-2'>
                                                <X size={16} color='white' />
                                            </Button>
                                            <Button  size="sm" className='p-2 bg-green-600'>
                                                <Settings2 size={16}/>
                                            </Button>
                                        </div>
                                    ))}
                                </ul>   
                            </div>
                        )}
                        <Button className={`${!selectedLocation && !selectedLocation? 'hidden':'bg-green-600 w-40 p-1 mt-5'} `}>
                            Add
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default EmergencyHotlines
