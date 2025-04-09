"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Megaphone } from 'lucide-react'
import React, { useState } from 'react'
import "leaflet/dist/leaflet.css";
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast, Toaster } from 'sonner'
import { Commet } from 'react-loading-indicators'
import dynamic from "next/dynamic";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false } // Disable SSR for this component
);

const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);

// Form Schema
const formSchema = z.object({
  disasterName: z.string().min(2, "Name must be at least 2 characters"),
  disasterType: z.string().min(2, "Type must be at least 2 characters"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  intensity: z.number().min(0).max(100, "Intensity must be between 0-100"),
  likelihood: z.number().min(0).max(100, "Likelihood must be between 0-100"),
  status: z.enum(["PENDING", "APPROVED"]),
  geojson: z.any().optional(),
  files: z.any().optional(),
}).refine(data => data.geojson || data.files, {
  message: "Either GeoJSON or Shapefiles must be uploaded",
  path: ["files"]
})

function DisasterUpload() {

   const [isSubmitting, setisSubmitting] = useState<boolean>(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      disasterName: "",
      disasterType: "",
      intensity: 0,
      likelihood: 0,
      status: "PENDING",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {

    setisSubmitting(true)

    const formData = new FormData();
    
    // Append regular fields
    formData.append('disasterName', values.disasterName);
    formData.append('disasterType', values.disasterType);
    formData.append('startDate', new Date(values.startDate).toISOString());
    formData.append('endDate', new Date(values.endDate).toISOString());
    formData.append('intensity', values.intensity.toString());
    formData.append('likelihood', values.likelihood.toString());
    formData.append('status', values.status);
  
    // Handle file uploads
    if (values.geojson) {
      formData.append('files', values.geojson);
    } else if (values.files) {
      values.files.forEach((file: File, index: number) => {
        formData.append(`files`, file);
      });
    }
  
    try {
      const response = await fetch('http://localhost:3000/disasters/upload', {
        method: 'POST',
        body: formData, // FormData will set proper headers
      });
  
      if (!response.ok) {
        throw new Error('Server responded with error');
      }
  
      const result = await response.json();
      toast.success('Disaster created successfully!');
      setisSubmitting(false);
      form.reset();
    } catch (error: any) {
      setisSubmitting(false)
      toast.error('Error submitting form: ' + error.message);
      console.log(error)
    }
  }

  return (
    <Card className='rounded-none'>
    <Toaster
        position="top-right"
        theme='system'
        />
      <CardContent>
        <CardHeader className='w-full bg-green-400 rounded-md mb-4 mt-4'>
          <CardTitle className='flex gap-2 justify-center items-center text-xl font-extrabold'>
            Upload A New Disaster <Megaphone/>
          </CardTitle>
          <CardDescription className='text-black flex justify-center'>
            Inform the public on an impending disaster
          </CardDescription>
        </CardHeader>
        <div className='flex flex-col md:flex-row gap-2'>
          <Card className="flex-1 relative md:w-[100%] h-[500px]">
            <MapContainer
              center={[-13.254308, 34.301525]}
              zoom={6.3}
              style={{ height: "100%", width: "100%", borderRadius: "2%", borderColor: "orange" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            </MapContainer>
          </Card>
          <Card className='flex-1'>
            <CardContent>
                <CardHeader >
                    <CardTitle className='flex justify-center'>Disaster Details</CardTitle>
                    <CardDescription className='flex justify-center'>Fill in the details of the disaster</CardDescription>
                </CardHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                  {/* Disaster Name */}
                  <FormField
                    control={form.control}
                    name="disasterName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Disaster Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter disaster name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Disaster Type */}
                  <FormField
                    control={form.control}
                    name="disasterType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Disaster Type</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter disaster type" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Date Range */}
                  <div className="flex gap-4">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>End Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Intensity and Likelihood */}
                  <div className="flex gap-4">
                    <FormField
                      control={form.control}
                      name="intensity"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Intensity (%)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0" 
                              max="100" 
                              {...field} 
                              onChange={e => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="likelihood"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Likelihood (%)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0" 
                              max="100" 
                              {...field} 
                              onChange={e => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Status Select */}
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="APPROVED">Approved</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* File Uploads */}
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="geojson"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>GeoJSON File</FormLabel>
                          <FormControl>
                            <Input 
                              type="file" 
                              accept=".geojson" 
                              onChange={(e) => field.onChange(e.target.files?.[0])}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="text-center">OR</div>

                    <FormField
                      control={form.control}
                      name="files"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Shapefiles (.shp + .dbf)</FormLabel>
                          <FormControl>
                            <Input 
                              type="file" 
                              multiple 
                              accept=".shp,.dbf" 
                              onChange={(e) => field.onChange(Array.from(e.target.files || []))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className='flex justify-center'>      
                   {
                    !isSubmitting?
                        <Button type="submit" className="w-full mt-6">
                            Submit Disaster Report
                        </Button>:
                        <Commet color="#32cd32" size="small" text="" textColor="" />
                   }
                  </div>    
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
}

export default DisasterUpload