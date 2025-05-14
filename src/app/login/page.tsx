'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast, Toaster } from 'sonner'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Shield, ShieldAlert } from 'lucide-react'
// import {getToken, storeRole, storeToken} from "../../lib/utils"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [registrationDialogIsOpen, setRegistrationDialogIsOpen] = useState(false)



  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(
        'https://localhost:3000/auth/login',
          {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({ 
            email:email, 
            pass:password 
          })
        }
      )
      
      if (!response.ok) {
        console.log("faiiled auth"+response.status)
        toast.error('Invalid email or password. Please check your credentials.')
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      console.log('API response status:', response.status);
      
      const data = await response.json()

      console.log(" the response from the server is"+data)

      const user=data.user

      console.log('Available users:', user) // Debug log

      const token = data.access_token
      console.log("the token is"+token)

      if (user && user.userRole.id==1) {
        localStorage.setItem('user', JSON.stringify(user))
        router.push('/admin-page')
      } 
      else if(user && user.userRole.id==2){
        localStorage.setItem('user', JSON.stringify(user))
        router.push('/home')
      }
      else {
        setError('Invalid email or password. Please check your credentials.')
      }
    } catch (err) {
      console.error('Login error:', err) // Debug log
      if (err instanceof Error) {
        setError(`Connection error: ${err.message}`)
      } else {
        setError('Failed to connect to the server. Make sure json-server is running on port 5001.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/bgimages/glowingGlobe.jpg')" }}>\

    <div className="absolute inset-0 bg-black bg-opacity-60 z-0" />
      <Toaster
      position="top-right"
      theme='system'
      />
      <Card className="w-full max-w-md z-10 bg-white/10 backdrop-blur-md border border-white/20 shadow-xl rounded-2xl transition-transform hover:scale-[1.01]">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <ShieldAlert className="text-green-400 animate-pulse" size={50} />
          </div>
          <CardTitle className="text-3xl text-center text-green-300 font-semibold tracking-wide">
            Disaster Alert System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-green-300">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-black/20 text-white placeholder:text-gray-400"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-green-300">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-black/20 text-white placeholder:text-gray-400"
                required
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white font-medium shadow-md transition-all"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
            <Button
              type="button"
              onClick={() => router.push("/registration")}
              variant="ghost"
              className="text-white hover:underline text-sm"
            >
              You don't have an account? Register
            </Button>
          </form>
        </CardContent>
      </Card>


    </div>
  )
} 