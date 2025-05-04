"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import React, { useEffect, useState } from 'react'
import { 
  Briefcase, 
  CheckCircle, 
  Edit, 
  Home, 
  Languages, 
  Mail, 
  MapPin, 
  MessageCircle, 
  Phone, 
  UserCircle, 
  UserSquare2Icon, 
  X,
  Bell,
  AtSign
} from 'lucide-react'
import { toast, Toaster } from 'sonner'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Commet } from 'react-loading-indicators'
import { LocationDialog } from './locationSelector'
import { set } from 'date-fns'

type UserRole = {
  id: number;
  name: string;
};

type UserLocation = {
  id: number;
  address: string;
  latitude: number;
  longitude: number;
  type: 'home' | 'work' | 'last';
};

type User = {
  locations: UserLocation[];
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  preferedLanguage: 'English' | 'Chichewa';
  createdAt: string;
  updatedAt: string;
  userRole: UserRole;
  notificationChannelType: 'email' | 'sms' | 'both';
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
      localStorage.setItem('user', JSON.stringify({...user, preferedLanguage: language}))
      setUser((prevUser:any)=>{
        if (prevUser) {
          return { ...prevUser, preferedLanguage: language };
        }
        return prevUser;
      })
      toast.success('Language preference updated!');

    } catch (error) {
      console.error('Error updating user profile:', error);
      toast.error('Error updating language preference. Please try again later.');
    }
  };

  const updateNotificationPreference = async (userId:number) => {

    let notificationChannel;

    console.log(`here is the email channel notification status: ${emailChannelNotification}`)
    console.log(`here is the sms channel notification status: ${smsChannelNotification}`)

    if (emailChannelNotification && smsChannelNotification) {
      notificationChannel = 'both'
    } else if (emailChannelNotification) {
      notificationChannel = 'email'
    } else if (smsChannelNotification) {
      notificationChannel = 'sms'
    } else {
      notificationChannel = 'none'
    }

    console.log('Notification channel:', notificationChannel)

    try {
      const response = await fetch(`http://localhost:3000/users/${userId}/notificationChannelType/${notificationChannel}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(' failed to update notification preference');
      }
      const updatedUser = await response.json();
      localStorage.setItem('user', JSON.stringify({...user, notificationChannel: notificationChannel}))
      setUser((prevUser:any)=>{
        if (prevUser) {
          return { ...prevUser, notificationChannelType: notificationChannel };
        }
        return prevUser;
      })
      toast.success('Notification preference updated!');

    } catch (error) {
      console.error('Error updating notication preference:', error);
      toast.error('Error updating notification preference. Please try again later.');
    }
  };


  const updateProfile = async (formData: { [key: string]: any }, userId:number) => {
    try {
      setUpdatingUser(true);
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
    } finally {
      setUpdatingUser(false);
    }
  };

  const updateUserLocation = async (address: string, latitude: number, longitude: number, type: string) => {
    if(user)
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
  const [user, setUser] = useState<User | null>(null)
  const [updatingUser, setUpdatingUser] = useState(false)

  // Update the user preferred language in local storage, state and call the api
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

  const [emailChannelNotification, setEmailChannelNotification] = useState(false)
  const [smsChannelNotification, setSMSChannelNotification] = useState(false)


    useEffect(()=>{
    updateNotificationPreference(user?.id!)
  }, [emailChannelNotification, smsChannelNotification])

  useEffect(() => {
    const stored = window.localStorage.getItem('user');
    if (stored) {
      try {
        const parsed: User = JSON.parse(stored);
        setUser(parsed);
        setFormData({
          firstName: parsed.firstName,
          lastName: parsed.lastName,
          phoneNumber: parsed.phoneNumber || '',
          email: parsed.email || '',
          preferedLanguage: parsed.preferedLanguage || ''
        });
      } catch (e) {
        console.error("Failed to parse stored user:", e);
      }
    }
  }, []);

  useEffect(()=>{
    if (!user) return;
      setEmailChannelNotification(user.notificationChannelType == 'email' || user.notificationChannelType == 'both'? true:false)
      setSMSChannelNotification(user.notificationChannelType == 'sms' || user.notificationChannelType == 'both'? true:false)
    }
  , [user]
  )

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    preferedLanguage:''
  })

  // Dialog state management
  const [homeDialogOpen, setHomeDialogOpen] = useState(false);
  const [workDialogOpen, setWorkDialogOpen] = useState(false);
  const [userUpdateDialogOpen, setUserUpdateDialogOpen] = useState(false);
  
  // Get locations
  const homeLocation = user?.locations.find(loc => loc.type === 'home') ?? null;
  const workLocation = user?.locations.find(loc => loc.type === 'work') ?? null;
  const lastLocation = user?.locations.find(loc => loc.type === 'last') ?? null;

  // Track user's real location
  useEffect(() => {
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by your browser.");
      toast.error("Your browser doesn't support location tracking");
      return;
    }
  
    // Define a function to fetch & update location
    const fetchAndUpdateLocation = () => {
      navigator.geolocation.getCurrentPosition(
        async ({ coords }) => {
          const { latitude, longitude } = coords;
          console.log("Got coordinates:", latitude, longitude);
  
          try {
            // Only update server if user exists
            if (user?.id) {
              await updateUserLocation("Current location", latitude, longitude, "last");
              
              // Local update only after successful server update
              setUser((prev:any) => {
                if (!prev) return prev;
                
                // Create a copy of locations without the last location
                const others = prev.locations.filter((l:UserLocation) => l.type !== "last");
                
                // Add the new last location
                const updated = [
                  ...others,
                  { id: Date.now(), address: "Current location", latitude: latitude, longitude: longitude, type: "last" }
                ];
                
                const updatedUser = { ...prev, locations: updated };
                localStorage.setItem("user", JSON.stringify(updatedUser));
                return updatedUser;
              });
              
              toast.success("Location updated successfully");
            } else {
              console.warn("User not loaded yet, can't update location");
            }
          } catch (error) {
            console.error("Failed to update location:", error);
            toast.error("Failed to update your location");
          }
        },
        (err) => {
          console.error("Location error:", err.code, err.message);
          
          // Show different messages based on error type
          if (err.code === 1) { // PERMISSION_DENIED
            toast.error("Location access denied. Please enable location permissions in your browser.");
          } else if (err.code === 2) { // POSITION_UNAVAILABLE
            toast.error("Location information is unavailable.");
          } else if (err.code === 3) { // TIMEOUT
            toast.error("Location request timed out.");
          } else {
            toast.error("Unknown error occurred while getting location.");
          }
        },
        { 
          enableHighAccuracy: true, 
          maximumAge: 0,
          timeout: 10000 // 10 second timeout
        }
      );
    };
  
    // Initial fetch
    fetchAndUpdateLocation();
    
    // Setup interval for periodic updates
    const intervalId = setInterval(fetchAndUpdateLocation, 5 * 60 * 1000); // every 5 minutes
    
    // Cleanup on component unmount
    return () => clearInterval(intervalId);
  }, [user?.id]); // Only re-run if user ID changes
      
  if (userDetailsfromLocalStorage == null) {
    return (
      <div className="flex items-center justify-center w-full h-screen bg-gray-50">
        <div className="text-center">
          <Commet color="#32cd32" size="large" text="" textColor="" />
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <Toaster position="top-right" theme="system" />
      
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="bg-gradient-to-r from-green-400 to-green-500 rounded-xl shadow-lg mb-6 p-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
              <UserCircle className="h-8 w-8" />
              My Profile
            </h1>
            <p className="text-green-50 mt-1">
              Manage your personal information and preferences
            </p>
          </div>
          <Button 
            onClick={() => setUserUpdateDialogOpen(true)}
            className="bg-white text-green-600 hover:bg-green-50 shadow transition-all duration-200 flex items-center gap-2"
          >
            <Edit size={16} />
            Edit Profile
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="lg:col-span-1 shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden border-0">
            <div className="bg-gradient-to-b from-green-400 to-green-500 h-24"></div>
            <div className="flex flex-col items-center -mt-12 px-6 pb-6">
              <div className="rounded-full bg-white p-2 shadow-lg mb-4">
                <UserSquare2Icon className="h-20 w-20 text-green-600" />
              </div>
              
              <h2 className="text-2xl font-bold">{`${user?.firstName || "N/A"} ${user?.lastName || "N/A"}`}</h2>
              <p className="text-gray-500 text-sm mb-6">{user?.userRole?.name || "User"}</p>
              
              <div className="w-full space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="bg-green-100 p-2 rounded-full">
                    <Phone size={16} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="font-medium">{user?.phoneNumber || "Not provided"}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="bg-green-100 p-2 rounded-full">
                    <Mail size={16} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-medium">{user?.email || "Not provided"}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="bg-green-100 p-2 rounded-full">
                    <Languages size={16} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Preferred Language</p>
                    <p className="font-medium">{user?.preferedLanguage || "English"}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
          
          {/* Right Column: Settings Cards */}
          <div className="lg:col-span-2 space-y-6">
            {/* Locations Card */}
            <Card className="shadow-md hover:shadow-lg transition-shadow duration-200 border-0">
              <CardHeader className="border-b border-gray-100 bg-gray-50">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-green-500" />
                  Location Information
                </CardTitle>
                <CardDescription>
                  Manage your saved locations for better service
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Home Location */}
                  <div 
                    className="bg-white border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setHomeDialogOpen(true)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="bg-green-100 p-2 rounded-full">
                          <Home size={16} className="text-green-600" />
                        </div>
                        <h3 className="font-medium">Home Location</h3>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          setHomeDialogOpen(true);
                        }}
                      >
                        <Edit size={14} className="text-gray-400 hover:text-green-600" />
                      </Button>
                    </div>
                    
                    <p className="text-gray-600 truncate">
                      {homeLocation?.address || "Click to set home location"}
                    </p>
                  </div>
                  
                  {/* Work Location */}
                  <div 
                    className="bg-white border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setWorkDialogOpen(true)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="bg-green-100 p-2 rounded-full">
                          <Briefcase size={16} className="text-green-600" />
                        </div>
                        <h3 className="font-medium">Work Location</h3>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          setWorkDialogOpen(true);
                        }}
                      >
                        <Edit size={14} className="text-gray-400 hover:text-green-600" />
                      </Button>
                    </div>
                    
                    <p className="text-gray-600 truncate">
                      {workLocation?.address || "Click to set work location"}
                    </p>
                  </div>
                </div>
                
                {/* Current Location */}
                {lastLocation && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin size={14} className="text-gray-500" />
                      <p className="text-sm text-gray-500">Current Location</p>
                    </div>
                    <p className="text-xs text-gray-500 pl-6">
                      Lat: {lastLocation.latitude}, Lng: {lastLocation.longitude}
                      {/* {JSON.stringify(user)} */}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Notification & Language Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Notification Settings Card */}
              <Card className="shadow-md hover:shadow-lg transition-shadow duration-200 border-0">
                <CardHeader className="border-b border-gray-100 bg-gray-50">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Bell className="h-5 w-5 text-green-500" />
                    Notifications
                  </CardTitle>
                  <CardDescription>
                    Select your preferred notification channels
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="bg-green-100 p-2 rounded-full">
                          <AtSign size={16} className="text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">Email Notifications</p>
                          <p className="text-xs text-gray-500">Receive updates via email</p>
                        </div>
                      </div>
                      <Switch 
                        className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-300"
                        id="email" 
                        checked={emailChannelNotification}
                        onCheckedChange={(checked) => {
                          setEmailChannelNotification(checked)
                          // if (user) updateNotificationPreference(user.id)
                        }}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="bg-green-100 p-2 rounded-full">
                          <MessageCircle size={16} className="text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">SMS Notifications</p>
                          <p className="text-xs text-gray-500">Receive updates via SMS</p>
                        </div>
                      </div>
                      <Switch 
                        className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-300"
                        id="sms" 
                        checked={smsChannelNotification}
                        onCheckedChange={(checked) => {
                          setSMSChannelNotification(checked)
                          // if (user) updateNotificationPreference(user.id)
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Language Settings Card */}
              <Card className="shadow-md hover:shadow-lg transition-shadow duration-200 border-0">
                <CardHeader className="border-b border-gray-100 bg-gray-50">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Languages className="h-5 w-5 text-green-500" />
                    Language Preference
                  </CardTitle>
                  <CardDescription>
                    Choose your preferred language
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${user?.preferedLanguage === 'English' ? 'bg-green-100' : 'bg-gray-100'}`}>
                          <CheckCircle size={16} className={user?.preferedLanguage === 'English' ? 'text-green-600' : 'text-gray-400'} />
                        </div>
                        <p className="font-medium">English</p>
                      </div>
                      <Switch 
                        checked={user?.preferedLanguage === 'English'}
                        onCheckedChange={(checked) => {
                          if (checked && user) updateLanguagePreference('English', user.id)
                        }}
                        className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-300"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${user?.preferedLanguage === 'Chichewa' ? 'bg-green-100' : 'bg-gray-100'}`}>
                          <CheckCircle size={16} className={user?.preferedLanguage === 'Chichewa' ? 'text-green-600' : 'text-gray-400'} />
                        </div>
                        <p className="font-medium">Chichewa</p>
                      </div>
                      <Switch 
                        checked={user?.preferedLanguage === 'Chichewa'}
                        onCheckedChange={(checked) => {
                          if (checked && user) updateLanguagePreference('Chichewa', user.id)
                        }}
                        className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-300"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      {/* Update Profile Dialog */}
      <Dialog open={userUpdateDialogOpen} onOpenChange={setUserUpdateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Update Profile</DialogTitle>
            <DialogDescription>
              Update your personal information below
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                placeholder="Your first name"
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                placeholder="Your last name"
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                placeholder="Your phone number"
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="Your email address"
                className="w-full"
              />
            </div>
          </div>
          
          <DialogFooter className="flex items-center justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setUserUpdateDialogOpen(false)}
              disabled={updatingUser}
            >
              Cancel
            </Button>
            
            {updatingUser ? (
              <Button disabled className="bg-green-500 hover:bg-green-600">
                <Commet color="#ffffff" size="small" text="" textColor="" />
                <span className="ml-2">Updating...</span>
              </Button>
            ) : (
              <Button 
                className="bg-green-500 hover:bg-green-600 text-white"
                onClick={() => {
                  if(user) updateProfile(formData, user.id)
                }}
              >
                Save Changes
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Location Dialog components */}
      <LocationDialog
        setUser={setUser}
        isOpen={homeDialogOpen}
        onClose={() => setHomeDialogOpen(false)}
        title="Select Home Location"
        initialValue={homeLocation?.address}
        onSave={(address, lat, lng) => updateUserLocation(address, lat, lng, 'home')}
      />
      
      <LocationDialog
        setUser={setUser}
        isOpen={workDialogOpen}
        onClose={() => setWorkDialogOpen(false)}
        title="Select Work Location"
        initialValue={workLocation?.address}
        onSave={(address, lat, lng) => updateUserLocation(address, lat, lng, 'work')}
      />
    </div>
  )
}

export default ProfilePage