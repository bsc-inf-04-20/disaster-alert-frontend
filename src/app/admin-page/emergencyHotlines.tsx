"use client"

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X, Settings, Settings2, Plus, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'


//api call to patch a contact in among the emergency hotlines
const patchContact = async (contact: any) => {
    const response = await fetch(`http://localhost:4000/emergency-contacts/${contact.id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(contact),
    })

    if (!response.ok) {
        throw new Error('Failed to patch contact')
    }
}


type EmergencyHotlinesProps = {
    emergencyHotlines: any[]
}

const EmergencyHotlines = ({ emergencyHotlines }: EmergencyHotlinesProps) => {

    //keeping track of all the contacts
    const [contactsState, setContactsState] = useState(emergencyHotlines);


    //keeping track of all the regions available (central, eastern, southern)
    const [regions, setRegions] = useState<string[]>([])

    //keeping track of the selected region
    const [selectedRegion, setSelectedRegion] = useState<string>("")

    //keeping track of the locations dropdown list(precise district or area)
    const [locationsDropDownList, setLocationsDropDownList] = useState<any[]>([])

    //keeping track of the selected location within the drop down list
    const [selectedLocation, setSelectedLocation] = useState<string>("")

    //keeping track of the contacts to render based on the selected region and location
    const [contactsToRender, setContactsToRender] = useState<any[]>([])


        // Dialog states
        const [editDialogOpen, setEditDialogOpen] = useState(false)
        const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
        const [addDialogOpen, setAddDialogOpen] = useState(false)
        const [importDialogOpen, setImportDialogOpen] = useState(false)
        
        // Phone number state
        const [selectedPhoneIndex, setSelectedPhoneIndex] = useState<number | null>(null)
        const [phoneNumberToEdit, setPhoneNumberToEdit] = useState("")
        const [newPhoneNumber, setNewPhoneNumber] = useState("")

          // Open the edit dialog
    const handleEditClick = (phoneNumber: string, index: number) => {
        setPhoneNumberToEdit(phoneNumber)
        setSelectedPhoneIndex(index)
        setEditDialogOpen(true)
    }

    // Open the delete dialog
    const handleDeleteClick = (index: number) => {
        setSelectedPhoneIndex(index)
        setDeleteDialogOpen(true)
    }

    // Confirm edit
    const handleEditConfirm = async () => {
        if (selectedPhoneIndex === null || contactsToRender.length === 0) return

        try {
            const updatedContact = { ...contactsToRender[0] }
            updatedContact.phones.numbers[selectedPhoneIndex] = phoneNumberToEdit
            
            await patchContact(updatedContact)
            
            const updatedContacts = contactsState.map(contact => {
                if (contact.id === updatedContact.id) {
                    return updatedContact
                }
                return contact
            })
            
            setContactsState(updatedContacts)
            setEditDialogOpen(false)
            toast.success('Phone number updated successfully')
        } catch (error) {
            toast.error('Failed to update phone number')
        }
    }

    // Confirm delete
    const handleDeleteConfirm = async () => {
        if (selectedPhoneIndex === null || contactsToRender.length === 0) return

        try {
            const updatedContact = { ...contactsToRender[0] }
            updatedContact.phones.numbers = updatedContact.phones.numbers.filter((_: any, index: number) => index !== selectedPhoneIndex)
            
            await patchContact(updatedContact)
            
            const updatedContacts = contactsState.map(contact => {
                if (contact.id === updatedContact.id) {
                    return updatedContact
                }
                return contact
            })
            
            setContactsState(updatedContacts)
            setDeleteDialogOpen(false)
            toast.success('Phone number deleted successfully')
        } catch (error) {
            toast.error('Failed to delete phone number')
        }
    }

    // Confirm add
    const handleAddConfirm = async () => {
        if (contactsToRender.length === 0 || !newPhoneNumber) return

        try {
            const updatedContact = { ...contactsToRender[0] }
            updatedContact.phones.numbers = [...updatedContact.phones.numbers, newPhoneNumber]
            
            await patchContact(updatedContact)
            
            const updatedContacts = contactsState.map(contact => {
                if (contact.id === updatedContact.id) {
                    return updatedContact
                }
                return contact
            })
            
            setContactsState(updatedContacts)
            setNewPhoneNumber("")
            setAddDialogOpen(false)
            toast.success('Phone number added successfully')
        } catch (error) {
            toast.error('Failed to add phone number')
        }
    }


    useEffect(() => {
        const uniqueRegions = [...new Set(contactsState.map(location => location.region))];
        setRegions(uniqueRegions)
    }, [contactsState])

    // Update the locations dropdown list when the selected region changes
    useEffect(() => {
        if (selectedRegion) {
            setLocationsDropDownList([...contactsState.filter((location: any) => location.region === selectedRegion)])
            // setSelectedLocation("") // Reset location when region changes
            // setContactsToRender([])
        }
    }, [selectedRegion, contactsState])

    // Update location contacts to render when location is selected
    useEffect(() => {
        if (selectedLocation && selectedRegion) {
            const filteredContacts = contactsState.filter(
                contact => contact.location === selectedLocation && contact.region === selectedRegion
            )
            setContactsToRender(filteredContacts)
        }
    }, [selectedLocation, selectedRegion, contactsState])

    //update contact of a location when edited
    // const handleContactUpdate = async (updatedContact: any) => {

    //     try{
    //             await patchContact(updatedContact)

    //             const updatedContacts = contactsState.map(contact => {
    //                 if (contact.id === updatedContact.id) {
    //                     return updatedContact
    //                 }
    //                 return contact
    //             })
    //             toast.success('Contact updated  successfully')
    //             setContactsState(updatedContacts)
    //         } catch (error) {
    //             toast.error('Failed to update contact')
    //         }
    //     }


        return (
            <div>
                <Card className="bg-gray-100 m-6 w-fit">
                    <CardContent>
                        <CardHeader>
                            <CardTitle className="flex flex-col justify-between items-center gap-2">
                                Emergency Hotlines
                                <Button 
                                    onClick={() => setImportDialogOpen(true)}
                                    variant='outline' 
                                    className='bg-green-400'>
                                        <Upload/> 
                                        import contacts
                                </Button>
                            </CardTitle>
                            <CardDescription className="flex justify-center">
                                Updated on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </CardDescription>
                        </CardHeader>
                        <div className="flex flex-col items-center gap-2">
                            <div className="flex justify-center gap-2">
                                <Select
                                    value={selectedRegion}
                                    onValueChange={(value) =>{ 
                                        setSelectedRegion(value)
                                        setSelectedLocation("") // Reset location when region changes
                                        setContactsToRender([])
                                    }}
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
                                <div className="mt-4 flex flex-col items-center gap-2">
                                    <span className="text-center block mb-2">
                                    </span>
                                    <ol className="list-decimal pl-10 w-full max-w-md"> {/* Add padding-left to make room for markers */}
                                        {contactsToRender.length > 0 && contactsToRender[0].phones.numbers.map((phoneNumber: string, index: number) => (
                                            <li
                                                key={index}
                                                className="border-0 border-b-2 border-gray-300 p-1 mb-2" /* Remove flex from here */
                                            >
                                                <div className="flex justify-center items-center gap-6"> {/* Move flex to an inner div */}
                                                    <span className="text-green-600 font-extrabold">{phoneNumber}</span>
                                                    
                                                    {/* Delete Button */}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="bg-red-500 hover:bg-red-900 p-2"
                                                        onClick={() => handleDeleteClick(index)}
                                                    >
                                                        <X size={16} color="white" />
                                                    </Button>
                                                    
                                                    {/* Edit Button */}
                                                    <Button
                                                        size="sm"
                                                        className="p-2 bg-green-600"
                                                        onClick={() => handleEditClick(phoneNumber, index)}
                                                    >
                                                        <Settings2 size={16} />
                                                    </Button>
                                                </div>
                                            </li>
                                        ))}
                                    </ol>
                                    
                                    {/* Add Button */}
                                    <Button
                                        className="bg-green-600 w-40 p-1 mt-5"
                                        onClick={() => setAddDialogOpen(true)}
                                    >
                                        <Plus size={16} className="mr-2" /> Add
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
    
                {/* Edit Dialog */}
                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Edit Phone Number</DialogTitle>
                            <DialogDescription>
                                Update the emergency contact phone number
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex items-center space-y-4">
                            <div className="grid flex-1 gap-2">
                                <Label htmlFor="phoneNumber" className="sr-only">
                                    Phone Number
                                </Label>
                                <Input
                                    id="phoneNumber"
                                    value={phoneNumberToEdit}
                                    onChange={(e) => setPhoneNumberToEdit(e.target.value)}
                                    placeholder="Enter phone number"
                                />
                            </div>
                        </div>
                        <DialogFooter className="sm:justify-end">
                            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" onClick={handleEditConfirm}>
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
    
                {/* Delete Dialog */}
                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete this
                                emergency contact phone number.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-500 hover:bg-red-700">
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
    
                {/* Add Dialog */}
                <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Add New Phone Number</DialogTitle>
                            <DialogDescription>
                                Add a new emergency contact phone number
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex items-center space-y-4">
                            <div className="grid flex-1 gap-2">
                                <Label htmlFor="newPhoneNumber" className="sr-only">
                                    New Phone Number
                                </Label>
                                <Input
                                    id="newPhoneNumber"
                                    value={newPhoneNumber}
                                    onChange={(e) => setNewPhoneNumber(e.target.value)}
                                    placeholder="Enter phone number"
                                />
                            </div>
                        </div>
                        <DialogFooter className="sm:justify-end">
                            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" onClick={handleAddConfirm} disabled={!newPhoneNumber}>
                                Add Number
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Import Dialog */}
           
                <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
                    <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Import Contacts</DialogTitle>
                    </DialogHeader>
                    <DialogDescription>
                        Please upload a JSON file that includes contacts in the following structure:
                    </DialogDescription>

                    {/* Preview of the JSON structure */}
                    <pre className="bg-gray-100 p-2 rounded text-sm my-4">
                        {`{
                        "id": "",
                        "location": "",
                        "phones": {
                            "numbers": [
                            ""
                            ]
                        },
                        "region": ""
                        }`}
                    </pre>

                    {/* Input for grabbing a JSON file */}
                    <Input type="file" accept=".json" />

                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
                        Close
                        </Button>
                    </DialogFooter>
                    </DialogContent>
                </Dialog>
 
            </div>
        )
    }

export default EmergencyHotlines
