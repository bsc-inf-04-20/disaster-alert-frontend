"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import React, { useEffect, useState } from 'react'
import { Briefcase, CheckCircle, Edit, Home, Languages, Mail, MessageCircle, Phone, UserCircle, UserSquare2Icon, X } from 'lucide-react'
import { toast, Toaster } from 'sonner'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Commet } from 'react-loading-indicators'
import { LocationDialog } from './locationSelector'


type UserRole = {
    id: number;
    name: string;
  };

  type UserLocation = {
    id: number;
    address: string;
    lat: number;
    lng: number;
    type: 'home' | 'work'; // Add this for clarity
  };
  
  type User = {
    locations: UserLocation[]; // <-- CHANGED
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    preferedLanguage: 'English' | 'Chichewa';
    createdAt: string;
    updatedAt: string;
    userRole: UserRole;
  };
  
  

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

    const updateLanguagePreference = async (language:string, userId:number) => {
        try {
          const response = await fetch(`http://localhost:3000/users/${userId}/languages/${language}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(formData),
          });
    
          if (!response.ok) {
            throw new Error(' failed to update language preference');
          }
          const updatedUser = await response.json();
        //   setUserUpdateDialogOpen(false)
          localStorage.setItem('user', JSON.stringify({...user, preferedLanguage: language}))
          setUser((prevUser:any)=>{
            if (prevUser) {
              return { ...prevUser, preferedLanguage: language };
            }
            return prevUser;
          })
          toast.success('Profile updated successfully!');

        } catch (error) {
          console.error('Error updating user profile:', error);
          toast.error('Error updating user profile. Please try again later.');
        }
    };


    const updateProfile = async (formData: { [key: string]: any }, userId:number) => {
        try {
          const response = await fetch(`http://localhost:3000/users/${userId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(formData),
          });
    
          if (!response.ok) {
            throw new Error('Failed to update user');
          }
          const updatedUser = await response.json();
          setUserUpdateDialogOpen(false)
          localStorage.setItem('user', JSON.stringify(updatedUser))
          setUser(updatedUser)
          toast.success('Profile updated successfully!');

        } catch (error) {
          console.error('Error updating user profile:', error);
          toast.error('Error updating user profile. Please try again later.');
        }
    };

    const updateUserLocation = async (address: string, latitude: number, longitude: number, type: string) => {
        try {
          const response = await fetch(`http://localhost:3000/users/${user?.id}/locations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ address, latitude, longitude, type }),
          });
      
          if (!response.ok) {
            throw new Error('Failed to update location');
          }
      
          const updatedLocation = await response.json();
      
          // Now update the user's locations
          setUser(prevUser => {
            if (!prevUser) return prevUser;
            const otherLocations = prevUser.locations.filter(loc => loc.type !== type);
            const updatedLocations = [...otherLocations, updatedLocation];
            const updatedUser = { ...prevUser, locations: updatedLocations };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            return updatedUser;
          });
      
          toast.success('Location updated successfully!');
        } catch (error) {
          console.error('Error updating user location:', error);
          toast.error('Error updating user location. Please try again later.');
        }
      };
      


   const userDetailsfromLocalStorage = localStorage.getItem('user')


//    const [selectedLanguage, setSelectedLanguage] = useState<'English' | 'Chichewa' | null>('english')

   const [user, setUser] = useState<User | null>(null)

   const [updatingUser, setUpdatingUser] = useState(false)

   //update the user preferred language in local storage, state and call the api to update the user in the database
    const handleLanguageChange = (language: 'English' | 'Chichewa') => {
     setUser((prevUser:any) => {
        if (prevUser) {
          const updatedUser = { ...prevUser, preferedLanguage: language, userRole:user?.userRole.id };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          updateProfile(updatedUser, updatedUser.id)
          return updatedUser;
        }
        return prevUser;
     });
    }

   useEffect(() => {
    if (userDetailsfromLocalStorage !== null) {
      const parsedUser = JSON.parse(userDetailsfromLocalStorage);
      setUser(parsedUser);
      setFormData({
        firstName: parsedUser.firstName,
        lastName: parsedUser.lastName,
        phoneNumber: parsedUser.phoneNumber || '',
        email: parsedUser.email || '',
        preferedLanguage: parsedUser.preferedLanguage || ''
      });
    }
  }, [userDetailsfromLocalStorage]);

  

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        email: '',
        preferedLanguage:''
    })

    // inside ProfilePage component:
    const [homeDialogOpen, setHomeDialogOpen] = useState(false);
    const [workDialogOpen, setWorkDialogOpen] = useState(false);
    const homeLocation = user?.locations.find(location => location.type === 'home') || null;
    const workLocation = user?.locations.find(location => location.type === 'work') || null;
    


    const [userUpdateDialogOpen, setUserUpdateDialogOpen] = useState(false)

  if (userDetailsfromLocalStorage == null) {
    return (
        <div className="flex items-center justify-center w-full h-screen">
        <Commet color="#32cd32" size="large" text="" textColor="" />
        </div>
    );
  }else
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
                        <span className='text-2xl font-bold'>{`${user?.firstName?? "N/A"} ${user?.lastName?? "N/A"}`}</span>
                        <div className='w-full flex flex-col gap-4'>
                            <Card className='flex-1 flex justify-center gap-2 p-3'>
                                <Phone size={18}/> 
                                <span>{user?.phoneNumber?? "N/A"}</span>
                            </Card>
                            <Card className='flex-1 flex justify-center gap-2 p-3'>
                                <Mail size={18}/> 
                                <span>{user?.email?? "N/A"}</span>
                            </Card>
                        </div>
                        <div className='w-full border-t-2 border-gray-300 pt-4 mt-auto'>
                        <h3 className='font-bold mb-2'>Location information</h3>
                            {
                                user && user.locations.length > 0  && user.locations.map((location) => (
                                    <span
                                        className="flex items-center gap-2 cursor-pointer hover:text-green-500 hover:font-bold"
                                        onClick={ location.type=='work'? () => setWorkDialogOpen(true): () => setHomeDialogOpen(true) }
                                        key={location.id}
                                        >
                                        {location.type === 'home' ? <Home size={18} /> : <Briefcase size={18} />} 
                                         {location?.address || `${location.type} Location`}
                                    </span>
                                ))
                            }
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
                                Either select one or both
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
                                    checked={user? user.preferedLanguage === 'English': true}
                                    onCheckedChange={(checked) => {
                                        if (checked && user) updateLanguagePreference('English', user.id)
                                      }}
                                    className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-300"
                                    id='email' 
                                    defaultChecked/>
                            </div>
                            <div className='flex justify-between items-center p-2'>
                                <span className='font-bold'>Chichewa</span>
                                <Switch
                                    checked={user?.preferedLanguage  === 'Chichewa'}
                                    onCheckedChange={(checked) => {
                                    if (checked && user) updateLanguagePreference('Chichewa', user.id)
                                    }}
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
                                firstName
                            </Label>
                            <Input
                                id="name"
                                value={formData.firstName}
                                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                lastName
                            </Label>
                            <Input
                                id="name"
                                value={formData.lastName}
                                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="phone" className="text-right">
                                Phone
                            </Label>
                            <Input
                                id="phone"
                                value={formData.phoneNumber}
                                onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
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
                        {
                            updatingUser?
                            <Commet color="#32cd32" size='medium' text="" textColor="" />:
                            <Button 
                            type="submit"
                            onClick={() => {
                                console.log(" this is the user's id: ", user?.id)
                                if(user)
                                updateProfile(formData, user?.id)
                            }}
                        >
                            Save changes
                        </Button>
                        }
                        <Button 
                            variant="outline" 
                            onClick={() => setUserUpdateDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <LocationDialog
                setUser={setUser}
                isOpen={homeDialogOpen}
                onClose={() => setHomeDialogOpen(false)}
                title="Select Home Location"
                initialValue={homeLocation?.address}
                onSave={(address, lat, lng) => updateUserLocation( address, lat, lng, 'home' )}
            />
            <LocationDialog
                setUser= {setUser}
                isOpen={workDialogOpen}
                onClose={() => setWorkDialogOpen(false)}
                title="Select Work Location"
                initialValue={workLocation?.address}
                onSave={(address, lat, lng) => updateUserLocation(address, lat, lng, 'work'  )}
            />
    </Card>
  )
}

export default ProfilePage