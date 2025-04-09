"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import React, { useState } from 'react'
import { Briefcase, CheckCircle, Edit, Home, Languages, Mail, MessageCircle, Phone, UserCircle, UserSquare2Icon, X } from 'lucide-react'
import { toast, Toaster } from 'sonner'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

const getProfile = async () => {
    const user = localStorage.getItem('user')
    if (user) {
        const parsedUser = JSON.parse(user)
        fetch(`http://localhost:3000/auth/user/${parsedUser.id}`, 
            { credentials: 'include' }).catch((error) => {
                console.error('Error fetching user data:', error);
                toast.error('Error fetching user data. Please try again later.')
            }) 
    }
}

function ProfilePage() {

    const [formData, setFormData] = useState({
        name: 'John Doe',
        phone: '08888888888',
        email: 'name@example.com'
    })

    const [userUpdateDialogOpen, setUserUpdateDialogOpen] = useState(false)

  return (
    <Card className='rounded-none h-full flex flex-col'>
        <Toaster position="top-right" theme='system'/>
        <CardContent className='flex-1 p-4 flex flex-col w-full'>
            <CardHeader className='bg-green-400 rounded-lg mb-4 p-4 w-full'>
                <CardTitle className='flex justify-center items-center gap-2 text-xl font-extrabold'>
                   Profile Page <UserCircle/>
                </CardTitle>
                <CardDescription className='text-center text-black'>
                    Manage your profile
                </CardDescription>
            </CardHeader>
            
            <div className='flex flex-col md:flex-row gap-4 w-full'>
                {/* Left Column */}
                <Card className='flex-1 flex flex-col bg-gray-100 p-4 w-full md:w-[50%]'>
                    <Button className='flex justify-self-end w-fit p-2 bg-green-400' variant='outline' size='icon' onClick={() => setUserUpdateDialogOpen(true)} >
                        <Edit 
                            size={20}
                        />
                        <Label>Update Profile</Label>
                    </Button>    
                    <div className='flex flex-col items-center gap-4 flex-1'>
                        <UserSquare2Icon size={100}/>
                        <span className='text-2xl font-bold'>John Doe</span>
                        <div className='w-full flex flex-col gap-4'>
                            <Card className='flex-1 flex justify-center gap-2 p-3'>
                                <Phone size={18}/> 
                                <span>08888888888</span>
                            </Card>
                            <Card className='flex-1 flex justify-center gap-2 p-3'>
                                <Mail size={18}/> 
                                <span>name@example.com</span>
                            </Card>
                        </div>
                        <div className='w-full border-t-2 border-gray-300 pt-4 mt-auto'>
                            <h3 className='font-bold mb-2'>Location information</h3>
                            <div className='flex flex-col gap-2'>
                                <span className='flex items-center gap-2'>
                                    <Home size={18}/> 
                                    Home Location 
                                    <CheckCircle size={18} className='ml-2 text-green-500'/>
                                </span>
                                <span className='flex items-center gap-2'>
                                    <Briefcase size={18}/> 
                                    Work Location (optional)
                                    <X size={18} className='ml-2 text-red-500'/>
                                </span>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Right Column */}
                <div className='flex flex-col gap-4 w-full md:w-[50%]'>
                    <Card className='flex-1 bg-gray-100 p-4'>
                        <CardHeader className='p-0 mb-4 w-full '>
                            <CardTitle className='flex items-center gap-2 text-lg font-bold bg-green-400 p-2 rounded-lg'>
                                <MessageCircle size={20}/>
                                Notification Channels
                            </CardTitle>
                            <CardDescription className='text-black'>
                                Either select one or two
                            </CardDescription>
                        </CardHeader>
                        <div className='space-y-4'>
                            <div className='flex justify-between items-center p-2'>
                                <span className='font-bold'>Email</span>
                                <Switch 
                                    className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-300"
                                    id='email' 
                                    defaultChecked/>
                            </div>
                            <div className='flex justify-between items-center p-2'>
                                <span className='font-bold'>SMS</span>
                                <Switch
                                    className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-300" 
                                    id='sms' 
                                    defaultChecked/>
                            </div>
                        </div>
                    </Card>
                    <Card className='flex-1 bg-gray-100 p-4'>
                        <CardHeader className='p-0 mb-4'>
                            <CardTitle className='flex items-center gap-2 text-lg font-bold bg-green-400 p-2 rounded-lg'>
                                <Languages size={20}/>
                                Language
                            </CardTitle>
                            <CardDescription className='text-black'>
                                select one
                            </CardDescription>
                        </CardHeader>
                        <div className='space-y-4'>
                            <div className='flex justify-between items-center p-2'>
                                <span className='font-bold'>English</span>
                                <Switch 
                                    className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-300"
                                    id='email' 
                                    defaultChecked/>
                            </div>
                            <div className='flex justify-between items-center p-2'>
                                <span className='font-bold'>Chichewa</span>
                                <Switch
                                    className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-300" 
                                    id='sms' 
                                    defaultChecked/>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

        </CardContent>
        <Dialog open={userUpdateDialogOpen} onOpenChange={setUserUpdateDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Update your personal Information</DialogTitle>
                        <DialogDescription>
                            Make changes to your profile here. Click save when you're done.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Name
                            </Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="phone" className="text-right">
                                Phone
                            </Label>
                            <Input
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">
                                Email
                            </Label>
                            <Input
                                id="email"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button 
                            type="submit"
                            onClick={() => {
                                setUserUpdateDialogOpen(false)
                                toast.success('Profile updated successfully')
                            }}
                        >
                            Save changes
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={() => setUserUpdateDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
    </Card>
  )
}

export default ProfilePage